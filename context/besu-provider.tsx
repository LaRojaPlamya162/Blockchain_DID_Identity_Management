"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ethers } from "ethers"

// Định nghĩa loại BesuContextType
interface BesuContextType {
  provider: ethers.JsonRpcProvider | null // Chúng ta sẽ dùng JsonRpcProvider thay vì BrowserProvider
  account: string | null
  setProvider: (provider: ethers.JsonRpcProvider | null) => void // Thay đổi loại provider thành JsonRpcProvider
  setAccount: (account: string | null) => void
}

// Khởi tạo context với giá trị mặc định
const BesuContext = createContext<BesuContextType>({
  provider: null,
  account: null,
  setProvider: () => {},
  setAccount: () => {},
})

export const useBesu = () => useContext(BesuContext)

interface BesuProviderProps {
  children: ReactNode
}

// Định nghĩa Provider component
export function BesuProvider({ children }: BesuProviderProps) {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  // Kết nối tới Besu RPC
  const connectToBesu = async () => {
    const BESU_RPC_URL = "http://localhost:8545" // Địa chỉ RPC của Besu, thay đổi nếu cần
    try {
      const newProvider = new ethers.JsonRpcProvider(BESU_RPC_URL) // Tạo một provider từ Besu RPC URL
      const accounts = await newProvider.listAccounts() // Lấy danh sách tài khoản
      if (accounts.length > 0) {
        setProvider(newProvider)
        setAccount(String(accounts[0])) // Sử dụng tài khoản đầu tiên trong danh sách
      } else {
        alert("No accounts found on Besu network.")
      }
    } catch (error) {
      console.error("Error connecting to Besu:", error)
      alert("Failed to connect to Besu!")
    }
  }

  return (
    <BesuContext.Provider value={{ provider, account, setProvider, setAccount }}>
      {children}
    </BesuContext.Provider>
  )
}
