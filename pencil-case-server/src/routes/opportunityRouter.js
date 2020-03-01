require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { LOOM_PRIVATE_KEY } = process.env;
const Hub = require("../contracts/Hub.json");
const Opportunity = require("../contracts/Opportunity.json");
const MyCoinJSON = require("../contracts/MyCoin.json");
const {
  CryptoUtils,
  LocalAddress,
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  Contracts,
  OfflineWeb3Signer,
  Address,
  LoomProvider
} = require("loom-js");
const Web3 = require("web3");
const axios = require("axios");
const User = require("../models/user");

router.get("/", (req, res) => {
  res.status(200);
  res.send("Opportunity API");
});

router.post(
  "/createOpportunity",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let hubInstance = new web3.eth.Contract(
      Hub.abi,
      Hub.networks["9545242630824"].address
    );

    const link = req.body.name + req.body.quantity;

    try {
      await hubInstance.methods
        .createOpportunity(
          req.body.name,
          req.body.description,
          req.body.location,
          `http://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${link
            .split(" ")
            .join("")}`,
          req.body.quantity,
          req.body.date
        )
        .send({
          from: user.address
        });

      res.status(201).json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.status(404);
    }
  }
);

router.get(
  "/getOpportunities",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let hubInstance = new web3.eth.Contract(
      Hub.abi,
      Hub.networks["9545242630824"].address,
      { from: user.address }
    );

    try {
      let opportunities = await hubInstance.methods
        .returnOpportunities()
        .call();

      const result = await opportunities.map(async opportunity => {
        const contract = new web3.eth.Contract(Opportunity.abi, opportunity);
        const details = await contract.methods.getDetails().call({
          from: user.address
        });

        const owner = await User.findOne({ address: details[5].toLowerCase() });
        return { ...details, address: opportunity, email: owner.email };
      });

      const finishedResult = await Promise.all(result);

      for (let i = 0; i < finishedResult.length; i++) {
        const { data } = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?key=237eddf069a14bba99f0968b55c075b8&q=${
            finishedResult[i][2]
          }`
        );

        finishedResult[i].coordinate = {
          latitude: data.results[0].geometry.lat,
          longitude: data.results[0].geometry.lng
        };
      }

      for (let i = 0; i < finishedResult.length; i++) {
        for (let j = 0; j < finishedResult[i]["6"].length; j++) {
          if (
            finishedResult[i]["6"][j].toLowerCase() ==
            user.address.toLowerCase()
          ) {
            finishedResult[i].volunteer = true;
          }
        }
      }

      res.status(200).json({
        opportunities: finishedResult
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  }
);

router.get(
  "/organizerOpportunities",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let hubInstance = new web3.eth.Contract(
      Hub.abi,
      Hub.networks["9545242630824"].address,
      { from: user.address }
    );

    try {
      let opportunities = await hubInstance.methods
        .returnOpportunities()
        .call();

      const result = await opportunities.map(async opportunity => {
        const contract = new web3.eth.Contract(Opportunity.abi, opportunity);
        const details = await contract.methods.getDetails().call({
          from: user.address
        });

        const search = details[6].map(async volunteer => {
          const metadata = await contract.methods.getVolunteer(volunteer).call({
            from: user.address
          });

          return { ...metadata, volunteer };
        });

        const finishedSearch = await Promise.all(search);

        const owner = await User.findOne({ address: details[5].toLowerCase() });

        return {
          ...details,
          address: opportunity,
          email: owner.email,
          volunteers: finishedSearch
        };
      });

      const finishedResult = await Promise.all(result);

      let filteredResult = [];
      for (let i = 0; i < finishedResult.length; i++) {
        if (finishedResult[i][5].toLowerCase() == user.address.toLowerCase()) {
          filteredResult.push(finishedResult[i]);
        }
      }

      for (let i = 0; i < filteredResult.length; i++) {
        let requests = [];

        for (let j = 0; j < filteredResult[i].volunteers.length; j++) {
          if (
            filteredResult[i].volunteers[j]["0"] &&
            filteredResult[i].volunteers[j]["1"] != "0"
          ) {
            requests.push(filteredResult[i].volunteers[j]);
          }
        }

        filteredResult[i].requests = requests;
      }

      res.status(200).json({
        opportunities: filteredResult
      });
    } catch (e) {
      res.sendStatus(400);
    }
  }
);

router.post(
  "/organizerOpportunity",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let opportunityInstance = new web3.eth.Contract(
      Opportunity.abi,
      req.body.address
    );

    try {
      const opportunity = await opportunityInstance.methods.getDetails().call({
        from: user.address
      });

      const search = opportunity[6].map(async volunteer => {
        const metadata = await opportunityInstance.methods
          .getVolunteer(volunteer)
          .call({
            from: user.address
          });

        return { ...metadata, volunteer };
      });

      const finishedSearch = await Promise.all(search);

      res.status(200).json({
        opportunity,
        volunteers: finishedSearch
      });
    } catch (e) {
      res.sendStatus(400);
    }
  }
);

router.get(
  "/myOpportunities",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let hubInstance = new web3.eth.Contract(
      Hub.abi,
      Hub.networks["9545242630824"].address,
      { from: user.address }
    );

    try {
      let opportunities = await hubInstance.methods
        .returnOpportunities()
        .call();

      const result = await opportunities.map(async opportunity => {
        const contract = new web3.eth.Contract(Opportunity.abi, opportunity);
        const details = await contract.methods.getDetails().call({
          from: user.address
        });

        const search = details[6].map(async volunteer => {
          const metadata = await contract.methods.getVolunteer(volunteer).call({
            from: user.address
          });

          return { ...metadata, volunteer };
        });

        const finishedSearch = await Promise.all(search);

        const owner = await User.findOne({ address: details[5].toLowerCase() });
        return {
          ...details,
          address: opportunity,
          email: owner.email,
          volunteers: finishedSearch
        };
      });

      const finishedResult = await Promise.all(result);

      const filteredResult = [];
      for (let i = 0; i < finishedResult.length; i++) {
        for (let j = 0; j < finishedResult[i]["6"].length; j++) {
          if (
            finishedResult[i]["6"][j].toLowerCase() ==
            user.address.toLowerCase()
          ) {
            filteredResult.push(finishedResult[i]);
            break;
          }
        }
      }

      res.status(200).json({
        opportunities: filteredResult
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  }
);

router.post(
  "/myOpportunity",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let opportunityInstance = new web3.eth.Contract(
      Opportunity.abi,
      req.body.address
    );

    try {
      const volunteer = await opportunityInstance.methods
        .getVolunteer(user.address)
        .call({
          from: user.address
        });

      const opportunity = await opportunityInstance.methods.getDetails().call({
        from: user.address
      });

      res.status(200).json({
        volunteer,
        opportunity
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  }
);

router.post(
  "/verifyQR",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));
    let opportunityInstance = new web3.eth.Contract(
      Opportunity.abi,
      req.body.address
    );

    try {
      await opportunityInstance.methods.verifyQR(req.body.volunteer).send({
        from: user.address
      });

      res.status(200).json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.status(400);
    }
  }
);

router.post(
  "/approve",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));
    let opportunityInstance = new web3.eth.Contract(
      Opportunity.abi,
      req.body.address
    );

    try {
      await opportunityInstance.methods.approve(req.body.volunteer).send({
        from: user.address
      });

      res.status(200).json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.status(400);
    }
  }
);

router.post(
  "/record",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));
    let opportunityInstance = new web3.eth.Contract(
      Opportunity.abi,
      req.body.address
    );

    try {
      await opportunityInstance.methods
        .record(req.body.time, req.body.endLocation)
        .send({
          from: user.address
        });

      res.status(200).json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.status(400);
    }
  }
);

router.post(
  "/joinOpportunity",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));
    let opportunityInstance = new web3.eth.Contract(
      Opportunity.abi,
      req.body.address
    );

    try {
      await opportunityInstance.methods.joinOpportunity().send({
        from: user.address
      });

      res.status(201).json({
        success: true
      });
    } catch (e) {
      res.sendStatus(400);
    }
  }
);

router.get(
  "/myHours",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findOne({ email: req.user.email });
    const privateKey = new Uint8Array(JSON.parse("[" + user.privateKey + "]"));
    const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);

    let hours = 0;

    let client = new Client(
      "extdev-plasma-us1",
      "wss://extdev-plasma-us1.dappchains.com/websocket",
      "wss://extdev-plasma-us1.dappchains.com/queryws"
    );

    client.txMiddleware = [
      new NonceTxMiddleware(publicKey, client),
      new SignedTxMiddleware(privateKey)
    ];

    let web3 = new Web3(new LoomProvider(client, privateKey));

    let hubInstance = new web3.eth.Contract(
      Hub.abi,
      Hub.networks["9545242630824"].address,
      { from: user.address }
    );

    try {
      let opportunities = await hubInstance.methods
        .returnOpportunities()
        .call();

      const result = await opportunities.map(async opportunity => {
        const contract = new web3.eth.Contract(Opportunity.abi, opportunity);
        const details = await contract.methods.getDetails().call({
          from: user.address
        });

        const search = details[6].map(async volunteer => {
          const metadata = await contract.methods.getVolunteer(volunteer).call({
            from: user.address
          });

          return { ...metadata, volunteer };
        });

        const finishedSearch = await Promise.all(search);

        const owner = await User.findOne({ address: details[5].toLowerCase() });
        return {
          ...details,
          address: opportunity,
          email: owner.email,
          volunteers: finishedSearch
        };
      });

      const finishedResult = await Promise.all(result);
      const filteredResult = [];

      for (let i = 0; i < finishedResult.length; i++) {
        for (let j = 0; j < finishedResult[i]["6"].length; j++) {
          if (
            finishedResult[i]["6"][j].toLowerCase() ==
            user.address.toLowerCase()
          ) {
            filteredResult.push(finishedResult[i]);
            break;
          }
        }
      }

      for (let i = 0; i < filteredResult.length; i++) {
        for (let j = 0; j < filteredResult[i].volunteers.length; j++) {
          if (
            filteredResult[i].volunteers[j].volunteer.toLowerCase() ==
              user.address.toLowerCase() &&
            filteredResult[i].volunteers[j][2]
          ) {
            hours += Number(filteredResult[i].volunteers[j][1]);
            break;
          }
        }
      }

      res.status(200).json({
        hours
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  }
);

module.exports = router;
