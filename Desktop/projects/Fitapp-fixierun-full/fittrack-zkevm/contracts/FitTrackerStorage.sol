// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FitTrackerStorage
 * @dev A contract for storing fitness data optimized for zkEVM network
 */
contract FitTrackerStorage {
    // Structs to represent different types of fitness data
    struct Workout {
        uint256 id;
        uint256 timestamp;
        string workoutType;
        uint256 duration; // in seconds
        uint256 caloriesBurned;
        string metadata; // JSON string for additional data
    }

    struct StepRecord {
        uint256 date; // YYYYMMDD format
        uint256 count;
        uint256 distance; // in meters
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 unlockedAt;
    }

    // Mappings to store user data
    mapping(address => Workout[]) private userWorkouts;
    mapping(address => mapping(uint256 => StepRecord)) private userStepRecords; // date => StepRecord
    mapping(address => Achievement[]) private userAchievements;
    mapping(address => mapping(address => bool)) private authorizedApps;
    mapping(address => uint256) private totalWorkouts;

    // Events
    event WorkoutAdded(address indexed user, uint256 indexed workoutId, string workoutType, uint256 timestamp);
    event StepsRecorded(address indexed user, uint256 indexed date, uint256 count);
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId, string name);
    event AppAuthorized(address indexed user, address indexed app, bool status);

    // Modifiers
    modifier onlyUserOrAuthorized(address user) {
        require(
            msg.sender == user || authorizedApps[user][msg.sender],
            "FitTracker: Not authorized"
        );
        _;
    }

    /**
     * @dev Add a new workout for a user
     * @param workoutType The type of workout (e.g., "running", "cycling")
     * @param duration Duration in seconds
     * @param caloriesBurned Estimated calories burned
     * @param metadata Additional JSON data
     */
    function addWorkout(
        string calldata workoutType,
        uint256 duration,
        uint256 caloriesBurned,
        string calldata metadata
    ) external {
        uint256 workoutId = totalWorkouts[msg.sender]++;
        
        userWorkouts[msg.sender].push(
            Workout({
                id: workoutId,
                timestamp: block.timestamp,
                workoutType: workoutType,
                duration: duration,
                caloriesBurned: caloriesBurned,
                metadata: metadata
            })
        );
        
        emit WorkoutAdded(msg.sender, workoutId, workoutType, block.timestamp);
    }

    /**
     * @dev Record steps for a specific date
     * @param date Date in YYYYMMDD format
     * @param count Number of steps
     * @param distance Distance covered in meters
     */
    function recordSteps(
        uint256 date,
        uint256 count,
        uint256 distance
    ) external {
        StepRecord storage record = userStepRecords[msg.sender][date];
        
        // Update or create step record
        record.date = date;
        record.count = count;
        record.distance = distance;
        
        emit StepsRecorded(msg.sender, date, count);
    }

    /**
     * @dev Add steps to existing count for incremental updates
     * @param date Date in YYYYMMDD format
     * @param additionalSteps Steps to add
     * @param additionalDistance Distance to add in meters
     */
    function addSteps(
        uint256 date,
        uint256 additionalSteps,
        uint256 additionalDistance
    ) external {
        StepRecord storage record = userStepRecords[msg.sender][date];
        
        // If record doesn't exist, initialize it
        if (record.date == 0) {
            record.date = date;
            record.count = 0;
            record.distance = 0;
        }
        
        // Add steps and distance
        record.count += additionalSteps;
        record.distance += additionalDistance;
        
        emit StepsRecorded(msg.sender, date, record.count);
    }

    /**
     * @dev Unlock a new achievement for a user
     * @param name Achievement name
     * @param description Achievement description
     */
    function unlockAchievement(
        string calldata name,
        string calldata description
    ) external {
        uint256 achievementId = userAchievements[msg.sender].length;
        
        userAchievements[msg.sender].push(
            Achievement({
                id: achievementId,
                name: name,
                description: description,
                unlockedAt: block.timestamp
            })
        );
        
        emit AchievementUnlocked(msg.sender, achievementId, name);
    }

    /**
     * @dev Authorize or deauthorize an app to manage user's fitness data
     * @param app Address of the app
     * @param authorized Authorization status
     */
    function setAppAuthorization(address app, bool authorized) external {
        require(app != address(0), "FitTracker: Invalid app address");
        authorizedApps[msg.sender][app] = authorized;
        emit AppAuthorized(msg.sender, app, authorized);
    }

    /**
     * @dev Bulk record fitness data (gas-optimized for zkEVM)
     * @param dates Array of dates in YYYYMMDD format
     * @param stepCounts Array of step counts
     * @param distances Array of distances in meters
     */
    function bulkRecordSteps(
        uint256[] calldata dates,
        uint256[] calldata stepCounts,
        uint256[] calldata distances
    ) external {
        require(
            dates.length == stepCounts.length && dates.length == distances.length,
            "FitTracker: Array length mismatch"
        );
        
        for (uint256 i = 0; i < dates.length; i++) {
            StepRecord storage record = userStepRecords[msg.sender][dates[i]];
            record.date = dates[i];
            record.count = stepCounts[i];
            record.distance = distances[i];
            
            emit StepsRecorded(msg.sender, dates[i], stepCounts[i]);
        }
    }

    // Read functions

    /**
     * @dev Get the total number of workouts for a user
     * @param user Address of the user
     * @return Total number of workouts
     */
    function getTotalWorkouts(address user) external view returns (uint256) {
        return totalWorkouts[user];
    }

    /**
     * @dev Get workout details by ID
     * @param user Address of the user
     * @param workoutId ID of the workout
     * @return Workout details
     */
    function getWorkout(address user, uint256 workoutId) 
        external 
        view 
        returns (Workout memory) 
    {
        require(workoutId < userWorkouts[user].length, "FitTracker: Workout does not exist");
        return userWorkouts[user][workoutId];
    }

    /**
     * @dev Get step record for a specific date
     * @param user Address of the user
     * @param date Date in YYYYMMDD format
     * @return Step record details
     */
    function getStepRecord(address user, uint256 date) 
        external 
        view 
        returns (StepRecord memory) 
    {
        return userStepRecords[user][date];
    }

    /**
     * @dev Get all achievements for a user
     * @param user Address of the user
     * @return Array of achievements
     */
    function getAchievements(address user) 
        external 
        view 
        returns (Achievement[] memory) 
    {
        return userAchievements[user];
    }

    /**
     * @dev Check if an app is authorized for a user
     * @param user Address of the user
     * @param app Address of the app
     * @return Authorization status
     */
    function isAppAuthorized(address user, address app) 
        external 
        view 
        returns (bool) 
    {
        return authorizedApps[user][app];
    }
}

