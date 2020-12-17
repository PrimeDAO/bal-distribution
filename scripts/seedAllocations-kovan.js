require('dotenv').config();
const BigNumber = require('bignumber.js');
const contracts = require('../contractAddresses');
const merkleroot = require('../merkleroot');
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const { toWei } = web3.utils;


module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const TToken = await ttoken.at(contracts.kovan.TToken);

  try {

    let balAmount = toWei((process.env.BAL).toString());
    console.log('BAL to seed (as wei): ' + balAmount);
    let account = process.env.ACCOUNT;

    console.log('transferring BAL to merkledrop funding account...');
    await TToken.mint(account, balAmount);
    console.log('...transfer complete \napproving...');
    await TToken.approve(MerkleDropKovan.address, balAmount);
    console.log('...approval complete \nseeding new allocations...');
    await MerkleDropKovan.seedNewAllocations(merkleroot, balAmount);
    console.log('...seeding complete: merkledrop ready for claims')

  } catch(error) {

    await console.log(error)

  }

  callback();

}
