require('dotenv').config();
const BigNumber = require('bignumber.js');
const config = require('../../contract-config.json');
const contracts = require('../../contractAddresses');
const merkleroot = require('../../merklescripts/mainnet/merkleroot');
const merkledrop = artifacts.require('MerkleDrop');
const { toWei } = web3.utils;


module.exports = async function(callback) {

  try {

    /* approve BAL transfer via etherscan interface */

    const MerkleDropMainnet = await merkledrop.at(contracts.mainnet.MerkleDrop);

    let balAmount = toWei((config.mainnet.BALAmount).toString());
    console.log('BAL to seed: ' + config.mainnet.BALAmount);
    let account = process.env.ACCOUNT;

    console.log('seeding new allocations...');
    await MerkleDropMainnet.seedNewAllocations(merkleroot, balAmount);
    console.log('...seeding complete: merkledrop ready for claims')

  } catch(error) {

    await console.log(error)

  }

  callback();

}
