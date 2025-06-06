/**
 * FitTrack zkEVM TypeScript Definitions
 * 
 * This file contains all the TypeScript types used throughout the application
 * for blockchain data, fitness tracking, and rewards.
 */

import { BigNumber } from "ethers";

// ======== Blockchain & Wallet Types ========

export interface WalletInfo {
  address: string;
  chainId: string;
  balance: string;
  isConnected: boolean;
}

export interface WalletState {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance: BigNumber;
  provider: any;
  signer: any;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: BigNumber;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  data?: string;
  nonce: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
}

export interface ZKProof {
  proof: string;
  publicInputs: string[];
  verified: boolean;
}

// ======== Fitness Activity Types ========

export enum WorkoutType {
  Running = 'running',
  Walking = 'walking',
  Cycling = 'cycling',
  Swimming = 'swimming',
  Hiking = 'hiking',
  WeightTraining = 'weightTraining',
  Other = 'other'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
}

export interface Workout {
  id: string;
  userId: string;
  workoutType: WorkoutType;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  distance?: number; // in meters
  caloriesBurned?: number;
  avgHeartRate?: number;
  route?: Coordinates[];
  notes?: string;
  verified: boolean;
  zkProof?: ZKProof;
  txHash?: string; // transaction hash when stored on blockchain
  blockNumber?: number;
}

export interface StepRecord {
  id: string;
  userId: string;
  date: string; // ISO format YYYY-MM-DD
  count: number;
  goal?: number;
  verified: boolean;
  txHash?: string;
  blockNumber?: number;
}

// ======== Achievement & Reward Types ========

export enum AchievementType {
  StepGoal = 'stepGoal',
  DistanceMilestone = 'distanceMilestone',
  WorkoutStreak = 'workoutStreak',
  PersonalBest = 'personalBest',
  CompletedChallenge = 'completedChallenge'
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  dateEarned: number;
  tokenId?: number; // ERC-1155 token ID if minted as NFT
  imageUrl?: string;
  metadataURI?: string;
  txHash?: string;
  blockNumber?: number;
}

export interface Reward {
  id: string;
  userId: string;
  tokenId: number;
  amount: number;
  name: string;
  description?: string;
  imageUrl?: string;
  dateIssued: number;
  expiryDate?: number;
  redeemed: boolean;
  txHash?: string;
  blockNumber?: number;
}

// ======== ZK Activity Verification Types ========

export interface ZKActivityProof {
  distance: number;
  duration: number;
  proof: string;
  publicInputs: string[];
}

export interface VerificationResult {
  success: boolean;
  message?: string;
  txHash?: string;
}

// ======== Smart Contract Interaction Types ========

export interface ContractCallOptions {
  gasLimit?: BigNumber;
  gasPrice?: BigNumber;
  nonce?: number;
  value?: BigNumber;
}

export interface FitTrackerContractState {
  address: string;
  isInitialized: boolean;
  totalWorkouts: number;
  totalUsers: number;
  totalRewards: number;
  ownerAddress: string;
}

export interface FitTrackerHookReturn {
  // Contract state
  contractState: FitTrackerContractState;
  isLoading: boolean;
  error: string | null;

  // Workout functions
  addWorkout: (workout: Omit<Workout, 'id' | 'verified' | 'txHash' | 'blockNumber'>) => Promise<Transaction>;
  getWorkouts: (userId: string) => Promise<Workout[]>;
  verifyWorkout: (workoutId: string, proof: ZKActivityProof) => Promise<VerificationResult>;

  // Step tracking functions
  recordSteps: (userId: string, date: string, count: number) => Promise<Transaction>;
  getStepRecords: (userId: string, startDate?: string, endDate?: string) => Promise<StepRecord[]>;

  // Achievement functions
  getAchievements: (userId: string) => Promise<Achievement[]>;
  claimAchievement: (achievement: Omit<Achievement, 'id' | 'txHash' | 'blockNumber'>) => Promise<Transaction>;

  // Reward functions
  getRewards: (userId: string) => Promise<Reward[]>;
  claimReward: (rewardId: string) => Promise<Transaction>;

  // Utility functions
  refreshData: () => Promise<void>;
  isUserAuthorized: (address: string) => Promise<boolean>;
}


