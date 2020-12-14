require('dotenv').config();

const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const BigNumber = require('bignumber.js');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0xaF8397fFdA7D912884412d811A0Ed09636257E62');
  const TToken = await ttoken.at('0x5Aa14c3d684c48c723473128cfa0222553848216');

  try {
    console.log('initializing merkledrop');
    await MerkleDropKovan.initialize(process.env.ACCOUNT, [process.env.ACCOUNT], TToken.address);
    console.log('initialized')
  } catch(error) {
    consosle.log(error)
  }

  callback();
}
