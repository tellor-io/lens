require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

async function deployLensContract(_network, _pk, _nodeURL) {
  ///////////////Connect to the network
  var net = _network;
  let privateKey = _pk;
  var provider = new ethers.providers.JsonRpcProvider(_nodeURL);
  let wallet = new ethers.Wallet(privateKey, provider);
  let tellorMaster = "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0";
  //Mainnet Address
  let tellorOracle =
    net == "rinkeby"
      ? "0x18431fd88adF138e8b979A7246eb58EA7126ea16"
      : "0xe8218cACb0a5421BC6409e498d9f8CC8869945ea";
  let tellorGov =
    net == "rinkeby"
      ? "0xA64Bb0078eB80c97484f3f09Adb47b9B73CBcA00"
      : "0x51d4088d4EeE00Ae4c55f46E0673e9997121DB00";

  //////////////// Lens Deployment
  console.log("Starting deployment for lens contract...");
  const Lens = await ethers.getContractFactory("Main", wallet);
  let lens = await Lens.deploy(tellorOracle, tellorMaster, tellorGov);

  console.log("waiting for lens confirmation...");
  await lens.deployTransaction.wait(5);

  console.log("submitting lens contract for verification...");
  await run("verify:verify", {
    address: lens.address,
    constructorArguments: [tellorOracle, tellorMaster, tellorGov],
  });
  console.log("lens contract verified");

  if (net == "mainnet") {
    console.log(
      "Extension contract deployed to:",
      "https://etherscan.io/address/" + lens.address
    );
    console.log(
      "   Extension transaction hash:",
      "https://etherscan.io/tx/" + lens.deployTransaction.hash
    );
  } else if (net == "rinkeby") {
    console.log(
      "Extension contract deployed to:",
      "https://rinkeby.etherscan.io/address/" + lens.address
    );
    console.log(
      "    Extension transaction hash:",
      "https://rinkeby.etherscan.io/tx/" + lens.deployTransaction.hash
    );
  } else {
    console.log("Please add network explorer details");
  }
}

deployLensContract(
  "rinkeby",
  process.env.TESTNET_PK,
  process.env.NODE_URL_RINKEBY
)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// deployLensContract(
//   "mainnet",
//   process.env.MAINNET_PK,
//   process.env.NODE_URL_MAINNET
// )
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
