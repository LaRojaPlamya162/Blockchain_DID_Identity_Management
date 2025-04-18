"use client"

import { createContext, useContext, useState, type ReactNode } from "react";
import { ethers } from "ethers";

// Định nghĩa loại BesuContextType
interface BesuContextType {
  provider: ethers.JsonRpcProvider | null;
  account: string | null;
  wallet: ethers.Wallet | null;
  setProvider: (provider: ethers.JsonRpcProvider | null) => void;
  setAccount: (account: string | null) => void;
  setWallet: (wallet: ethers.Wallet | null) => void;
}

// Khởi tạo context với giá trị mặc định
const BesuContext = createContext<BesuContextType>({
  provider: null,
  account: null,
  wallet: null,
  setProvider: () => {},
  setAccount: () => {},
  setWallet: () => {},
});

export const useBesu = () => useContext(BesuContext);

interface BesuProviderProps {
  children: ReactNode;
}

// Định nghĩa Provider component
export function BesuProvider({ children }: BesuProviderProps) {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);

  return (
    <BesuContext.Provider value={{ provider, account, wallet, setProvider, setAccount, setWallet }}>
      {children}
    </BesuContext.Provider>
  );
}
