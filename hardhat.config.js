require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("./dataIDs");
require("dotenv").config();

const { dataIDs } = require("./dataIDs");


task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploy and verify the contracts")
  .addParam("oracleAddress", "The master contract address")
  .setAction(async taskArgs => {
    var oracleAddress = taskArgs.oracleAddress
    run("compile");
    const t = await ethers.getContractFactory("Lens");
    const contract = await t.deploy(oracleAddress, dataIDs);
    await contract.deployed();
    console.log("contract deployed to:", contract.address);
    console.log("    transaction hash:", contract.deployTransaction.hash);

    // Wait for few confirmed transactions.
    // Otherwise the etherscan api doesn't find the deployed contract.
    console.log('waiting for tx confirmation...');
    await contract.deployTransaction.wait(3)

    console.log('submitting for etherscan verification...');

    await run(
      "verify", {
      address: contract.address,
      constructorArguments: [oracleAddress, dataIDs],
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
      url: `${process.env.NODE_URL_RINKEBY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: `${process.env.NODE_URL_MAINNET}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN
  },
  solidity: {
    compilers: [
      { version: "0.5.17" },
      { version: "0.7.6", }
    ]
  },
};

