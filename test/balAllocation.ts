/*global artifacts, web3, contract, before, it, context*/
/*eslint no-undef: "error"*/

const chai = require('chai');
import { expect } from 'chai';
const { constants, time, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const allocation = require('../allocation/utils.js');
const contracts = require('../contractAddresses');
const BigNumber = require('bignumber.js');
const fs = require('fs');

const StakingRewards = artifacts.require('StakingRewards');
const TToken = artifacts.require('TToken');

const { toWei } = web3.utils;
const DECIMALS = 18;

BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMAL_PLACES: 18,
});

contract('BAL allocation', (accounts) => {
  let stakeAmount = toWei('1000');
  let halfStake = toWei('500');
  let quarterStake = toWei('250');

  let rewardAmount;
  let _initreward = (BigNumber(925 * 100 * 1000000000000000000)).toString(); // "92500000000000003145728"
  let _starttime = 1600560000;
  let _durationDays = 7;

  let stakingRewards;
  let bal;
  let rewardToken;
  let stakingToken;

  let balAllocation;

  let rewards;
  const BAL = BigNumber(process.env.BAL);


  before('!! deploy and setup', async () => {
     stakingRewards = await StakingRewards.new();
     bal = await TToken.new('TToken', 'TKN', DECIMALS);
     rewardToken = await TToken.new('PRIME', 'PRM', DECIMALS);
     stakingToken = await TToken.new('STAKING', 'STK', DECIMALS);
  });

  context('BAL allocation runthrough', async () => {
      context('stake -> rewards -> bal allocation', async () => {
          before('setup', async () => {
              await rewardToken.mint(stakingRewards.address, _initreward);
              await stakingRewards.initialize(rewardToken.address, stakingToken.address, _initreward, _starttime, _durationDays)

              await stakingToken.mint(accounts[1], stakeAmount);
              await stakingToken.mint(accounts[2], stakeAmount);
              await stakingToken.mint(accounts[3], stakeAmount);
              await stakingToken.mint(accounts[4], stakeAmount);
              await stakingToken.mint(accounts[5], stakeAmount);
              await stakingToken.mint(accounts[6], stakeAmount);
              await stakingToken.mint(accounts[7], stakeAmount);
              await stakingToken.mint(accounts[8], stakeAmount);

              let balance = await stakingToken.balanceOf(accounts[1]);
              expect(balance.toString()).to.equal(stakeAmount)

              await stakingToken.approve(stakingRewards.address, stakeAmount, {from:accounts[1]});
              await stakingRewards.stake(stakeAmount, {from: accounts[1]});
              await stakingToken.approve(stakingRewards.address, halfStake, {from:accounts[2]});
              await stakingRewards.stake(halfStake, {from: accounts[2]});
              await stakingToken.approve(stakingRewards.address, quarterStake, {from:accounts[3]});
              await stakingRewards.stake(quarterStake, {from: accounts[3]});
              await stakingToken.approve(stakingRewards.address, stakeAmount, {from:accounts[4]});
              await stakingRewards.stake(stakeAmount, {from: accounts[4]});
              await stakingToken.approve(stakingRewards.address, halfStake, {from:accounts[5]});
              await stakingRewards.stake(halfStake, {from: accounts[5]});
              await stakingToken.approve(stakingRewards.address, quarterStake, {from:accounts[6]});
              await stakingRewards.stake(quarterStake, {from: accounts[6]});
              await stakingToken.approve(stakingRewards.address, stakeAmount, {from:accounts[7]});
              await stakingRewards.stake(stakeAmount, {from: accounts[7]});
              await stakingToken.approve(stakingRewards.address, stakeAmount, {from:accounts[8]});
              await stakingRewards.stake(stakeAmount, {from: accounts[8]});

              await time.increase(time.duration.days(8));

              await stakingRewards.getReward({from:accounts[1]});
              await stakingRewards.getReward({from:accounts[2]});
              await stakingRewards.getReward({from:accounts[3]});
              await stakingRewards.getReward({from:accounts[4]});
              await stakingRewards.getReward({from:accounts[5]});
              await stakingRewards.getReward({from:accounts[6]});
              await stakingRewards.getReward({from:accounts[7]});

              await time.increase(time.duration.hours(2));
          });
          it('grabbed events array length == number of events', async () => {
              let rewards = await stakingRewards.getPastEvents('RewardPaid', {
                  fromBlock: 0,
                  toBlock: 'latest'
              });

              expect(rewards.length).to.equal(7);
          });
          it('allocates out BAL according to % allocation of paid out PRIME rewards', async () => {
              let allocatedBAL = BigNumber(0); // sum of all rewards paid out

              let rewards = await stakingRewards.getPastEvents('RewardPaid', {
                  fromBlock: 0,
                  toBlock: 'latest'
              });
              // using local array for testing
              let rewardsByAddress = await allocation.writeToArray(rewards);
              let forBal = await allocation.addRewards(rewards, rewardsByAddress);
              balAllocation = await allocation.writeBALAllocation(forBal, BAL);

              fs.writeFileSync('./BalAllocation.json', JSON.stringify(balAllocation), (err) => {
                  if (err) throw err;
              });

              let i;
              for(i=0; i<balAllocation.length; i++){
                allocatedBAL = allocatedBAL.plus(balAllocation[i][1]);
              }

              /* cannot expect exact equivalence due to fractional remaining reward in Staking contract */
              expect(allocatedBAL.toNumber()).to.be.at.most(BAL.toNumber());
              expect(allocatedBAL.toNumber()).to.be.at.least((BAL.minus(BAL.dividedBy(100))).toNumber());

          });
      });
  });

});
