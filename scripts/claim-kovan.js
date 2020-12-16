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

  let account = '0x0ecfd7C7b08F05d9d28b80AE3139E42817f73248' // <-- account
  let amount = toWei('9000000'); // <-- amount

  try {

    console.log('account: ' + account)
    console.log('amount: ' + amount)
    console.log('merkleproof: ' + merkleproof)

      console.log('claiming for tranche...')
      await MerkleDropKovan.claimWeek(
        account,
        0,
        amount,
        merkleproof
      )

      console.log('...claim successful')

  } catch(error) {
    await console.log(error)
  }

  callback();

}
