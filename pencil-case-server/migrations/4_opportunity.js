const Hub = artifacts.require("Hub");

module.exports = async function(deployer, network) {
  if (network === "rinkeby") {
    return;
  }

  await deployer.deploy(Hub);
  console.log(Hub.address);
};
