import { ethers } from "ethers";
import DIDRegistryArtifact from "@/contracts/DIDRegistry.json";
import { isBesuOnline } from "@/context/besuUtils";
import { useBesu } from "@/context/besu-provider";

const DIDRegistryABI = DIDRegistryArtifact.abi;
const CONTRACT_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Cập nhật địa chỉ contract

export function usingBesu() {
  const { provider, account, setProvider, setAccount } = useBesu();

  // 🦊 Kết nối trực tiếp tới mạng Besu (không dùng MetaMask)
  async function connectToBesu() {
    const BESU_RPC_URL = "http://localhost:8545"; // Địa chỉ RPC của Besu, thay đổi nếu cần

    try {
      const newProvider = new ethers.JsonRpcProvider(BESU_RPC_URL); // Tạo một provider từ Besu RPC URL
      const accounts = await newProvider.listAccounts(); // Lấy danh sách tài khoản từ Besu

      if (accounts.length > 0) {
        setProvider(newProvider);
        setAccount(String(accounts[0])); // Sử dụng tài khoản đầu tiên trong danh sách
        console.log("Connected to Besu with account:", accounts[0]);
      } else {
        alert("No accounts found on Besu network.");
      }
    } catch (error) {
      console.error("Error connecting to Besu:", error);
      alert("Failed to connect to Besu!");
    }
  }

  // 📝 Đăng ký DID trên mạng Besu
  async function registerDID(did: string, publicKey: string) {
    if (!provider) {
      alert("Please connect to the Besu network first!");
      return;
    }

    // Kiểm tra Besu có hoạt động không
    if (!(await isBesuOnline())) {
      alert("Besu network is not available. Please check your connection!");
      return;
    }

    try {
      const signer = await provider.getSigner(); // Lấy signer từ provider của Besu
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDRegistryABI, signer);

      console.log("Sending transaction...");
      const tx = await contract.registerDID(did, publicKey);
      await tx.wait(); // Đợi transaction được xác nhận
      alert("DID registered successfully!");
    } catch (error) {
      console.error("Error registering DID:", error);
      alert("Failed to register DID!");
    }
  }

  return { provider, account, connectToBesu, registerDID };
}
