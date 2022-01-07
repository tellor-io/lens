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
  const deityAddress = "0x83eB2094072f6eD9F57d3F19f54820ee0BaE6084";
  const ownerAddress = "0x39E419bA25196794B595B2a595Ea8E527ddC9856";
  const pendingOwnerAddress = "0x0000000000000000000000000000000000000000";
  const proxyAddress = "0xf98624E9924CAA2cbD21cC6288215Ec2ef7cFE80";
  const QUERYID1 = h.uintTob32(1);
  const eighteenDecimals = 1e18;
  let queryIdArray = [
    h.uintTob32(1),
    h.uintTob32(2),
    h.uintTob32(10),
    h.uintTob32(50),
  ];

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
    //Deploying Lens Contract to test methods
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
        it("checks if oracle address was updated properly", async () => {
          await lens.setOracle(accounts[4].address);
          expect(await lens.oracle()).to.equal(accounts[4].address);
        });
      });
    });
    describe("setAdmin function", () => {
      describe("require statements/testing onlyAdmin modifier", () => {
        it("checks if admin is msg.sender", async () => {
          result = await h.expectThrowMessage(
            lens.connect(accounts[1]).setOracle(accounts[3].address)
          );
          assert.include(result.message, "not an admin");
        });
        //COME BACK TO THIS
        // it("checks if admin address was updated properly", async () => {
        //   await lens.setAdmin(accounts[5].address);
        //   expect(await lens.oracle()).to.equal(accounts[5].address);
        // });
      });
    });
    describe("getCurrentReward function", () => {
      let result;
      it("returns current reward for given queryId", async () => {
        result = await lens.getCurrentReward(QUERYID1);
        //Expect tip to be 0
        expect(result[0]).to.equal(0);
        //Expect reward to be around 2.5 TRB.
        result = result[1] / eighteenDecimals;
        expect(result).to.be.closeTo(2.5, 0.5);
      });
    });
    describe("getLastValues function", () => {
      let result;
      it("checks if getLastValues returns a value for a given queryId", async () => {
        result = await lens.getLastValues(QUERYID1, 1);
        result = web3.utils.hexToNumber(result[0].value) / 1000000;
        expect(result).to.be.closeTo(3500, 500);
      });
      it("checks if getLastValues returns a proper count", async () => {
        result = await lens.getLastValues(QUERYID1, 10);
        expect(result).to.have.lengthOf(10);
      });
    });
    describe("getLastValuesAll function", () => {
      let result;
      let getLastValueResult;
      it("checks if getLastValuesAll returns all queryId info for a specified count", async () => {
        result = await lens.getLastValuesAll(5, queryIdArray);
        expect(result).to.have.lengthOf(20);
      });
      it("checks if returned value from getLastValue is the same from a batch result from getLastValues for Ethereum", async () => {
        getLastValueResult = await lens.getLastValues(QUERYID1, 1);
        result = await lens.getLastValuesAll(1, queryIdArray);
        result = result.slice(0, 1);
        result = result[0].value;
        getLastValueResult = getLastValueResult[0].value;
        expect(result).to.equal(getLastValueResult);
      });
      it("checks if returned value from getLastValue is the same from a batch result from getLastValues for Bitcoin", async () => {
        getLastValueResult = await lens.getLastValues(h.uintTob32(2), 1);
        result = await lens.getLastValuesAll(1, queryIdArray);
        result = result.slice(1, 2);
        result = result[0].value;
        getLastValueResult = getLastValueResult[0].value;
        expect(result).to.equal(getLastValueResult);
      });
      it("checks if returned value from getLastValue is the same from a batch result from getLastValues for AMPL", async () => {
        getLastValueResult = await lens.getLastValues(h.uintTob32(10), 1);
        result = await lens.getLastValuesAll(1, queryIdArray);
        result = result.slice(2, 3);
        result = result[0].value;
        getLastValueResult = getLastValueResult[0].value;
        expect(result).to.equal(getLastValueResult);
      });
      it("checks if returned value from getLastValue is the same from a batch result from getLastValues for TRB", async () => {
        getLastValueResult = await lens.getLastValues(h.uintTob32(50), 1);
        result = await lens.getLastValuesAll(1, queryIdArray);
        result = result.slice(3, 4);
        result = result[0].value;
        getLastValueResult = getLastValueResult[0].value;
        expect(result).to.equal(getLastValueResult);
      });
    });
    describe("deity function", () => {
      it("checks if deity function returns a owner address", async () => {
        expect(await lens.deity()).to.equal(deityAddress);
      });
    });
    describe("owner function", () => {
      it("checks if owner function returns proper owner address", async () => {
        expect(await lens.owner()).to.equal(ownerAddress);
      });
    });
    describe("pendingOwner function", () => {
      it("checks if pendingOwner function returns pending owner address", async () => {
        expect(await lens.pendingOwner()).to.equal(pendingOwnerAddress);
      });
    });
    describe("tellorContract function", () => {
      it("checks if tellorContract function returns proxy address", async () => {
        expect(await lens.tellorContract()).to.equal(proxyAddress);
      });
    });
  });
});
