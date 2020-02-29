require("dotenv").config();
const Web3 = require("web3");
const {
  CryptoUtils,
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Address,
  LocalAddress,
  Contracts,
  LoomProvider,
  soliditySha3
} = require("loom-js");

const { LOOM_PRIVATE_KEY, RINKEBY_PRIVATE_KEY, INFURA_API_KEY } = process.env;

const { OfflineWeb3Signer } = require("loom-js/dist/solidity-helpers");

const MyRinkebyCoinJSON = require("../src/contracts/MyRinkebyCoin.json");
const MyCoinJSON = require("../src/contracts/MyCoin.json");
const RinkebyGatewayJSON = require("../src/Gateway.json");

const TransferGateway = Contracts.TransferGateway;

const extdevChainId = "extdev-plasma-us1";

const loadRinkebyAccount = async () => {
  const web3js = new Web3(`https://rinkeby.infura.io/v3/${INFURA_API_KEY}`);
  const ownerAccount = web3js.eth.accounts.privateKeyToAccount(
    "0x" + RINKEBY_PRIVATE_KEY
  );
  web3js.eth.accounts.wallet.add(ownerAccount);

  return { account: ownerAccount, web3js };
};

const loadExtdevAccount = async () => {
  const privateKey = CryptoUtils.B64ToUint8Array(LOOM_PRIVATE_KEY);
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
  const client = new Client(
    extdevChainId,
    "wss://extdev-plasma-us1.dappchains.com/websocket",
    "wss://extdev-plasma-us1.dappchains.com/queryws"
  );
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ];
  client.on("error", msg => {
    console.error("PlasmaChain connection error", msg);
  });

  return {
    account: LocalAddress.fromPublicKey(publicKey).toString(),
    web3js: new Web3(new LoomProvider(client, privateKey)),
    client
  };
};

const mapContracts = async ({
  client,
  signer,
  coinRinkebyAddress,
  coinExtdevAddress,
  ownerExtdevAddress,
  rinkebyTxHash
}) => {
  const ownerExtdevAddr = Address.fromString(
    `${client.chainId}:${ownerExtdevAddress}`
  );

  const gatewayContract = await TransferGateway.createAsync(
    client,
    ownerExtdevAddr
  );
  const foreignContract = Address.fromString(`eth:${coinRinkebyAddress}`);

  const localContract = Address.fromString(
    `${client.chainId}:${coinExtdevAddress}`
  );

  const hash = soliditySha3(
    { type: "address", value: coinRinkebyAddress.slice(2) },
    { type: "address", value: coinExtdevAddress.slice(2) }
  );

  const foreignContractCreatorSig = await signer.signAsync(hash);
  const foreignContractCreatorTxHash = Buffer.from(
    rinkebyTxHash.slice(2),
    "hex"
  );

  await gatewayContract.addContractMappingAsync({
    localContract,
    foreignContract,
    foreignContractCreatorSig,
    foreignContractCreatorTxHash
  });
};

const init = async () => {
  let client;

  try {
    const rinkeby = await loadRinkebyAccount();
    const extdev = await loadExtdevAccount();

    client = extdev.client;

    const rinkebyNetworkId = await rinkeby.web3js.eth.net.getId();
    const extdevNetworkId = await extdev.web3js.eth.net.getId();

    let coinRinkebyAddress =
      MyRinkebyCoinJSON.networks[rinkebyNetworkId].address;
    let coinExtdevAddress = MyCoinJSON.networks[extdevNetworkId].address;
    let rinkebyTxHash =
      MyRinkebyCoinJSON.networks[rinkebyNetworkId].transactionHash;

    const signer = new OfflineWeb3Signer(rinkeby.web3js, rinkeby.account);

    await mapContracts({
      client,
      signer,
      coinRinkebyAddress,
      coinExtdevAddress,
      ownerExtdevAddress: extdev.account,
      rinkebyTxHash
    });
    console.log(
      `Submitted request to map ${coinExtdevAddress} to ${coinRinkebyAddress}`
    );

    client.disconnect();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

init();
