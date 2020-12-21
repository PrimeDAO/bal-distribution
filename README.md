<p align="center">
<img src="https://i.ibb.co/6DBm381/photo-2020-12-21-12-27-29.jpg" width="500" height="300" />
</p>

<h1 align="center">PrimeDAO BAL distribution</h1>

> Scripts and smart contracts for the PrimeDAO BAL distribution following the close Prime's first Liquidity Mining program.

During PrimeDAO's first [Liquidity Mining program](https://medium.com/primedao/primes-first-liquidity-mining-program-b8e4abb6c63), Liquidity Providers have been accruing BAL. Due to the architecture of the smart contracts, this BAL was not automatically distributed to Liquidity Providers, and instead has accrued in the `StakingRewards` contract itself.

This repository is a set of scripts and a fork of mStable's [MerkleDrop](https://github.com/mstable/merkle-drop) contract with which the amount of BAL accrued by each LP will be computed and a claim mechanism set up.

For a step-by-step user guide to claiming your BAL, please see our [documentation](https://medium.com/primedao/claim-your-liquidity-rewards-to-receive-your-balancer-tokens-a865c2a529f7).

- Functions in `/allocation/utils.js` are used to compute the amount of BAL owed to each Liquidity Provider.
- Scripts in `/scripts/kovan` are used for initializing and testing against a deployed instance of the MerkleDrop contract on Kovan.
- `/merklscripts/` contains scripts for creating the MerkleRoot containing the claims for each Liquidity Provider to be seeded in the MerkleDrop contract.
- `MerkleDrop.sol` is a fork of mStable's MerkleDrop contract, slightly adjusted to suit PrimeDAO's needs:
  - Functionality for claiming for multiple tranches (periods) has been removed, as only one tranche can be claimed for (the period of the Liquidity Mining program).

**⚠ Users will need to withdraw their PRIME rewards from the liquidity mining contract by January 7th, 2021 in order to receive Balancer Pool tokens.**

## Setting up
Install dependencies
```
yarn install
```

Run tests
```
yarn test
```

## Deploy and prepare claims: Kovan
- Create a `.env` file containing `NETWORK`, `PROVIDER`, `KEY`, & `ACCOUNT` parameters

- Migrate contracts
```
npm run migrate:kovan
```

- Initialize Merkledrop
```
npm run init-merkledrop:kovan
```

- Calculate BAL allocation
```
npm run calc-bal:kovan
```

- Copy the contents of the array saved in `/allocation/BalAllocation.json` into `getTranche()` in `/merklescripts/create-merkleroot.ts` and create the merkleroot for the computed tranche
```
npm run create-merkleroot
```

- Seed allocations for the computed tranche
```
npm run seed-allocations:kovan
```

## Deploy and prepare claims: Mainnet
- Create a .env file containing `NETWORK`, `PROVIDER`, `KEY`, `ACCOUNT` & `BAL` parameters

- Migrate contracts
```
npm run migrate:mainnet
```

- Initialize Merkledrop
```
npm run init-merkledrop:mainnet
```

- Calculate BAL allocation
```
npm run calc-bal:mainnet
```

- Copy the contents of the array saved in `/allocation/BalAllocationMainnet.json` into `getTranche()` in `/merklescripts/create-merkleroot.ts` and create the merkleroot for the computed tranche
```
npm run create-merkleroot
```

- Seed allocations for the computed tranche
```
npm run seed-allocations:mainnet
```

## Contributing to PrimeDAO
If you wish to contribute to PrimeDAO, check out our [Contributor Onboarding documentation](https://docs.primedao.io/primedao/call-for-contributors).

## License
```
Copyright 2020 Prime Foundation

Licensed under the GNU General Public License v3.0.
You may obtain a copy of this license at:

  https://www.gnu.org/licenses/gpl-3.0.en.html

```
