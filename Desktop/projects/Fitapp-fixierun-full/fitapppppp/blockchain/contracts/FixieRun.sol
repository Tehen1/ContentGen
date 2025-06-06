// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FixieNFT.sol";
import "./FixieToken.sol";

/**
 * @title FixieRun Main Contract
 * @dev Manages activity tracking, bike NFTs, and rewards for the FixieRun application
 * @notice This contract coordinates between FixieNFT and FixieToken to provide a complete fitness dApp
 * @custom:security-contact security@fixierun.com
 */
contract FixieRun is Pausable, AccessControl, ReentrancyGuard, Initializable {
    using Counters for Counters.Counter;

    // Version control for upgrades
    string public constant VERSION = "1.0.0";
    
    // References to other contracts
    FixieNFT public nftContract;
    FixieToken public tokenContract;
    
    // Role definitions
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Structure for storing activity data
    struct Activity {
        uint256 timestamp;
        uint256 distance;  // in meters
        uint256 duration;  // in seconds
        uint256 calories;  // in calories
        bool validated;    // validated by oracle
        string activityType; // "cycling", "running", etc.
        uint256 tokenReward; // tokens earned from this activity
    }
    
    // Structure for bikes (linked to NFTs)
    struct Bike {
        uint256 nftId;       // ID of the NFT in FixieNFT contract
        string model;        // Bike model name
        uint256 efficiency;  // Efficiency factor for rewards (base 100)
        bool active;         // Whether the bike is currently active
        uint256 totalDistance; // Total distance covered with this bike
    }
    
    // Activity tracking
    mapping(address => Activity[]) public userActivities;
    mapping(address => uint256) public pendingActivities; // Count of unvalidated activities
    mapping(bytes32 => bool) public processedActivityHashes; // To prevent duplicate submissions
    
    // Bike management
    mapping(address => Bike[]) public userBikes;
    mapping(address => uint256) public activeBikeIndex; // Index of the active bike for each user
    mapping(uint256 => address) public nftToBikeOwner; // Mapping from NFT ID to bike owner
    
    // Reward parameters (can be adjusted by admins)
    uint256 public baseRewardRate = 10;  // Base tokens per km
    uint256 public streakMultiplier = 110; // 10% bonus for maintaining streak (base 100)
    uint256 public calorieMultiplier = 2; // Tokens per 100 calories
    
    // System parameters
    uint256 public validationTimeLimit = 3 days; // Time limit for validating activities
    uint256 public minActivityDistance = 100; // Minimum 100 meters for activity to be valid
    uint256 public minActivityDuration = 60; // Minimum 60 seconds for activity to be valid
    uint256 public maxClaims = 10; // Maximum activities that can be claimed at once
    
    // Counters
    Counters.Counter private _activityIdCounter;
    
    // Events
    event ActivityRecorded(
        address indexed user, 
        uint256 indexed activityIndex, 
        uint256 distance, 
        uint256 duration,
        string activityType
    );
    event ActivityValidated(address indexed user, uint256 indexed activityIndex, uint256 tokenReward);
    event BikeRegistered(address indexed user, uint256 indexed nftId, string model);
    event BikeStatusToggled(address indexed user, uint256 indexed bikeIndex, bool active);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 activitiesClaimed);
    event ParameterUpdated(string name, uint256 value);
    
    /**
     * @dev Initializes the contract with references to dependent contracts
     * @param _nftContract Address of the FixieNFT contract
     * @param _tokenContract Address of the FixieToken contract
     * @param _admin Address that will receive admin privileges
     * @param _oracle Address that will receive oracle privileges
     */
    function initialize(
        address _nftContract,
        address _tokenContract,
        address _admin,
        address _oracle
    ) public initializer {
        require(_nftContract != address(0), "Invalid NFT contract address");
        require(_tokenContract != address(0), "Invalid token contract address");
        require(_admin != address(0), "Invalid admin address");
        require(_oracle != address(0), "Invalid oracle address");
        
        nftContract = FixieNFT(_nftContract);
        tokenContract = FixieToken(_tokenContract);
        
        // Setup role hierarchy
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(ADMIN_ROLE, _admin);
        _setupRole(PAUSER_ROLE, _admin);
        _setupRole(ORACLE_ROLE, _oracle);
        
        // Ensure this contract has MINTER_ROLE on the token contract
        // Note: This requires the admin to also be admin on tokenContract
        // tokenContract.grantRole(tokenContract.MINTER_ROLE(), address(this));
    }
    
    /**
     * @dev Pauses contract functionality
     * @notice Only addresses with PAUSER_ROLE can call this function
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses contract functionality
     * @notice Only addresses with PAUSER_ROLE can call this function
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Records a new activity for the user
     * @param _distance Distance covered in meters
     * @param _duration Duration in seconds
     * @param _calories Calories burned
     * @notice User must have at least one registered and active bike
     * @notice The same activity cannot be submitted twice (checked via hash)
     */
    function recordRide(
        uint256 _distance,
        uint256 _duration,
        uint256 _calories
    ) public whenNotPaused nonReentrant {
        // Validate input parameters
        require(_distance >= minActivityDistance, "Distance too short");
        require(_duration >= minActivityDuration, "Duration too short");
        require(_calories > 0, "Calories must be positive");
        require(userBikes[msg.sender].length > 0, "No bikes registered");
        
        // Check if user has an active bike
        bool hasActiveBike = false;
        for (uint256 i = 0; i < userBikes[msg.sender].length; i++) {
            if (userBikes[msg.sender][i].active) {
                hasActiveBike = true;
                activeBikeIndex[msg.sender] = i;
                break;
            }
        }
        require(hasActiveBike, "No active bike");
        
        // Prevent duplicate submissions by hashing activity data
        bytes32 activityHash = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            _distance,
            _duration,
            _calories
        ));
        require(!processedActivityHashes[activityHash], "Duplicate activity");
        processedActivityHashes[activityHash] = true;
        
        // Create and store the activity
        Activity memory newActivity = Activity({
            timestamp: block.timestamp,
            distance: _distance,
            duration: _duration,
            calories: _calories,
            validated: false,
            activityType: "cycling", // Default to cycling for FixieRun
            tokenReward: 0
        });
        
        userActivities[msg.sender].push(newActivity);
        pendingActivities[msg.sender]++;
        
        // Update bike statistics
        uint256 bikeIndex = activeBikeIndex[msg.sender];
        userBikes[msg.sender][bikeIndex].totalDistance += _distance;
        
        emit ActivityRecorded(
            msg.sender,
            userActivities[msg.sender].length - 1,
            _distance,
            _duration,
            "cycling"
        );
    }
    
    /**
     * @dev Validates an activity (called by an oracle)
     * @param _user Address of the user who recorded the activity
     * @param _activityIndex Index of the activity in the user's activity array
     * @notice Only addresses with ORACLE_ROLE can call this function
     * @notice Activities must be validated within the validation time limit
     */
    function validateActivity(
        address _user,
        uint256 _activityIndex
    ) public onlyRole(ORACLE_ROLE) whenNotPaused {
        require(_user != address(0), "Invalid user address");
        require(_activityIndex < userActivities[_user].length, "Activity index out of bounds");
        
        Activity storage activity = userActivities[_user][_activityIndex];
        require(!activity.validated, "Activity already validated");
        
        // Check if the activity is within the validation time limit
        require(
            block.timestamp <= activity.timestamp + validationTimeLimit,
            "Validation time expired"
        );
        
        // Validate the activity
        activity.validated = true;
        
        // Calculate token reward
        uint256 tokenReward = calculateReward(_user, _activityIndex);
        activity.tokenReward = tokenReward;
        
        // Update pending activities count
        pendingActivities[_user]--;
        
        emit ActivityValidated(_user, _activityIndex, tokenReward);
    }
    
    /**
     * @dev Registers a new bike for the user
     * @param _model Bike model name
     * @param _efficiency Efficiency factor for rewards (base 100)
     * @return uint256 ID of the newly created bike NFT
     * @notice This function mints a new NFT to represent the bike
     */
    function registerBike(
        string memory _model,
        uint256 _efficiency
    ) public whenNotPaused nonReentrant returns (uint256) {
        require(bytes(_model).length > 0, "Model name cannot be empty");
        require(_efficiency > 0 && _efficiency <= 200, "Efficiency out of range"); // Max 2x efficiency
        
        // Mint a new bike NFT
        string memory nftType = "bike";
        uint8 rarityLevel = uint8((_efficiency * 5) / 200); // Convert efficiency to rarity (1-5)
        if (rarityLevel == 0) rarityLevel = 1;
        
        uint8 rewardBoost = uint8(_efficiency > 100 ? (_efficiency - 100) : 0); // Only bonus over 100%
        
        // Create metadata URI (in production this would point to actual metadata)
        string memory tokenURI = string(abi.encodePacked(
            "https://api.fixierun.com/metadata/bike/",
            _model
        ));
        
        // Mint NFT (this requires FixieRun to have MINTER_ROLE in FixieNFT)
        uint256 nftId = nftContract.safeMint(
            msg.sender,
            tokenURI,
            nftType,
            rarityLevel,
            rewardBoost,
            _model,
            1, // Initial level
            true // Upgradable
        );
        
        // Register bike in this contract
        Bike memory newBike = Bike({
            nftId: nftId,
            model: _model,
            efficiency: _efficiency,
            active: true, // New bikes are active by default
            totalDistance: 0
        });
        
        userBikes[msg.sender].push(newBike);
        nftToBikeOwner[nftId] = msg.sender;
        
        // If this is the first bike, set it as active
        if (userBikes[msg.sender].length == 1) {
            activeBikeIndex[msg.sender] = 0;
        }
        
        emit BikeRegistered(msg.sender, nftId, _model);
        
        return nftId;
    }
    
    /**
     * @dev Toggles the active status of a bike
     * @param _bikeIndex Index of the bike in the user's bike array
     * @notice Only one bike can be active at a time
     */
    function toggleBikeStatus(uint256 _bikeIndex) public whenNotPaused {
        require(_bikeIndex < userBikes[msg.sender].length, "Bike index out of bounds");
        
        Bike storage bike = userBikes[msg.sender][_bikeIndex];
        
        if (!bike.active) {
            // Deactivate currently active bike (if any)
            for (uint256 i = 0; i < userBikes[msg.sender].length; i++) {
                if (userBikes[msg.sender][i].active) {
                    userBikes[msg.sender][i].active = false;
                }
            }
            
            // Activate the selected bike
            bike.active = true;
            activeBikeIndex[msg.sender] = _bikeIndex;
        } else {
            // Deactivate the bike
            bike.active = false;
        }
        
        emit BikeStatusToggled(msg.sender, _bikeIndex, bike.active);
    }
    
    /**
     * @dev Claims rewards for validated activities
     * @notice This function processes validated but unrewarded activities
     * @notice Rewards are distributed through the FixieToken contract
     */
    function claimRewards() public whenNotPaused nonReentrant {
        address user = msg.sender;
        uint256 claimCount = 0;
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < userActivities[user].length && claimCount < maxClaims; i++) {
            Activity storage activity = userActivities[user][i];
            
            // Check if the activity is validated but rewards not yet claimed
            if (activity.validated && activity.tokenReward > 0) {
                totalReward += activity.tokenReward;
                activity.tokenReward = 0; // Mark as claimed
                claimCount++;
            }
        }
        
        require(claimCount > 0, "No rewards to claim");
        require(totalReward > 0, "Zero reward amount");
        
        // Transfer tokens via the token contract
        // This requires this contract to have MINTER_ROLE on the token contract
        tokenContract.recordActivity(
            user,
            0, // We're not recording a new activity, just distributing rewards
            0,
            "reward_claim"
        );
        
        emit RewardsClaimed(user, totalReward, claimCount);
    }
    
    /**
     * @dev Calculates the reward for an activity
     * @param _user Address of the user
     * @param _activityIndex Index of the activity
     * @return uint256 Amount of tokens to reward
     * @notice Reward calculation considers distance, calories, bike efficiency, and streaks
     */
    function calculateReward(
        address _user,
        uint256 _activityIndex
    ) public view returns (uint256) {
        Activity storage activity = userActivities[_user][_activityIndex];
        
        // Base reward calculation: distance in km * base rate
        uint256 distanceInKm = activity.distance / 1000;
        uint256 reward = distanceInKm * baseRewardRate * 10**18; // Convert to tokens with 18 decimals
        
        // Apply bike efficiency factor
        if (userBikes[_user].length > 0) {
            uint256 bikeIndex = activeBikeIndex[_user];
            uint256 efficiency = userBikes[_user][bikeIndex].efficiency;
            reward = (reward * efficiency) / 100; // Apply bike efficiency
        }
        
        // Additional reward based on calories burned
        uint256 calorieReward = (activity.calories * calorieMultiplier * 10**18) / 100;
        reward += calorieReward;
        
        // Check for streak bonus
        if (hasActiveStreak(_user)) {
            reward = (reward * streakMultiplier) / 100; // Apply streak bonus
        }
        
        // Apply NFT boosts if user has any
        uint256 nftBoost = getNFTBoost(_user);
        if (nftBoost > 0) {
            reward = (reward * (100 + nftBoost)) / 100;
        }
        
        return reward;
    }
    
    /**
     * @dev Checks if user has an active streak
     * @param _user User address to check
     * @return bool True if user has an active streak
     */
    function hasActiveStreak(address _user) public view returns (bool) {
        if (userActivities[_user].length == 0) {
            return false;
        }
        
        // Find the timestamp of the last validated activity
        uint256 lastValidatedTimestamp = 0;
        for (uint256 i = userActivities[_user].length; i > 0; i--) {
            if (userActivities[_user][i-1].validated) {
                lastValidatedTimestamp = userActivities[_user][i-1].timestamp;
                break;
            }
        }
        
        if (lastValidatedTimestamp == 0) {
            return false;
        }
        
        // Check if the last activity was within 24 hours (for daily streak)
        return (block.timestamp - lastValidatedTimestamp) <= 1 days;
    }
    
    /**
     * @dev Gets the total NFT boost for a user
     * @param _user User address
     * @return uint256 Total boost percentage
     */
    function getNFTBoost(address _user) public view returns (uint256) {
        return nftContract.getTotalRewardBoost(_user);
    }
    
    /**
     * @dev Gets the details of a specific bike
     * @param _user User address
     * @param _bikeIndex Index of the bike
     * @return Bike struct containing bike details
     */
    function getBikeDetails(
        address _user,
        uint256 _bikeIndex
    ) public view returns (Bike memory) {
        require(_bikeIndex < userBikes[_user].length, "Bike index out of bounds");
        return userBikes[_user][_bikeIndex];
    }
    
    /**
     * @dev Gets the number of bikes owned by a user
     * @param _user User address
     * @return uint256 Number of bikes
     */
    function getBikeCount(address _user) public view returns (uint256) {
        return userBikes[_user].length;
    }
    
    /**
     * @dev Gets the active bike for a user
     * @param _user User address
     * @return Bike struct of the active bike, reverts if no active bike
     */
    function getActiveBike(address _user) public view returns (Bike memory) {
        require(userBikes[_user].length > 0, "No bikes registered");
        
        uint256 index = activeBikeIndex[_user];
        require(userBikes[_user][index].active, "No active bike");
        
        return userBikes[_user][index];
    }
    
    /**
     * @dev Gets the details of a specific activity
     * @param _user User address
     * @param _activityIndex Index of the activity
     * @return Activity struct containing activity details
     */
    function getActivityDetails(
        address _user,
        uint256 _activityIndex
    ) public view returns (Activity memory) {
        require(_activityIndex < userActivities[_user].length, "Activity index out of bounds");
        return userActivities[_user][_activityIndex];
    }
    
    /**
     * @dev Gets the number of activities recorded by a user
     * @param _user User address
     * @return uint256 Number of activities
     */
    function getActivityCount(address _user) public view returns (uint256) {
        return userActivities[_user].length;
    }
    
    /**
     * @dev Gets the number of validated activities with unclaimed rewards
     * @param _user User address
     * @return uint256 Number of claimable activities
     */
    function getClaimableActivityCount(address _user) public view returns (uint256) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < userActivities[_user].length; i++) {
            if (userActivities[_user][i].validated && userActivities[_user][i].tokenReward > 0) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @dev Gets the total unclaimed rewards for a user
     * @param _user User address
     * @return uint256 Total unclaimed rewards
     */
    function getTotalUnclaimedRewards(address _user) public view returns (uint256) {
        uint256 total = 0;
        
        for (uint256 i = 0; i < userActivities[_user].length; i++) {
            if (userActivities[_user][i].validated && userActivities[_user][i].tokenReward > 0) {
                total += userActivities[_user][i].tokenReward;
            }
        }
        
        return total;
    }
    
    /**
     * @dev Updates the base reward rate
     * @param _newRate New base reward rate
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateBaseRewardRate(uint256 _newRate) public onlyRole(ADMIN_ROLE) {
        require(_newRate > 0, "Rate must be positive");
        baseRewardRate = _newRate;
        emit ParameterUpdated("baseRewardRate", _newRate);
    }
    
    /**
     * @dev Updates the streak multiplier
     * @param _newMultiplier New streak multiplier (base 100)
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateStreakMultiplier(uint256 _newMultiplier) public onlyRole(ADMIN_ROLE) {
        require(_newMultiplier >= 100, "Multiplier must be at least 100");
        streakMultiplier = _newMultiplier;
        emit ParameterUpdated("streakMultiplier", _newMultiplier);
    }
    
    /**
     * @dev Updates the calorie multiplier
     * @param _newMultiplier New calorie multiplier
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateCalorieMultiplier(uint256 _newMultiplier) public onlyRole(ADMIN_ROLE) {
        calorieMultiplier = _newMultiplier;
        emit ParameterUpdated("calorieMultiplier", _newMultiplier);
    }
    
    /**
     * @dev Updates the validation time limit
     * @param _newLimit New time limit in seconds
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateValidationTimeLimit(uint256 _newLimit) public onlyRole(ADMIN_ROLE) {
        require(_newLimit >= 1 hours, "Time limit too short");
        validationTimeLimit = _newLimit;
        emit ParameterUpdated("validationTimeLimit", _newLimit);
    }
    
    /**
     * @dev Updates the minimum activity distance
     * @param _newMinDistance New minimum distance in meters
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateMinActivityDistance(uint256 _newMinDistance) public onlyRole(ADMIN_ROLE) {
        require(_newMinDistance > 0, "Distance must be positive");
        minActivityDistance = _newMinDistance;
        emit ParameterUpdated("minActivityDistance", _newMinDistance);
    }
    
    /**
     * @dev Updates the minimum activity duration
     * @param _newMinDuration New minimum duration in seconds
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateMinActivityDuration(uint256 _newMinDuration) public onlyRole(ADMIN_ROLE) {
        require(_newMinDuration > 0, "Duration must be positive");
        minActivityDuration = _newMinDuration;
        emit ParameterUpdated("minActivityDuration", _newMinDuration);
    }
    
    /**
     * @dev Updates the maximum number of claims per transaction
     * @param _newMaxClaims New maximum claims
     * @notice Only addresses with ADMIN_ROLE can call this function
     */
    function updateMaxClaims(uint256 _newMaxClaims) public onlyRole(ADMIN_ROLE) {
        require(_newMaxClaims > 0, "Max claims must be positive");
        maxClaims = _newMaxClaims;
        emit ParameterUpdated("maxClaims", _newMaxClaims);
    }
    
    /**
     * @dev Adds a new Oracle role to the specified address
     * @param _oracle Address to receive oracle privileges
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function addOracle(address _oracle) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_oracle != address(0), "Invalid oracle address");
        grantRole(ORACLE_ROLE, _oracle);
    }
    
    /**
     * @dev Removes Oracle role from the specified address
     * @param _oracle Address to remove oracle privileges from
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function removeOracle(address _oracle) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ORACLE_ROLE, _oracle);
    }
    
    /**
     * @dev Batch validate multiple activities at once (for gas efficiency)
     * @param _users Array of user addresses
     * @param _activityIndices Array of activity indices corresponding to each user
     * @notice Only addresses with ORACLE_ROLE can call this function
     * @notice Arrays must be the same length
     */
    function batchValidateActivities(
        address[] memory _users,
        uint256[] memory _activityIndices
    ) public onlyRole(ORACLE_ROLE) whenNotPaused {
        require(_users.length == _activityIndices.length, "Array length mismatch");
        require(_users.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < _users.length; i++) {
            // We use a try-catch to prevent one failed validation from reverting the entire batch
            try this.validateActivity(_users[i], _activityIndices[i]) {
                // Validation successful
            } catch {
                // Skip failed validation and continue with the next one
            }
        }
    }
    
    /**
     * @dev Emergency function to recover any ERC20 tokens accidentally sent to this contract
     * @param _tokenAddress Address of the token to recover
     * @param _to Address to send the tokens to
     * @param _amount Amount of tokens to recover
     * @notice Only addresses with DEFAULT_ADMIN_ROLE can call this function
     */
    function recoverERC20(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_to != address(0), "Cannot send to zero address");
        
        // Disallow recovering the actual FixieToken to prevent abuse
        require(_tokenAddress != address(tokenContract), "Cannot recover FixieToken");
        
        // Use a low-level call to handle tokens that don't return a bool
        (bool success, bytes memory data) = _tokenAddress.call(
            abi.encodeWithSelector(0xa9059cbb, _to, _amount) // transfer(address,uint256)
        );
        
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "Token recovery failed"
        );
    }
    
    /**
     * @dev View function to get a summary of user statistics
     * @param _user Address of the user
     * @return bikeCount Number of bikes owned
     

