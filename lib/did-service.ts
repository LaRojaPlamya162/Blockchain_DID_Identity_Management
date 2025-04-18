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

// Verify a verifiable credential
export async function verifyCredential(credential: any) {
  // In a real implementation, this would verify the credential against DIDs on Hyperledger Besu
  // For demonstration, we'll do some basic validation

  try {
    // Check if the credential has the required fields
    if (
      !credential["@context"] ||
      !credential.type ||
      !credential.issuer ||
      !credential.issuanceDate
    ) {
      return {
        isValid: false,
        message: "Missing required fields in the credential",
      };
    }

    // Check if the credential has a valid context
    if (
      !credential["@context"].includes("https://www.w3.org/2018/credentials/v1")
    ) {
      return {
        isValid: false,
        message: "Invalid credential context",
      };
    }

    // Check if the credential has a valid type
    if (!credential.type.includes("VerifiableCredential")) {
      return {
        isValid: false,
        message: "Invalid credential type",
      };
    }

    // Check if the credential has a proof
    if (!credential.proof) {
      return {
        isValid: false,
        message: "Credential is missing proof",
      };
    }

    // In a real implementation, this would verify the proof against the issuer's DID
    // For demonstration, we'll simulate a successful verification

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      isValid: true,
      message: "Credential successfully verified",
    };
  } catch (error) {
    return {
      isValid: false,
      message:
        "Error verifying credential: " +
        (error instanceof Error ? error.message : String(error)),
    };
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

