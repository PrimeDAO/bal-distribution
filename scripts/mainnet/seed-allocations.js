require('dotenv').config();
const BigNumber = require('bignumber.js');
const contracts = require('../../contractAddresses');
const merkleroot = require('../../merklescripts/merkleroot');
const merkledrop = artifacts.require('MerkleDrop');
const bal = artifacts.require('BAL');
const { toWei } = web3.utils;


module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const BAL = await bal.at(contracts.kovan.BAL);

  try {

    let balAmount = toWei((process.env.BAL).toString());
    console.log('BAL to seed: ' + process.env.BAL);
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
