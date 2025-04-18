import { ethers} from "ethers";
//import DIDRegistryArtifact from "@/contracts/DIDRegistry.json";
import DIDArtifact from "@/contracts/DID.json"
import { isBesuOnline } from "@/context/besuUtils";
import { useBesu } from "@/context/besu-provider";
import { getDIDComponents } from "@/context/besuUtils";
//const DIDRegistryABI = DIDRegistryArtifact.abi;
const DIDABI = DIDArtifact.abi;
//const CONTRACT_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
//const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
//const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export function usingBesu() {
  const { provider, account, setProvider, setAccount} = useBesu();
  const { contract, wallet } = getDIDComponents();
  // 🦊 Kết nối trực tiếp tới mạng Besu (không dùng MetaMask)
  async function connectToBesu() {
    const BESU_RPC_URL = "http://localhost:8545"; // Địa chỉ RPC của Besu, thay đổi nếu cần

    try {
      //const newProvider = new ethers.JsonRpcProvider(BESU_RPC_URL); // Tạo một provider từ Besu RPC URL
      //const accounts = await newProvider.listAccounts(); // Lấy danh sách tài khoản từ Besu
      //const newWallet = new ethers.Wallet(PRIVATE_KEY, provider);
      const accounts = [wallet.address];
      //setWallet(newWallet)
      if (accounts.length > 0) {
        setProvider(provider);
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
  async function registerDID(did: string, name: string, birthday: string, personalID: string) {
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
    if (!wallet) {
      throw new Error("Wallet is not initialized!");
    }
      //const network = await provider.getNetwork();
      //const signer = wallet.connect(provider);
      //const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDRegistryABI, signer);
      //const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDABI, signer);
      const balance = await provider.getBalance(wallet.address);
      console.log("Balance:", ethers.formatEther(balance), "ETH");
      console.log("Registering DID...");
      const tx = await contract.registerDID(did, name, birthday, personalID);
      await tx.wait();
      alert("DID registered successfully!");
      const totalDIDs = await contract.getTotalDIDs();
      console.log(`\nTotal DIDs registered: ${totalDIDs}`);
      
      // 5. Liệt kê các DID đã đăng ký
      console.log("\nListing all registered DIDs:");
      for (let i = 0; i < totalDIDs; i++) {
        const didStr = await contract.getDIDAtIndex(i);
        const info = await contract.getDIDInfo(didStr);
        console.log(
          `[${i}] DID: ${didStr} - Owner: ${info[0]} - Name: ${info[1]} - Active: ${info[3]}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to register DID!");
    }
  }

  return { provider, account, connectToBesu, registerDID };
}