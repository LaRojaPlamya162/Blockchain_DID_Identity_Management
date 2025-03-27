// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {
    // Mapping để lưu trữ thông tin DID
    mapping(string => address) private didToContract;
    
    // Struct để lưu thông tin DID Document
    struct DIDDocument {
        string id;
        string controller;
        string publicKeys;
        string services;
        bool exists;
    }
    
    // Mapping để lưu DID Document
    mapping(string => DIDDocument) private didDocuments;
    
    // Events
    event DIDRegistered(string indexed did, address indexed contractAddress);
    event DIDCreated(string indexed did, string controller);
    
    // Kiểm tra DID tồn tại
    function didExists(string memory did) public view returns (bool) {
        return didToContract[did] != address(0);
    }
    
    // Tạo DID mới
    function createDID(
        string memory did,
        string memory controller,
        string memory publicKeys,
        string memory services
    ) public {
        require(!didExists(did), "DID already exists");
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
        
        // Lưu địa chỉ contract
        didToContract[did] = msg.sender;
        
        emit DIDCreated(did, controller);
    }
    
    // Đăng ký DID vào registry
    function registerDID(string memory did, address contractAddress) public {
        require(!didExists(did), "DID already exists");
        require(contractAddress != address(0), "Invalid contract address");
        require(didDocuments[did].exists, "DID document does not exist");
        
        didToContract[did] = contractAddress;
        emit DIDRegistered(did, contractAddress);
    }
    
    // Lấy địa chỉ contract của DID
    function getDIDContract(string memory did) public view returns (address) {
        return didToContract[did];
    }
    
    // Lấy thông tin DID Document
    function getDIDDocument(string memory did) public view returns (
        string memory id,
        string memory controller,
        string memory publicKeys,
        string memory services
    ) {
        require(didDocuments[did].exists, "DID document does not exist");
        
        DIDDocument memory doc = didDocuments[did];
        return (doc.id, doc.controller, doc.publicKeys, doc.services);
    }
    
    // Kiểm tra DID Document tồn tại
    function hasDIDDocument(string memory did) public view returns (bool) {
        return didDocuments[did].exists;
    }
}