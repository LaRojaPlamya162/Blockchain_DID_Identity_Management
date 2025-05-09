import { getDIDComponents } from "@/context/besuUtils";
// Interface for a public key in a DID document
interface PublicKey {
  id: string;
  type: string;
  //controller: string,
  publicKeyHex: string;
}

// Interface for a service in a DID document
interface Service {
  id: string;
  type: string;
  endpoint: string;
}

// Create a new DID on Hyperledger Besu
export async function createDID(
  account: string | null,
  name: string,
  publicKeys: PublicKey[],
  services: Service[],
  personalId: string,
  birthday: string
) {
  if (!account) {
    throw new Error("No account connected");
  }

  // In a real implementation, this would create a DID on Hyperledger Besu
  // For demonstration, we'll create a mock DID document

  // Generate a DID based on the account address
  const did = `did:besu:${account.toLowerCase()}:${name}:${birthday}:${personalId}`;

  // Create the DID document
  const didDocument = {
    "@context": "https://www.w3.org/ns/did/v1",
    id: did,
    name: name,
    personalID: personalId,
    birthday: birthday,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    publicKey: publicKeys.map((key, index) => ({
      id: `${did}#${key.id}`,
      type: key.type,
      controller: did,
      publicKeyHex: key.publicKeyHex || account, // Use account as default if no key provided
    })),
    authentication: publicKeys.map((key) => `${did}#${key.id}`),
    service: services.map((svc) => ({
      id: `${did}#${svc.id}`,
      type: svc.type,
      serviceEndpoint: svc.endpoint,
    })),
  };

  // In a real implementation, this would store the DID document on Hyperledger Besu
  // For demonstration, we'll just return the document

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return didDocument;
}

// Resolve a DID to get its DID document
export async function resolveDID(didUrl: string) {
  // In a real implementation, this would resolve the DID from Hyperledger Besu
  // For demonstration, we'll create a mock DID document
  const { contract} = getDIDComponents();

  // Validate DID format
  if (!didUrl.startsWith("did:")) {
    throw new Error("Invalid DID format");
  }
  const isRegistered = await contract.isDIDRegistered(didUrl);
  if (!isRegistered){
    alert("DID is not found");
    return;
  }
  const DIDInfo = await contract.getDIDInfo(didUrl);

  // Extract the method and identifier
  //const [, method, identifier, name] = didUrl.split(":");
  const [, method,identifier] = didUrl.split(":");
  if (method !== "besu" && method !== "ethr" && method !== "web") {
    throw new Error(`Unsupported DID method: ${method}`);
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a mock DID document
  const didDocument = {
    "@context": "https://www.w3.org/ns/did/v1",
    id: didUrl,
    name: DIDInfo[1] || undefined,
    birthday: DIDInfo[2],
    personalID: DIDInfo[3],
    created: DIDInfo[4],
    updated: DIDInfo[4],
    publicKey: [
      {
        id: `${didUrl}#key-1`,
        type: "EcdsaSecp256k1VerificationKey2019",
        controller: didUrl,
        publicKeyHex: `0x${identifier.substring(0, 40)}`,
      },
    ],
    authentication: [`${didUrl}#key-1`],
    service: [
      {
        id: `${didUrl}#svc-1`,
        type: "DIDCommMessaging",
        serviceEndpoint: "https://example.com/endpoint",
      },
    ],
  };

  return didDocument;
}

export async function verifyCredential(vc: any) {
  const { contract } = getDIDComponents()

  try {
    // Kiểm tra context hợp lệ cho VC
    if (
      !vc["@context"] ||
      !Array.isArray(vc["@context"]) ||
      !vc["@context"].includes("https://www.w3.org/2018/credentials/v1")
    ) {
      return {
        isValid: false,
        message: "Invalid or missing credential context",
      }
    }

    if (!vc.id || typeof vc.id !== "string") {
      return {
        isValid: false,
        message: "Credential must include an ID",
      }
    }

    if (!vc.issuer || typeof vc.issuer !== "string") {
      return {
        isValid: false,
        message: "Credential must include an issuer DID",
      }
    }

    if (!vc.credentialSubject || typeof vc.credentialSubject !== "object") {
      return {
        isValid: false,
        message: "Missing credentialSubject",
      }
    }

    // 🔍 Kiểm tra xem issuer DID có tồn tại trên smart contract không
    const isRegistered = await contract.isDIDRegistered(vc.issuer)
    if (!isRegistered) {
      return {
        isValid: false,
        message: "Issuer DID is not registered on the blockchain",
      }
    }

    const [owner, name, birthday, personalID, timestamp, active] = await contract.getDIDInfo(vc.issuer)
    if (!active) {
      return {
        isValid: false,
        message: "Issuer DID is not active",
      }
    }
    if (!owner || !name || !birthday || !personalID) {
      return {
        isValid: false,
        message: "Invalid issuer DID information",
      }
    }
    

    // 🔒 Xác thực signature nếu cần (để sau)
    // TODO: verify signature (proof.jws) with publicKey of verificationMethod

    // Mô phỏng độ trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      isValid: true,
      message: "Verifiable Credential is valid and issuer DID is registered",
    }

  } catch (error) {
    console.error("Verification error:", error)
    return {
      isValid: false,
      message:
        "Error verifying credential: " +
        (error instanceof Error ? error.message : String(error)),
    }
  }
}

