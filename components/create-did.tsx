"use client"
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBesu } from "@/context/besu-provider";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createDID } from "@/lib/did-service";
import { usingBesu } from "@/hooks/usingBesu";
import { isBesuOnline } from "@/context/besuUtils";

// 🔐 Tải private key từ biến môi trường (chỉ dùng trong môi trường server-side)
const PRIVATE_KEY = process.env.NEXT_PUBLIC_BESU_PRIVATE_KEY || "";
const BESU_RPC_URL = process.env.NEXT_PUBLIC_BESU_RPC_URL || "";

export function CreateDID() {
  const { registerDID } = usingBesu();
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [publicKeys, setPublicKeys] = useState([
    { id: "key-1", type: "EcdsaSecp256k1VerificationKey2019", publicKeyHex: "" },
  ]);
  const [services, setServices] = useState([{ id: "svc-1", type: "DIDCommMessaging", endpoint: "" }]);
  const [isCreating, setIsCreating] = useState(false);
  const [didDocument, setDidDocument] = useState<any>(null);

  useEffect(() => {
    const fetchPublicKey = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Yêu cầu quyền truy cập tài khoản
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          const address = accounts[0]; // Lấy địa chỉ đầu tiên
          setAccount(address)
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
  }, []);
  

  // 🆕 Thêm Public Key
  const addPublicKey = () => {
    setPublicKeys([...publicKeys, { id: `key-${publicKeys.length + 1}`, type: "EcdsaSecp256k1VerificationKey2019", publicKeyHex: "" }]);
  };
  const removePublicKey = (index: number) => {
    if (publicKeys.length > 1) {
      setPublicKeys(publicKeys.filter((_, i) => i !== index))
    }
  }

  // 🆕 Cập nhật Public Key
  const updatePublicKey = (index: number, field: string, value: string) => {
    const updatedKeys = [...publicKeys];
    updatedKeys[index] = { ...updatedKeys[index], [field]: value };
    setPublicKeys(updatedKeys);
  };

  // 🆕 Thêm Service
  const addService = () => {
    setServices([...services, { id: `svc-${services.length + 1}`, type: "DIDCommMessaging", endpoint: "" }]);
  };
  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index))
    }
  }

  // 🆕 Cập nhật Service
  const updateService = (index: number, field: string, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  // 🚀 Xử lý tạo DID
  const handleCreateDID = async () => {
    if (!name) {
      alert("Vui lòng nhập tên DID");
      return;
    }

    if (!(await isBesuOnline())) {
      alert("Vui lòng kết nối với mạng Besu");
      return;
    }

    if (!account) {
      alert("Tài khoản không hợp lệ, vui lòng kiểm tra Private Key");
      return;
    }

    setIsCreating(true);

    try {
      // 1️⃣ Tạo DID Document
      const didDoc = await createDID(account, name, publicKeys, services);

      // 2️⃣ Gửi giao dịch lên mạng Besu
      await registerDID(didDoc.id, JSON.stringify(didDoc), publicKeys[0].publicKeyHex, String(services));

      // 3️⃣ Cập nhật state
      setDidDocument(didDoc);
      alert("✅ DID đã được tạo thành công!");
    } catch (error) {
      console.error("❌ Lỗi tạo DID:", error);
      alert("⚠️ Không thể tạo DID, vui lòng kiểm tra lại.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create DID</CardTitle>
        <CardDescription>Create your DID and register it on the Besu network.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter DID name"
        />
        {/* Public Keys */}
        {publicKeys.map((key, index) => (
          <div key={key.id}>
            <Label>{`Public Key ${index + 1}`}</Label>
            <Input
              value={key.publicKeyHex}
              onChange={(e) => updatePublicKey(index, "publicKeyHex", e.target.value)}
              placeholder="Enter Public Key Hex"
            />
            <Button onClick={() => removePublicKey(index)} variant="destructive">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button onClick={addPublicKey}>
          <Plus size={16} /> Add Public Key
        </Button>

        {/* Services */}
        {services.map((svc, index) => (
          <div key={svc.id}>
            <Label>{`Service ${index + 1}`}</Label>
            <Input
              value={svc.endpoint}
              onChange={(e) => updateService(index, "endpoint", e.target.value)}
              placeholder="Enter service endpoint"
            />
            <Button onClick={() => removeService(index)} variant="destructive">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button onClick={addService}>
          <Plus size={16} /> Add Service
        </Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateDID} disabled={isCreating}>
          {isCreating ? <Loader2 className="animate-spin" size={16} /> : "Create DID"}
        </Button>
      </CardFooter>
    </Card>
  );
}
