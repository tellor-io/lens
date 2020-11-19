const { expect } = require("chai");
const path = require("path")


let toTest;
let tellor;


describe("All tests", function () {
  it("Should return the totalTip for a request", async function () {

    // Set the initial state.
    {
      const [owner] = await ethers.getSigners();

      var bal = await tellor.balanceOf(owner.address)
      console.log("balance before", bal.toNumber())

      await tellor.setBalance(owner.address, 100);

      bal = await tellor.balanceOf(owner.address)
      console.log("balance after", bal.toNumber())
    }

    await tellor.addTip(1, 3)
    expect(await toTest.totalTip(1)).to.equal(3)

  });
});


// `beforeEach` will run before each test, re-deploying the contract every
// time. It receives a callback, which can be async.
beforeEach(async function () {
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
});
