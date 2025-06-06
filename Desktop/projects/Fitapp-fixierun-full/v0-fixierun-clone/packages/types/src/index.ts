// Shared TypeScript types for FixieRun

export interface User {
  id: string;
  address: string;
  username?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BikeNFT {
  id: string;
  tokenId: number;
  owner: string;
  rarity: BikeRarity;
  attributes: BikeAttributes;
  metadataURI: string;
  level: number;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum BikeRarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  MYTHIC = 'Mythic'
}

export interface BikeAttributes {
  speed: number;
  endurance: number;
  agility: number;
  strength: number;
  balance: number;
  reflexes: number;
  resilience: number;
}

export interface Activity {
  id: string;
  userId: string;
  distance: number; // in kilometers
  duration: number; // in minutes
  averageSpeed: number; // km/h
  calories: number;
  route?: GeoPoint[];
  timestamp: Date;
  verified: boolean;
  rewardsClaimed: boolean;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface Reward {
  id: string;
  userId: string;
  activityId: string;
  amount: number; // $FIXIE tokens
  type: RewardType;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
}

export enum RewardType {
  DISTANCE = 'distance',
  SPEED = 'speed',
  CONSISTENCY = 'consistency',
  CHALLENGE = 'challenge',
  SPECIAL_EVENT = 'special_event'
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: number;
  reward: number;
  startDate: Date;
  endDate: Date;
  participants: string[];
  completed: string[];
}

export enum ChallengeType {
  DISTANCE = 'distance',
  SPEED = 'speed',
  DURATION = 'duration',
  FREQUENCY = 'frequency'
}

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export enum LeaderboardType {
  DISTANCE = 'distance',
  SPEED = 'speed',
  REWARDS = 'rewards',
  CONSISTENCY = 'consistency'
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  value: number;
  rank: number;
  change: number; // position change from previous period
}

export interface TokenBalance {
  userId: string;
  balance: number;
  lockedBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface NFTMarketplace {
  id: string;
  tokenId: number;
  seller: string;
  price: number; // in $FIXIE
  currency: 'FIXIE' | 'ETH';
  listed: boolean;
  listedAt?: Date;
  soldAt?: Date;
  buyer?: string;
}

// Web3 specific types
export interface ContractAddresses {
  fixieToken: string;
  bikeNFT: string;
  marketplace: string;
  staking: string;
  governance: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  contracts: ContractAddresses;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Event types for real-time updates
export interface ActivityEvent {
  type: 'activity_started' | 'activity_completed' | 'activity_paused';
  userId: string;
  activityId: string;
  data: Partial<Activity>;
}

export interface RewardEvent {
  type: 'reward_earned' | 'reward_claimed';
  userId: string;
  rewardId: string;
  amount: number;
}

export interface NFTEvent {
  type: 'nft_minted' | 'nft_transferred' | 'nft_listed' | 'nft_sold';
  tokenId: number;
  from?: string;
  to?: string;
  price?: number;
}