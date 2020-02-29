const MyCoin = artifacts.require("./MyCoin.sol");

const gatewayAddress = "0xe754d9518bf4a9c63476891ef9AA7d91C8236A5D";

module.exports = function(deployer, network, accounts) {
  if (network === "rinkeby") {
    return;
  }

  deployer.then(async () => {
    await deployer.deploy(MyCoin, gatewayAddress);
    const myCoinInstance = await MyCoin.deployed();

    console.log(
      "\n*************************************************************************\n"
    );
    console.log(`MyCoin Contract Address: ${myCoinInstance.address}`);
    console.log(
      "\n*************************************************************************\n"
    );
  });
};
