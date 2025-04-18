const { ethers } = require("ethers");

// Private key của bạn
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Khởi tạo ví từ private key
const wallet = new ethers.Wallet(privateKey);

// Lấy public key trực tiếp từ signingKey
const publicKey = wallet.signingKey.publicKey;

console.log("Public Key:", publicKey);
console.log("Address:", wallet.address);
