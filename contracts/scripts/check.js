const hre = require("hardhat")

async function main() {
  const deployments = await hre.ethers.provider.listAccounts()
  console.log("Địa chỉ đã triển khai:", deployments)
}

main()
