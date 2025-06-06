// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AchievementTracker
 * @dev NFT contract for tracking fitness achievements
 */
contract AchievementTracker is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    
    // Counter for NFT token IDs
    Counters.Counter private _tokenIdCounter;
    
    // Address authorized to mint achievements (this will be the ProfileManager contract)
    address public achievementIssuer;
    
    // Mapping from achievement type to its base URI
    mapping(string => string) private _achievementBaseURIs;
    
    // Achievement data structure
    struct Achievement {
        string achievementType;
        uint256 timestamp;
        string metadata;
    }
    
    // Mapping from token ID to achievement data
    mapping(uint256 => Achievement) public achievements;
    
    // Events
    event AchievementIssued(
        address indexed user, 
        uint256 tokenId, 
        string achievementType, 
        string metadata
    );
    event AchievementIssuerUpdated(
        address indexed previousIssuer, 
        address indexed newIssuer
    );
    event AchievementBaseURISet(
        string achievementType, 
        string baseURI
    );

    /**
     * @dev Constructor initializes the ERC721 token with name and symbol
     * @param initialOwner The address that will own the contract initially
     */
    constructor(address initialOwner) 
        ERC721("FitnessAchievement", "FIT") 
        Ownable(initialOwner) 
    {
    }

    /**
     * @dev Set the address that has permission to issue achievements
     * Only the contract owner can call this
     * @param _issuer The address of the new achievement issuer
     */
    function setAchievementIssuer(address _issuer) external onlyOwner {
        emit AchievementIssuerUpdated(achievementIssuer, _issuer);
        achievementIssuer = _issuer;
    }

    /**
     * @dev Set the base URI for a specific achievement type
     * Only the contract owner can call this
     * @param achievementType The type of achievement
     * @param baseURI The base URI for this achievement type
     */
    function setAchievementBaseURI(string calldata achievementType, string calldata baseURI) external onlyOwner {
        _achievementBaseURIs[achievementType] = baseURI;
        emit AchievementBaseURISet(achievementType, baseURI);
    }

    /**
     * @dev Issue a new achievement NFT to a user
     * Only the achievement issuer can call this
     * @param to The address receiving the achievement
     * @param achievementType The type of fitness achievement
     * @param metadata Additional metadata for the achievement
     * @return tokenId The ID of the minted NFT
     */
    function issueAchievement(
        address to, 
        string calldata achievementType, 
        string calldata metadata
    ) external returns (uint256) {
        require(msg.sender == achievementIssuer, "Only achievement issuer can mint");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        // Store achievement data
        achievements[tokenId] = Achievement({
            achievementType: achievementType,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        // Set token URI using the base URI for this achievement type + metadata
        string memory tokenURI = string(abi.encodePacked(_achievementBaseURIs[achievementType], metadata));
        _setTokenURI(tokenId, tokenURI);
        
        emit AchievementIssued(to, tokenId, achievementType, metadata);
        
        return tokenId;
    }

    /**
     * @dev Get achievement details by token ID
     * @param tokenId The token ID to query
     * @return Achievement struct containing details
     */
    function getAchievement(uint256 tokenId) external view returns (Achievement memory) {
        require(_exists(tokenId), "Token does not exist");
        return achievements[tokenId];
    }

    /**
     * @dev Required override for ERC721URIStorage and ERC721Enumerable
     * @param interfaceId The interface identifier
     * @return bool Whether the interface is supported
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Required override for ERC721URIStorage and ERC721Enumerable
     */
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId, 
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Required override for ERC721URIStorage and ERC721Enumerable
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Required override for ERC721URIStorage
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}

