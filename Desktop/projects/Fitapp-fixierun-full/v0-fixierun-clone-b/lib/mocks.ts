import { v4 as uuidv4 } from 'uuid';
import {
  BIKE_IMAGES,
  MAX_DURABILITY,
  MAX_LEVEL,
  RARITY_MULTIPLIERS,
  XP_PER_KM,
  REWARDS_PER_KM,
  MIN_RIDE_DISTANCE,
  MAX_RIDE_DISTANCE,
  MIN_RIDE_DURATION,
} from './constants';
import type {
  BikeNFT,
  BikeRarity,
  BikeStats,
  BikeUpgrades,
  ActivityData,
  Challenge,
  ChallengeType,
  UserStats,
  Achievement,
  LeaderboardEntry,
  TokenTransaction,
  TokenTransactionType,
} from '@/types/nft';

// Utility functions for generating random data
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomFloat = (min: number, max: number, decimals = 2): number => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomDate = (startDate: Date, endDate: Date = new Date()): Date => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
};

const getRandomBikeRarity = (): BikeRarity => {
  const rarities: BikeRarity[] = ['common', 'rare', 'epic', 'legendary'];
  const weights = [70, 20, 8, 2]; // Probability distribution
  
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return rarities[i];
    }
    random -= weights[i];
  }
  
  return 'common'; // Default fallback
};

// Generate mock bike stats based on rarity
const generateBikeStats = (rarity: BikeRarity, level: number): BikeStats => {
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity];
  const levelMultiplier = 1 + (level * 0.01);
  
  return {
    speed: getRandomInt(5, 10) * rarityMultiplier * levelMultiplier,
    acceleration: getRandomInt(5, 10) * rarityMultiplier * levelMultiplier,
    handling: getRandomInt(5, 10) * rarityMultiplier * levelMultiplier,
    efficiency: getRandomInt(5, 10) * rarityMultiplier * levelMultiplier,
    durability: MAX_DURABILITY,
    maxDurability: MAX_DURABILITY,
  };
};

// Generate mock bike upgrades
const generateBikeUpgrades = (): BikeUpgrades => {
  return {
    frame: getRandomInt(0, 3),
    wheels: getRandomInt(0, 3),
    chain: getRandomInt(0, 3),
    seat: getRandomInt(0, 3),
  };
};

// Generate a mock bike NFT
export const generateMockBikeNFT = (tokenId?: number): BikeNFT => {
  const id = tokenId || getRandomInt(1, 10000);
  const rarity = getRandomBikeRarity();
  const level = getRandomInt(1, MAX_LEVEL);
  
  return {
    tokenId: id,
    name: `Fixie Bike #${id}`,
    description: `A ${rarity} Fixie Bike for your crypto-cycling adventures.`,
    imageUrl: BIKE_IMAGES[rarity],
    rarity,
    level,
    xp: getRandomInt(0, level * 1000),
    stats: generateBikeStats(rarity, level),
    upgrades: generateBikeUpgrades(),
    mintDate: getRandomDate(new Date('2023-01-01')).toISOString(),
    lastRideDate: getRandomDate(new Date('2023-01-01')).toISOString(),
    totalDistance: getRandomFloat(0, 5000, 1),
    owner: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    metadata: {
      attributes: [
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Level', value: level.toString() },
        { trait_type: 'Frame Type', value: ['Standard', 'Carbon', 'Aluminum', 'Titanium'][getRandomInt(0, 3)] },
        { trait_type: 'Color', value: ['Red', 'Blue', 'Green', 'Black', 'White'][getRandomInt(0, 4)] },
      ],
    },
  };
};

// Generate multiple mock bike NFTs
export const generateMockBikeNFTs = (count: number): BikeNFT[] => {
  return Array.from({ length: count }, (_, i) => generateMockBikeNFT(i + 1));
};

