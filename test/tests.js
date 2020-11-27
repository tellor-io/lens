const { expect } = require("chai");
const path = require("path")

let owner, acc1, acc2, acc3, acc4, acc5;

let toTest;
let tellor;

describe("All tests", function () {
  it("Should return the totalTip for a request", async function () {
    await tellor.addTip(1, 3);
    expect(await toTest.totalTip(1)).to.equal(3);
  });

  it("Should return the current reward amount", async function () {
    // 5min past last submitted value.
    {
      timeOfLastValue = parseInt(await toTest.timeOfLastNewValue());
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

    let val1 = 11;
    await tellor.connect(acc1).submitMiningSolution("", [1, 2, 3, 4, 5], [val1, 00, 00, 00, 00]);
    await tellor.connect(acc2).submitMiningSolution("", [1, 2, 3, 4, 5], [val1, 00, 00, 00, 00]);
    await tellor.connect(acc3).submitMiningSolution("", [1, 2, 3, 4, 5], [val1, 00, 00, 00, 00]);
    await tellor.connect(acc4).submitMiningSolution("", [1, 2, 3, 4, 5], [val1, 00, 00, 00, 00]);
    await tellor.connect(acc5).submitMiningSolution("", [1, 2, 3, 4, 5], [val1, 00, 00, 00, 00]);
    timeOfLastValue1 = parseInt(await toTest.timeOfLastNewValue());

    await waffle.provider.send("evm_setNextBlockTimestamp", [timeOfLastValue1 + 9000]); // Forward 15min so that it takes any nonce solution.
    let val2 = 11;
    await tellor.connect(acc1).submitMiningSolution("", [5, 4, 3, 2, 1], [00, 00, 00, 00, val2]);
    await tellor.connect(acc2).submitMiningSolution("", [5, 4, 3, 2, 1], [00, 00, 00, 00, val2]);
    await tellor.connect(acc3).submitMiningSolution("", [5, 4, 3, 2, 1], [00, 00, 00, 00, val2]);
    await tellor.connect(acc4).submitMiningSolution("", [5, 4, 3, 2, 1], [00, 00, 00, 00, val2]);
    await tellor.connect(acc5).submitMiningSolution("", [5, 4, 3, 2, 1], [00, 00, 00, 00, val2]);
    timeOfLastValue2 = parseInt(await toTest.timeOfLastNewValue());


    let res = await toTest.getLastNewValues(1, 2)

    // The order of the returned values is reversed. Newest to oldest.
    expect(res[0].value).to.equal(val2);
    expect(res[0].timestamp).to.equal(timeOfLastValue2);

    expect(res[1].value).to.equal(val1);
    expect(res[1].timestamp).to.equal(timeOfLastValue1);

    expect(toTest.getLastNewValues(1, 9999)).to.be.reverted

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
    "TellorTest",
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
  fact = await ethers.getContractFactory("Lens");
  toTest = await fact.deploy(tellor.address);
  await toTest.deployed();

  // Set the initial required state for the test tasks.
  await tellor.setBalance(owner.address, 1000);
  await tellor.setBalance(tellor.address, 1e10);
});
