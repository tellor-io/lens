/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-ethers");
 require("dotenv").config();
 module.exports = {
   solidity: "0.8.3",
   networks: {
     hardhat: {
       forking: {
        url: `${process.env.NODE_URL}`,
        gasPrice: 1,
        gasLimit: 30000,
        blockNumber: 7797607
       }
     },
   }
 };
