require('dotenv').config();

const merkledrop = artifacts.require('MerkleDrop');
const BigNumber = require('bignumber.js');
const contracts = require('../../contractAddresses');

module.exports = async function(callback) {

  try {

    const MerkleDropKovan = await merkledrop.at(contracts.mainnet.MerkleDrop);

    console.log('initializing merkledrop...');
    await MerkleDropKovan.initialize(process.env.ACCOUNT, [process.env.ACCOUNT], contracts.mainnet.BAL);
    console.log('...contract initialized');

  } catch(error) {

    consosle.log(error)

  }

  callback();
}
