require('dotenv').config();
const BigNumber = require('bignumber.js');
const config = require('../../contract-config.json');
const contracts = require('../../contractAddresses');
const merkleroot = require('../../merklescripts/merkleroot');
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const { toWei } = web3.utils;


module.exports = async function(callback) {

  try {

    const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
    const TToken = await ttoken.at(contracts.kovan.TToken);

    let balAmount = toWei((config.kovan.BALAmount).toString());
    console.log('BAL to seed: ' + config.kovan.BALAmount);
    let account = process.env.ACCOUNT;

    console.log('transferring kovan BAL to merkledrop funding account...');
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
