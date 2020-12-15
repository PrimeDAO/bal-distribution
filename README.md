# PrimeDAO incentives round BAL distribution

This repo is for the BAL distribution following the close of the PrimeDAO incubation round rewards round.

It is comprised of scripts built atop the MStable MerkleDrop repo. These can be found in:

- `/allocation/`
- `/scripts/`

These scripts calculate BAL allocation according to the same logic as MStable: the % of reward earned == the % of the total BAL allocation.

Users will have had to withdraw their rewards prior to the BAL distribution.

- To calculate the amount of BAL per account for deployed `StakingRewards` contract on Kovan (stakingrewards @ `0xC5DB682Aeb48eF1dbF195E39C68A88E9D9d818a3`):

Create a `.env` file containing `NETWORK`, `PROVIDER`, `KEY` and `ACCOUNT` parameters & run:
```
npm run calc-bal:kovan
```

Create a merkleroot for claimants and seedNewAllocations in the contract (merkledrop on kovan at `0x2DceeFaA9471C2647030549b17fdEEc2E4aa0F5B`, ttoken @ `0x3618A04c72B1DF99d1c6A528F6Fc6267e1D1C6D6`):
```
npm run create-merkleroot:kovan
```
copy the merkleroot into the `seedNewAllocations` function in `seedAllocations-kovan.js` & run:
```
npm run seed-allocations:kovan
```

Create a proof of your claim to copy into etherscan to verify & then claim:
```
npm run create-proof:kovan
```

Alternatively, run this script to claim via an HDWalletProvider connection:
```
npm run claim:kovan
```

*If deploying the contracts yourself for testing initialize the MerkleDrop contract first:*
```
npm run init-merkledrop:kovan
```

- To create a proof for your account:
    - navigate to list of accounts and claim amounts (this needs to be hosted on IPFS)
    - Run the script (make tree for account, call getAccountBalanceProof function w this tree & log to console)
    - Go to the contract on etherscan
    - claim with the Proof

### to do:
  - ~~write script for making tree w all claimants & calling `seedNewAllocations` (see TestMerkleDrop spec file)~~
  - ~~write script for making proof for user (see TestMerkleDrop spec file)~~
  - kovan testing
    - ~~general~~
    - redploy contracts & clean run-through: scripts
    - verify contract on etherscan
    - redploy contracts & clean run-through: etherscan
  - ~~general tidying up & optimization~~
  - create list of arrays for `getTranche` to pass in dynamically
  - tweak bal allocation script to round to whole numbers
  - deploy Merkledrop to mainnet & verify
  - documentation

# Merkle-drop

A lightweight Merkle Drop contract

## Prerequisites

* [Node.js][1]

## Installation

    yarn install

## Testing

    yarn test

## Deployment

### Local deployment

Start an instance of `ganache-cli`

    ganache-cli -p 7545 -l 8000000

Run the migration

    yarn migrate

### Rinkeby / Kovan

Edit `truffle-config.js`, and add a mnemonic for the `HDWalletProvider` for a private key that is funded.

#### Deploy to Kovan

    yarn migrate:kovan

#### Deploy to Ropsten

    yarn migrate:Ropsten

[1]: https://nodejs.org/
