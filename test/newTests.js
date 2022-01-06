const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const h = require("./helpers/helpers.js");
const web3 = require("web3");

describe("TellorX Lens Contract - Function Tests", function () {
  //Globals
  let accounts;
  let lens;
  let lensFactory;
  const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
  const tellorOracle = "0xe8218cACb0a5421BC6409e498d9f8CC8869945ea";
  const QUERYID1 = h.uintTob32(1);

  //Hardhat Forking from Mainnet
  //To retrieve live values from
  //Block 13953255 to test against
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: hre.config.networks.hardhat.forking.url,
            blockNumber: 13953255,
          },
        },
      ],
    });
    //Delpoying Lens Contract to test methods
    lensFactory = await ethers.getContractFactory("contracts/Main.sol:Main");
    lens = await lensFactory.deploy(tellorOracle, tellorMaster);
    await lens.connect(accounts[2]).deployed();
  });

  describe("Main.sol Function Tests", () => {
    describe("constructor function", () => {
      it("checks if Oracle contract address was set correctly", async () => {
        expect(await lens.oracle()).to.equal(
          "0xe8218cACb0a5421BC6409e498d9f8CC8869945ea"
        );
      });
      it("checks if Master contract address was set correctly", async () => {
        expect(await lens.master()).to.equal(
          "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
        );
      });
    });
    describe("setOracle function", () => {
      let result;
      describe("require statements/testing onlyAdmin modifier", () => {
        it("checks if admin is msg.sender", async () => {
          result = await h.expectThrowMessage(
            lens.connect(accounts[1]).setOracle(accounts[3].address)
          );
          assert.include(result.message, "not an admin");
        });
      });
    });
    describe("getLastValues", () => {
      let result;
      it("checks if getLastValues returns a value for a given queryId", async () => {
        result = await lens.getLastValues(QUERYID1, 1);
        result = web3.utils.hexToNumber(result[0].value) / 1000000;
        expect(result).to.be.closeTo(3500, 500);
      });
    });
  });
});
