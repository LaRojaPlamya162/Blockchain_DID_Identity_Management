"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ethers } from "ethers"

interface BesuContextType {
  provider: ethers.BrowserProvider | null
  account: string | null
  setProvider: (provider: ethers.BrowserProvider | null) => void
  setAccount: (account: string | null) => void
}

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

export function BesuProvider({ children }: BesuProviderProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)

  return <BesuContext.Provider value={{ provider, account, setProvider, setAccount }}>{children}</BesuContext.Provider>
}