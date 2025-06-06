// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HealthCoin.sol";
import "./AchievementTracker.sol";

/**
 * @title ProfileManager
 * @dev Contract for managing user profiles and linking wallets to Google IDs
 */
contract ProfileManager is Ownable {
    // Reference to the HealthCoin token contract
    HealthCoin public healthCoin;
    
    // Reference to the AchievementTracker NFT contract
    AchievementTracker public achievementTracker;
    
    // User profile structure
    struct UserProfile {
        string googleId;           // Google ID used for authentication
        uint256 lastSyncTimestamp; // Last time fitness data was synced
        bool isActive;             // Whether the profile is active
        uint256 totalSteps;        // Total steps recorded
        uint256 totalCaloriesBurned; // Total calories burned
        uint256 rewardPoints;      // Reward points that can be converted to tokens
        mapping(string => bool) achievementsEarned; // Tracking achievements already earned
    }
    
    // Mapping from user address to profile
    mapping(address => UserProfile) private _profiles;
    
    // Mapping from Google ID to wallet address
    mapping(string => address) private _googleIdToAddress;
    
    // List of authorized data providers that can submit fitness data
    mapping(address => bool) public authorizedDataProviders;
    
    // Achievement definitions and reward amounts
    struct AchievementDefinition {
        string achievementType;    // Type of achievement
        uint256 threshold;         // Threshold to earn the achievement
        uint256 tokenReward;       // Amount of tokens to reward
        string metadataURI;        // URI for achievement metadata
        bool isActive;             // Whether this achievement is active
    }
    
    // Mapping of achievement IDs to their definitions
    mapping(string => AchievementDefinition) public achievements;
    
    // Events
    event ProfileCreated(address indexed userAddress, string googleId);
    event ProfileUpdated(address indexed userAddress, string googleId);
    event FitnessDataSynced(address indexed userAddress, uint256 steps, uint256 caloriesBurned);
    event AchievementEarned(address indexed userAddress, string achievementId, uint256 tokenReward);
    event TokensClaimed(address indexed userAddress, uint256 amount);
    event DataProviderAuthorized(address indexed provider, bool status);
    event AchievementDefined(string achievementId, string achievementType, uint256 threshold, uint256 tokenReward);
    
    /**
     * @dev Constructor sets the HealthCoin and AchievementTracker contract addresses
     * @param _healthCoin Address of the HealthCoin contract
     * @param _achievementTracker Address of the AchievementTracker contract
     * @param initialOwner Address of the initial owner
     */
    constructor(
        address _healthCoin,
        address _achievementTracker,
        address initialOwner
    ) Ownable(initialOwner) {
        healthCoin = HealthCoin(_healthCoin);
        achievementTracker = AchievementTracker(_achievementTracker);
    }
    
    /**
     * @dev Set a data provider's authorization status
     * @param provider Address of the data provider
     * @param status Authorization status to set
     */
    function setDataProviderAuthorization(address provider, bool status) external onlyOwner {
        authorizedDataProviders[provider] = status;
        emit DataProviderAuthorized(provider, status);
    }
    
    /**
     * @dev Define or update an achievement
     * @param achievementId Unique identifier for the achievement
     * @param achievementType Type of achievement (steps, calories, etc.)
     * @param threshold Value that must be reached to earn the achievement
     * @param tokenReward Amount of tokens rewarded for earning the achievement
     * @param metadataURI URI for the achievement metadata
     * @param isActive Whether the achievement is active
     */
    function defineAchievement(
        string calldata achievementId,
        string calldata achievementType,
        uint256 threshold,
        uint256 tokenReward,
        string calldata metadataURI,
        bool isActive
    ) external onlyOwner {
        achievements[achievementId] = AchievementDefinition({
            achievementType: achievementType,
            threshold: threshold,
            tokenReward: tokenReward,
            metadataURI: metadataURI,
            isActive: isActive
        });
        
        emit AchievementDefined(achievementId, achievementType, threshold, tokenReward);
    }
    
    /**
     * @dev Create a new user profile
     * @param googleId Google ID to link to the wallet
     */
    function createProfile(string calldata googleId) external {
        require(bytes(_profiles[msg.sender].googleId).length == 0, "Profile already exists");
        require(_googleIdToAddress[googleId] == address(0), "Google ID already linked");
        
        _profiles[msg.sender].googleId = googleId;
        _profiles[msg.sender].isActive = true;
        _profiles[msg.sender].lastSyncTimestamp = block.timestamp;
        
        _googleIdToAddress[googleId] = msg.sender;
        
        emit ProfileCreated(msg.sender, googleId);
    }
    
    /**
     * @dev Update user profile (only the user can update their own profile)
     * @param googleId New Google ID to link
     */
    function updateProfile(string calldata googleId) external {
        require(bytes(_profiles[msg.sender].googleId).length > 0, "Profile does not exist");
        
        // Remove old Google ID mapping
        string memory oldGoogleId = _profiles[msg.sender].googleId;
        _googleIdToAddress[oldGoogleId] = address(0);
        
        // Update with new Google ID
        _profiles[msg.sender].googleId = googleId;
        _googleIdToAddress[googleId] = msg.sender;
        
        emit ProfileUpdated(msg.sender, googleId);
    }
    
    /**
     * @dev Sync fitness data for a user
     * @param userAddress Address of the user
     * @param googleId Google ID of the user
     * @param steps Step count to add
     * @param caloriesBurned Calories burned to add
     * @param timestamp Timestamp of the data
     */
    function syncFitnessData(
        address userAddress,
        string calldata googleId,
        uint256 steps,
        uint256 caloriesBurned,
        uint256 timestamp
    ) external {
        require(authorizedDataProviders[msg.sender], "Not authorized data provider");
        require(_googleIdToAddress[googleId] == userAddress, "Google ID doesn't match address");
        require(_profiles[userAddress].isActive, "Profile not active");
        require(timestamp > _profiles[userAddress].lastSyncTimestamp, "Outdated data");
        
        // Update user's fitness data
        _profiles[userAddress].totalSteps += steps;
        _profiles[userAddress].totalCaloriesBurned += caloriesBurned;
        _profiles[userAddress].lastSyncTimestamp = timestamp;
        
        // Check for achievements based on step count
        _checkStepAchievements(userAddress);
        
        // Check for achievements based on calories burned
        _checkCalorieAchievements(userAddress);
        
        emit FitnessDataSynced(userAddress, steps, caloriesBurned);
    }
    
    /**
     * @dev Check if user earned any step-based achievements
     * @param userAddress Address of the user
     */
    function _checkStepAchievements(address userAddress) internal {
        uint256 totalSteps = _profiles[userAddress].totalSteps;
        
        // Iterate through all achievements to check step-based ones
        for (uint i = 0; i < bytes("step_achievements").length; i++) {
            string memory achievementId = string(abi.encodePacked("step_", i));
            AchievementDefinition storage achievement = achievements[achievementId];
            
            if (achievement.isActive && 
                keccak256(bytes(achievement.achievementType)) == keccak256(bytes("steps")) &&
                totalSteps >= achievement.threshold &&
                !_profiles[userAddress].achievementsEarned[achievementId]) {
                
                // Mark achievement as earned
                _profiles[userAddress].achievementsEarned[achievementId] = true;
                
                // Award tokens
                _profiles[userAddress].rewardPoints += achievement.tokenReward;
                
                // Issue NFT achievement
                achievementTracker.issueAchievement(
                    userAddress,
                    "steps",
                    achievement.metadataURI
                );
                
                emit AchievementEarned(userAddress, achievementId, achievement.tokenReward);
            }
        }
    }
    
    /**
     * @dev Check if user earned any calorie-based achievements
     * @param userAddress Address of the user
     */
    function _checkCalorieAchievements(address userAddress) internal {
        uint256 totalCalories = _profiles[userAddress].totalCaloriesBurned;
        
        // Iterate through all achievements to check calorie-based ones
        for (uint i = 0; i < bytes("calorie_achievements").length; i++) {
            string memory achievementId = string(abi.encodePacked("calorie_", i));
            AchievementDefinition storage achievement = achievements[achievementId];
            
            if (achievement.isActive && 
                keccak256(bytes(achievement.achievementType)) == keccak256(bytes("calories")) &&
                totalCalories >= achievement.threshold &&
                !_profiles[userAddress].achievementsEarned[achievementId]) {
                
                // Mark achievement as earned
                _profiles[userAddress].achievementsEarned[achievementId] = true;
                
                // Award tokens
                _profiles[userAddress].rewardPoints += achievement.tokenReward;
                
                // Issue NFT achievement
                achievementTracker.issueAchievement(
                    userAddress,
                    "calories",
                    achievement.metadataURI
                );
                
                emit AchievementEarned(userAddress, achievementId, achievement.tokenReward);
            }
        }
    }
    
    /**
     * @dev Claim HealthCoin tokens for earned reward points
     */
    function claimTokens() external {
        require(_profiles[msg.sender].isActive, "Profile not active");
        uint256 rewardPoints = _profiles[msg.sender].rewardPoints;
        require(rewardPoints > 0, "No rewards to claim");
        
        // Reset reward points
        _profiles[msg.sender].rewardPoints = 0;
        
        // Mint tokens to the user
        healthCoin.mintReward(msg.sender, rewardPoints, "Fitness Rewards");
        
        emit TokensClaimed(msg.sender, rewardPoints);
    }
    
    /**
     * @dev Get user profile data
     * @param userAddress Address of the user
     * @return googleId User's Google ID
     * @return lastSyncTimestamp Last sync timestamp
     * @return isActive Whether profile is active
     * @return totalSteps Total recorded steps
     * @return totalCaloriesBurned Total calories burned
     * @return rewardPoints Available reward points
     */
    function getProfile(address userAddress) external view returns (
        string memory googleId,
        uint256 lastSyncTimestamp,
        bool isActive,
        uint256 totalSteps,
        uint256 totalCaloriesBurned,
        uint256 rewardPoints
    ) {
        UserProfile storage profile = _profiles[userAddress];
        return (
            profile.googleId,
            profile.lastSyncTimestamp,
            profile.isActive,
            profile.totalSteps,
            profile.totalCaloriesBurned,
            profile.rewardPoints
        );
    }
    
    /**
     * @dev Check if a user has earned a specific achievement
     * @param userAddress Address of the user
     * @param achievementId ID of the achievement to check
     * @return Whether the achievement has been earned
     */
    function hasEarnedAchievement(address userAddress, string calldata achievementId) external view returns (bool) {
        return _profiles[userAddress].achievementsEarned[achievementId];
    }
    
    /**
     * @dev Get the wallet address linked to a Google ID
     * @param googleId Google ID to query
     * @return Linked wallet address
     */
    function getAddressByGoogleId(string calldata googleId) external view returns (address) {
        return _googleIdToAddress[googleId];
    }
}

