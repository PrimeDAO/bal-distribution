require('dotenv').config();
// const merkletree = require('../merkletree');
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const allocation = require('../allocation/balArray');
const BigNumber = require('bignumber.js');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0xaF8397fFdA7D912884412d811A0Ed09636257E62');
  const TToken = await ttoken.at('0x5Aa14c3d684c48c723473128cfa0222553848216');

  let account = (allocation.allocation[0][0]).toString()
  console.log(account)

  try {

    await TToken.mint(MerkleDropKovan.address, '1000000000000000000000')

    console.log(await TToken.balanceOf(account))

    let verify = await MerkleDropKovan.verifyClaim(
      account,
      2,
      '1000000000000000000000',
      [ '0x2d40e7a64991b22baba3dd84925d8c649fb0c53dd48f65394fc1e28747421b44' ]
    )
    console.log(verify)


    await MerkleDropKovan.claimWeek(
      allocation.allocation[0][0],
      2,
      '1000000000000000000000',
      [ '0x2d40e7a64991b22baba3dd84925d8c649fb0c53dd48f65394fc1e28747421b44' ]
    )

  console.log( (await TToken.balanceOf(account)).toString() )

  } catch(error) {
    await console.log(error)
  }

  callback();
}
