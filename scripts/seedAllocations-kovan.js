require('dotenv').config();

const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0xaF8397fFdA7D912884412d811A0Ed09636257E62');
  const TToken = await ttoken.at('0x5Aa14c3d684c48c723473128cfa0222553848216');

  try {

    await TToken.mint(process.env.ACCOUNT, 2000);
    let balance = await TToken.balanceOf(process.env.ACCOUNT);
    console.log('balance of ' + process.env.ACCOUNT + ': ' + balance.toString())
    await TToken.approve(MerkleDropKovan.address, 1000)

    let trancheID = await MerkleDropKovan.seedNewAllocations('0x9aee5dc2e528a01616287b08f476cc4bcf7ea223ca304ade284e0129e5bbb03d', 1000);
    console.log(trancheID);

    let balance2 = await TToken.balanceOf(process.env.ACCOUNT);
    console.log('balance of ' + process.env.ACCOUNT + ': ' + balance2.toString())
    let contractBalance = await TToken.balanceOf(MerkleDropKovan.address)
    console.log('balance of MerkleDrop:' + contractBalance)

  } catch(error) {
    await console.log(error)
  }

  callback();
}
