"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBesu } from "@/context/besu-provider"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { createDID } from "@/lib/did-service"
import { usingBesu } from "@/hook/useBesu"

export function CreateDID() {
  const { account } = useBesu()
  const { registerDID} = usingBesu()
  const [name, setName] = useState("")
  const [did, setDid] = useState("")
  const [publicKeys, setPublicKeys] = useState([
    { id: "key-1", type: "EcdsaSecp256k1VerificationKey2019", publicKeyHex: "" },
  ]);
  useEffect(() => {
    const fetchPublicKey = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Yêu cầu quyền truy cập tài khoản
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const address = accounts[0]; // Lấy địa chỉ đầu tiên
  
          if (!address) throw new Error("Không tìm thấy địa chỉ ví.");
  
          // Lấy public key từ địa chỉ ví
          const publicKey = await window.ethereum.request({
            method: "eth_getEncryptionPublicKey",
            params: [address], // Dùng address thay vì window.ethereum.selectedAddress
          });
  
          // Cập nhật state với publicKey mới
          setPublicKeys([
            { id: "key-1", type: "EcdsaSecp256k1VerificationKey2019", publicKeyHex: publicKey },
          ]);
        } catch (error) {
          console.error("Lỗi lấy public key:", error);
        }
      } else {
        console.error("MetaMask chưa được cài đặt!");
      }
    };
  
    fetchPublicKey();
  }, []); // Chạy chỉ một lần sau khi component mount
  const [services, setServices] = useState([{ id: "svc-1", type: "DIDCommMessaging", endpoint: "" }])
  const [isCreating, setIsCreating] = useState(false)
  const [didDocument, setDidDocument] = useState<any>(null)

  const addPublicKey = () => {
    setPublicKeys([
      ...publicKeys,
      {
        id: `key-${publicKeys.length + 1}`,
        type: "EcdsaSecp256k1VerificationKey2019",
        publicKeyHex: "",
      },
    ])
  }

  const removePublicKey = (index: number) => {
    if (publicKeys.length > 1) {
      setPublicKeys(publicKeys.filter((_, i) => i !== index))
    }
  }

  const updatePublicKey = (index: number, field: string, value: string) => {
    const updatedKeys = [...publicKeys]
    updatedKeys[index] = { ...updatedKeys[index], [field]: value }
    setPublicKeys(updatedKeys)
  }

  const addService = () => {
    setServices([
      ...services,
      {
        id: `svc-${services.length + 1}`,
        type: "DIDCommMessaging",
        endpoint: "",
      },
    ])
  }

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index))
    }
  }

  const updateService = (index: number, field: string, value: string) => {
    const updatedServices = [...services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setServices(updatedServices)
  }

  const handleCreateDID = async () => {
    setIsCreating(true)
    if (!publicKeys.length) {
      alert("Please enter a valid DID and at least one Public Key")
      setIsCreating(false)
      return
    }
  
    try {
      // 1️⃣ Tạo tài liệu DID
      const didDoc = await createDID(account, name, publicKeys, services)
  
      // 2️⃣ Đăng ký DID lên mạng Besu
      await registerDID(didDoc.id, JSON.stringify(didDoc))
  
      // 3️⃣ Cập nhật UI với tài liệu DID mới
      setDidDocument(didDoc)
      alert("DID successfully created and registered on Besu!")
    } catch (error) {
      console.error("Error creating DID:", error)
      alert("Failed to create DID. Check console for details.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New DID</CardTitle>
        <CardDescription>Create a new Decentralized Identifier (DID) on Hyperledger Besu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">DID Name (Optional)</Label>
          <Input
            id="name"
            placeholder="Enter a name for this DID"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Public Keys</Label>
            <Button variant="outline" size="sm" onClick={addPublicKey}>
              <Plus className="h-4 w-4 mr-2" />
              Add Key
            </Button>
          </div>

          {publicKeys.map((key, index) => (
            <div key={key.id} className="space-y-2 p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <Label>Key {index + 1}</Label>
                {publicKeys.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removePublicKey(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`key-type-${index}`}>Key Type</Label>
                <Input
                  id={`key-type-${index}`}
                  value={key.type}
                  onChange={(e) => updatePublicKey(index, "type", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`key-value-${index}`}>Public Key Hex</Label>
                <Input
                  id={`key-value-${index}`}
                  placeholder="Enter public key hex value"
                  value={key.publicKeyHex}
                  onChange={(e) => updatePublicKey(index, "publicKeyHex", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Services</Label>
            <Button variant="outline" size="sm" onClick={addService}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {services.map((service, index) => (
            <div key={service.id} className="space-y-2 p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <Label>Service {index + 1}</Label>
                {services.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeService(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`service-type-${index}`}>Service Type</Label>
                <Input
                  id={`service-type-${index}`}
                  value={service.type}
                  onChange={(e) => updateService(index, "type", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`service-endpoint-${index}`}>Endpoint</Label>
                <Input
                  id={`service-endpoint-${index}`}
                  placeholder="Enter service endpoint URL"
                  value={service.endpoint}
                  onChange={(e) => updateService(index, "endpoint", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {didDocument && (
          <div className="space-y-2">
            <Label>Generated DID Document</Label>
            <Textarea className="font-mono text-sm h-64" value={JSON.stringify(didDocument, null, 2)} readOnly />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateDID} className="w-full" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating DID...
            </>
          ) : (
            "Create DID"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
