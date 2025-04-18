const hre = require("hardhat");

async function main() {
    const didRegistry = await hre.ethers.getContractAt("DIDRegistry", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const did = "did:example:123"; // DID bạn muốn tìm

    // Kiểm tra DID có tồn tại không
    const exists = await didRegistry.didExists(did);
    if (!exists) {
        console.log("DID does not exist");
        return;
    }

    // Nếu DID tồn tại, lấy thông tin DID Document
    const data = await didRegistry.getDIDDocument(did);
    console.log("DID Document:", data);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