// 🆕 Update a DID Document on Hyperledger Besu
export async function updateDID(
  account: string | null,
  name: string,
  personalId: string,
  birthday: string
) {
  if (!account) {
    throw new Error("No account connected");
  }
  const { contract } = getDIDComponents();

  const did = `did:besu:${account.toLowerCase()}:${name}:${birthday}:${personalId}`;


  try {
    // Call the contract's updateDID function
    const tx = await contract.updateDID(did, name, birthday, personalId,);
    await tx.wait(); // Wait for the transaction to be mined

    // Fetch the updated DID information
    const DIDInfo = await contract.getDIDInfo(did);

    // Construct the updated DID document
    const didDocument = {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      name: DIDInfo[0], // name from contract
      personalID: DIDInfo[2], // personalID from contract
      birthday: DIDInfo[1], // birthday from contract
      created: DIDInfo[4], // creation timestamp
      updated: new Date().toISOString(), // current timestamp
      publicKey: [
        {
          id: `${did}#key-1`,
          type: "EcdsaSecp256k1VerificationKey2019",
          controller: did,
          publicKeyHex: account,
        },
      ],
      authentication: [`${did}#key-1`],
      service: [], // No services updated in this function
    };

    return didDocument;
  } catch (error) {
    console.error("Error updating DID:", error);
    throw new Error("Failed to update DID. Ensure you are the owner and the DID is active.");
  }
}

export async function createVC(
  issuer: string,
  subject: string,
  credentialType: string,
  claims: { key: string; value: string }[],
  expirationDate: string,
  account: string | null
) {
  // Khai báo issuerDID và subjectDID bên ngoài các điều kiện if
  let issuerDID: string | undefined;
  let subjectDID: string | undefined;

  // Trích xuất phần DID từ issuer
  const matchIssuer = issuer.match(/:(\d+:\d{4}-\d{2}-\d{2}:\d+)$/);

  if (matchIssuer) {
    issuerDID = matchIssuer[1];
    console.log("Issuer DID:", issuerDID);  // Output: 1:1111-11-11:1115
  } else {
    throw new Error("Invalid issuer DID format");
  }

  // Trích xuất phần DID từ subject
  const matchSubject = subject.match(/:(\d+:\d{4}-\d{2}-\d{2}:\d+)$/);
  if (matchSubject) {
    subjectDID = matchSubject[1];
    console.log("Subject DID:", subjectDID);  // Output: 1:1111-11-11:1111
  } else {
    throw new Error("Invalid subject DID format");
  }

  if (!account) {
    throw new Error("No account connected");
  }

  if (!issuer || !subject) {
    throw new Error("Issuer and subject DIDs are required");
  }

  // Generate VC ID using issuerDID and subjectDID
  const vcId = `vc:besu:${issuerDID}:${subjectDID}:${Date.now()}`;

  // Create the VC document
  const vcDocument = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1"
    ],
    id: vcId,
    type: ["VerifiableCredential", credentialType],
    issuer: issuer,
    issuanceDate: new Date().toISOString(),
    expirationDate: expirationDate || undefined,
    credentialSubject: {
      id: subject,
      ...claims.reduce((acc, claim) => ({
        ...acc,
        [claim.key]: claim.value
      }), {})
    },
    proof: {
      type: "EcdsaSecp256k1Signature2019",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: `${issuer}#key-1`,
      jws: account.toLowerCase() // Placeholder JWS (in real implementation, sign with private key)
    }
  };

  // In a real implementation, this would store the VC document on Hyperledger Besu
  // For demonstration, we'll just return the document

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return vcDocument;
}

