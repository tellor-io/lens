const { expect } = require("chai");
const { dataIDs } = require("../dataIDs");

const path = require("path")

let owner, acc1, acc2, acc3, acc4, acc5;

let toTest;
let tellor;

describe("All tests", function () {

  it("CRUD for data IDs", async function () {
    // Test initial state.
    {
      let res = await toTest.dataIDsAll();

      for (i = 0; i < res.length; i++) {
        expect(res[i].id).to.equal(dataIDs[i].id);
        expect(res[i].granularity).to.equal(dataIDs[i].granularity);
        expect(res[i].name).to.equal(dataIDs[i].name);
      }
    }
    // Test replacing all.
    {
      let IDs = [
        {
          id: 999,
          granularity: 1,
          name: "cool"
        }
      ]
      await toTest.replaceDataIDs(IDs);
      let res = await toTest.dataIDsAll();

      expect(res.length).to.equal(IDs.length);
      expect(res[0].id).to.equal(IDs[0].id);
      expect(res[0].granularity).to.equal(IDs[0].granularity);
      expect(res[0].name).to.equal(IDs[0].name);
    }

    // Test pushing a new data ID a single one.
    {
      let resBefore = await toTest.dataIDsAll();
      let newID = {
        id: 999,
        granularity: 1,
        name: "cool"
      }
      await toTest.pushDataID(newID);
      let resAfter = await toTest.dataIDsAll();

      expect(resAfter.length).to.equal(resBefore.length + 1);
      expect(resAfter[resAfter.length - 1].id).to.equal(newID.id);
      expect(resAfter[resAfter.length - 1].granularity).to.equal(newID.granularity);
      expect(resAfter[resAfter.length - 1].name).to.equal(newID.name);
    }

    // Test updating a single one.
    {
      let id = 0
      let updatedID = {
        id: 999,
        granularity: 1,
        name: "cool"
      }
      await toTest.setDataID(id, updatedID);
      let res = await toTest.dataIDsAll();

      expect(res[id].id).to.equal(updatedID.id);
      expect(res[id].granularity).to.equal(updatedID.granularity);
      expect(res[id].name).to.equal(updatedID.name);
    }

  });

  it("Should return the totalTip for a request", async function () {
    await tellor.addTip(1, 3);
    expect(await toTest.totalTip(1)).to.equal(3);
  });

  it("Should return the current reward amount", async function () {
    // 5min past last submitted value.
    {
      timeOfLastValue = parseInt(await toTest.timeOfLastValue());
      await waffle.provider.send("evm_setNextBlockTimestamp", [timeOfLastValue + 300]);
      await waffle.provider.send("evm_mine");
      expect(await toTest.currentReward()).to.equal(BigInt(1e18));
    }

    // 10min past last submitted value.
    {
      await waffle.provider.send("evm_setNextBlockTimestamp", [timeOfLastValue + 600]);
      await waffle.provider.send("evm_mine");
      expect(await toTest.currentReward()).to.equal(BigInt(2e18));
    }

    // 15min past last submitted value with a tip.
    {
      await waffle.provider.send("evm_setNextBlockTimestamp", [timeOfLastValue + 900]);
      // Send 10TRB tip. Miners get 1/10 so a single miner's reward should be 1TRB.
      await tellor.addTip(1, BigInt(10e18));
      expect(await toTest.currentReward()).to.equal(BigInt(4e18));
    }
  });

  it("Should return the last N submitted values", async function () {
    await tellor.setBalance(acc1.address, 1000);
    await tellor.setBalance(acc2.address, 1000);
    await tellor.setBalance(acc3.address, 1000);
    await tellor.setBalance(acc4.address, 1000);
    await tellor.setBalance(acc5.address, 1000);

    await tellor.connect(acc1).depositStake();
    await tellor.connect(acc2).depositStake();
    await tellor.connect(acc3).depositStake();
    await tellor.connect(acc4).depositStake();
    await tellor.connect(acc5).depositStake();

    let valExp1 = {}
    valExp1[1] = 11;
    valExp1[2] = 12;
    valExp1[3] = 13;
    valExp1[4] = 14;
    valExp1[5] = 15;

    await tellor.connect(acc1).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await tellor.connect(acc2).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await tellor.connect(acc3).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await tellor.connect(acc4).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    await tellor.connect(acc5).submitMiningSolution("", [1, 2, 3, 4, 5], [valExp1[1], valExp1[2], valExp1[3], valExp1[4], valExp1[5]]);
    timeOfLastValue1 = parseInt(await toTest.timeOfLastValue());

    await waffle.provider.send("evm_setNextBlockTimestamp", [timeOfLastValue1 + 9000]); // Forward 15min so that it takes any nonce solution.
    let valExp2 = {}
    valExp2[1] = 21;
    valExp2[2] = 22;
    valExp2[3] = 23;
    valExp2[4] = 24;
    valExp2[5] = 25;
    await tellor.connect(acc1).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await tellor.connect(acc2).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await tellor.connect(acc3).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await tellor.connect(acc4).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    await tellor.connect(acc5).submitMiningSolution("", [5, 4, 3, 2, 1], [valExp2[5], valExp2[4], valExp2[3], valExp2[2], valExp2[1]]);
    timeOfLastValue2 = parseInt(await toTest.timeOfLastValue());


    let res = await toTest.getLastValues(1, 2)

    // The order of the returned values is reversed. Newest to oldest.
    expect(res[0].value).to.equal(valExp2[1]);
    expect(res[0].timestamp).to.equal(timeOfLastValue2);

    expect(res[1].value).to.equal(valExp1[1]);
    expect(res[1].timestamp).to.equal(timeOfLastValue1);


    // When calling getLastValuesAll should get the same result, but without specifing which data ID the request is for.
    res = await toTest.getLastValuesAll(2)
    expect(res.length).to.equal(2 * dataIDs.length);

    let pos = 1

    for (let index = 0; index < 10; index++) {
      if (index % 2) {
        expect(res[index].value).to.equal(valExp1[pos]);
        expect(res[index].timestamp).to.equal(timeOfLastValue1);
        pos++
      } else {
        expect(res[index].value).to.equal(valExp2[pos]);
        expect(res[index].timestamp).to.equal(timeOfLastValue2);
      }
    }

    // A request over the max values count should still return the max available.
    res = await toTest.getLastValues(1, 9999);
    expect(res.length).to.equal(2);

  });
});

