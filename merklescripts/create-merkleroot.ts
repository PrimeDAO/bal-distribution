import {TrancheBalances} from '../test/types'
import {
  createTreeWithAccounts,
  getAccountBalanceProof,
  MerkleTree,
} from '../test/utils/merkleTree'
import { simpleToExactAmount } from '../test/utils/math'
import { allocation } from '../allocation/balArray'
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
      // console.log(balances)
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

const TRANCHES = {
  unclaimed: getTranche(
    ["0x1bf4e7D549fD7Bf9c6BA3Be8BD2b9Af62F086220","922.676739013339959773"],
    ["0x6d327055D5791a93545432906aFa229accf0B762","6769.050684176718188723"],
    ["0x137dcE536912b0313D534aE0d10d122eA4C7a9ad","0"],
    ["0xC4d9d1a93068d311Ab18E988244123430eB4F1CD","1344.490162678758460604"],
    ["0xa3eB2115D947C29882c9Ee2d8D7BEF98d0cA16FD","0.010858624980528405"],
    ["0x47b72adb8cf42043E4796C2FEcF27E836E0341Fb","27.331361886973658454"],
    ["0x0ecfd7C7b08F05d9d28b80AE3139E42817f73248","936.440193619229204038"],
    ["0x92e25f2830a3c5385Faa10e0030d3096578777Ac","0"]
  )
}

async function makeTree() {
  await setup(TRANCHES.unclaimed)
  console.log('merkleroot: ' + merkleroot);

  fs.writeFile('./merklescripts/merkleroot.json', JSON.stringify(merkleroot), (err) => {
      if (err) throw err;
  });
}

async function writeProofs() {
  let i;
  let forIPFS: any[] = [];
  console.log('writing claims...')
  for(i=0;i<allocation.length;i++){
    const [
      {
        tree,
        tranche,
        balances: {
          [ allocation[i][0] ]: { balance },
        },
      },
    ] = await setup(TRANCHES.unclaimed)
    const proof = await getAccountBalanceProof(tree, allocation[i][0], balance)
    console.log('to claim (as wei): ' + balance.toString())
    let obj = {
      account: allocation[i][0],
      tranche: 0,
      claim: balance.toString(),
      proof: proof
    }
    forIPFS.push(obj)
  }
  fs.writeFile('./user-claims', JSON.stringify(forIPFS), (err) => {
      if (err) throw err;
  });
  console.log('...claims saved as `user-claims.json`');
}

async function main(){
  await makeTree();
  await writeProofs();
}

main();
