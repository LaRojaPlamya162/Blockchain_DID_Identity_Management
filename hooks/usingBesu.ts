import { ethers, N } from "ethers";
import DIDRegistryArtifact from "@/contracts/DIDRegistry.json";
import { isBesuOnline } from "@/context/besuUtils";
import { useBesu } from "@/context/besu-provider";

const DIDRegistryABI = DIDRegistryArtifact.abi;
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Cập nhật địa chỉ contract
//const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
export function usingBesu() {
  const { provider, account, setProvider, setAccount} = useBesu();

  // 🦊 Kết nối trực tiếp tới mạng Besu (không dùng MetaMask)
  async function connectToBesu() {
    const BESU_RPC_URL = "http://localhost:8545"; // Địa chỉ RPC của Besu, thay đổi nếu cần

    try {
      const newProvider = new ethers.JsonRpcProvider(BESU_RPC_URL); // Tạo một provider từ Besu RPC URL
      //const accounts = await newProvider.listAccounts(); // Lấy danh sách tài khoản từ Besu
      const newWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
      const accounts = [newWallet.address];
      //setWallet(newWallet)
      console.log(accounts);
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
  async function registerDID(did: string, controller: string, publicKey: string, services: string) {
    await connectToBesu()
    if (!provider) {
      alert("Please connect to the Besu network first!");
      return;
    }
  
    if (!(await isBesuOnline())) {
      alert("Besu network is not available. Please check your connection!");
      return;
    }
    try {
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)
    if (!wallet) {
      throw new Error("Wallet is not initialized!");
    }
    const network = await provider.getNetwork();
    console.log("ChainID:", network.chainId); // Ví dụ: 2018 (Besu mặc định)
    console.log("Tên mạng:", network.name); 
      const signer = wallet.connect(provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDRegistryABI, signer);
      const balance = await provider.getBalance(wallet.address);
      console.log("Balance:", ethers.formatEther(balance), "ETH");
      // Kiểm tra DID đã tồn tại chưa
      //const balance = await provider.getBalance(wallet.address);
      //console.log("Balance:", ethers.formatEther(balance), "ETH");
      console.log("Registering DID...");
      //console.log("Gas Estimate:", await contract.registerDID.estimateGas(did));
      const tx = await contract.registerDID(did);
      //console.log("Gas Estimate:", await tx.estimateGas(did));
      await tx.wait();
      alert("DID registered successfully!");
      const latestBlockNumber = await provider.getBlockNumber();
      console.log("Latest Block Number:", latestBlockNumber);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to register DID!");
    }
  }
  

  return { provider, account, connectToBesu, registerDID };
}
