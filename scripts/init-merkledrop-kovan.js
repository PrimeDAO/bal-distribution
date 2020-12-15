require('dotenv').config();

const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const BigNumber = require('bignumber.js');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0x2DceeFaA9471C2647030549b17fdEEc2E4aa0F5B');
  const TToken = await ttoken.at('0x3618A04c72B1DF99d1c6A528F6Fc6267e1D1C6D6');

  try {
    console.log('initializing merkledrop');
    await MerkleDropKovan.initialize(process.env.ACCOUNT, [process.env.ACCOUNT], TToken.address);
    console.log('initialized')
  } catch(error) {
    consosle.log(error)
  }

  callback();
}
  
