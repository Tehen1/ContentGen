// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BikeNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    
    // Bike attributes
    struct BikeAttributes {
        uint8 level;
        uint16 experience;
        uint8 speed;
        uint8 endurance;
        uint8 efficiency;
        uint8 rarity;
        string bikeType;
        string color;
    }
    
    // Mapping from token ID to bike attributes
    mapping(uint256 => BikeAttributes) public bikes;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Experience thresholds for leveling up
    uint16[] public levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    
    // Events
    event BikeCreated(uint256 indexed tokenId, address indexed owner, uint8 rarity);
    event BikeEvolved(uint256 indexed tokenId, uint8 newLevel);
    event ExperienceGained(uint256 indexed tokenId, uint16 experience, uint16 totalExperience);
    
    constructor() ERC721("FixierunBike", "FIXIE") {
        _baseTokenURI = "https://api.fixierun.com/metadata/bike/";
    }
    
    /**
     * @dev Mint a new bike NFT
     * @param to Address to mint the bike to
     * @param bikeType Type of bike (road, mountain, fixie, etc.)
     * @param color Color of the bike
     */
    function mintBike(address to, string memory bikeType, string memory color) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Generate random rarity (1-5)
        uint8 rarity = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, to, tokenId))) % 5) + 1;
        
        // Calculate initial attributes based on rarity
        uint8 speed = 50 + (rarity * 5);
        uint8 endurance = 50 + (rarity * 5);
        uint8 efficiency = 50 + (rarity * 5);
        
        // Create bike attributes
        bikes[tokenId] = BikeAttributes({
            level: 1,
            experience: 0,
            speed: speed,
            endurance: endurance,
            efficiency: efficiency,
            rarity: rarity,
            bikeType: bikeType,
            color: color
        });
        
        _safeMint(to, tokenId);
        
        emit BikeCreated(tokenId, to, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Add experience to a bike and potentially level it up
     * @param tokenId ID of the bike
     * @param experiencePoints Experience points to add
     */
    function addExperience(uint256 tokenId, uint256 experiencePoints) external {
        require(_exists(tokenId), "Bike does not exist");
        require(experiencePoints > 0, "Experience must be positive");
        
        BikeAttributes storage bike = bikes[tokenId];
        
        // Cap experience points per transaction
        uint16 points = experiencePoints > 1000 ? 1000 : uint16(experiencePoints);
        
        // Add experience
        uint16 newExperience = bike.experience + points;
        bike.experience = newExperience;
        
        emit ExperienceGained(tokenId, points, newExperience);
        
        // Check for level up
        if (bike.level < 10 && newExperience >= levelThresholds[bike.level]) {
            _levelUp(tokenId);
        }
    }
    
    /**
     * @dev Internal function to level up a bike
     * @param tokenId ID of the bike to level up
     */
    function _levelUp(uint256 tokenId) internal {
        BikeAttributes storage bike = bikes[tokenId];
        
        // Ensure we don't exceed max level
        if (bike.level >= 10) {
            return;
        }
        
        // Increase level
        bike.level += 1;
        
        // Improve attributes based on bike type
        if (keccak256(abi.encodePacked(bike.bikeType)) == keccak256(abi.encodePacked("road"))) {
            bike.speed += 3;
            bike.endurance += 1;
            bike.efficiency += 2;
        } else if (keccak256(abi.encodePacked(bike.bikeType)) == keccak256(abi.encodePacked("mountain"))) {
            bike.speed += 1;
            bike.endurance += 3;
            bike.efficiency += 2;
        } else if (keccak256(abi.encodePacked(bike.bikeType)) == keccak256(abi.encodePacked("fixie"))) {
            bike.speed += 2;
            bike.endurance += 2;
            bike.efficiency += 2;
        } else {
            bike.speed += 2;
            bike.endurance += 2;
            bike.efficiency += 2;
        }
        
        emit BikeEvolved(tokenId, bike.level);
    }
    
    /**
     * @dev Get the reward multiplier for a bike
     * @param tokenId ID of the bike
     * @return Reward multiplier (100 = 1x, 150 = 1.5x, etc.)
     */
    function getRewardMultiplier(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Bike does not exist");
        
        BikeAttributes memory bike = bikes[tokenId];
        
        // Base multiplier starts at 100 (1x)
        uint256 multiplier = 100;
        
        // Add level bonus (5% per level)
        multiplier += (bike.level - 1) * 5;
        
        // Add rarity bonus (5% per rarity point)
        multiplier += (bike.rarity - 1) * 5;
        
        return multiplier;
    }
    
    /**
     * @dev Get all attributes for a bike
     * @param tokenId ID of the bike
     */
    function getBikeAttributes(uint256 tokenId) external view returns (BikeAttributes memory) {
        require(_exists(tokenId), "Bike does not exist");
        return bikes[tokenId];
    }
    
    /**
     * @dev Set the base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Override base URI function
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get token URI with metadata
     * @param tokenId ID of the token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(_baseURI(), tokenId.toString()));
    }
}
