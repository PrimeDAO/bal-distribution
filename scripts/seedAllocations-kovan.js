require('dotenv').config();

const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0x2DceeFaA9471C2647030549b17fdEEc2E4aa0F5B');
  const TToken = await ttoken.at('0x3618A04c72B1DF99d1c6A528F6Fc6267e1D1C6D6');

  let balAmount = 200000000;
  let account = process.env.ACCOUNT;
  let merkleroot = '0xe7bec26ea0f034779aaab791cd0b28ebba003f341c93f45e90d903e38c89d62f'

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
