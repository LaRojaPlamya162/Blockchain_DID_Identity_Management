import { ethers } from "ethers";
import DIDArtifact from "@/contracts/DID.json"
const DIDABI = DIDArtifact.abi;
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const BESU_RPC_URL = "http://localhost:8545"; 
// Hàm kiểm tra mạng Besu có đang hoạt động không
export async function isBesuOnline(): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(BESU_RPC_URL);

    const networkPromise = provider.getNetwork();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout khi kết nối đến Besu")), 5000);
    });

    await Promise.race([networkPromise, timeoutPromise]);

    const blockNumber = await provider.getBlockNumber();
    //console.log(`Kết nối thành công đến Besu. Block hiện tại: ${blockNumber}`);

    return true;
  } catch (error) {
    console.error(`Lỗi khi kết nối đến Besu: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}
export function getDIDComponents() {
  const provider = new ethers.JsonRpcProvider(BESU_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDABI, signer);

  return { contract, provider, signer, wallet };
}