require('dotenv').config();
const fs = require('fs');
const BigNumber = require('bignumber.js');
const config = require('../../contract-config.json');
const contracts = require('../../contractAddresses');
const staking = artifacts.require('StakingRewards');
const allocation = require('../../allocation/utils.js');
const { toWei } = web3.utils;


BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMALS: 0
});

module.exports = async function(callback) {

  try {

    const StakingRewards = await staking.at(contracts.kovan.StakingRewards);

    let parsedAddresses = [];
    let rewardsByAddress = [];
    let forBal = [];
    let balAllocation = [];

    /* these are loose for testing */
    let now = await web3.eth.getBlockNumber();
    let prev = now - BigNumber(60*60*24*30); // now - 1 month

    /* Reward & BAL total for testing */
    const BAL = BigNumber(config.kovan.BALAmount);
    console.log('BAL to allocate: ' + BAL.toString());
    const RewardAmount = BigNumber(await StakingRewards.initreward());
    // console.log('reward amount: ' + RewardAmount);

    let staked = await StakingRewards.getPastEvents('Staked', {
        fromBlock: 11271944,
        toBlock: now
    });

    let rewards = await StakingRewards.getPastEvents('RewardPaid', {
        fromBlock: 11271944,
        toBlock: now
    });

    /************
    *   STEPS   *
    ************/

    /* get all addresses that have staked */
    rewardsByAddress = await allocation.writeToArray(staked);

    /* add rewarded amounts for addresses */
    forBal = await allocation.addRewards(rewards, rewardsByAddress);
    console.log('\nPRIME rewards by account:');
    allocation.logAmounts(forBal);

    /* work out as % of sum of paid out rewards -> write array for each with BAL % for MerkleDrop */
    console.log('\n' + 'calculating BAL allocation...');
    balAllocation = await allocation.writeBALAllocation(forBal, BAL);

    await fs.writeFileSync('./allocation/kovan/BalAllocation.json', JSON.stringify(balAllocation), (err) => {
        if (err) throw err;
    });
    console.log('...BAL allocation written to "./allocation/kovan/BalAllocation.json"');

  } catch(error) {

      console.log(error);

  }


  callback();

}
