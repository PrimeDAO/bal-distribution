import {TrancheBalances} from './test/types'
import {
  createTreeWithAccounts,
  getAccountBalanceProof,
  MerkleTree,
} from './test/utils/merkleTree'
import { simpleToExactAmount } from './test/utils/math'
import { allocation } from './allocation/balArray'
import { merkletree } from './treeExport.js'
import BN from 'bn.js'


async function main() {
  console.log(merkletree)

  const proof = getAccountBalanceProof(merkletree, allocation[0][0], allocation[0][1])

  console.log(pro)
}

main();
