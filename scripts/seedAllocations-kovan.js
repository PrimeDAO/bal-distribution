require('dotenv').config();
const contracts = require('../contractAddresses');

const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at(contracts.kovan.MerkleDrop);
  const TToken = await ttoken.at(contracts.kovan.TToken);

  let balAmount = 200000000;
  let account = process.env.ACCOUNT;
  let merkleroot = '0xbe4b5943c5391378201f69adda2c7c8e37eeaf133676a408dddac819b2e4387a'

  try {

    await TToken.mint(account, balAmount);
    let balance = await TToken.balanceOf(account);
    console.log('balance of ' + account + ': ' + balance.toString())
    await TToken.approve(MerkleDropKovan.address, balAmount)

    let trancheID = await MerkleDropKovan.seedNewAllocations(merkleroot, balAmount);
    console.log(trancheID);

    let balance2 = await TToken.balanceOf(account);
    console.log('balance of ' + account + ': ' + balance2.toString())
    let contractBalance = await TToken.balanceOf(MerkleDropKovan.address)
    console.log('balance of MerkleDrop:' + contractBalance)

  } catch(error) {

    await console.log(error)

  }

  callback();

}
