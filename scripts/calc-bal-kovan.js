require('dotenv').config();
const fs = require('fs');
const BigNumber = require('bignumber.js');
const contracts = require('../contractAddresses');

const staking = artifacts.require('StakingRewards');

BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMAL_PLACES: 18,
});

/*
* Following the logic of MStable (rewarding BAL according to MTA earned)
* we just reward BAL per % of total reward amount each address has earned
*/

module.exports = async function(callback) {

  const StakingRewards = await staking.at(contracts.kovan.StakingRewards);

    let parsedAddresses = [];
    let rewardsByAddress = [];
    let forBal = [];

    /* these are loose for testing: we will have exact times at end */
    let now = await web3.eth.getBlockNumber();
    let prev = now - BigNumber(60*60*24*30); // now - 1 month

    /* Reward & BAL total for testing */
    const BAL = BigNumber(1000);
    const RewardAmount = BigNumber(await StakingRewards.initreward());
    console.log('reward amount: ' + RewardAmount);

    let staked = await StakingRewards.getPastEvents('Staked', {
        fromBlock: prev,
        toBlock: now
    });

    let rewards = await StakingRewards.getPastEvents('RewardPaid', {
        fromBlock: prev,
        toBlock: now
    });

    /************
    *   STEPS   *
    ************/

    /* get all addresses that have staked */
    rewardsByAddress = await writeToArray(staked);
    // console.log(parsedAddresses[0][0], (parsedAddresses[0][1]).toString());
    console.log(JSON.stringify(rewardsByAddress))

    /* add rewarded amounts for addresses */
    forBal = await addRewards(rewards, rewardsByAddress);
    console.log('\n..total rewards by account:')
    logAmounts(forBal);

    /* work out as % of total reward -> write array for each with BAL % for MerkleDrop */
    console.log('\n' + 'writing BAL allocation.. ');
    await writeBALAllocation(rewardsByAddress);


    /************
    * FUNCTIONS *
    ************/

    async function writeToArray(events){
      if(events.length == 0) {
          console.log('\n no events in specified range for contract at ' + StakingRewards.address);
          return;
      }
      console.log('\n parsing addresses..');
      let allAddresses = [];
      let i;
      for(i=0;i<events.length;i++) {
          /* push addresses into array*/
          allAddresses.push(events[i].args.user);
      }
      /* remove duplicate addresses */
      for(var value of allAddresses){
        if(parsedAddresses.indexOf(value) === -1){
            parsedAddresses.push(value);
        }
      }
      console.log('..created address array:')
      for(i=0;i<parsedAddresses.length;i++){
        let obj = [
          parsedAddresses[i],
          BigNumber(0)
        ]
        rewardsByAddress.push(obj)
      }
      return rewardsByAddress;
    }

    async function addRewards(rewards, addressArray){
        let i;
        let j;

        console.log(addressArray.length)
        for(i=0;i<rewards.length;i++){
          for(j=0;j<addressArray.length;j++){
            if(rewards[i].args.user === addressArray[j][0]){
              // need to rewrite not push!
              console.log('found match: ' + rewards[i].args.user + ' --- ' + rewards[i].args.reward);
              let current = addressArray[j][1];
              // console.log('current' + current)
              addressArray[j][1] = current.plus(rewards[i].args.reward)
              // console.log(addressArray[j][1])
            }
          }
        }
        return rewardsByAddress;
    }

    async function logAmounts(addressArray){
      let i;
      for(i=0;i<addressArray.length;i++){
        console.log(addressArray[i][0] + ': ' + addressArray[i][1]);
      }
    }

    async function writeBALAllocation(addressArray){
      let balAllocation = [];
      let i;
      for(i=0; i<addressArray.length; i++){
          /* what % is it of rewardTotal */
          console.log('total PRIME earned account' + [i] + ': ' + (addressArray[i][1]).toString());
          let rewardOver100 = RewardAmount.dividedBy(100);
          let rewardPercentage = BigNumber(addressArray[i][1]).dividedBy(rewardOver100);
          console.log('reward percentage account' + [i] + ': ' + rewardPercentage.toString());

          /* what is this as a % of total BAL */
          let balOver100 = BAL.dividedBy(100);
          let balReward = BigNumber(rewardPercentage).multipliedBy(balOver100);
          console.log('BAL reward: ' + balReward.toString())

          /* push BAL allocation to array */
          let arr = [
            addressArray[i][0],
            BigNumber(balReward)
          ]
          balAllocation.push(arr)
      }
      fs.writeFileSync('./allocation/' + 'kovanBalAllocation.json', JSON.stringify(balAllocation), (err) => {
          if (err) throw err;
      });
      console.log('BAL allocation written to "kovanBalAllocation.json"');
    }


  callback();

}
