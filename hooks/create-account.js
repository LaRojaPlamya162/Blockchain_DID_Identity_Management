const { ethers } = require("ethers");

// RPC URL for Besu
const BESU_RPC_URL = "http://localhost:8545"; // Update as needed

// Create a new wallet (with private key and public key)
const wallet = ethers.Wallet.createRandom();

// Connect to Besu network via provider (JSON-RPC)
const provider = new ethers.JsonRpcProvider(BESU_RPC_URL);

// Connect wallet to provider
const signer = wallet.connect(provider);

const main = async () => {
  // Display the new account info
  console.log("New Account Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);

  // Example: Send a transaction (replace with real receiver address)
};

main().catch(console.error);
