// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BikeNFT
 * @dev NFT contract for FixieRun bikes with evolution and fusion mechanics
 */
contract BikeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    enum Rarity { Common, Rare, Epic, Legendary, Mythic }
    
    struct BikeAttributes {
        uint256 speed;
        uint256 endurance;
        uint256 agility;
        uint256 strength;
        uint256 balance;
        uint256 reflexes;
        uint256 resilience;
    }
    
    struct Bike {
        Rarity rarity;
        BikeAttributes attributes;
        uint256 level;
        uint256 experience;
        uint256 createdAt;
        bool canEvolve;
    }
    
    // Mappings
    mapping(uint256 => Bike) public bikes;
    mapping(address => bool) public minters;
    mapping(Rarity => uint256) public raritySupply;
    mapping(Rarity => uint256) public maxRaritySupply;
    
    // Constants
    uint256 public constant MAX_SUPPLY = 100000;
    uint256 public constant EVOLUTION_COST = 1000 * 10**18; // 1000 FIXIE tokens
    
    // Contract references
    address public fixieTokenContract;
    address public fusionContract;
    
    // Events
    event BikeEvolved(uint256 indexed tokenId, uint256 newLevel, BikeAttributes newAttributes);
    event BikeFused(uint256[] fusedTokenIds, uint256 newTokenId);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(address _fixieTokenContract) ERC721("FixieBike", "FIXBIKE") {
        fixieTokenContract = _fixieTokenContract;
        
        // Set max supply for each rarity
        maxRaritySupply[Rarity.Common] = 50000;     // 50%
        maxRaritySupply[Rarity.Rare] = 25000;       // 25%
        maxRaritySupply[Rarity.Epic] = 15000;       // 15%
        maxRaritySupply[Rarity.Legendary] = 8000;   // 8%
        maxRaritySupply[Rarity.Mythic] = 2000;      // 2%
    }
    
    /**
     * @dev Mint a new bike NFT
     */
    function mintBike(
        address to,
        Rarity rarity,
        string memory metadataURI
    ) external onlyMinter whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(raritySupply[rarity] < maxRaritySupply[rarity], "Rarity max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        BikeAttributes memory attributes = _generateAttributes(rarity);
        
        bikes[tokenId] = Bike({
            rarity: rarity,
            attributes: attributes,
            level: 1,
            experience: 0,
            createdAt: block.timestamp,
            canEvolve: true
        });
        
        raritySupply[rarity]++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Evolve a bike by spending FIXIE tokens
     */
    function evolveBike(uint256 tokenId) external nonReentrant whenNotPaused {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(bikes[tokenId].canEvolve, "Bike cannot evolve");
        require(bikes[tokenId].level < 10, "Max level reached");
        
        // Transfer FIXIE tokens from user
        require(
            IERC20(fixieTokenContract).transferFrom(msg.sender, address(this), EVOLUTION_COST),
            "Failed to transfer FIXIE tokens"
        );
        
        Bike storage bike = bikes[tokenId];
        bike.level++;
        
        // Increase attributes based on level
        uint256 boost = bike.level * 5;
        bike.attributes.speed += boost;
        bike.attributes.endurance += boost;
        bike.attributes.agility += boost;
        bike.attributes.strength += boost;
        bike.attributes.balance += boost;
        bike.attributes.reflexes += boost;
        bike.attributes.resilience += boost;
        
        emit BikeEvolved(tokenId, bike.level, bike.attributes);
    }
    
    /**
     * @dev Fuse multiple bikes to create a new one
     */
    function fuseBikes(uint256[] calldata tokenIds, string memory newMetadataURI) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        require(tokenIds.length >= 2, "Need at least 2 bikes to fuse");
        require(tokenIds.length <= 5, "Cannot fuse more than 5 bikes");
        
        // Verify ownership and calculate new attributes
        BikeAttributes memory newAttributes;
        Rarity highestRarity = Rarity.Common;
        uint256 totalLevel = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_exists(tokenIds[i]), "Token does not exist");
            require(ownerOf(tokenIds[i]) == msg.sender, "Not the owner");
            
            Bike memory bike = bikes[tokenIds[i]];
            
            // Accumulate attributes
            newAttributes.speed += bike.attributes.speed;
            newAttributes.endurance += bike.attributes.endurance;
            newAttributes.agility += bike.attributes.agility;
            newAttributes.strength += bike.attributes.strength;
            newAttributes.balance += bike.attributes.balance;
            newAttributes.reflexes += bike.attributes.reflexes;
            newAttributes.resilience += bike.attributes.resilience;
            
            totalLevel += bike.level;
            
            if (bike.rarity > highestRarity) {
                highestRarity = bike.rarity;
            }
            
            // Burn the fused bike
            _burn(tokenIds[i]);
            delete bikes[tokenIds[i]];
        }
        
        // Average the attributes and add fusion bonus
        newAttributes.speed = (newAttributes.speed / tokenIds.length) + 10;
        newAttributes.endurance = (newAttributes.endurance / tokenIds.length) + 10;
        newAttributes.agility = (newAttributes.agility / tokenIds.length) + 10;
        newAttributes.strength = (newAttributes.strength / tokenIds.length) + 10;
        newAttributes.balance = (newAttributes.balance / tokenIds.length) + 10;
        newAttributes.reflexes = (newAttributes.reflexes / tokenIds.length) + 10;
        newAttributes.resilience = (newAttributes.resilience / tokenIds.length) + 10;
        
        // Potentially upgrade rarity
        if (tokenIds.length >= 3 && highestRarity < Rarity.Mythic) {
            highestRarity = Rarity(uint256(highestRarity) + 1);
        }
        
        // Create new bike
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        bikes[newTokenId] = Bike({
            rarity: highestRarity,
            attributes: newAttributes,
            level: totalLevel / tokenIds.length,
            experience: 0,
            createdAt: block.timestamp,
            canEvolve: true
        });
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, newMetadataURI);
        
        emit BikeFused(tokenIds, newTokenId);
        
        return newTokenId;
    }
    
    /**
     * @dev Generate initial attributes based on rarity
     */
    function _generateAttributes(Rarity rarity) internal pure returns (BikeAttributes memory) {
        uint256 baseValue;
        
        if (rarity == Rarity.Common) baseValue = 10;
        else if (rarity == Rarity.Rare) baseValue = 20;
        else if (rarity == Rarity.Epic) baseValue = 30;
        else if (rarity == Rarity.Legendary) baseValue = 40;
        else if (rarity == Rarity.Mythic) baseValue = 50;
        
        return BikeAttributes({
            speed: baseValue,
            endurance: baseValue,
            agility: baseValue,
            strength: baseValue,
            balance: baseValue,
            reflexes: baseValue,
            resilience: baseValue
        });
    }
    
    /**
     * @dev Add experience to a bike
     */
    function addExperience(uint256 tokenId, uint256 exp) external onlyMinter {
        require(_exists(tokenId), "Token does not exist");
        bikes[tokenId].experience += exp;
    }
    
    /**
     * @dev Add a new minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Set fusion contract address
     */
    function setFusionContract(address _fusionContract) external onlyOwner {
        fusionContract = _fusionContract;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get bike details
     */
    function getBike(uint256 tokenId) external view returns (Bike memory) {
        require(_exists(tokenId), "Token does not exist");
        return bikes[tokenId];
    }
    
    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}