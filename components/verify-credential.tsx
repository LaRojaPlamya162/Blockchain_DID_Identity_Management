"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { verifyCredential } from "@/lib/did-service"

export function VerifyCredential() {
  const [credential, setCredential] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  const handleVerifyCredential = async () => {
    if (!credential.trim()) {
      setVerificationResult({
        isValid: false,
        message: "Please enter a verifiable credential",
      })
      return
    }

    setIsVerifying(true)

    try {
      // Parse the credential JSON
      const credentialObj = JSON.parse(credential)

      // In a real implementation, this would verify the credential against Hyperledger Besu
      const result = await verifyCredential(credentialObj)
      setVerificationResult(result)
    } catch (error) {
      console.error("Error verifying credential:", error)
      setVerificationResult({
        isValid: false,
        message: "Invalid credential format. Please check the JSON structure.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Credential</CardTitle>
        <CardDescription>Verify a Verifiable Credential against DIDs on Hyperledger Besu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="credential">Verifiable Credential (JSON)</Label>
          <Textarea
            id="credential"
            className="font-mono text-sm h-64"
            placeholder='{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],...}'
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          />
        </div>

        <Button onClick={handleVerifyCredential} className="w-full" disabled={isVerifying}>
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
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{verificationResult.isValid ? "Valid Credential" : "Invalid Credential"}</AlertTitle>
            <AlertDescription>{verificationResult.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

