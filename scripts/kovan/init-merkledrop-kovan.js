require('dotenv').config();

const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const BigNumber = require('bignumber.js');
const contracts = require('../../contractAddresses');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const TToken = await ttoken.at(contracts.kovan.TToken);

  try {
    console.log('initializing merkledrop...');
    await MerkleDropKovan.initialize(process.env.ACCOUNT, [process.env.ACCOUNT], TToken.address);
    console.log('...contract initialized');
  } catch(error) {
    consosle.log(error)
  }

  callback();
}
