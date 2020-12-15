require('dotenv').config();
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const merkleproof = require('../merkleproof.json')
const allocation = require('../allocation/balArray');
const BigNumber = require('bignumber.js');
const { toWei } = web3.utils;

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0x2DceeFaA9471C2647030549b17fdEEc2E4aa0F5B');
  const TToken = await ttoken.at('0x3618A04c72B1DF99d1c6A528F6Fc6267e1D1C6D6');

  /* for user to fill in */
  let account = allocation.allocation[1][0] // <-- account
  let amount = toWei('142'); // <-- amount

  try {

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
