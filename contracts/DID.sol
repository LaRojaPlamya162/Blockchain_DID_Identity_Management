// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


contract DID {
    // Cấu trúc lưu trữ thông tin DID
    struct DIDInfo {
        address owner;
        string name;
        string birthday;
        string personalID;
        uint256 timestamp;
        bool active;
    }

    // Mapping từ DID string đến DIDInfo
    mapping(string => DIDInfo) private didRegistry;
    
    // Array lưu trữ tất cả các DID đã đăng ký
    string[] private registeredDIDs;

    // Sự kiện khi một DID được đăng ký
    event RegisterDID(string did, address indexed owner, string name, string birthday, string personalID, uint256 timestamp);
    
    // Sự kiện khi một DID được cập nhật
    event UpdateDID(string did, address indexed owner, string name, string birthday, string personalID, uint256 timestamp);
    
    // Sự kiện khi một DID bị vô hiệu hóa
    event DeactivateDID(string did, address indexed owner, uint256 timestamp);


    function registerDID(string memory did, string memory name, string memory birthday, string memory personalID) public {
        require(didRegistry[did].owner == address(0), "DID already registered");
        
        // Tạo thông tin DID mới
        DIDInfo memory newDID = DIDInfo({
            owner: msg.sender,
            name: name,
            birthday: birthday,
            personalID: personalID,
            timestamp: block.timestamp,
            active: true
        });
        
        // Lưu thông tin vào registry
        didRegistry[did] = newDID;
        registeredDIDs.push(did);
        
        // Emit sự kiện
        emit RegisterDID(did, msg.sender, name,birthday, personalID, block.timestamp);
    }
    

    function getDIDInfo(string memory did) public view returns (address owner, string memory name, string memory birthday, string memory personalID, uint256 timestamp, bool active) {
        DIDInfo memory info = didRegistry[did];
        require(info.owner != address(0), "DID not registered");
        
        return (info.owner, info.name,info.birthday, info.personalID, info.timestamp, info.active);
    }

    function isDIDRegistered(string memory did) public view returns (bool) {
        return didRegistry[did].owner != address(0);
    }
    

    function updateDID(string memory did, string memory newName, string memory newBirthday, string memory newPersonalID) public {
        require(didRegistry[did].owner == msg.sender, "Only owner can update DID");
        require(didRegistry[did].active, "DID is not active");
        
        didRegistry[did].name = newName;
        didRegistry[did].birthday = newBirthday;
        didRegistry[did].personalID = newPersonalID;
        didRegistry[did].timestamp = block.timestamp;
        
        emit UpdateDID(did, msg.sender, newName, newBirthday, newPersonalID, block.timestamp);
    }
    

    function deactivateDID(string memory did) public {
        require(didRegistry[did].owner == msg.sender, "Only owner can deactivate DID");
        require(didRegistry[did].active, "DID is already inactive");
        
        didRegistry[did].active = false;
        
        emit DeactivateDID(did, msg.sender, block.timestamp);
    }
    

    function getTotalDIDs() public view returns (uint256) {
        return registeredDIDs.length;
    }
    

    function getDIDAtIndex(uint256 index) public view returns (string memory) {
        require(index < registeredDIDs.length, "Index out of bounds");
        return registeredDIDs[index];
    }
}