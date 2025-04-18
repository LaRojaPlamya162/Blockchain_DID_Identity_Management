const { ethers } = require("hardhat");

async function main() {
    const didRegistryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Thay bằng địa chỉ contract
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    const didRegistry = DIDRegistry.attach(didRegistryAddress);

    const did = "did:example:123456"; // DID bạn muốn tìm địa chỉ
        // Thông tin DID bạn muốn tạo
    //const did = "did:example:123456"; // DID bạn muốn tạo
    const controller = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Địa chỉ controller của DID
    const publicKeys = "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5"; // Khóa công khai của DID
    const services = "https://example.com/did-service"; // Dịch vụ của DID


    // Nếu bạn muốn lưu dữ liệu cho DID này
    const tx = await didRegistry.createDID(did,controller, publicKeys, services)
    await tx.wait();
    console.log("Data stored successfully!");

    // Lấy địa chỉ của DID từ contract
    
    const didInfo = await didRegistry.getDIDInfo(did);
    console.log("DID Info:", didInfo);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
