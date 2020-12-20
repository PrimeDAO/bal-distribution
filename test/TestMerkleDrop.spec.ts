import { expectEvent, expectRevert } from '@openzeppelin/test-helpers'
import BN from 'bn.js'

import { MerkleDropInstance, TTokenInstance } from '../types/generated'
import { TrancheBalances } from './types'
import {
  createTreeWithAccounts,
  getAccountBalanceProof,
  MerkleTree,
} from './utils/merkleTree'
import { simpleToExactAmount } from './utils/math'

const MerkleDrop = artifacts.require('MerkleDrop')
const TToken = artifacts.require('TToken')

const DECIMALS = 18

// [account, balance] | [account, balance, claimed]
type AccountBalancesTuple = ([string, string] | [string, string, boolean])[]

const exactAmount = (simpleAmount: number | string): BN =>
  simpleToExactAmount(simpleAmount, DECIMALS)

const getTranche = (
  ...accountBalances: AccountBalancesTuple
): TrancheBalances => {
  return accountBalances.reduce<TrancheBalances>(
    (prev, [account, balance, claimed]) => ({
      ...prev,
      [account]: { balance: exactAmount(balance), claimed },
    }),
    {},
  )
}

contract('MerkleDrop', accounts => {
  let token: TTokenInstance
  let merkleDrop: MerkleDropInstance

  const [
    funder,
    claimantAcct,
    acctWithNoClaim,
    otherAcct1,
    otherAcct2,
    otherAcct3,
  ] = accounts

  const TRANCHES = {
    unclaimed: getTranche(
      [claimantAcct, '100'],
      [otherAcct1, '25'],
      [otherAcct2, '75'],
      [otherAcct3, '3000'],
    ),
    claimed: getTranche(
      [claimantAcct, '100', true],
      [otherAcct1, '1'],
      [otherAcct3, '3000'],
    ),
    noBalance: getTranche(
      [claimantAcct, '0'],
      [otherAcct1, '10000'],
      [otherAcct2, '1'],
      [otherAcct3, '10000'],
    ),
  }

  beforeEach(async () => {
    // Deploy TToken
    token = await TToken.new('TToken', 'TKN', DECIMALS)

    // Deploy MerkleDrop
    merkleDrop = await MerkleDrop.new()

    // Initialize MerkleDrop
    await merkleDrop.initialize(funder, [funder], token.address)

    // Mint TToken (large amount)
    const amount = exactAmount('100000000')
    await token.mint(funder, amount)
  })

  const setup = async (
    ...tranches: TrancheBalances[]
  ): Promise<{
    tranche: string
    tree: MerkleTree
    balances: TrancheBalances
    totalAmount: BN
  }[]> => {
    // Approval cumulative amount
    const cumulativeAmount = tranches.reduce(
      (prev, balances) =>
        prev.add(
          Object.values(balances).reduce(
            (trancheAmount, { balance }) => trancheAmount.add(balance),
            new BN(0),
          ),
        ),
      new BN(0),
    )
    await token.approve(merkleDrop.address, cumulativeAmount)

    // Add tranches
    return Promise.all(
      tranches.map(async (balances, index) => {
        const tranche = index.toString()

        const tree = createTreeWithAccounts(balances)
        const merkleRoot = tree.hexRoot

        const totalAmount = Object.values(balances).reduce(
          (prev, current) => prev.add(current.balance),
          new BN(0),
        )

        const seedTx = await merkleDrop.seedNewAllocations(
          merkleRoot,
          totalAmount,
        )

        expectEvent(seedTx, 'TrancheAdded', {
          tranche,
          merkleRoot,
          totalAmount,
        })

        // Perform claims
        const claims = Object.entries(balances)
          .filter(([, value]) => value.claimed)
          .map(([account, { balance }]) => {
            const proof = getAccountBalanceProof(tree, account, balance)
            return merkleDrop.claimTranche(account, tranche, balance, proof)
          })
        await Promise.all(claims)

        return { tranche, tree, balances, totalAmount }
      }),
    )
  }

  describe('verifyClaim', () => {
    it('proofs for expired tranches are not verified', async () => {
      const tranches = await setup(TRANCHES.unclaimed)

      const balance = exactAmount('100')

      const proof = getAccountBalanceProof(
        tranches[0].tree,
        claimantAcct,
        balance,
      )

      const verifiedBeforeExpiration = await merkleDrop.verifyClaim(
        claimantAcct,
        tranches[0].tranche,
        balance,
        proof,
      )

      expect(verifiedBeforeExpiration).eq(
        true,
        'Proof should be verified for non-expired tranche',
      )

      const expireTx = await merkleDrop.expireTranche(tranches[0].tranche)

      expectEvent(expireTx, 'TrancheExpired', { tranche: tranches[0].tranche })

      const verifiedAfterExpiration = await merkleDrop.verifyClaim(
        claimantAcct,
        tranches[0].tranche,
        balance,
        proof,
      )

      expect(verifiedAfterExpiration).eq(
        false,
        'Proof should NOT be verified for expired tranche',
      )
    })
  })

  describe('claimTranche', () => {
    it('invalid liquidityProvider does not get claimed', async () => {
      const [{ tranche }] = await setup(
        // Just acct1, not acct2
        TRANCHES.unclaimed,
      )

      const balance = exactAmount('100')

      const treeWithAcct2 = createTreeWithAccounts({
        [acctWithNoClaim]: { balance },
      })
      const proof = getAccountBalanceProof(
        treeWithAcct2,
        acctWithNoClaim,
        balance,
      )

      const claimPromise = merkleDrop.claimTranche(
        acctWithNoClaim,
        tranche,
        balance,
        proof,
      )

      await expectRevert(claimPromise, 'Incorrect merkle proof')
    })

    it('invalid balance does not get claimed', async () => {
      const [{ tranche }] = await setup(TRANCHES.unclaimed)

      // Over the balance acct1 should be able to claim
      const balance = exactAmount('1000')

      const treeWithHigherBalance = createTreeWithAccounts({
        [claimantAcct]: { balance },
      })
      const proof = getAccountBalanceProof(
        treeWithHigherBalance,
        claimantAcct,
        balance,
      )

      const claimPromise = merkleDrop.claimTranche(
        claimantAcct,
        tranche,
        balance,
        proof,
      )

      await expectRevert(claimPromise, 'Incorrect merkle proof')
    })

    it('future tranche does not get claimed', async () => {
      const [
        {
          tree,
          balances: {
            [claimantAcct]: { balance },
          },
        },
      ] = await setup(
        // Only tranche 0
        TRANCHES.unclaimed,
      )

      const proof = getAccountBalanceProof(tree, claimantAcct, balance)

      const claimPromise = merkleDrop.claimTranche(
        claimantAcct,
        1, // Tranche 1 should not exist yet
        balance,
        proof,
      )

      await expectRevert(claimPromise, 'Week cannot be in the future')
    })

    it('LP cannot claim the same tranche more than once', async () => {
      const [
        {
          tree,
          tranche,
          balances: {
            [claimantAcct]: { balance },
          },
        },
      ] = await setup(TRANCHES.claimed)

      const proof = getAccountBalanceProof(tree, claimantAcct, balance)

      const claimPromise = merkleDrop.claimTranche(
        claimantAcct,
        tranche,
        balance,
        proof,
      )

      await expectRevert(claimPromise, 'LP has already claimed')
    })

    it('LP cannot claim balance of 0', async () => {
      const [
        {
          tree,
          tranche,
          balances: {
            [claimantAcct]: { balance },
          },
        },
      ] = await setup(TRANCHES.noBalance)

      const proof = getAccountBalanceProof(tree, claimantAcct, balance)

      const claimPromise = merkleDrop.claimTranche(
        claimantAcct,
        tranche,
        balance,
        proof,
      )

      await expectRevert(
        claimPromise,
        'No balance would be transferred - not going to waste your gas',
      )
    })

    it('valid claim is claimed', async () => {
      const [
        {
          tree,
          tranche,
          balances: {
            [claimantAcct]: { balance },
          },
        },
      ] = await setup(TRANCHES.unclaimed)

      const proof = getAccountBalanceProof(tree, claimantAcct, balance)

      const claimTx = await merkleDrop.claimTranche(
        claimantAcct,
        tranche,
        balance,
        proof,
      )

      expectEvent(claimTx, 'Claimed', {
        claimant: claimantAcct,
        week: tranche,
        balance,
      })
    })

    it('valid claims can be made on behalf of others', async () => {
      const [
        {
          tree,
          tranche,
          balances: {
            [claimantAcct]: { balance },
          },
        },
      ] = await setup(TRANCHES.unclaimed)

      const proof = getAccountBalanceProof(tree, claimantAcct, balance)

      const claimTx = await merkleDrop.claimTranche(
        claimantAcct,
        tranche,
        balance,
        proof,
        {
          from: acctWithNoClaim,
        },
      )

      expectEvent(claimTx, 'Claimed', {
        claimant: claimantAcct,
        week: tranche,
        balance,
      })
    })
  })

})
