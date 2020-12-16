# PrimeDAO incentives round BAL distribution

This repo is for the BAL distribution following the close of the PrimeDAO incubation round rewards round.

It is comprised of scripts built atop the MStable MerkleDrop repo. These can be found in:

- `/allocation/`
- `/scripts/`
- `MERKLE SCRIPTS DIRECTORY`

These scripts calculate BAL allocation according to the same logic as MStable: the % of reward earned == the % of the total BAL allocation.

Users will have had to withdraw their rewards prior to the BAL distribution.


USERS:
- navigate to list of accounts and claim amounts (this needs to be hosted on IPFS)
- Go to the contract on etherscan at ______.
- claim with the provided address, amount, and merkleproof information, entering '0' as the tranche
- *if users wish to create their own proof, simply replace the [ 'address' ] on line 102 of `create-proof.ts` and 107 & run `npm run create-proof`. The proof will be logged in the cli and written to `merkleproof.json` in the root directory* <--- change this to using config file 


DEV:
- package.json includes scripts for deployment to mainnet, kovan, and ropsten. N.B. remember to update the `contratAddresses.json` file with the new addresses.

- *If deploying the contracts yourself for testing initialize the MerkleDrop contract first:*
```
npm run init-merkledrop:kovan
```

- To calculate the amount of BAL per account for deployed `StakingRewards` contract on Kovan (stakingrewards @ `0xC5DB682Aeb48eF1dbF195E39C68A88E9D9d818a3`):

Create a `.env` file containing `NETWORK`, `PROVIDER`, `KEY` and `ACCOUNT` parameters & run:
```
npm run calc-bal:kovan
```

Copy the contents of the array saved in `BalAllocation.json` into `getTranche()` line 85 `create-merkleroot.ts` & line __ `create-proof.ts`

Create a merkleroot for claimants and seedNewAllocations in the contract (merkledrop on kovan at `0x2DceeFaA9471C2647030549b17fdEEc2E4aa0F5B`, ttoken @ `0x3618A04c72B1DF99d1c6A528F6Fc6267e1D1C6D6`):
```
npm run create-merkleroot
```
copy the merkleroot (either from `./merkleroot.json`) or the CLI output into the variable at line 14 in `seedAllocations-kovan.js` & run:
```
npm run seed-allocations:kovan
```

run `` to create list of addresses, allocations, and proofs for claiming: this file should be uploaded to IPFS to share with claimaints


### to do:
  - ~~write script for making tree w all claimants & calling `seedNewAllocations` (see TestMerkleDrop spec file)~~
  - ~~write script for making proof for user (see TestMerkleDrop spec file)~~
  - kovan testing
    - ~~general~~
    - ~~redploy contracts & clean run-through: scripts~~
    - ~~verify contract on etherscan~~
    - redploy contracts & clean run-through: etherscan
        - some issue with interacting via etherscan: script runthrough works fine
  - ~~general tidying up & optimization~~
  - ~~tweak bal allocation script: whole numbers~~
  - change `claimWeek()` to `claimTranche()` & remove `claimWeeks()`
      1. smart contract
      2. test
      3. scripts
  - add proofs to bal allocation - new file for upload to ipfs
  - directories tidyup:
      1. add BAL amount to .env
      1. merkle scripts
      2. scripts: split into `kovan` & `mainnet`
      3. create mainnet script copies
  - ~~cli tidyup:~~
    1. ~~seedAllocations script~~
  - deploy Merkledrop to mainnet & verify
  - documentation tidyup
  - look into dynamic array creation (optional : optimization)

add address to config file in root, import into scripts, & then do runthrough via truffle if etherscan wont work

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
