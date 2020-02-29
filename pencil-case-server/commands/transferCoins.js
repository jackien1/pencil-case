// imports packages
require("dotenv").config();
const Web3 = require("web3");
const { RINKEBY_PRIVATE_KEY, INFURA_API_KEY, LOOM_PRIVATE_KEY } = process.env;
const {
  createEthereumGatewayAsync,
  LoomProvider,
  LocalAddress,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Client,
  CryptoUtils
} = require("loom-js");
const { ethers } = require("ethers");
const MyRinkebyCoinJSON = require("../src/contracts/MyRinkebyCoin.json");
const MyCoinJSON = require("../src/contracts/MyCoin.json");

// stores gateway address for transfers
const rinkebyGatewayAddress = "0x9c67fD4eAF0497f9820A3FBf782f81D6b6dC4Baa";

const transfer = async () => {
  const web3js = new Web3(`https://rinkeby.infura.io/v3/${INFURA_API_KEY}`);
  const owner = web3js.eth.accounts.privateKeyToAccount(
    "0x" + RINKEBY_PRIVATE_KEY
  );

  web3js.eth.accounts.wallet.add(owner);

  const networkId = await web3js.eth.net.getId();
  const rinkebyCoinContract = new web3js.eth.Contract(
    MyRinkebyCoinJSON.abi,
    MyRinkebyCoinJSON.networks[networkId].address
  );

  await rinkebyCoinContract.methods
    .approve(rinkebyGatewayAddress, (1000000000).toString())
    .send({ from: owner.address, gas: 1000000 });

  const gateway = await createEthereumGatewayAsync(
    2,
    rinkebyGatewayAddress,
    new ethers.Wallet(
      owner.privateKey,
      new ethers.providers.Web3Provider(web3js.currentProvider)
    )
  );

  const tx = await gateway.depositERC20Async(
    1000000000,
    MyRinkebyCoinJSON.networks[networkId].address,
    {
      gasLimit: 1000000
    }
  );

  console.log(`Coins deposited, Rinkeby tx hash: ${tx.hash}`);
};

transfer();
