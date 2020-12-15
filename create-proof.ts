import {TrancheBalances} from './test/types'
import {
  createTreeWithAccounts,
  getAccountBalanceProof,
  MerkleTree,
} from './test/utils/merkleTree'
import { simpleToExactAmount } from './test/utils/math'
import { allocation } from './allocation/balArray'
import BN from 'bn.js'
import fs from 'fs'

let merkletree;
let merkleroot;

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


const TRANCHES = {
  unclaimed: getTranche(
    [allocation[0][0], allocation[0][1]],
    [allocation[1][0], '142']
  )
}

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

  // Add tranches
  return Promise.all(
    tranches.map(async (balances, index) => {
      const tranche = index.toString()

      const tree = createTreeWithAccounts(balances)
      console.log(balances)
      merkletree = tree;
      const merkleRoot = tree.hexRoot
      merkleroot = merkleRoot;

      const totalAmount = Object.values(balances).reduce(
        (prev, current) => prev.add(current.balance),
        new BN(0),
      )

      // Perform claims
      const claims = Object.entries(balances)
        .filter(([, value]) => value.claimed)
        .map(([account, { balance }]) => {
          const proof = getAccountBalanceProof(tree, account, balance)
        })
      await Promise.all(claims)

      return { tranche, tree, balances, totalAmount }
    }),
  )
}

async function makeProof() {
  const [
    {
      tree,
      tranche,
      balances: {
        [ allocation[1][0] ]: { balance },
      },
    },
  ] = await setup(TRANCHES.unclaimed)
  const proof = await getAccountBalanceProof(tree, allocation[1][0], balance)
  fs.writeFile('./merkleproof.json', JSON.stringify(proof), (err) => {
      if (err) throw err;
  });
  console.log(balance.toString())
  console.log('proof: ' + proof);
}

makeProof();