// Generate mock activity data
export const generateMockActivityData = (bikeId?: number): ActivityData => {
  const distance = getRandomFloat(MIN_RIDE_DISTANCE, MAX_RIDE_DISTANCE, 2);
  const duration = getRandomInt(MIN_RIDE_DURATION, MIN_RIDE_DURATION * 10);
  const startTime = getRandomDate(new Date('2023-01-01'));
  const endTime = new Date(startTime.getTime() + duration * 1000);
  const rewards = Math.floor(distance * REWARDS_PER_KM);
  const bike = bikeId || getRandomInt(1, 10000);
  
  return {
    id: uuidv4(),
    bikeTokenId: bike,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    distance,
    avgSpeed: distance / (duration / 3600),
    elevationGain: getRandomInt(0, 500),
    caloriesBurned: getRandomInt(100, 1000),
    rewards,
    xpEarned: Math.floor(distance * XP_PER_KM),
    verified: Math.random() > 0.1, // 90% chance of being verified
    routeData: {
      points: Array.from({ length: getRandomInt(10, 50) }, () => ({
        lat: getRandomFloat(-90, 90, 6),
        lng: getRandomFloat(-180, 180, 6),
        elevation: getRandomFloat(0, 1000, 1),
        timestamp: new Date().toISOString(),
      })),
    },
    weather: {
      temperature: getRandomFloat(-10, 40, 1),
      conditions: getRandomElement(['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy']),
      humidity: getRandomInt(0, 100),
    },
    transactionHash: Math.random() > 0.2 ? `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined,
  };
};

// Generate multiple mock activities
export const generateMockActivities = (count: number, bikeId?: number): ActivityData[] => {
  return Array.from({ length: count }, () => generateMockActivityData(bikeId));
};

// Generate mock challenge
export const generateMockChallenge = (id?: string): Challenge => {
  const types: ChallengeType[] = ['daily', 'weekly', 'achievement'];
  const type = getRandomElement(types);
  const now = new Date();
  
  let startDate: Date, endDate: Date;
  if (type === 'daily') {
    startDate = new Date(now.setHours(0, 0, 0, 0));
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
  } else if (type === 'weekly') {
    const day = now.getDay();
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - day);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
  } else {
    startDate = new Date('2023-01-01');
    endDate = new Date('2030-01-01');
  }
  
  const challengeTypes = [
    { name: 'Distance Challenge', metric: 'distance', target: getRandomInt(5, 100) },
    { name: 'Speed Challenge', metric: 'avgSpeed', target: getRandomInt(15, 35) },
    { name: 'Duration Challenge', metric: 'duration', target: getRandomInt(1800, 7200) },
    { name: 'Elevation Challenge', metric: 'elevationGain', target: getRandomInt(100, 1000) },
    { name: 'Rides Challenge', metric: 'count', target: getRandomInt(3, 20) },
  ];
  
  const selectedChallenge = getRandomElement(challengeTypes);
  
  return {
    id: id || uuidv4(),
    title: selectedChallenge.name,
    description: `Complete ${selectedChallenge.target} ${selectedChallenge.metric} to earn rewards.`,
    type,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    targetMetric: selectedChallenge.metric,
    targetValue: selectedChallenge.target,
    reward: getRandomInt(50, 500),
    progress: getRandomInt(0, selectedChallenge.target),
    completed: Math.random() > 0.7,
    claimed: Math.random() > 0.8,
  };
};

// Generate multiple mock challenges
export const generateMockChallenges = (count: number): Challenge[] => {
  return Array.from({ length: count }, (_, i) => generateMockChallenge(`challenge-${i + 1}`));
};

// Generate mock achievement
export const generateMockAchievement = (id?: string): Achievement => {
  const achievementTypes = [
    { name: 'Century Rider', description: 'Ride 100km in a single ride', tier: 1 },
    { name: 'Early Bird', description: 'Complete 10 rides before 8 AM', tier: 2 },
    { name: 'Night Owl', description: 'Complete 10 rides after 8 PM', tier: 1 },
    { name: 'Mountain Goat', description: 'Climb 1000m elevation in a single ride', tier: 3 },
    { name: 'Speed Demon', description: 'Maintain 30km/h average speed for a 10km ride', tier: 3 },
    { name: 'Iron Butt', description: 'Ride for 5 hours in a single ride', tier: 2 },
    { name: 'Consistent Rider', description: 'Ride for 7 consecutive days', tier: 1 },
  ];
  
  const achievement = getRandomElement(achievementTypes);
  
  return {
    id: id || uuidv4(),
    name: achievement.name,
    description: achievement.description,
    tier: achievement.tier,
    dateEarned: Math.random() > 0.3 ? getRandomDate(new Date('2023-01-01')).toISOString() : undefined,
    reward: achievement.tier * 100,
    iconUrl: `/images/achievements/${achievement.name.toLowerCase().replace(/\s/g, '-')}.png`,
  };
};

// Generate multiple mock achievements
export const generateMockAchievements = (count: number): Achievement[] => {
  return Array.from({ length: count }, (_, i) => generateMockAchievement(`achievement-${i + 1}`));
};

// Generate mock user stats
export const generateMockUserStats = (userId?: string): UserStats => {
  return {
    userId: userId || `user-${getRandomInt(1, 1000)}`,
    totalDistance: getRandomFloat(0, 10000, 1),
    totalRides: getRandomInt(0, 500),
    totalRewards: getRandomInt(0, 50000),
    level: getRandomInt(1, 100),
    xp: getRandomInt(0, 10000),
    nextLevelXp: getRandomInt(10000, 20000),
    achievements: generateMockAchievements(getRandomInt(3, 10)),
    bikesOwned: getRandomInt(1, 5),
    highestRarity: getRandomElement(['common', 'rare', 'epic', 'legendary'] as BikeRarity[]),
    longestRide: getRandomFloat(10, 200, 1),
    fastestSpeed: getRandomFloat(20, 60, 1),
    totalElevation: getRandomInt(0, 50000),
    joinDate: getRandomDate(new Date('2023-01-01')).toISOString(),
    lastActive: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString(),
  };
};

// Generate mock leaderboard entry
export const generateMockLeaderboardEntry = (rank?: number): LeaderboardEntry => {
  return {
    userId: `user-${getRandomInt(1, 1000)}`,
    username: `rider${getRandomInt(1000, 9999)}`,
    rank: rank || getRandomInt(1, 100),
    totalDistance: getRandomFloat(100, 10000, 1),
    totalRides: getRandomInt(10, 500),
    avatarUrl: `/images/avatars/avatar-${getRandomInt(1, 10)}.png`,
    level: getRandomInt(1, 100),
    bikeCount: getRandomInt(1, 10),
    bestBikeRarity: getRandomElement(['common', 'rare', 'epic', 'legendary'] as BikeRarity[]),
  };
};

// Generate mock leaderboard
export const generateMockLeaderboard = (count: number): LeaderboardEntry[] => {
  return Array.from({ length: count }, (_, i) => generateMockLeaderboardEntry(i + 1))
    .sort((a, b) => b.totalDistance - a.totalDistance);
};

// Generate mock token transaction
export const generateMockTokenTransaction = (): TokenTransaction => {
  const types: TokenTransactionType[] = ['reward', 'purchase', 'staking', 'transfer'];
  const type = getRandomElement(types);
  const amount = getRandomInt(1, 1000);
  
  let description = '';
  switch (type) {
    case 'reward':
      description = `Earned ${amount} $FIX for completing a ride`;
      break;
    case 'purchase':
      description = `Spent ${amount} $FIX on bike upgrades`;
      break;
    case 'staking':
      description = `Staked ${amount} $FIX for rewards`;
      break;
    case 'transfer':
      description = `Transferred ${amount} $FIX to another wallet`;
      break;
  }
  
  return {
    id: uuidv4(),
    type,
    amount: amount.toString(),
    timestamp: getRandomDate(new Date('2023-01-01')).toISOString(),
    description,
    transactionHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    from: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    to: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    status: getRandomElement(['pending', 'completed', 'failed']),
  };
};

// Generate multiple mock token transactions
export const generateMockTokenTransactions = (count: number): TokenTransaction[] => {
  return Array.from({ length: count }, () => generateMockTokenTransaction())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

