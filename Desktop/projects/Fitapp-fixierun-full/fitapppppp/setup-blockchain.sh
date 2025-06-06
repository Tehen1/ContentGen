#!/bin/bash
set -e

# Check if Hardhat is available
if ! command -v npx &> /dev/null; then
  echo "npx could not be found. Please install Node.js first."
  exit 1
fi

# Initialize blockchain directory
if [ ! -f blockchain/package.json ]; then
  echo "Setting up blockchain environment..."
  
  mkdir -p blockchain
  cd blockchain
  
  # Initialize npm project
  npm init -y
  
  # Install Hardhat and related dependencies
  npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
  
  # Initialize Hardhat project
  npx hardhat init
  
  # Create contracts directory and add token contract
  mkdir -p contracts
  echo '// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FIXIEToken is ERC20, Ownable {
    // Maximum supply of tokens (100 million)
    uint256 private constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Minting controller address
    address private mintingController;
    
    // Events
    event MintingControllerUpdated(address indexed previousController, address indexed newController);
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor() ERC20("FIXIE Fitness Token", "FIXIE") Ownable(msg.sender) {
        // Mint initial supply to owner (10% of max supply)
        _mint(msg.sender, MAX_SUPPLY / 10);
    }
    
    /**
     * @dev Sets the minting controller address
     * @param _controller The address of the minting controller
     */
    function setMintingController(address _controller) external onlyOwner {
        require(_controller != address(0), "Invalid controller address");
        emit MintingControllerUpdated(mintingController, _controller);
        mintingController = _controller;
    }
    
    /**
     * @dev Mints new FIXIE tokens as rewards for fitness activities
     * @param _to The address to mint tokens to
     * @param _amount The amount of tokens to mint
     */
    function mintRewards(address _to, uint256 _amount) external {
        require(msg.sender == mintingController, "Only minting controller can mint rewards");
        require(_to != address(0), "Cannot mint to zero address");
        require(totalSupply() + _amount <= MAX_SUPPLY, "Exceeds maximum token supply");
        
        _mint(_to, _amount);
        emit TokensMinted(_to, _amount);
    }
    
    /**
     * @dev Returns the remaining mintable supply
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}' > contracts/FIXIEToken.sol

  # Create rewards controller contract
  echo '// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./FIXIEToken.sol";

contract RewardsController is AccessControl {
    // Role definitions
    bytes32 public constant REWARDS_ADMIN_ROLE = keccak256("REWARDS_ADMIN_ROLE");
    bytes32 public constant ACTIVITY_VERIFIER_ROLE = keccak256("ACTIVITY_VERIFIER_ROLE");
    
    // FIXIE token contract
    FIXIEToken public fixieToken;
    
    // Rewards configuration
    uint256 public baseRewardRate = 10 * 10**18; // 10 FIXIE tokens base rate
    uint256 public maxDailyReward = 100 * 10**18; // 100 FIXIE tokens max per day
    
    // User rewards tracking
    mapping(address => uint256) public userLastRewardTimestamp;
    mapping(address => uint256) public userDailyRewardTotal;
    
    // Events
    event RewardIssued(address indexed user, uint256 amount, string activityType);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event MaxDailyRewardUpdated(uint256 oldMax, uint256 newMax);
    
    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        
        fixieToken = FIXIEToken(_tokenAddress);
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REWARDS_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Issues rewards for verified fitness activities
     * @param _user Address of the user to reward
     * @param _activityPoints Points earned from the activity
     * @param _activityType Type of fitness activity performed
     */
    function issueRewards(
        address _user,
        uint256 _activityPoints,
        string calldata _activityType
    ) external onlyRole(ACTIVITY_VERIFIER_ROLE) {
        require(_user != address(0), "Invalid user address");
        require(_activityPoints > 0, "Activity points must be positive");
        
        // Reset daily tracking if it's a new day
        if (block.timestamp - userLastRewardTimestamp[_user] >= 1 days) {
            userDailyRewardTotal[_user] = 0;
        }
        
        // Calculate reward amount based on activity points
        uint256 rewardAmount = _activityPoints * baseRewardRate / 100;
        
        // Apply daily reward cap
        uint256 availableDailyReward = maxDailyReward - userDailyRewardTotal[_user];
        if (rewardAmount > availableDailyReward) {
            rewardAmount = availableDailyReward;
        }
        
        // Update user reward tracking
        userLastRewardTimestamp[_user] = block.timestamp;
        userDailyRewardTotal[_user] += rewardAmount;
        
        // Mint rewards
        fixieToken.mintRewards(_user, rewardAmount);
        
        emit RewardIssued(_user, rewardAmount, _activityType);
    }
    
    /**
     * @dev Updates the base reward rate
     * @param _newRate New base reward rate
     */
    function updateRewardRate(uint256 _newRate) external onlyRole(REWARDS_ADMIN_ROLE) {
        emit RewardRateUpdated(baseRewardRate, _newRate);
        baseRewardRate = _newRate;
    }
    
    /**
     * @dev Updates the maximum daily reward
     * @param _newMax New maximum daily reward
     */
    function updateMaxDailyReward(uint256 _newMax) external onlyRole(REWARDS_ADMIN_ROLE) {
        emit MaxDailyRewardUpdated(maxDailyReward, _newMax);
        maxDailyReward = _newMax;
    }
}' > contracts/RewardsController.sol

  # Create NFT badge contract
  echo '// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FIXIEBadges is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    
    // Role definitions
    bytes32 public constant BADGE_ISSUER_ROLE = keccak256("BADGE_ISSUER_ROLE");
    
    // Badge counter for token IDs
    Counters.Counter private _badgeIdCounter;
    
    // Badge type mapping
    mapping(uint256 => string) public badgeTypes;
    
    // User badge counts by type
    mapping(address => mapping(string => uint256)) public userBadgeCounts;
    
    // Events
    event BadgeIssued(address indexed user, uint256 tokenId, string badgeType);
    
    constructor() ERC721("FIXIE Fitness Badges", "BADGE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BADGE_ISSUER_ROLE, msg.sender);
    }
    
    /**
     * @dev Issues a new badge NFT to a user
     * @param _to Address to issue the badge to
     * @param _badgeType Type of badge (e.g., "marathon", "10k-steps", etc.)
     * @param _tokenURI IPFS URI for the badge metadata
     */
    function issueBadge(
        address _to, 
        string calldata _badgeType,
        string calldata _tokenURI
    ) external onlyRole(BADGE_ISSUER_ROLE) {
        require(_to != address(0), "Cannot issue to zero address");
        
        // Get next token ID
        uint256 tokenId = _badgeIdCounter.current();
        _badgeIdCounter.increment();
        
        // Mint the badge NFT
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Record badge type
        badgeTypes[tokenId] = _badgeType;
        
        // Update user badge count for this type
        userBadgeCounts[_to][_badgeType]++;
        
        emit BadgeIssued(_to, tokenId, _badgeType);
    }
    
    /**
     * @dev Returns the number of badges of a specific type owned by a user
     * @param _user User address
     * @param _badgeType Type of badge
     */
    function getUserBadgeCount(
        address _user, 
        string calldata _badgeType
    ) external view returns (uint256) {
        return userBadgeCounts[_user][_badgeType];
    }
    
    /**
     * @dev Override of supportsInterface to support AccessControl
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}' > contracts/FIXIEBadges.sol

  # Create deployment script
  mkdir -p scripts
  echo 'const hre = require("hardhat");

async function main() {
  console.log("Deploying FIXIE contracts...");

  // Deploy FIXIE Token
  const FIXIEToken = await hre.ethers.getContractFactory("FIXIEToken");
  const fixieToken = await FIXIEToken.deploy();
  await fixieToken.waitForDeployment();
  
  const tokenAddress = await fixieToken.getAddress();
  console.log(`FIXIEToken deployed to: ${tokenAddress}`);

  // Deploy Rewards Controller
  const RewardsController = await hre.ethers.getContractFactory("RewardsController");
  const rewardsController = await RewardsController.deploy(tokenAddress);
  await rewardsController.waitForDeployment();
  
  const controllerAddress = await rewardsController.getAddress();
  console.log(`RewardsController deployed to: ${controllerAddress}`);
  
  // Set minting controller on token
  const tx = await fixieToken.setMintingController(controllerAddress);
  await tx.wait();
  console.log("MintingController set on FIXIEToken");
  
  // Deploy Badges
  const FIXIEBadges = await hre.ethers.getContractFactory("FIXIEBadges");
  const fixieBadges = await FIXIEBadges.deploy();
  await fixieBadges.waitForDeployment();
  
  const badgesAddress = await fixieBadges.getAddress();
  console.log(`FIXIEBadges deployed to: ${badgesAddress}`);

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });' > scripts/deploy.js

  # Create hardhat config file
  echo 'require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import("hardhat/config").HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 1337
    },
    // Add testnet configurations as needed
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  }
};' > hardhat.config.js

  # Create .env file template
  echo '# Network private keys - DO NOT COMMIT with real keys
PRIVATE_KEY=

# RPC URLs
ETHEREUM_RPC_URL=
POLYGON_RPC_URL=

# API Keys
ETHERSCAN_API_KEY=
POLYGONSCAN_API_KEY=' > .env.example

  cd ..
fi

echo "Blockchain environment setup completed!"