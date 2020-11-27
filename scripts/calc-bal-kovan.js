require('dotenv').config();
const fs = require('fs');
const BigNumber = require('bignumber.js');

const staking = artifacts.require('StakingRewards');

BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMAL_PLACES: 18,
});

/*
* Following the logic of MStable (rewarding BAL according to MTA earned)
* we just reward BAL per % of total reward amount each address has earned
*
* Steps:
* - Staked event from StakingRewards -> parse array of addresses (avoid duplicates) DONE
* - get earned() for accounts array
* - check RewardPaid for accounts array
* - if duplicates add amounts together : earned() has not yet been claimed, whilst 'getReward' has
* - work out each as % of total reward amount
* - use these %s to work out BAL for each
* - use resulting array for MerkleDrop
*/

module.exports = async function(callback) {

    const StakingRewards = await staking.at('0xC5DB682Aeb48eF1dbF195E39C68A88E9D9d818a3'); // kovan address

    let parsedAddresses = [];
    let rewardsByAddress = [];

    /* these are loose for testing: we will have exact times at end */
    let now = await web3.eth.getBlockNumber();
    let prev = now - BigNumber(60*60*24*30); // now - 1 month

    /* Reward & BAL total for testing */
    const BAL = BigNumber(1000);
    // const BAL = BigNumber(925 * 100 * 1000000000000000000) // 92500000000000000000000
    const RewardAmount = BigNumber(925 * 100 * 1000000000000000000); // 92500000000000000000000

    let staked = await StakingRewards.getPastEvents('Staked', {
        fromBlock: prev,
        toBlock: now
    });


    /************
    *   STEPS   *
    ************/

    /* get all addresses that have staked */
    parsedAddresses = await writeToArray(staked);
    console.log(parsedAddresses);

    /* get earned() for addresses */
    rewardsByAddress = await getEarned(parsedAddresses);
    console.log('\n' + 'amounts earned by account:')
    logAmounts(rewardsByAddress);
    console.log('\n' + 'adding rewarded amounts..')

    /* add rewarded amounts for addresses */
    rewardsByAddress = await addRewards(rewardsByAddress);
    console.log('..total rewards by account:')
    logAmounts(rewardsByAddress);

    /* work out as % of total reward -> write array for each with BAL % for MerkleDrop */
    console.log('\n' + 'writing BAL allocation.. ');
    await writeBALAllocation(rewardsByAddress);


    /************
    * FUNCTIONS *
    ************/

    async function writeBALAllocation(addressArray){
      let balAllocation = [];
      let i;
      for(i=0; i<addressArray.length; i++){
          /* what % is it of rewardTotal */
          console.log('\n');
          console.log('total PRIME earned account' + [i] + ': ' + addressArray[i].amount.toString()); 
          let rewardOver100 = RewardAmount.dividedBy(100);
          let rewardPercentage = BigNumber(addressArray[i].amount).dividedBy(rewardOver100);
          console.log('reward percentage account' + [i] + ': ' + rewardPercentage.toString()); // <-- this seems off

          /* what is this as a % of total BAL */
          let balOver100 = BAL.dividedBy(100);
          let balReward = BigNumber(rewardPercentage).multipliedBy(balOver100);
          console.log('BAL reward: ' + balReward.toString())

          /* push BAL allocation to array */
          let arr = [
            addressArray[i].address,
            BigNumber(balReward)
          ]
          balAllocation.push(arr)
      }
      fs.writeFileSync('./allocation/' + 'kovanBalAllocation.json', JSON.stringify(balAllocation), (err) => {
          if (err) throw err;
      });
      console.log('BAL allocation written to "kovanBalAllocation.json"');
    }

    async function writeToArray(events){
      if(events.length == 0) {
          console.log('no events in specified range for contract at ' + StakingRewards.address);
          return;
      }
      console.log('parsing addresses of stakers..');
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
      return parsedAddresses;
    }

    async function getEarned(addressArray){
        for(i=0;i<parsedAddresses.length;i++){
          let earned = await StakingRewards.earned(addressArray[i]);
          // console.log(parsedAddresses[i] + ' has earned: ' + earned + ' PRIME');

          let obj = {
            address: parsedAddresses[i],
            amount: BigNumber(earned)
          }
          rewardsByAddress.push(obj)
        }
        return rewardsByAddress;
    }

    async function addRewards(addressArray){
        let rewards = await StakingRewards.getPastEvents('RewardPaid', {
            fromBlock: prev,
            toBlock: now
        });
        let i;
        let j;
        for(i=0;i<rewards.length;i++){
          for(j=0;j<addressArray.length;j++){
            if(rewards[i].args.user === addressArray[j].address){
              console.log('found match: ' + rewards[i].args.user + ' : ' + addressArray[j].address);
              let alreadyEarned = addressArray[j].amount;
              console.log('already earned: ' + alreadyEarned);
              let userReward = rewards[i].args.reward;
              console.log('reward: ' + userReward)
              addressArray[j].amount = alreadyEarned.plus(userReward);
              console.log('total: ' + BigNumber(addressArray[j].amount));
            }
          }
        }
        return rewardsByAddress;
    }

    async function logAmounts(addressArray){
      let i;
      for(i=0;i<addressArray.length;i++){
        console.log(addressArray[i].address + ': ' + addressArray[i].amount);
      }
    }

    callback();

};
