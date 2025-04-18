"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBesu } from "@/context/besu-provider"
import { Loader2, AlertCircle } from "lucide-react"

interface ConnectWalletProps {
  onConnect: () => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const { setProvider, setAccount } = useBesu()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      // Create ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum)

      // Check if connected to Hyperledger Besu network
      const network = await provider.getNetwork()

      // In a real app, you would check for the specific Besu network ID
      // This is just a placeholder check
      // if (network.chainId !== YOUR_BESU_CHAIN_ID) {
      //   throw new Error("Please connect to the Hyperledger Besu network")
      // }

      setProvider(provider)
      setAccount(accounts[0])
      onConnect()
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={connectWallet} className="w-full" disabled={isConnecting}>
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>
    </div>
  )
}

