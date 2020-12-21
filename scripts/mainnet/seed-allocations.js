require('dotenv').config();
const BigNumber = require('bignumber.js');
const config = require('../../contract-config.json');
const contracts = require('../../contractAddresses');
const merkleroot = require('../../merklescripts/merkleroot');
const merkledrop = artifacts.require('MerkleDrop');
const bal = artifacts.require('BAL');
const { toWei } = web3.utils;


module.exports = async function(callback) {

  try {

    const MerkleDropKovan = await merkledrop.at(contracts.mainnet.MerkleDrop);
    const BAL = await bal.at(contracts.mainnet.BAL);

    let balAmount = toWei((config.mainnet.BALAmount).toString());
    console.log('BAL to seed: ' + config.mainnet.BALAmount);
    let account = process.env.ACCOUNT;

    console.log('\napproving for transfer to contract...');
    await BAL.approve(MerkleDropKovan.address, balAmount);
    console.log('...approval complete \nseeding new allocations...');
    await MerkleDropKovan.seedNewAllocations(merkleroot, balAmount);
    console.log('...seeding complete: merkledrop ready for claims')

  } catch(error) {

    await console.log(error)

  }

  callback();

}
