# PrimeDAO incentives round BAL distribution

This repo is for the BAL distribution following the close of the PrimeDAO incubation round rewards round.

It is comprised of scripts built atop the MStable MerkleDrop repo. These can be found in:

- `/allocation/`
- `scripts/`

These scripts calculate BAL allocation according to the same logic as MStable: the % of reward earned == the % of the total BAL allocation.

To calculate the amount of BAL per account for deployed `StakingRewards` contracts:
- Kovan (`0xC5DB682Aeb48eF1dbF195E39C68A88E9D9d818a3`):
```
npm run calc-bal:kovan
```

- Mainnet (`0xE25faBF901Be98099b0FD8C8b3827A4c69F909E4`):
```
npm run calc-bal:mainnet [ not functional yet ]
```


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
