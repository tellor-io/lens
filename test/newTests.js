const { expect } = require("chai");
const { ethers } = require("hardhat");
var assert = require("assert");
const h = require("./helpers/helpers.js");

describe("Tellor360 Lens Contract - Function Tests", function () {
  //Globals
  let accounts, lens, lensFactory, devWallet, master, oracle, autopay;

  const DEV_WALLET = "0x4A1099d4897fFcc8eC7cb014B1a7442B28C7940C";
  const deityAddress = "0x0000000000000000000000000000000000000000";
  const ownerAddress = "0x0000000000000000000000000000000000000000";
  const pendingOwnerAddress = "0x0000000000000000000000000000000000000000";
  const proxyAddress = "0x0000000000000000000000000000000000000000";
  const tellorFlex = "0x873DAEd52B52b826C000713de3DCdB77641F7756";
  const tellorGovernance = "0x199839a4907ABeC8240D119B606C98c405Bb0B33";
  const tellorMaster = "0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2";
  const tellor360 = "0x8C9057FA16D3Debb703ADBac0A097d2E5577AA6b";
  const tellorAutopay = "0x7E7b96d13D75bc7DaF270A491e2f1e571147d4DA";


  const QUERYID1 = h.uintTob32(1);
  const eighteenDecimals = 1e18;
  const abiCoder = new ethers.utils.AbiCoder;
  const TRB_QUERY_DATA_ARGS = abiCoder.encode(["string", "string"], ["trb", "usd"])
	const TRB_QUERY_DATA = abiCoder.encode(["string", "bytes"], ["SpotPrice", TRB_QUERY_DATA_ARGS])
	const TRB_QUERY_ID = ethers.utils.keccak256(TRB_QUERY_DATA);
  let queryIdArray = [TRB_QUERY_ID];

  //Hardhat Forking from Mainnet
  //To retrieve live values from
  //Block 7797225 to test against
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    // await hre.network.provider.request({
    //   method: "hardhat_reset",
    //   params: [
    //     {
    //       forking: {
    //         jsonRpcUrl: hre.config.networks.hardhat.forking.url,
    //       },
    //     },
    //   ],
    // });
    //Deploying Lens Contract to test methods
    lensFactory = await ethers.getContractFactory("contracts/Main.sol:Main");
    lens = await lensFactory.deploy(tellorFlex, tellor360, tellorGovernance, tellorAutopay);
    await lens.connect(accounts[2]).deployed();
    //Getting Dev TRB Account
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DEV_WALLET],
    });
    devWallet = ethers.provider.getSigner(DEV_WALLET);
    //Transferring to accounts[5].address
    master = await ethers.getContractAt(
      "contracts/interfaces/ITellor.sol:ITellor",
      tellorMaster
    );
    //Making an instance of the ITellor contract
    oracle = await ethers.getContractAt(
      "contracts/interfaces/ITellor.sol:ITellor",
      tellorFlex
    );
    autopay = await ethers.getContractAt(
      "contracts/interfaces/ITellor.sol:ITellor",
      tellorAutopay
    );
  });

  describe("Main.sol Function Tests", () => {
    describe("constructor function", () => {
      it("checks if Oracle contract address was set correctly", async () => {
        expect(await lens.oracle()).to.equal(
          "0x873DAEd52B52b826C000713de3DCdB77641F7756"
        );
      });
      it("checks if Master contract address was set correctly", async () => {
        expect(await lens.master()).to.equal(
          "0x8C9057FA16D3Debb703ADBac0A097d2E5577AA6b"
        );
      });
      it("checks if Governance contract address was set correctly", async () => {
        expect(await lens.governance()).to.equal(
          "0x199839a4907ABeC8240D119B606C98c405Bb0B33"
        );
      });
    });
    describe("getCurrentReward function", () => {
      let result;
      it("returns current reward for given queryId", async () => {
        result = await lens.getCurrentReward(QUERYID1);
        //Expect tip to be 0
        expect(parseInt(result[0])).to.equal(0);
        expect(parseInt(result[1])).to.equal(0);
      });
    });
    describe("getLastValues function", () => {
      let result;
      it("checks if getLastValues returns a value for a given queryId", async () => {
        result = await lens.getLastValues(TRB_QUERY_ID, 1);
        result = parseInt(result[0].value) / eighteenDecimals;
        expect(result).to.be.closeTo(40, 30);
      });
      it("checks if getLastValues returns a proper count", async () => {
        result = await lens.getLastValues(TRB_QUERY_ID, 1);
        expect(result).to.have.lengthOf(1);
      });
    });
    describe("getLastValuesAll function", () => {
      let result;
      let getLastValueResult;
      it("checks if getLastValuesAll returns all queryId info for a specified count", async () => {
        result = await lens.getLastValuesAll(1, queryIdArray);
        expect(result).to.have.lengthOf(1);
      });
      it("checks if returned value from getLastValues is the same from a batch result from getLastValuesAll for TRB", async () => {
        getLastValueResult = await lens.getLastValues(TRB_QUERY_ID, 1);
        result = await lens.getLastValuesAll(1, queryIdArray);
        result = result.slice(0, 1);
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
    describe("totalTip function", () => {
      it("checks if function returns total tip amount for a given queryId", async () => {
        expect(parseInt(await lens.totalTip(TRB_QUERY_ID))).to.equal(0);
      });
    });
    describe("timeOfLastValue function", () => {
      it("checks the last time a value was submitted", async () => {
        expect(parseInt(await lens.timeOfLastValue())).to.equal(1666195236);
      });
    });
    describe("totalTipsByUser function", () => {
      it("checks total amount tipped by a user", async () => {
        await master.connect(devWallet).transfer(accounts[5].address, 100);
        console.log("here")
        assert(await master.connect(devWallet).balanceOf(accounts[5].address) == 100, "check account balance");
        await master.connect(accounts[5]).approve(autopay.address, h.toWei("10"));
        await autopay.connect(accounts[5]).tip(TRB_QUERY_ID, 10, TRB_QUERY_DATA);
        expect(parseInt(await lens.totalTipsByUser(accounts[5].address))).to.equal(10);
      });
    });
    describe("tipsInContract function", () => {
      it("checks what the total amount of tips are in the oracle contract", async () => {
        expect(parseInt(await lens.tipsInContract())).to.equal(0);
      });
    });
    describe("disputeFee function", () => {
      it("checks the current dispute fee amount", async () => {
        //checking if disputeFee should be what we expect
        expect(parseInt(await lens.disputeFee())).to.equal(
          parseInt(h.toWei("10"))
        );
      });
    });
    describe("stakeAmount function", () => {
      it("checks the stake amount needed to become a data reporter", async () => {
        expect(parseInt(await lens.stakeAmount())).to.equal(parseInt(h.toWei("100")));
      });
    });
    describe("stakeCount function", () => {
      it("checks the amount of stakers at this block", async () => {
        expect(parseInt(await lens.stakeCount())).to.equal(1);
      });
    });
  });
});