// `beforeEach` will run before each test, re-deploying the contract every
// time. It receives a callback, which can be async.
beforeEach(async function () {
  [owner, acc1, acc2, acc3, acc4, acc5] = await ethers.getSigners();

  // Deploy TellorTransfer.
  var fact = await ethers.getContractFactory(path.join("tellorcore", "contracts", "libraries", "TellorTransfer.sol:TellorTransfer"));
  transfer = await fact.deploy();
  await transfer.deployed();

  // Deploy TellorLibrary.
  fact = await ethers.getContractFactory(
    path.join("tellorcore", "contracts", "libraries", "TellorLibrary.sol:TellorLibrary"),
    {
      libraries: {
        TellorTransfer: transfer.address,
      }
    }
  );
  library = await fact.deploy();
  await library.deployed();

  // Deploy TellorDispute.
  fact = await ethers.getContractFactory(
    path.join("tellorcore", "contracts", "libraries", "TellorDispute.sol:TellorDispute"),
    {
      libraries: {
        TellorTransfer: transfer.address,
      }
    }
  );
  const dispute = await fact.deploy();
  await dispute.deployed();

  // Deploy TellorStake.
  fact = await ethers.getContractFactory(
    path.join("tellorcore", "contracts", "libraries", "TellorStake.sol:TellorStake"),
    {
      libraries: {
        TellorTransfer: transfer.address,
        TellorDispute: dispute.address,
      }
    }
  );
  const stake = await fact.deploy();
  await stake.deployed();

  // Deploy the main contract wrapped in a testing contract.
  // The helper contract allows setting up the required internal state.
  fact = await ethers.getContractFactory(
    "OracleTest",
    {
      libraries: {
        TellorTransfer: transfer.address,
        TellorDispute: dispute.address,
        TellorLibrary: library.address,
        TellorStake: stake.address,
      }
    }
  );
  tellor = await fact.deploy();
  await tellor.deployed();


  // Deploy the actual contract to test.
  fact = await ethers.getContractFactory("Main");
  toTest = await fact.deploy(tellor.address);
  await toTest.deployed();

  // Set the initial required state for the test tasks.
  await tellor.setBalance(owner.address, 1000);
  await tellor.setBalance(tellor.address, 1e10);

  await toTest.replaceDataIDs(dataIDs);
});
