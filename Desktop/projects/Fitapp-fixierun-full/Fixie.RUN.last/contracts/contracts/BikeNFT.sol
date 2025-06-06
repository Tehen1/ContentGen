// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BikeNFT
 * @dev ERC721 contract for Fixie.RUN bikes
 */
contract BikeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Mapping to track bike attributes
    mapping(uint256 => BikeAttributes) public bikeAttributes;
    
    // Mapping to track authorized updaters
    mapping(address => bool) public authorizedUpdaters;
    
    // Maximum level a bike can reach
    uint256 public constant MAX_LEVEL = 10;
    
    // Experience points required to level up
    uint256 public constant XP_PER_LEVEL = 1000;
    
    // Structure to store bike attributes
    struct BikeAttributes {
        uint256 level;
        uint256 xp;
        uint256 speed;
        uint256 endurance;
        uint256 handling;
        uint256 lastRideTimestamp;
        uint256 totalDistance;
        uint256 totalRides;
        string bikeType;
        string color;
    }
    
    /**
     * @dev Constructor
     * @param baseURI Base URI for metadata
     * @param admin Admin address
     */
    constructor(string memory baseURI, address admin) ERC721("Fixie Bike", "BIKE") Ownable(admin) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Set the base URI for metadata
     * @param baseURI Base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Add an authorized updater
     * @param updater Address to authorize
     */
    function addUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        
        emit UpdaterAdded(updater);
    }
    
    /**
     * @dev Remove an authorized updater
     * @param updater Address to remove
     */
    function removeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        
        emit UpdaterRemoved(updater);
    }
    
    /**
     * @dev Mint a new bike
     * @param to Address to mint the bike to
     * @param bikeType Type of bike
     * @param color Color of bike
     */
    function mintBike(address to, string memory bikeType, string memory color) external onlyOwner {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        
        // Initialize bike attributes
        BikeAttributes memory attributes = BikeAttributes({
            level: 1,
            xp: 0,
            speed: 10,
            endurance: 10,
            handling: 10,
            lastRideTimestamp: 0,
            totalDistance: 0,
            totalRides: 0,
            bikeType: bikeType,
            color: color
        });
        
        bikeAttributes[tokenId] = attributes;
        
        // Set token URI based on bike type and level
        string memory tokenURI = string(abi.encodePacked(
            _baseTokenURI,
            bikeType,
            "/",
            "1", // Level 1
            ".json"
        ));
        
        _setTokenURI(tokenId, tokenURI);
        
        emit BikeCreated(tokenId, to, bikeType, color);
    }
    
    /**
     * @dev Update bike attributes based on activity
     * @param tokenId Token ID
     * @param distance Distance ridden in meters
     * @param timestamp Timestamp of the ride
     */
    function updateBikeActivity(uint256 tokenId, uint256 distance, uint256 timestamp) external {
        require(_isApprovedOrOwner(msg.sender, tokenId) || 
                authorizedUpdaters[msg.sender] || 
                msg.sender == owner(), 
                "Not authorized to update bike");
                
        require(_exists(tokenId), "Bike does not exist");
        
        BikeAttributes storage bike = bikeAttributes[tokenId];
        
        // Update last ride timestamp
        bike.lastRideTimestamp = timestamp;
        
        // Update total distance and rides
        bike.totalDistance += distance;
        bike.totalRides += 1;
        
        // Calculate XP gained (1 XP per 100 meters)
        uint256 xpGained = distance / 100;
        bike.xp += xpGained;
        
        // Check if bike can level up
        if (bike.level < MAX_LEVEL && bike.xp >= XP_PER_LEVEL * bike.level) {
            // Level up the bike
            bike.level += 1;
            
            // Improve bike attributes
            bike.speed += 2;
            bike.endurance += 2;
            bike.handling += 2;
            
            // Update token URI for new level
            string memory tokenURI = string(abi.encodePacked(
                _baseTokenURI,
                bike.bikeType,
                "/",
                toString(bike.level),
                ".json"
            ));
            
            _setTokenURI(tokenId, tokenURI);
            
            emit BikeLevelUp(tokenId, bike.level);
        }
        
        emit BikeActivityUpdated(tokenId, distance, xpGained);
    }
    
    /**
     * @dev Convert uint to string
     * @param value Value to convert
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Special case for 0
        if (value == 0) {
            return "0";
        }
        
        // Find the length of the resulting string
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        // Create the string
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Override _baseURI function
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId Token ID to check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Required overrides for ERC721 extensions
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Events
    event BikeCreated(uint256 indexed tokenId, address indexed owner, string bikeType, string color);
    event BikeActivityUpdated(uint256 indexed tokenId, uint256 distance, uint256 xpGained);
    event BikeLevelUp(uint256 indexed tokenId, uint256 newLevel);
    event UpdaterAdded(address indexed updater);
    event UpdaterRemoved(address indexed updater);
}
