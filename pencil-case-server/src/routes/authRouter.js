require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  CryptoUtils,
  LocalAddress,
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Contracts,
  OfflineWeb3Signer,
  Address
} = require("loom-js");
const Web3 = require("web3");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const User = require("../models/user");
const MyCoinJSON = require("../contracts/MyCoin.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { INFURA_API_KEY, SECRET, TIME } = process.env;

router.get("/", (req, res) => {
  res.status(200);
  res.send("Authentication API");
});

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({
      email: "User already exists"
    });
  }

  const web3 = new Web3(`https://rinkeby.infura.io/v3/${INFURA_API_KEY}`);
  const account = web3.eth.accounts.wallet.create(1, SECRET);
  const ethPrivateKey = account["0"].privateKey;
  const ethAddress = account["0"].address;
  const ownerAccount = web3.eth.accounts.privateKeyToAccount(ethPrivateKey);
  web3.eth.accounts.wallet.add(ownerAccount);

  const privateKey = CryptoUtils.generatePrivateKey();
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
  const address = LocalAddress.fromPublicKey(publicKey).toString();

  let client = new Client(
    "extdev-plasma-us1",
    "wss://extdev-plasma-us1.dappchains.com/websocket",
    "wss://extdev-plasma-us1.dappchains.com/queryws"
  );

  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ];

  const ethAccount = new Address("eth", LocalAddress.fromHexString(ethAddress));
  const dappAccount = new Address(
    client.chainId,
    LocalAddress.fromPublicKey(publicKey)
  );

  const addressMapper = await Contracts.AddressMapper.createAsync(
    client,
    dappAccount
  );

  const signer = new OfflineWeb3Signer(web3, ownerAccount);
  await addressMapper.addIdentityMappingAsync(dappAccount, ethAccount, signer);

  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    userName: req.body.userName,
    school: req.body.school,
    location: req.body.location,
    organizer: req.body.organizer,
    address,
    privateKey,
    ethAddress,
    ethPrivateKey
  });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newUser.password, salt);

  newUser.password = hash;
  await newUser.save();

  const payload = {
    id: newUser.id,
    email: newUser.email,
    userName: newUser.userName,
    school: newUser.school,
    location: newUser.location,
    organizer: newUser.organizer,
    date: newUser.date,
    address: newUser.address,
    ethAddress: newUser.ethAddress
  };

  const token = await jwt.sign(payload, SECRET, {
    expiresIn: TIME
  });

  return res.status(201).json({
    success: true,
    token: `Bearer ${token}`
  });
});

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json({
      email: "User not found"
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (isMatch) {
    const payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      school: user.school,
      location: user.location,
      organizer: user.organizer,
      date: user.date,
      address: user.address,
      ethAddress: user.ethAddress
    };

    const token = await jwt.sign(payload, SECRET, { expiresIn: TIME });
    return res.json({ success: true, token: `Bearer ${token}` });
  } else {
    return res.status(400).json({
      password: "Incorrect Password"
    });
  }
});

router.get(
  "/getUser",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).lean();
    return res.status(200).json(user);
  }
);

module.exports = router;
