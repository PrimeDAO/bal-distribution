const Migrations = artifacts.require("Migrations");
const MerkleDrop = artifacts.require("MerkleDrop");
const TToken = artifacts.require("TToken");

// Bind the first argument of the script to the global truffle argument,
// with `web3`, `artifacts` and so on, and pass in all CLI arguments.
module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(Migrations);
    await deployer.deploy(MerkleDrop);
    await deployer.deploy(TToken, 'TTOKEN', 'TT', 18);
};
