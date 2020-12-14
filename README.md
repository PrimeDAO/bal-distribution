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

Create a merkleroot for claimants and seedNewAllocations in the contract (merkledrop on kovan at `0xaF8397fFdA7D912884412d811A0Ed09636257E62`, ttoken @ `0x5Aa14c3d684c48c723473128cfa0222553848216`):
```

```

Create a proof of your claim to copy into etherscan to claim:
```

```

*If deploying the contracts yourself for testing initialize the MerkleDrop contract first:*
```
npm run init-merkledrop:kovan
```

- To create a proof for your account:
    - Run the script (make tree for account, call getAccountBalanceProof function w this tree & log to console)
    - Go to the contract on etherscan
    - claim with the Proof

### to do:
  - write script for making tree w all claimants & calling `seedNewAllocations` (see TestMerkleDrop spec file)
  - write script for making proof for user (see TestMerkleDrop spec file)
  - kovan test
  - verify contract on etherscan
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
