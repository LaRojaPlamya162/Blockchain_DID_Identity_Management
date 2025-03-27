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

  async function registerDID(did: string, publicKey: string) {
    if (!provider || !account) {
      alert("Please connect your wallet first!")
      return
    }

    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DIDRegistryABI, signer)

    try {
      const tx = await contract.registerDID(did, publicKey) // Gọi smart contract
      await tx.wait()
      alert("DID registered successfully!")
    } catch (error) {
      console.error("Error registering DID:", error)
      alert("Failed to register DID!")
    }
  }

  return { provider, account, connectWallet, registerDID }
}
