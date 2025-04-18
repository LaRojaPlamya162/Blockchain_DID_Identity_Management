const { ethers } = require("ethers");

// Kết nối tới mạng Besu
const provider = new ethers.JsonRpcProvider("https://localhost:8545/"); // Thay <besu_rpc_url> bằng URL của mạng Besu của bạn

// Địa chỉ mà bạn muốn kiểm tra
const address = "0x06af3e29bE302764057b935EA746B98D80BF2Da8"; // Thay bằng địa chỉ của bạn

async function checkBalance() {
  try {
    const balance = await provider.getBalance(address);
    console.log(`Balance of account ${address}: ${ethers.utils.formatEther(balance)} ETH`);
  } catch (error) {
    console.error("Error checking balance:", error);
  }
}

checkBalance();
