"use client";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createVC } from "@/lib/did-service";
import { usingBesu } from "@/hooks/usingBesu";
import { isBesuOnline} from "@/context/besuUtils";
export function CreateVC() {
  const { registerVC, account } = usingBesu();
  const [issuer, setIssuer] = useState("");
  const [subject, setSubject] = useState("");
  const [credentialType, setCredentialType] = useState("VerifiableCredential");
  const [claims, setClaims] = useState([{ key: "claim-1", value: "" }]);
  const [expirationDate, setExpirationDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [vcDocument, setVcDocument] = useState<any>(null);
  // Add Claim
  const addClaim = () => {
    setClaims([...claims, { key: `claim-${claims.length + 1}`, value: "" }]);
  };

  // Remove Claim
  const removeClaim = (index: number) => {
    if (claims.length > 1) {
      setClaims(claims.filter((_, i) => i !== index));
    }
  };

  // Update Claim
  const updateClaim = (index: number, field: string, value: string) => {
    const updatedClaims = [...claims];
    updatedClaims[index] = { ...updatedClaims[index], [field]: value };
    setClaims(updatedClaims);
  };

  // Handle VC Creation
  const handleCreateVC = async () => {
    if (!issuer) {
      alert("Please enter the issuer DID");
      return;
    }
    if (!subject) {
      alert("Please enter the subject DID");
      return;
    }
    if (!claims.every(claim => claim.key && claim.value)) {
      alert("Please fill in all claim fields");
      return;
    }
    if (!(await isBesuOnline())) {
      alert("Please connect to the Besu network");
      return;
    }
    if (!account) {
      alert("Invalid account, please check Private Key");
      return;
    }

    setIsCreating(true);

    const storageKey = `vcMap_${account}`;
    const storedVCMap = JSON.parse(localStorage.getItem(storageKey) || "{}");

    try {
      // Create VC Document
      const vcDoc = await createVC(issuer, subject, credentialType, claims, expirationDate, account);
      // Register VC on Besu
      await registerVC(vcDoc.id, subject, claims);


      // Update state
      setVcDocument(vcDoc);
    } catch (error) {
      console.error("Error creating VC:", error);
      alert("Failed to create VC, please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Verifiable Credential</CardTitle>
        <CardDescription>Create a new Verifiable Credential (VC) on Hyperledger Besu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="issuer">Issuer DID</Label>
          <Input
            id="issuer"
            placeholder="Enter issuer DID (e.g., did:ethr:0x...)"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject DID</Label>
          <Input
            id="subject"
            placeholder="Enter subject DID (e.g., did:ethr:0x...)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credentialType">Credential Type</Label>
          <Input
            id="credentialType"
            value={credentialType}
            onChange={(e) => setCredentialType(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
          <Input
            id="expirationDate"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Claims</Label>
            <Button variant="outline" size="sm" onClick={addClaim}>
              <Plus className="h-4 w-4 mr-2" />
              Add Claim
            </Button>
          </div>

          {claims.map((claim, index) => (
            <div key={claim.key} className="space-y-2 p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <Label>Claim {index + 1}</Label>
                {claims.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeClaim(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`claim-key-${index}`}>Claim Key</Label>
                <Input
                  id={`claim-key-${index}`}
                  placeholder="Enter claim key (e.g., degree)"
                  value={claim.key}
                  onChange={(e) => updateClaim(index, "key", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`claim-value-${index}`}>Claim Value</Label>
                <Input
                  id={`claim-value-${index}`}
                  placeholder="Enter claim value (e.g., Bachelor of Science)"
                  value={claim.value}
                  onChange={(e) => updateClaim(index, "value", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {vcDocument && (
          <div className="space-y-2">
            <Label>Generated VC Document</Label>
            <Textarea className="font-mono text-sm h-64" value={JSON.stringify(vcDocument, null, 2)} readOnly />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateVC} className="w-full" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating VC...
            </>
          ) : (
            "Create VC"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}