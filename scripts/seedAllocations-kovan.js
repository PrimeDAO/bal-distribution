require('dotenv').config();
const BigNumber = require('bignumber.js');
const contracts = require('../contractAddresses');
const merkleroot = require('../merkleroot')
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const TToken = await ttoken.at(contracts.kovan.TToken);

  let balAmount = BigNumber(process.env.BAL);
  let account = process.env.ACCOUNT;
  let merkleroot = merkleroot;

  try {

    console.log('transferring BAL to merkledrop funding account...');
    await TToken.mint(account, balAmount);
    console.log('...transfer complete \n approving...');
    await TToken.approve(MerkleDropKovan.address, balAmount);
    console.log('...approval complete \n seeding new allocations...');
    await MerkleDropKovan.seedNewAllocations(merkleroot, balAmount);
    console.log('...seeding complete: merkledrop ready for claims')

  } catch(error) {

    await console.log(error)

  }

  callback();

}
