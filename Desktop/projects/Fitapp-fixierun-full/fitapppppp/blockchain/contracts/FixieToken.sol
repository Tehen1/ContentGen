// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title FIXIE Token
 * @dev ERC20 Token for the FIXIE fitness application
 * Users earn tokens through physical activities tracked in the app
 */
contract FixieToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Max supply of FIXIE tokens (100 million)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Activities tracking
    mapping(address => uint256) public userActivityCount;
    mapping(address => uint256) public userTotalDistance; // in meters
    mapping(address => uint256) public lastActivityTimestamp;
    
    // Events
    event ActivityCompleted(
        address indexed user,
        uint256 distance,
        uint256 duration,
        string activityType,
        uint256 tokensEarned
    );
    
    event StreakUpdated(address indexed user, uint256 streak, uint256 bonusTokens);
    
    /**
     * @dev Constructor for the FIXIE token
     */
    constructor() ERC20("FIXIE Fitness Token", "FIXIE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Pauses token transfers
     * Only accounts with PAUSER_ROLE can call this function
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses token transfers
     * Only accounts with PAUSER_ROLE can call this function
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Records a completed activity and mints tokens as reward
     * Only accounts with MINTER_ROLE can call this function
     * @param user Address of the user who completed the activity
     * @param distance Distance covered in meters
     * @param duration Duration in seconds
     * @param activityType Type of activity (running, cycling, walking)
     */
    function recordActivity(
        address user,
        uint256 distance,
        uint256 duration,
        string memory activityType
    ) public onlyRole(MINTER_ROLE) {
        require(user != address(0), "Invalid user address");
        require(distance > 0, "Distance must be greater than zero");
        
        // Calculate tokens to reward
        uint256 tokensToMint = calculateTokenReward(distance, duration, activityType);
        
        // Check if total supply would exceed max supply
        require(totalSupply() + tokensToMint <= MAX_SUPPLY, "Would exceed max supply");
        
        // Update user stats
        userActivityCount[user] += 1;
        userTotalDistance[user] += distance;
        
        // Check for streak bonus
        uint256 streakBonus = 0;
        if (isStreak(user)) {
            uint256 currentStreak = calculateCurrentStreak(user);
            streakBonus = calculateStreakBonus(currentStreak, tokensToMint);
            tokensToMint += streakBonus;
            
            emit StreakUpdated(user, currentStreak, streakBonus);
        }
        
        // Update last activity timestamp
        lastActivityTimestamp[user] = block.timestamp;
        
        // Mint tokens to the user
        _mint(user, tokensToMint);
        
        emit ActivityCompleted(user, distance, duration, activityType, tokensToMint);
    }
    
    /**
     * @dev Calculate token reward based on activity parameters
     * @param distance Distance in meters
     * @param duration Duration in seconds
     * @param activityType Type of activity
     * @return uint256 Number of tokens to mint (with 18 decimals)
     */
    function calculateTokenReward(
        uint256 distance,
        uint256 duration,
        string memory activityType
    ) public pure returns (uint256) {
        // Base calculation: 1 token per km
        uint256 distanceInKm = distance / 1000;
        uint256 tokens = distanceInKm * 10**18; // Convert to tokens with 18 decimals
        
        // Bonus for longer activities
        if (duration > 1800) { // More than 30 minutes
            tokens = (tokens * 120) / 100; // 20% bonus
        }
        
        // Apply multiplier based on activity type
        bytes32 activityHash = keccak256(abi.encodePacked(activityType));
        
        if (activityHash == keccak256(abi.encodePacked("running"))) {
            tokens = (tokens * 150) / 100; // 50% bonus for running
        } else if (activityHash == keccak256(abi.encodePacked("cycling"))) {
            tokens = (tokens * 120) / 100; // 20% bonus for cycling
        }
        // Walking gets no additional bonus
        
        return tokens;
    }
    
    /**
     * @dev Check if user has an active streak
     * @param user User address
     * @return bool True if the user has an active streak
     */
    function isStreak(address user) public view returns (bool) {
        if (lastActivityTimestamp[user] == 0) {
            return false;
        }
        
        // Check if last activity was within the last 24-48 hours
        uint256 daysSinceLastActivity = (block.timestamp - lastActivityTimestamp[user]) / 86400;
        return daysSinceLastActivity <= 1;
    }
    
    /**
     * @dev Calculate user's current streak
     * This is a simplified implementation that would be more complex in production
     * @param user User address
     * @return uint256 Current streak count
     */
    function calculateCurrentStreak(address user) public view returns (uint256) {
        // In a real implementation, this would track consecutive days with activities
        // For this example, we'll return a placeholder based on activity count
        return userActivityCount[user] % 30; // Cap at 30 for example purposes
    }
    
    /**
     * @dev Calculate bonus tokens for streak
     * @param streak Current streak
     * @param baseTokens Base token amount
     * @return uint256 Bonus tokens
     */
    function calculateStreakBonus(uint256 streak, uint256 baseTokens) public pure returns (uint256) {
        // Bonus increases with streak length
        // 5% bonus for each week of streak, up to 25%
        uint256 weekMultiplier = streak / 7;
        if (weekMultiplier > 5) {
            weekMultiplier = 5;
        }
        
        return (baseTokens * weekMultiplier * 5) / 100;
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
