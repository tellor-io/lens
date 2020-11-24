require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();


task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploy and verify the contracts on rinkeby")
  .addParam("masterAddress", "The master contract address")
  .setAction(async taskArgs => {
    var masterAddress = taskArgs.masterAddress
    const t = await hre.ethers.getContractFactory("Lens");
    const contract = await t.deploy(masterAddress);
    await contract.deployed();
    console.log("contract deployed to:", contract.address);

    // Wait for 2 confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    await contract.deployTransaction.wait(2)

    await hre.run(
      "verify", {
      address: contract.address,
      constructorArguments: [masterAddress],
    },
    )
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_MAINNET}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN
  },
  solidity: "0.5.17",
};

