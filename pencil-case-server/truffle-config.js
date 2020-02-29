require("dotenv").config();
const { join } = require("path");
const LoomTruffleProvider = require("loom-truffle-provider");
const HDWalletProvider = require("truffle-hdwallet-provider");
const { LOOM_PRIVATE_KEY, RINKEBY_MNEMONIC, INFURA_API_KEY } = process.env;

module.exports = {
  contracts_build_directory: join(__dirname, "./src/contracts"),
  compilers: {
    solc: {
      version: "0.5.0"
    }
  },
  networks: {
    extdev_plasma_us1: {
      provider: function() {
        const chainId = "extdev-plasma-us1";
        const writeUrl = "http://extdev-plasma-us1.dappchains.com:80/rpc";
        const readUrl = "http://extdev-plasma-us1.dappchains.com:80/query";
        return new LoomTruffleProvider(
          chainId,
          writeUrl,
          readUrl,
          LOOM_PRIVATE_KEY
        );
      },
      network_id: "9545242630824"
    },
    rinkeby: {
      provider: new HDWalletProvider(
        RINKEBY_MNEMONIC,
        `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`
      ),
      network_id: 4,
      gasPrice: 15000000001,
      skipDryRun: true
    }
  }
};
