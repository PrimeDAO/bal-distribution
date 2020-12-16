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

  /* for user to fill in */
  let account = allocation.allocation[3][0] // <-- account
  let amount = toWei(allocation.allocation[3][1]); // <-- amount

  try {

    console.log(account)
    console.log(amount)
    console.log(merkleproof)

      // console.log('minting bal...')
      // await TToken.mint(MerkleDropKovan.address, amount)

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
