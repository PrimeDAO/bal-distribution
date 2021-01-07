import {TrancheBalances} from '../../test/types'
import {
  createTreeWithAccounts,
  getAccountBalanceProof,
  MerkleTree,
} from '../../test/utils/merkleTree'
import { simpleToExactAmount } from '../../test/utils/math'
import { allocation } from '../../allocation/mainnet/balArray'
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
    ["0x033CFeF803852271Fd49d5aD9A051EF5d979EC70","0.061496950294097380"],
    ["0x9bcBFE550D32DFDD2d047Ca52F497cBA1f564B6B","2.803919519868285693"],
    ["0xB5806a701c2ae0366e15BDe9bE140E82190fa3d6","3.328671627950333454"],
    ["0xF610D8C16F9B607642A9c5649078b445f48FcD31","22.724661930068450135"],
    ["0x077b89835d729283bDCcE39840dF5B063bC1159f","1.184230413139662635"],
    ["0x00290ffc9e9D19bdA7b25c6e44d8ADF55DFBf2dD","129.384117560584132358"],
    ["0x9C7B84BE5D69BB41a718A4aF921E44730a277F90","3.622672573892931207"],
    ["0xC671BBB8357B1D1cB0827483e96F7B759d1aC1b7","1.190453398106601609"],
    ["0x5dB43b176860Bdc65fa18f839CfAce35A309E5c7","37.324126570180705846"],
    ["0xe33f1860Eb6B335F0F961c95952e29941D09b5f7","0.034233988590805782"],
    ["0xEC3281124d4c2FCA8A88e3076C1E7749CfEcb7F2","0.727524609365390285"],
    ["0xD683B78e988BA4bdb9Fa0E2012C4C36B7cC96aaD","1.685627901617376552"],
    ["0x7494Eb2916CAD8649F4f91eB1DB6E20bE605DAd6","0.158517110912651887"],
    ["0x0ff6a1f71Bb9B72b18256b1a0661Cc0B581A0EF3","0.235081189012684172"],
    ["0x8540F80Fab2AFCAe8d8FD6b1557B1Cf943A0999b","3.590113592316721879"],
    ["0xaF9D0ACB28ee760402D774d1f3EcEc8C96C4CB99","1.052839645097073904"],
    ["0xE53E7AFf40BB7ef958bF98A67B9dF8D0016DeeAF","0.013971775327093605"],
    ["0x88e673c38AF23E587b9540BB5EF7069eC2fA7130","0.113639109834602296"],
    ["0xDF290293C4A4d6eBe38Fd7085d7721041f927E0a","1.030622075929848222"],
    ["0xfF74A253B6bad54368841Ae45E6a70004FfE9Bd3","0.003891780193012619"],
    ["0xC13bA51d26d1b2022Fa51e25243bb49A54c4A953","0.981669806976257049"],
    ["0xcD32111c1Ea7dDfb1d02fA26e1Bb23381c369d88","9.849748904190238856"],
    ["0xDADDb96a5C006380822F6bC5C9c43deADA2C5196","0.018738547958643909"],
    ["0x74667801993b457B8ccF19d03bbBaA52b7ffF43B","0.691811860214920217"],
    ["0x5bDC20C8D3b00268c1CB0D1Ae404956B6feEf19A","1.171686891134535136"],
    ["0x6A68B9CF65d64D060854f2cbB6825B6026BDe920","0.083846657867512669"],
    ["0x30043aAbBCeBbD887437Ec4F0Cfe6d4c0eB5CC64","1.227999265138641956"],
    ["0x697F7df70b9440B66C59A3ea891e25CC832289C0","11.849415743209881428"],
    ["0x7BFEe91193d9Df2Ac0bFe90191D40F23c773C060","0.702725286716523510"],
    ["0x8558f502887a9a52c4B265d72327E0E529Ff790d","17.052854422791783688"],
    ["0x08bf056C728966C8d6D3f2ACB0Ad4BE521ED0631","3.013481673104827746"],
    ["0xe232FB7c4467F1f4A6c6bBb5b8382a539E21eeEE","0.042180376418513415"],
    ["0xfc43AC04640336B83C354Dd8bCD688e13A6d2e80","0.182415769107131984"],
    ["0x4eb7c94B63b2a18e9769Fa876aB7bc87205Fd6F9","0.182534676032185396"],
    ["0xeE03446E9654697685E82BcafeE1e3cB0Aa6f315","0.375792696421395675"],
    ["0x8dfD5baC330369e20d14A4d68dadEC90Df85029C","2.355354169627365411"],
    ["0x9Ab1A23a1d2aC3603c73d8d3C1E96B7Fd4e7aA19","0.610015154204863858"],
    ["0x3Db1a02aD1a87cb078959B115b47B53300bcC0b8","0.070152878273941680"],
    ["0xF9107317B0fF77eD5b7ADea15e50514A3564002B","0.094832805909184777"],
    ["0xE59a4be85F063F1080a0443e6a5Fa1DC398A9421","1.825170137358733085"],
    ["0xC984946Ea53D6D840b3696deB499F139b64aa9a2","0.050392821773989230"],
    ["0x3049AF959961C2a849884FBB576BCad3Eb5a9F32","0.002087992869174109"],
    ["0x576B1C2d113C634d5849181442aEc5a3A9148c1e","0.464438453908601476"],
    ["0x2f00ec31652d35F0Aa5BBD72520BeE6069f6Fb36","0.000396886278116559"],
    ["0xBB852372A69bdae4EDe4C1Aa626D97ad4bB65ac5","0.002903122946075238"],
    ["0x49F1B9140D887f31200943c4cD6b1F3759514BE9","0.181807155973275345"],
    ["0x7De082e63E040fB3CAD81bf729F40ba762E87F0b","4.135839552705697052"],
    ["0xD11Eb5Db7cFbB9ECae4B62E71Ec0A461F6baF669","0.003378384434930581"],
    ["0x04e8e5aA372D8e2233D2EF26079e23E3309003D5","0.748928758947701711"],
    ["0x8b984563d529070658C1CbfFeAB2E31381B745Ce","0.144779769944043481"],
    ["0xd6D9d42A6e86f85b52d607Ce222798cCca21E881","0.006066160784305866"],
    ["0x42a3252f967EC6e946F427909d6fa1ae52a01807","0.196252520548518372"],
    ["0x2387b5576786D70bEBc0B08ff429f70c2D3df2B5","0.735530456170404068"],
    ["0xb63bb45B2eF614ce087dc01C98013d87Fd757896","0.047253028806836563"],
    ["0x0a1f2e1a4585bbf5E54a894FffA74133654BfaDC","0.017794518841675970"],
    ["0x1d28B009a7c7E7bF71E91D61FA82504D10a7c33C","0.038068208415679955"],
    ["0x5fFe1e4d196116049C4C17d1F4d2457Eb92A2100","0.050241161711431429"]
  )
}

async function makeTree() {
  await setup(TRANCHES.unclaimed)
  console.log('merkleroot: ' + merkleroot);

  fs.writeFile('./merklescripts/mainnet/merkleroot.json', JSON.stringify(merkleroot), (err) => {
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
    // console.log('to claim (as wei): ' + balance.toString())
    let obj = {
      _liquidityProvider: allocation[i][0],
      _tranche: 0,
      _balance: balance.toString(),
      _merkleProof: proof
    }
    forIPFS.push(obj)
  }
  fs.writeFile('./user-claims-mainnet.json', JSON.stringify(forIPFS), (err) => {
      if (err) throw err;
  });
  console.log('...claims saved as `user-claims-mainnet.json`');
}

async function main(){
  await makeTree();
  await writeProofs();
}

main();
