require('dotenv').config();
const fs = require('fs');
const BigNumber = require('bignumber.js');
const contracts = require('../contractAddresses');
import { simpleToExactAmount } from '../test/utils/math'


BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMALS: 18
});

async function writeToArray(events){
  if(events.length == 0) {
      console.log('\n no events in specified range for contract');
      return;
  }
  let allAddresses = [];
  let parsedAddresses = [];
  let rewardsByAddress = [];
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
  // console.log('\ncreated address array:')
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
    for(i=0;i<rewards.length;i++){
      for(j=0;j<addressArray.length;j++){
        if(rewards[i].args.user === addressArray[j][0]){
          let current = addressArray[j][1];
          addressArray[j][1] = current.plus(rewards[i].args.reward)
        }
      }
    }
    return addressArray;
}

async function logAmounts(addressArray){
  let i;
  for(i=0;i<addressArray.length;i++){
    console.log(addressArray[i][0] + ': ' + addressArray[i][1]);
  }
}

async function writeBALAllocation(addressArray, totalBAL){
  let balAllocation = [];
  let rewardAmount = BigNumber(0); // sum of all rewards paid out
  let i;
  let j;
  for(i=0; i<addressArray.length; i++){
    rewardAmount = rewardAmount.plus(addressArray[i][1]);
  }
  for(j=0; j<addressArray.length; j++){
      /* what % is it of rewardTotal */
      let rewardOver100 = rewardAmount.dividedBy(100);
      let rewardPercentage = BigNumber(addressArray[j][1]).dividedBy(rewardOver100);
      /* what is this as a % of total BAL */
      let balOver100 = totalBAL.dividedBy(100);
      let balReward = BigNumber(rewardPercentage).multipliedBy(balOver100);

      /* push BAL allocation to array */
      let arr = [
        addressArray[j][0],
        BigNumber(balReward).toFixed(18)
      ]

      if(balReward.toNumber() === 0){
        console.log(addressArray[j][0] + ' did not remove rewards: not adding to BAL distribution')
      } else {
        console.log(addressArray[j][0] + ' can claim BAL')
        balAllocation.push(arr)
      }

  }
  return balAllocation;
}

module.exports = {
  writeToArray: writeToArray,
  addRewards: addRewards,
  logAmounts: logAmounts,
  writeBALAllocation: writeBALAllocation
};
