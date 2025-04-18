// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DIDRegistry {
    struct DIDDocument {
        string id;
        string controller;
        string publicKeys;
        string services;
        bool exists;
    }

    mapping(string => DIDDocument) private didDocuments;
    mapping(string => string) private didData;
    mapping(address => bool) public registeredAccounts;
    address[] public accounts;
    string[] private didList;

    // Events
    event DIDCreated(string indexed did, string controller);
    event DIDRegistered(string indexed did, address indexed contractAddress);
    event DataStored(string indexed did, string data);
    event DIDListUpdated(string[] dids);

    // Kiểm tra DID tồn tại
    function didExists(string memory did) public view returns (bool) {
        return hasDIDDocument(did);
    }

    // Tạo DID mới
    function createDID(
        string memory did,
        string memory controller,
        string memory publicKeys,
        string memory services
    ) public {
        require(!hasDIDDocument(did), "DID already exists");
        require(bytes(did).length > 0, "DID cannot be empty");
        require(bytes(controller).length > 0, "Controller cannot be empty");

        // Lưu DID Document
        didDocuments[did] = DIDDocument({
            id: did,
            controller: controller,
            publicKeys: publicKeys,
            services: services,
            exists: true
        });

        didList.push(did);
        emit DIDCreated(did, controller);
        emit DIDListUpdated(didList);
    }

    // Đăng ký DID lên mạng Besu
    function registerDID(string memory did) public {
        require(hasDIDDocument(did), "DID document does not exist");

        // Đăng ký DID lên mạng (bằng cách phát sinh sự kiện hoặc lưu vào hệ thống mạng Besu)
        emit DIDRegistered(did, msg.sender);
    }

    // Lấy thông tin DID Document
    function getDIDDocument(string memory did) public view returns (
        string memory id,
        string memory controller,
        string memory publicKeys,
        string memory services
    ) {
        require(hasDIDDocument(did), "DID document does not exist");

        DIDDocument memory doc = didDocuments[did];
        return (doc.id, doc.controller, doc.publicKeys, doc.services);
    }

    // Lưu dữ liệu trên mạng Besu
    function storeData(string memory did, string memory data) public {
        require(hasDIDDocument(did), "DID does not exist");
        require(bytes(data).length > 0, "Data cannot be empty");

        didData[did] = data;
        emit DataStored(did, data);
    }

    // Lấy dữ liệu đã lưu
    function getStoredData(string memory did) public view returns (string memory) {
        require(hasDIDDocument(did), "DID does not exist");
        return didData[did];
    }

    // Trả về danh sách tất cả DID đã đăng ký
    function getAllDIDs() public view returns (string[] memory) {
        return didList;
    }

    // Kiểm tra xem DID đã tồn tại trong danh sách đã đăng ký
    function hasDIDDocument(string memory did) public view returns (bool) {
        // Duyệt qua mảng didList để kiểm tra xem DID đã tồn tại hay chưa
        for (uint i = 0; i < didList.length; i++) {
            if (keccak256(bytes(didList[i])) == keccak256(bytes(did))) {
                return true; // Nếu tìm thấy DID trong danh sách
            }
        }
        return false; // Nếu không tìm thấy DID
    }



function registerAccount(address account) public {
    require(!registeredAccounts[account], "Account already registered");
    registeredAccounts[account] = true;
    accounts.push(account);
}

function getAllAccounts() public view returns (address[] memory) {
    return accounts;
}
}
