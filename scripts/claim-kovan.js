require('dotenv').config();
const merkledrop = artifacts.require('MerkleDrop');
const ttoken = artifacts.require('TToken');
const allocation = require('../allocation/balArray');
const BigNumber = require('bignumber.js');

module.exports = async function(callback) {

  const MerkleDropKovan = await merkledrop.at('0x2DceeFaA9471C2647030549b17fdEEc2E4aa0F5B');
  const TToken = await ttoken.at('0x3618A04c72B1DF99d1c6A528F6Fc6267e1D1C6D6');

  /* for user to fill in */
  let account = allocation.allocation[1][0] // <-- account
  let amount = (allocation.allocation[1][1]).toString(); // <-- amount

  try {

    await TToken.mint(MerkleDropKovan.address, '142000000000000000000')

    /* these are loose for testing: we will have exact times at end */
    // let now = await web3.eth.getBlockNumber();
    // let prev = now - BigNumber(60*60*24*30); // now - 1 month
    //
    // let tranches = await MerkleDropKovan.getPastEvents('TrancheAdded', {
    //   fromBlock: prev,
    //   toBlock: now
    // })
    //
    // console.log(tranches)


    // let verify = await MerkleDropKovan.verifyClaim(
    //   account,
    //   0,
    //   '142000000000000000000',
    //   [ '0x21bf475deca8618192e87c8a3a8f14af1dd77463e3a5ba3ef4fc5ee936c1a5ca' ]
    // )

    // if(verify === true){
      // console.log('proof verified - claiming BAL...')
      console.log('claiming for tranche...')
      await MerkleDropKovan.claimWeek(
        account,
        0,
        '142000000000000000000', // does this need to be balance toWei ?
        [ '0x21bf475deca8618192e87c8a3a8f14af1dd77463e3a5ba3ef4fc5ee936c1a5ca' ]
      )

      console.log('...claim successful')
      console.log('your new BAL balance: ' + (await TToken.balanceOf(account)).toString())
    // } else {
    //   console.log('proof is ' + verify)
    // }

  } catch(error) {
    await console.log(error)
  }

  callback();
}
