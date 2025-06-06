// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFixieToken.sol";
import "./interfaces/IBikeNFT.sol";

contract ActivityVerifier is Ownable {
    IFixieToken public fixieToken;
    IBikeNFT public bikeNFT;
    
    // Mapping to store verified activity hashes
    mapping(bytes32 => bool) public verifiedActivities;
    
    // Reward rates per kilometer
    uint256 public baseRewardRate = 10 * 10**18; // 10 tokens per km
    
    // Minimum and maximum rewards
    uint256 public minReward = 5 * 10**18; // 5 tokens
    uint256 public maxReward = 100 * 10**18; // 100 tokens
    
    // Events
    event ActivityVerified(address indexed user, bytes32 activityHash, uint256 distance, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(address _fixieToken, address _bikeNFT) {
        fixieToken = IFixieToken(_fixieToken);
        bikeNFT = IBikeNFT(_bikeNFT);
    }
    
    /**
     * @dev Verify activity and distribute rewards
     * @param user Address of the user who performed the activity
     * @param activityHash Hash of the activity data
     * @param distance Distance in kilometers (with 2 decimal precision, e.g. 10.25 km = 1025)
     * @param proof Zero-knowledge proof of the activity
     * @param bikeId ID of the bike NFT used for the activity (0 if none)
     */
    function verifyActivity(
        address user,
        bytes32 activityHash,
        uint256 distance,
        bytes calldata proof,
        uint256 bikeId
    ) external returns (bool) {
        // Check if activity has already been verified
        require(!verifiedActivities[activityHash], "Activity already verified");
        
        // Verify the zero-knowledge proof
        bool isValid = verifyProof(user, activityHash, distance, proof);
        require(isValid, "Invalid activity proof");
        
        // Mark activity as verified
        verifiedActivities[activityHash] = true;
        
        // Calculate reward based on distance
        uint256 reward = calculateReward(user, distance, bikeId);
        
        // Distribute reward
        fixieToken.mint(user, reward);
        
        // Update bike NFT experience if applicable
        if (bikeId > 0 && bikeNFT.ownerOf(bikeId) == user) {
            bikeNFT.addExperience(bikeId, distance);
        }
        
        emit ActivityVerified(user, activityHash, distance, reward);
        return true;
    }
    
    /**
     * @dev Calculate reward based on distance and bike NFT
     */
    function calculateReward(
        address user,
        uint256 distance,
        uint256 bikeId
    ) public view returns (uint256) {
        // Base reward calculation
        uint256 reward = (distance * baseRewardRate) / 100; // Distance has 2 decimal places
        
        // Apply bike NFT multiplier if applicable
        if (bikeId > 0 && bikeNFT.ownerOf(bikeId) == user) {
            uint256 multiplier = bikeNFT.getRewardMultiplier(bikeId);
            reward = (reward * multiplier) / 100;
        }
        
        // Apply min/max constraints
        if (reward < minReward) {
            reward = minReward;
        } else if (reward > maxReward) {
            reward = maxReward;
        }
        
        return reward;
    }
    
    /**
     * @dev Verify zero-knowledge proof
     * Note: This is a placeholder for the actual ZK proof verification logic
     */
    function verifyProof(
        address user,
        bytes32 activityHash,
        uint256 distance,
        bytes calldata proof
    ) internal pure returns (bool) {
        // Placeholder for actual ZK proof verification
        // In a real implementation, this would verify the proof using a ZK circuit
        return true;
    }
    
    /**
     * @dev Update the base reward rate
     * @param newRate New reward rate per kilometer (in tokens * 10^18)
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        baseRewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    /**
     * @dev Update min and max reward limits
     */
    function updateRewardLimits(uint256 _minReward, uint256 _maxReward) external onlyOwner {
        require(_minReward < _maxReward, "Min must be less than max");
        minReward = _minReward;
        maxReward = _maxReward;
    }
}
