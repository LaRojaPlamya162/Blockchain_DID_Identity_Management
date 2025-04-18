"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Search } from "lucide-react"
import { resolveDID } from "@/lib/did-service"

export function ViewDID() {
  const [didUrl, setDidUrl] = useState("")
  const [isResolving, setIsResolving] = useState(false)
  const [didDocument, setDidDocument] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResolveDID = async () => {
    if (!didUrl.trim()) {
      setError("Please enter a DID URL")
      return
    }

    setIsResolving(true)
    setError(null)

    try {
      // Contract connected:

      // In a real implementation, this would resolve the DID from Hyperledger Besu
      const didDoc = await resolveDID(didUrl)
      setDidDocument(didDoc)
    } catch (error) {
      console.error("Error resolving DID:", error)
      setError("Failed to resolve DID. Please check the DID URL and try again.")
      setDidDocument(null)
    } finally {
      setIsResolving(false)
    }
  }
  const jsonSafeStringify = (obj: any) =>
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
      2
    );
  return (
    <Card>
      <CardHeader>
        <CardTitle>View DID Document</CardTitle>
        <CardDescription>
          Resolve and view a Decentralized Identifier (DID) document from Hyperledger Besu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="did-url" className="sr-only">
              DID URL
            </Label>
            <Input
              id="did-url"
              placeholder="Enter DID URL (e.g., did:ethr:0x...)"
              value={didUrl}
              onChange={(e) => setDidUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleResolveDID} disabled={isResolving}>
            {isResolving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Resolve
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {didDocument && (
          <div className="space-y-2">
            <Label>DID Document</Label>
            <Textarea className="font-mono text-sm h-96" value={jsonSafeStringify(didDocument)} readOnly />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

