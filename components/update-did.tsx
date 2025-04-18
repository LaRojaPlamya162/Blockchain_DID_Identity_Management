"use client"
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UploadCloud, AlertCircle, CheckCircle } from "lucide-react";
import { useBesu } from "@/context/besu-provider";
import { usingBesu } from "@/hooks/usingBesu";
import { isBesuOnline, getDIDComponents } from "@/context/besuUtils";
import { updateDID } from "@/lib/did-service";

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const BESU_RPC_URL = "http://127.0.0.1:8545";

export function UpdateDID() {
  const { setProvider, setAccount } = useBesu();
  const { account } = usingBesu();
  const [did, setDid] = useState("");
  const [name, setName] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [birthday, setBirthday] = useState("");
  const [didDocument, setDidDocument] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingDid, setIsCheckingDid] = useState(false);
  const [isDidValid, setIsDidValid] = useState(false);
  const [error, setError] = useState("");
  const { contract } = getDIDComponents();

  useEffect(() => {
    const fetchPublicKey = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          setProvider(new ethers.JsonRpcProvider(BESU_RPC_URL));
          const wallet = new ethers.Wallet(PRIVATE_KEY, new ethers.JsonRpcProvider(BESU_RPC_URL));
          const accounts = [wallet.address];
          const address = accounts[0];
          setAccount(address);
          if (!address) throw new Error("Không tìm thấy địa chỉ ví.");
        } catch (error) {
          console.error("Lỗi lấy public key:", error);
        }
      } else {
        console.error("MetaMask chưa được cài đặt!");
      }
    };

    fetchPublicKey();
  }, [setProvider, setAccount]);

  const handleCheckDID = async () => {
    if (!did) {
      setError("Please enter a DID.");
      return;
    }
    if (!(await isBesuOnline())) {
      setError("Please connect to the Besu network.");
      return;
    }
    if (!account) {
      setError("Invalid account. Check private key.");
      return;
    }

    setIsCheckingDid(true);
    setError("");
    try {
      const isRegistered = await contract.isDIDRegistered(did);
      if (!isRegistered) {
        throw new Error("DID is not found");
      }
      setIsDidValid(true);
      setError("");
    } catch (error) {
      console.error("Error checking DID:", error);
      setError("DID not found or invalid. Please check and try again.");
      setIsDidValid(false);
    } finally {
      setIsCheckingDid(false);
    }
  };

  const handleUpdateDID = async () => {
    if (!isDidValid) {
      setError("Please verify the DID first.");
      return;
    }
    if (!name) {
      setError("Please enter a name.");
      return;
    }
    if (!personalId) {
      setError("Please enter a personal ID.");
      return;
    }
    if (!birthday) {
      setError("Please enter a birthday.");
      return;
    }
    const isRegistered = await contract.isDIDRegistered(did);
    if (!isRegistered) {
    alert("DID is not found");
    return;
    }

    setIsUpdating(true);
    setError("");
    try {
      const didDoc = await updateDID(account, name, personalId, birthday);
      setDidDocument(didDoc);
    } catch (error) {
      console.error("Error updating DID:", error);
      setError("Failed to update DID. Please check the DID and try again.");
      setDidDocument(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const jsonSafeStringify = (obj: any) => {
    // TODO: Consider defining a specific type for didDocument instead of 'any'
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update DID Document</CardTitle>
        <CardDescription>
          Update an existing Decentralized Identifier (DID) on Hyperledger Besu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>DID</Label>
            <Input
              value={did}
              onChange={(e) => setDid(e.target.value)}
              placeholder="did:besu:..."
              disabled={isDidValid}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCheckDID} disabled={isCheckingDid || isDidValid} className="w-full">
              {isCheckingDid ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isDidValid ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  DID Verified
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check DID
                </>
              )}
            </Button>
          </div>
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isDidValid}
            />
          </div>
          <div>
            <Label>Personal ID</Label>
            <Input
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              disabled={!isDidValid}
            />
          </div>
          <div>
            <Label>Birthday</Label>
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              disabled={!isDidValid}
            />
          </div>
        </div>

        <Button onClick={handleUpdateDID} disabled={isUpdating || !isDidValid} className="mt-4">
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-4 w-4 mr-2" />
              Update DID
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {didDocument && (
          <div className="space-y-2">
            <Label>Updated DID Document</Label>
            <Textarea className="font-mono text-sm h-96" value={jsonSafeStringify(didDocument)} readOnly />
          </div>
        )}
      </CardContent>
    </Card>
  );
}