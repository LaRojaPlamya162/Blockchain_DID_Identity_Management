const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  //const ContractFactory = await ethers.getContractFactory("DIDRegistry");
  const ContractFactory = await ethers.getContractFactory("DID")
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
