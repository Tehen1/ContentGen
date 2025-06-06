// Types
export type ActivityType = 'run' | 'bike';

export interface Activity {
  type: ActivityType;
  distance: number;
  averageSpeed: number;
  completed: boolean;
  duration?: number;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  type: ActivityType | 'any';
  targetDistance?: number;
  targetSpeed?: number;
  targetDuration?: number;
  progress: number;
  completed: boolean;
  icon?: string;
}

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: 'First 5K',
    description: 'Complete your first 5 kilometer run',
    type: 'run',
    targetDistance: 5,
    progress: 0,
    completed: false,
    icon: 'award'
  },
  {
    id: 2,
    title: 'Speed Demon',
    description: 'Maintain 15 km/h for a full run',
    type: 'run',
    targetSpeed: 15,
    progress: 0,
    completed: false,
    icon: 'zap'
  },
  {
    id: 3,
    title: 'Bike Explorer',
    description: 'Complete a 10 kilometer bike ride',
    type: 'bike',
    targetDistance: 10,
    progress: 0,
    completed: false,
    icon: 'map'
  },
  {
    id: 4,
    title: 'Marathon',
    description: 'Run for over 42 kilometers in total',
    type: 'run',
    targetDistance: 42.2,
    progress: 0,
    completed: false,
    icon: 'trophy'
  },
  {
    id: 5,
    title: 'Consistent Rider',
    description: 'Complete 5 bike rides',
    type: 'bike',
    progress: 0,
    completed: false,
    icon: 'repeat'
  }
];

/**
 * Calculate tokens earned based on distance and activity type
 * 
 * @param distance Distance in kilometers
 * @param activityType Type of activity ('run' or 'bike')
 * @returns Number of tokens earned
 */
export const calculateTokens = (distance: number, activityType: ActivityType): number => {
  // Base calculations:
  // Running: 2 tokens per km
  // Biking: 1 token per km
  const baseMultiplier = activityType === 'run' ? 2 : 1;
  
  // Bonus for longer distances
  let bonusMultiplier = 1;
  if (distance >= 10) {
    bonusMultiplier = 1.5; // 50% bonus for 10km+
  } else if (distance >= 5) {
    bonusMultiplier = 1.2; // 20% bonus for 5km+
  }
  
  // Calculate tokens with potential bonus
  const rawTokens = distance * baseMultiplier * bonusMultiplier;
  
  // Round down to nearest integer
  return Math.floor(rawTokens);
};

/**
 * Calculate the next distance milestone for rewards
 * 
 * @param currentDistance Current distance in kilometers
 * @returns Next milestone distance in kilometers
 */
export const getNextRewardDistance = (currentDistance: number): number => {
  // Rewards at 5km intervals (5, 10, 15, etc.)
  return Math.ceil(currentDistance / 5) * 5;
};

/**
 * Update achievement progress based on a completed activity
 * 
 * @param achievements Current achievements array
 * @param activity Completed activity details
 * @returns Updated achievements array
 */
export const calculateAchievementProgress = (
  achievements: Achievement[],
  activity: Activity
): Achievement[] => {
  return achievements.map(achievement => {
    // Skip if already completed
    if (achievement.completed) {
      return achievement;
    }
    
    // Skip if achievement type doesn't match activity type (unless 'any')
    if (achievement.type !== 'any' && achievement.type !== activity.type) {
      return achievement;
    }
    
    let newProgress = achievement.progress;
    
    // Calculate progress based on achievement criteria
    if (achievement.targetDistance) {
      // Distance-based achievements
      newProgress = Math.min(
        (activity.distance / achievement.targetDistance) * 100,
        100
      );
    } else if (achievement.targetSpeed && activity.averageSpeed >= achievement.targetSpeed) {
      // Speed-based achievements
      newProgress = 100;
    } else if (achievement.targetDuration && activity.duration) {
      // Duration-based achievements
      newProgress = Math.min(
        (activity.duration / achievement.targetDuration) * 100,
        100
      );
    } else {
      // For counting completions (like "Complete 5 bike rides")
      // Increment by 20% for each completion (assuming 5 is the target)
      newProgress = Math.min(achievement.progress + 20, 100);
    }
    
    // Check if achievement is now completed
    const completed = newProgress >= 100;
    
    return {
      ...achievement,
      progress: newProgress,
      completed
    };
  });
};

/**
 * Track total stats for a user over time
 * This would typically be stored in persistent storage
 */
export interface UserStats {
  totalRunDistance: number;
  totalBikeDistance: number;
  totalActivities: number;
  runActivities: number;
  bikeActivities: number;
  totalTokens: number;
}

export const DEFAULT_USER_STATS: UserStats = {
  totalRunDistance: 0,
  totalBikeDistance: 0,
  totalActivities: 0,
  runActivities: 0,
  bikeActivities: 0,
  totalTokens: 0
};

/**
 * Update user stats with a new activity
 * 
 * @param currentStats Current user statistics
 * @param activity Completed activity
 * @param tokensEarned Tokens earned from the activity
 * @returns Updated user statistics
 */
export const updateUserStats = (
  currentStats: UserStats,
  activity: Activity,
  tokensEarned: number
): UserStats => {
  return {
    ...currentStats,
    totalRunDistance: 
      currentStats.totalRunDistance + (activity.type === 'run' ? activity.distance : 0),
    totalBikeDistance:
      currentStats.totalBikeDistance + (activity.type === 'bike' ? activity.distance : 0),
    totalActivities: currentStats.totalActivities + 1,
    runActivities: 
      currentStats.runActivities + (activity.type === 'run' ? 1 : 0),
    bikeActivities:
      currentStats.bikeActivities + (activity.type === 'bike' ? 1 : 0),
    totalTokens: currentStats.totalTokens + tokensEarned
  };
};

