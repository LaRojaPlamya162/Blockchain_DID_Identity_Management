import { useState } from "react"
import { ethers } from "ethers"
import DIDRegistryArtifact from "@/contracts/DIDRegistry.json"
const DIDRegistryABI = DIDRegistryArtifact.abi // Trích xuất ABI từ JSON
const CONTRACT_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // Cập nhật địa chỉ contract

export function usingBesu() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  async function connectWallet() {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      await web3Provider.send("eth_requestAccounts", [])
      const signer = await web3Provider.getSigner()
      setProvider(web3Provider)
      setAccount(await signer.getAddress())
    } else {
      alert("MetaMask is required!")
    }
  }

  async function isBesuActive(): Promise<boolean> {
    if (!provider) return false
    try {
      await provider.getBlockNumber() // Lấy số block để kiểm tra kết nối
      return true
    } catch (error) {
      console.error("Besu network is down:", error)
      return false
    }
  }

  // 📝 Hàm đăng ký DID, kiểm tra mạng Besu trước khi thực hiện
  async function registerDID(did: string, publicKey: string) {


    const besuOnline = await isBesuActive()
    if (!besuOnline) {
      // alert("Besu network is not available. Please check your connection!")
      return
    }

    try {
      const signer = await provider?.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDRegistryABI, signer)
      
      const tx = await contract.registerDID(did, publicKey) // Gọi smart contract
      await tx.wait()
      alert("DID registered successfully!")
    } catch (error) {
      console.error("Error registering DID:", error)
      alert("Failed to register DID!")
    }
  }

  return { provider, account, connectWallet, isBesuActive, registerDID }
}
