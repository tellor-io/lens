const { expect } = require("chai");
const { ethers } = require("hardhat");
const h = require("./helpers/helpers.js");
const web3 = require("web3");

describe("TellorX Lens Contract - Function Tests", function () {
  //Globals
  let accounts;
  let lens;
  let lensFactory;
  let devWallet;
  let master;
  let oracle;
  const DEV_WALLET = "0x39E419bA25196794B595B2a595Ea8E527ddC9856";
  const tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
  const tellorOracle = "0xe8218cACb0a5421BC6409e498d9f8CC8869945ea";
  const tellorGov = "0x51d4088d4EeE00Ae4c55f46E0673e9997121DB00";
  const deityAddress = "0x83eB2094072f6eD9F57d3F19f54820ee0BaE6084";
  const ownerAddress = "0x39E419bA25196794B595B2a595Ea8E527ddC9856";
  const pendingOwnerAddress = "0x0000000000000000000000000000000000000000";
  const proxyAddress = "0xf98624E9924CAA2cbD21cC6288215Ec2ef7cFE80";
  const QUERYID1 = h.uintTob32(1);
  const QUERYID2 = h.uintTob32(2);
  const eighteenDecimals = 1e18;
  let queryIdArray = [
    h.uintTob32(1),
    h.uintTob32(2),
    h.uintTob32(10),
    h.uintTob32(50),
  ];
  const stakeCountHash =
    "0x10c168823622203e4057b65015ff4d95b4c650b308918e8c92dc32ab5a0a034b";

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
    lens = await lensFactory.deploy(tellorOracle, tellorMaster, tellorGov);
    await lens.connect(accounts[2]).deployed();
    //Getting Dev TRB Account
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DEV_WALLET],
    });
    devWallet = ethers.provider.getSigner(DEV_WALLET);
    //Transferring to accounts[5].address
    master = await ethers.getContractAt(
      "contracts/iTellor.sol:ITellor",
      tellorMaster
    );
    master.connect(devWallet).transfer(accounts[5].address, 100);
    //Transferring to accounts[6].address
    master.connect(devWallet).transfer(accounts[6].address, h.toWei("200"));
    //Making an instance of the iTellor contract
    oracle = await ethers.getContractAt(
      "contracts/iTellor.sol:ITellor",
      tellorOracle
    );
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
      it("checks if Governance contract address was set correctly", async () => {
        expect(await lens.governance()).to.equal(
          "0x51d4088d4EeE00Ae4c55f46E0673e9997121DB00"
        );
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
      it("checks if returned value from getLastValues is the same from a batch result from getLastValuesAll for Ethereum", async () => {
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
    describe("totalTip function", () => {
      it("checks if function returns total tip amount for a given queryId", async () => {
        expect(await lens.totalTip(QUERYID1)).to.equal("0");
      });
    });
    describe("timeOfLastValue function", () => {
      it("checks the last time a value was submitted", async () => {
        expect(await lens.timeOfLastValue()).to.equal("1641489123");
      });
    });
    describe("totalTipsByUser function", () => {
      it("checks total amount tipped by a user", async () => {
        await oracle.connect(accounts[5]).tipQuery(QUERYID1, 10, "0x");
        //We burn half of the tips, so by tipping 10, we should expect 5.
        expect(await lens.totalTipsByUser(accounts[5].address)).to.equal(5);
      });
    });
    describe("tipsInContract function", () => {
      it("checks what the total amount of tips are in the oracle contract", async () => {
        //Total amount of tips at this point of mainnet fork were zero.
        await oracle.connect(accounts[5]).tipQuery(QUERYID1, 10, "0x");
        await oracle.connect(accounts[5]).tipQuery(QUERYID2, 10, "0x");
        expect(await lens.tipsInContract()).to.equal(10);
      });
    });
    describe("disputeFee function", () => {
      it("checks the current dispute fee amount", async () => {
        //accounts[6] becoming a staker to influence
        //the disputeFee amount.
        await master.connect(accounts[6]).depositStake();
        await master.getUintVar(stakeCountHash);
        //checking if disputeFee should be what we expect
        //with one staker.
        expect(parseInt(await lens.disputeFee())).to.equal(
          parseInt(h.toWei("67.15"))
        );
      });
    });
    describe("stakeAmount function", () => {
      it("checks the stake amount needed to become a data reporter", async () => {
        expect(await lens.stakeAmount()).to.equal(h.toWei("100"));
      });
    });
    describe("stakeCount function", () => {
      it("checks the amount of stakers at this block", async () => {
        expect(await master.getUintVar(stakeCountHash)).to.equal(72);
      });
    });
  });
});
