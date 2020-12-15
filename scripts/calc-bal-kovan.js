require('dotenv').config();
const fs = require('fs');
const BigNumber = require('bignumber.js');
const contracts = require('../contractAddresses');
const staking = artifacts.require('StakingRewards');
const allocation = require('../allocation/utils.js');

BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMAL_PLACES: 0,
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
    let balAllocation = [];

    /* these are loose for testing: we will have exact times at end */
    let now = await web3.eth.getBlockNumber();
    let prev = now - BigNumber(60*60*24*30); // now - 1 month

    /* Reward & BAL total for testing */
    const BAL = BigNumber(100000000);
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
    rewardsByAddress = await allocation.writeToArray(staked);
    console.log(JSON.stringify(rewardsByAddress))

    /* add rewarded amounts for addresses */
    forBal = await allocation.addRewards(rewards, rewardsByAddress);
    console.log('\ntotal rewards by account:');
    allocation.logAmounts(forBal);

    /* work out as % of sum of paid out rewards -> write array for each with BAL % for MerkleDrop */
    console.log('\n' + 'writing BAL allocation: ');
    balAllocation = await allocation.writeBALAllocation(forBal, BAL);

    fs.writeFileSync('./BalAllocation.json', JSON.stringify(balAllocation), (err) => {
        if (err) throw err;
    });
    console.log('\n BAL allocation written to "BalAllocation.json"');


  callback();

}
