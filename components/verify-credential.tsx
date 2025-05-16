"use client"

import { useState, useEffect} from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { verifyCredential } from "@/lib/did-service"
import { useBesu } from "@/context/besu-provider";
import { getDIDComponents } from "@/context/besuUtils";
export function VerifyCredential() {
   const { setProvider, setAccount } = useBesu();
   const { provider, wallet } = getDIDComponents();
     const [publicKeys, setPublicKeys] = useState([
    { id: "key-1", type: "EcdsaSecp256k1VerificationKey2019", publicKeyHex: "" },
  ]);
  useEffect(() => {
      const fetchPublicKey = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
          try {
            // Yêu cầu quyền truy cập tài khoản
            //setProvider(new ethers.JsonRpcProvider(BESU_RPC_URL))
            setProvider(provider)
            const accounts = [wallet.address];
            const address = accounts[0]; // Lấy địa chỉ đầu tiên
            setAccount(address)
            if (!address) throw new Error("Không tìm thấy địa chỉ ví.");
    
            // Lấy public key từ địa chỉ ví
            const publicKey = await window.ethereum.request({
              method: "eth_getEncryptionPublicKey",
              params: [address], // Dùng address thay vì window.ethereum.selectedAddress
            });
            
            setPublicKeys([
            { id: "key-1", type: "EcdsaSecp256k1VerificationKey2019", publicKeyHex: publicKey },
          ]);
            // Cập nhật state với publicKey mới
          } catch (error) {
            console.error("Lỗi lấy public key:", error);
          }
        } else {
          console.error("MetaMask chưa được cài đặt!");
        }
      };
    
      fetchPublicKey();
    }, []);
  const [credential, setCredential] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  const handleVerifyCredential = async () => {
    setVerificationResult(null)

    if (!credential.trim()) {
      setVerificationResult({
        isValid: false,
        message: "Please paste a Verifiable Credential JSON string.",
      })
      return
    }

    setIsVerifying(true)

    try {
      const parsedCredential = JSON.parse(credential)

      if (!parsedCredential?.id) {
        throw new Error("Missing `id` field in VC document")
      }
      console.log("Address:", wallet.address)
      const result = await verifyCredential(parsedCredential, wallet.address)
      setVerificationResult(result)
    } catch (err: any) {
      console.error("Verification error:", err)
      setVerificationResult({
        isValid: false,
        message:
          err?.message?.includes("Unexpected token")
            ? "Invalid JSON format. Please make sure your VC is valid JSON."
            : err.message || "Verification failed",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Credential</CardTitle>
        <CardDescription>
          Check if the VC exists and is valid on the Hyperledger Besu network.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="credential">Verifiable Credential (JSON)</Label>
          <Textarea
            id="credential"
            className="font-mono text-sm h-64"
            placeholder='Paste your Verifiable Credential JSON here...'
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          />
        </div>

        <Button
          onClick={handleVerifyCredential}
          className="w-full"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Credential"
          )}
        </Button>

        {verificationResult && (
          <Alert variant={verificationResult.isValid ? "default" : "destructive"}>
            {verificationResult.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertTitle>
              {verificationResult.isValid ? "Credential Found" : "Credential Not Found"}
            </AlertTitle>
            <AlertDescription>{verificationResult.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
