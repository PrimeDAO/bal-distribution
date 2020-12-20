require('dotenv').config();
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const merkleproof = require('../../merklescripts/merkleproof.json')
const allocation = require('../../allocation/balArray');
const BigNumber = require('bignumber.js');
const contracts = require('../../contractAddresses');
const { toWei, hexToBytes, bytesToHex } = web3.utils;

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const TToken = await ttoken.at(contracts.kovan.TToken);

  let account = '0x6d327055D5791a93545432906aFa229accf0B762' // <-- account
  let amount = '67000000000000000000'; // <-- amount as wei

  try {

    console.log(account)
    console.log(amount)
    console.log(merkleproof)

     // console.log('claiming for tranche...')
     // await MerkleDropKovan.claimTranche(
     //   account,
     //   2,
     //   amount,
     //   merkleproof
     // )
     //
     // console.log('...claim successful')

  } catch(error) {
    await console.log(error)
  }

  callback();

}
