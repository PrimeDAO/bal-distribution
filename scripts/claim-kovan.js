require('dotenv').config();
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const merkleproof = require('../merkleproof.json')
const allocation = require('../allocation/balArray');
const BigNumber = require('bignumber.js');
const contracts = require('../contractAddresses');
const { toWei } = web3.utils;

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const TToken = await ttoken.at(contracts.kovan.TToken);

  let account = '0x1bf4e7D549fD7Bf9c6BA3Be8BD2b9Af62F086220' // <-- account
  let amount = toWei('810000000000000000'); // <-- amount

  try {

    console.log('account: ' + account)
    console.log('amount: ' + amount)
    console.log('merkleproof: ' + merkleproof)

      console.log('claiming for tranche...')
      await MerkleDropKovan.claimTranche(
        account,
        1,
        amount,
        merkleproof
      )

      console.log('...claim successful')

  } catch(error) {
    await console.log(error)
  }

  callback();

}
