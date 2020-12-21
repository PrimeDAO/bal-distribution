const MerkleDrop = artifacts.require('MerkleDrop');
const TToken = artifacts.require('TToken');
const contracts = require('../contractAddresses.json');
const config = require('../contract-config.json');
const fs = require("fs");

module.exports = async function (deployer, network) {
    const { toWei } = web3.utils;

    if (network === 'mainnet') {

        await deployer.deploy(MerkleDrop);

        contracts.mainnet.MerkleDrop = MerkleDrop.address;

        // overwrite contranctAddresses.json
        fs.writeFile('./contractAddresses.json', JSON.stringify(contracts), (err) => {
           if (err) throw err;
         });

    } else if (network === 'kovan') {

        await deployer.deploy(MerkleDrop);
        await deployer.deploy(TToken, 'TTOKEN', 'TT', 18);

        contracts.kovan.MerkleDrop = MerkleDrop.address;
        contracts.kovan.TToken = TToken.address;

        // overwrite contranctAddresses.json
        fs.writeFile('./contractAddresses.json', JSON.stringify(contracts), (err) => {
           if (err) throw err;
         });
    }
};
