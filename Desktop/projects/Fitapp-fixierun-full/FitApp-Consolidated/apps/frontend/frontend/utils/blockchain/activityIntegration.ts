/**
 * FixieRun Activity Integration
 * 
 * This module provides integration between Google Health/Fit API data
 * and the FixieRun smart contract system using Viem.
 */

import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  custom, 
  PublicClient, 
  WalletClient, 
  Account,
  Transport,
  Chain
} from 'viem';
import { mainnet, polygon, optimism } from 'viem/chains';
import { PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts';
import { logInfo, logWarn, logError } from '../logging';

// Import contract ABIs
import fixieRunABI from './abis/FixieRunABI';
import fixieTokenABI from './abis/FixieTokenABI';
import fixieNFTABI from './abis/FixieNFTABI';

// Contract addresses (these would typically come from environment variables)
const CONTRACT_ADDRESSES = {
  FixieRun: process.env.NEXT_PUBLIC_FIXIERUN_ADDRESS || '0xFixieRunContractAddress',
  FixieToken: process.env.NEXT_PUBLIC_FIXIETOKEN_ADDRESS || '0xFixieTokenContractAddress',
  FixieNFT: process.env.NEXT_PUBLIC_FIXIENFT_ADDRESS || '0xFixieNFTContractAddress'
};

// Define the chain to use - default to polygon but allow override
const DEFAULT_CHAIN = polygon;

// Types for Google Health API responses
interface GoogleHealthActivity {
  startTime: string;
  endTime: string;
  activityType: string;
  metrics: {
    distance?: number;       // in meters
    duration?: number;       // in seconds
    calories?: number;       // in calories
    steps?: number;          // step count
    heartRate?: number[];    // heart rate samples
    speed?: number[];        // speed samples
  };
  source: string;
  dataSourceId: string;
}

// Types for processed activity data
interface ProcessedActivity {
  timestamp: number;        // unix timestamp
  distance: number;         // in meters
  duration: number;         // in seconds
  calories: number;         // in calories
  activityType: string;     // "cycling", "running", etc.
  valid: boolean;           // whether the activity passed validation
  validationMessage?: string; // if invalid, reason why
}

// Google Health API client options
interface GoogleHealthOptions {
  accessToken: string;
  userId: string;
  dateRange?: {
    startTime: string;
    endTime: string;
  };
}

// Client configurations
interface ClientConfig {
  chain?: Chain;
  publicClient?: PublicClient;
  walletClient?: WalletClient;
}

/**
 * Activity Integration class
 * Handles fetching fitness data from Google Health API and submitting to blockchain
 */
export class ActivityIntegration {
  private publicClient: PublicClient;
  private walletClient: WalletClient | null = null;
  private account: Account | null = null;
  private chain: Chain;
  private oracleAccount: PrivateKeyAccount | null = null;
  
  /**
   * Create a new ActivityIntegration instance
   * @param config Optional configuration object
   */
  constructor(config: ClientConfig = {}) {
    this.chain = config.chain || DEFAULT_CHAIN;
    
    // Initialize public client for reading from blockchain
    this.publicClient = config.publicClient || createPublicClient({
      chain: this.chain,
      transport: http()
    });
    
    logInfo('ActivityIntegration initialized with chain:', this.chain.name);
  }
  
  /**
   * Connect wallet for blockchain interactions
   * @returns Connected account address or null if connection failed
   */
  async connectWallet(): Promise<string | null> {
    try {
      // Check if browser has ethereum provider
      if (!window.ethereum) {
        logWarn('No Ethereum provider found. Please install MetaMask or another wallet.');
        throw new Error('No Ethereum provider found');
      }
      
      // Create wallet client
      this.walletClient = createWalletClient({
        chain: this.chain,
        transport: custom(window.ethereum)
      });
      
      // Request accounts
      const [address] = await this.walletClient.requestAddresses();
      this.account = { address };
      
      logInfo('Wallet connected:', address);
      return address;
    } catch (error) {
      logError('Failed to connect wallet:', error);
      this.walletClient = null;
      this.account = null;
      return null;
    }
  }
  
  /**
   * Initialize oracle account (for backend use only - should never be used in frontend)
   * @param privateKey Oracle's private key
   */
  initializeOracleAccount(privateKey: string): void {
    if (typeof window !== 'undefined') {
      throw new Error('Oracle account should only be initialized in server-side code');
    }
    
    try {
      this.oracleAccount = privateKeyToAccount(privateKey as `0x${string}`);
      logInfo('Oracle account initialized');
    } catch (error) {
      logError('Failed to initialize oracle account:', error);
      throw error;
    }
  }
  
  /**
   * Fetch activities from Google Health API
   * @param options Google Health API options
   * @returns Array of activities
   */
  async fetchActivitiesFromGoogleHealth(
    options: GoogleHealthOptions
  ): Promise<GoogleHealthActivity[]> {
    try {
      logInfo('Fetching activities from Google Health API');
      
      // Default date range to last 24 hours if not provided
      const dateRange = options.dateRange || {
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString()
      };
      
      // Call Google Health API
      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/sessions',
        {
          headers: {
            Authorization: `Bearer ${options.accessToken}`,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        logError('Google Health API error:', errorData);
        throw new Error(`Google Health API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter for relevant activities (cycling for FixieRun)
      const activities = data.session
        .filter((session: any) => 
          session.activityType === 'cycling' ||
          session.activityType === 'biking'
        )
        .filter((session: any) => 
          new Date(session.startTimeMillis).toISOString() >= dateRange.startTime &&
          new Date(session.endTimeMillis).toISOString() <= dateRange.endTime
        );
      
      logInfo(`Found ${activities.length} cycling activities`);
      
      // Fetch detailed data for each activity
      const detailedActivities = await Promise.all(
        activities.map(async (activity: any) => {
          // Fetch detailed metrics for this activity
          const detailsResponse = await fetch(
            `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${options.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                aggregateBy: [{
                  dataTypeName: 'com.google.distance.delta',
                  dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'
                }, {
                  dataTypeName: 'com.google.calories.expended',
                  dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
                }],
                startTimeMillis: activity.startTimeMillis,
                endTimeMillis: activity.endTimeMillis
              })
            }
          );
          
          if (!detailsResponse.ok) {
            logWarn(`Could not fetch detailed metrics for activity ${activity.id}`);
            return null;
          }
          
          const details = await detailsResponse.json();
          
          // Extract metrics
          const metrics: GoogleHealthActivity['metrics'] = {};
          
          details.bucket.forEach((bucket: any) => {
            bucket.dataset.forEach((dataset: any) => {
              dataset.point.forEach((point: any) => {
                const values = point.value[0];
                
                if (dataset.dataSourceId.includes('distance')) {
                  metrics.distance = (metrics.distance || 0) + values.fpVal;
                } else if (dataset.dataSourceId.includes('calories')) {
                  metrics.calories = (metrics.calories || 0) + values.fpVal;
                }
              });
            });
          });
          
          // Calculate duration from start/end time
          const startTime = new Date(parseInt(activity.startTimeMillis));
          const endTime = new Date(parseInt(activity.endTimeMillis));
          metrics.duration = (endTime.getTime() - startTime.getTime()) / 1000;
          
          return {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            activityType: 'cycling',
            metrics,
            source: activity.application?.packageName || 'unknown',
            dataSourceId: activity.id
          };
        })
      );
      
      // Filter out null activities (failed to fetch details)
      return detailedActivities.filter(
        (activity): activity is GoogleHealthActivity => activity !== null
      );
    } catch (error) {
      logError('Error fetching activities from Google Health:', error);
      throw error;
    }
  }
  
  /**
   * Process and validate Google Health activity data
   * @param activities Array of Google Health activities
   * @returns Array of processed activities ready for blockchain submission
   */
  processActivities(activities: GoogleHealthActivity[]): ProcessedActivity[] {
    return activities.map(activity => {
      // Extract relevant data
      const { metrics } = activity;
      const distance = metrics.distance || 0;
      const duration = metrics.duration || 0;
      const calories = metrics.calories || 0;
      const timestamp = new Date(activity.startTime).getTime() / 1000;
      
      // Validate the activity data
      const valid = this.validateActivityData(distance, duration, calories);
      
      let validationMessage;
      if (!valid.isValid) {
        validationMessage = valid.message;
        logWarn(`Invalid activity data: ${valid.message}`);
      }
      
      return {
        timestamp: Math.floor(timestamp),
        distance: Math.round(distance),
        duration: Math.round(duration),
        calories: Math.round(calories),
        activityType: activity.activityType,
        valid: valid.isValid,
        validationMessage: validationMessage
      };
    });
  }
  
  /**
   * Validate activity data before submitting to blockchain
   * @param distance Distance in meters
   * @param duration Duration in seconds
   * @param calories Calories burned
   * @returns Validation result with boolean and message
   */
  private validateActivityData(
    distance: number,
    duration: number,
    calories: number
  ): { isValid: boolean; message?: string } {
    // Check minimum requirements
    if (distance < 100) {
      return { isValid: false, message: 'Distance is too short (minimum 100m)' };
    }
    
    if (duration < 60) {
      return { isValid: false, message: 'Duration is too short (minimum 60s)' };
    }
    
    if (calories <= 0) {
      return { isValid: false, message: 'Calories must be positive' };
    }
    
    // Check for realistic speed (between 5 km/h and 50 km/h for cycling)
    const speedKmh = (distance / 1000) / (duration / 3600);
    if (speedKmh < 5 || speedKmh > 50) {
      return { 
        isValid: false, 
        message: `Unrealistic speed: ${speedKmh.toFixed(2)} km/h (expected: 5-50 km/h)` 
      };
    }
    
    // Check for realistic calories (roughly 10 calories per minute of cycling)
    const expectedCalories = duration / 60 * 10;
    const calorieRatio = calories / expectedCalories;
    if (calorieRatio < 0.5 || calorieRatio > 2) {
      return { 
        isValid: false, 
        message: `Suspicious calorie count: ${calories} (expected around ${Math.round(expectedCalories)})` 
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Submit activity data to FixieRun contract
   * @param activity Processed activity data
   * @returns Transaction hash if successful
   */
  async submitActivity(activity: ProcessedActivity): Promise<string | null> {
    try {
      // Ensure wallet is connected
      if (!this.walletClient || !this.account) {
        logWarn('Wallet not connected. Call connectWallet() first.');
        throw new Error('Wallet not connected');
      }
      
      // Check if activity data is valid
      if (!activity.valid) {
        logWarn(`Cannot submit invalid activity: ${activity.validationMessage}`);
        throw new Error(`Invalid activity: ${activity.validationMessage}`);
      }
      
      logInfo('Submitting activity to FixieRun contract:', {
        distance: activity.distance,
        duration: activity.duration,
        calories: activity.calories
      });
      
      // Submit transaction to blockchain
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'recordRide',
        args: [
          BigInt(activity.distance),
          BigInt(activity.duration),
          BigInt(activity.calories)
        ],
        account: this.account
      });
      
      logInfo('Activity submitted successfully:', hash);
      return hash;
    } catch (error) {
      logError('Failed to submit activity:', error);
      throw error;
    }
  }
  
  /**
   * Submit activity data as an Oracle (for backend use only)
   * @param userAddress Address of the user who recorded the activity
   * @param activityIndex Index of the activity to validate
   * @returns Transaction hash if successful
   */
  async validateActivityAsOracle(
    userAddress: string,
    activityIndex: number
  ): Promise<string | null> {
    try {
      // Ensure oracle account is initialized
      if (!this.oracleAccount) {
        logWarn('Oracle account not initialized. Call initializeOracleAccount() first.');
        throw new Error('Oracle account not initialized');
      }
      
      // Create wallet client for oracle
      const oracleWalletClient = createWalletClient({
        chain: this.chain,
        account: this.oracleAccount,
        transport: http()
      });
      
      logInfo('Validating activity as Oracle:', {
        userAddress,
        activityIndex
      });
      
      // Submit validation transaction
      const hash = await oracleWalletClient.writeContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'validateActivity',
        args: [userAddress as `0x${string}`, BigInt(activityIndex)]
      });
      
      logInfo('Activity validated successfully:', hash);
      return hash;
    } catch (error) {
      logError('Failed to validate activity as Oracle:', error);
      throw error;
    }
  }
  
  /**
   * Batch validate multiple activities as Oracle (for backend use only)
   * @param activities Array of activities to validate (user address and activity index)
   * @returns Array of transaction hashes (null for failed validations)
   */
  async batchValidateAsOracle(
    activities: Array<{ userAddress: string; activityIndex: number }>
  ): Promise<(string | null)[]> {
    try {
      // Ensure oracle account is initialized
      if (!this.oracleAccount) {
        logWarn('Oracle account not initialized. Call initializeOracleAccount() first.');
        throw new Error('Oracle account not initialized');
      }
      
      // Create wallet client for oracle
      const oracleWalletClient = createWalletClient({
        chain: this.chain,
        account: this.oracleAccount,
        transport: http()
      });
      
      // Prepare batch call arguments
      const userAddresses = activities.map(a => a.userAddress as `0x${string}`);
      const activityIndices = activities.map(a => BigInt(a.activityIndex));
      
      logInfo(`Batch validating ${activities.length} activities as Oracle`);
      
      // Submit batch validation transaction
      const hash = await oracleWalletClient.writeContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'batchValidateActivities',
        args: [userAddresses, activityIndices]
      });
      
      logInfo('Batch validation submitted successfully:', hash);
      return activities.map(() => hash);
    } catch (error) {
      logError('Failed to batch validate activities as Oracle:', error);
      throw error;
    }
  }
  
  /**
   * Claim rewards for validated activities
   * @returns Transaction hash if successful
   */
  async claimRewards(): Promise<string | null> {
    try {
      // Ensure wallet is connected
      if (!this.walletClient || !this.account) {
        logWarn('Wallet not connected. Call connectWallet() first.');
        throw new Error('Wallet not connected');
      }
      
      // Check if there are rewards to claim
      const claimableCount = await this.getClaimableActivityCount();
      if (claimableCount === 0) {
        logWarn('No rewards to claim');
        throw new Error('No rewards to claim');
      }
      
      logInfo(`Claiming rewards for ${claimableCount} activities`);
      
      // Submit claim transaction
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'claimRewards',
        args: [],
        account: this.account
      });
      
      logInfo('Rewards claimed successfully:', hash);
      return hash;
    } catch (error) {
      logError('Failed to claim rewards:', error);
      throw error;
    }
  }
  
  /**
   * Register a new bike
   * @param model Bike model name
   * @param efficiency Efficiency factor (100 = 100%, range: 1-200)
   * @returns Transaction hash if successful
   */
  async registerBike(model: string, efficiency: number): Promise<string | null> {
    try {
      // Ensure wallet is connected
      if (!this.walletClient || !this.account) {
        logWarn('Wallet not connected. Call connectWallet() first.');
        throw new Error('Wallet not connected');
      }
      
      // Validate input
      if (!model || model.trim() === '') {
        throw new Error('Model name cannot be empty');
      }
      
      if (efficiency < 1 || efficiency > 200) {
        throw new Error('Efficiency must be between 1 and 200');
      }
      
      logInfo('Registering new bike:', { model, efficiency });
      
      // Submit transaction to register bike
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'registerBike',
        args: [model, BigInt(efficiency)],
        account: this.account
      });
      
      logInfo('Bike registered successfully:', hash);
      return hash;
    } catch (error) {
      logError('Failed to register bike:', error);
      throw error;
    }
  }
  
  /**
   * Toggle the active status of a bike
   * @param bikeIndex Index of the bike to toggle
   * @returns Transaction hash if successful
   */
  async toggleBikeStatus(bikeIndex: number): Promise<string | null> {
    try {
      // Ensure wallet is connected
      if (!this.walletClient || !this.account) {
        logWarn('Wallet not connected. Call connectWallet() first.');
        throw new Error('Wallet not connected');
      }
      
      logInfo(`Toggling status of bike at index ${bikeIndex}`);
      
      // Submit transaction to toggle bike status
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'toggleBikeStatus',
        args: [BigInt(bikeIndex)],
        account: this.account
      });
      
      logInfo('Bike status toggled successfully:', hash);
      return hash;
    } catch (error) {
      logError('Failed to toggle bike status:', error);
      throw error;
    }
  }
  
  /**
   * Check if a user has an active bike
   * @param userAddress Address of the user, defaults to connected account
   * @returns True if user has an active bike
   */
  async hasActiveBike(userAddress?: string): Promise<boolean> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return false;
      }
      
      // Get all bikes and check if any are active
      const bikes = await this.getUserBikes(address);
      return bikes.some(bike => bike.active);
    } catch (error) {
      logError('Error checking for active bike:', error);
      return false;
    }
  }
  
  /**
   * Get user bikes
   * @param userAddress Address of the user, defaults to connected account
   * @returns Array of bike data
   */
  async getUserBikes(userAddress?: string): Promise<Array<{
    nftId: bigint;
    model: string;
    efficiency: bigint;
    active: boolean;
    totalDistance: bigint;
  }>> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return [];
      }
      
      // Get bike count
      const bikeCount = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'getBikeCount',
        args: [address as `0x${string}`]
      });
      
      // Get bike details for each bike
      const bikes = [];
      for (let i = 0; i < Number(bikeCount); i++) {
        const bike = await this.publicClient.readContract({
          address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
          abi: fixieRunABI,
          functionName: 'getBikeDetails',
          args: [address as `0x${string}`, BigInt(i)]
        });
        bikes.push(bike);
      }
      
      return bikes;
    } catch (error) {
      logError('Error getting user bikes:', error);
      return [];
    }
  }
  
  /**
   * Get the active bike for a user
   * @param userAddress Address of the user, defaults to connected account
   * @returns Active bike data or null if no active bike
   */
  async getActiveBike(userAddress?: string): Promise<{
    nftId: bigint;
    model: string;
    efficiency: bigint;
    active: boolean;
    totalDistance: bigint;
  } | null> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return null;
      }
      
      // Get active bike
      try {
        const activeBike = await this.publicClient.readContract({
          address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
          abi: fixieRunABI,
          functionName: 'getActiveBike',
          args: [address as `0x${string}`]
        });
        
        return activeBike;
      } catch (error) {
        // Function will revert if no active bike
        return null;
      }
    } catch (error) {
      logError('Error getting active bike:', error);
      return null;
    }
  }
  
  /**
   * Get user activities
   * @param userAddress Address of the user, defaults to connected account
   * @returns Array of activity data
   */
  async getUserActivities(userAddress?: string): Promise<Array<{
    timestamp: bigint;
    distance: bigint;
    duration: bigint;
    calories: bigint;
    validated: boolean;
    activityType: string;
    tokenReward: bigint;
  }>> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return [];
      }
      
      // Get activity count
      const activityCount = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'getActivityCount',
        args: [address as `0x${string}`]
      });
      
      // Get activity details for each activity
      const activities = [];
      for (let i = 0; i < Number(activityCount); i++) {
        const activity = await this.publicClient.readContract({
          address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
          abi: fixieRunABI,
          functionName: 'getActivityDetails',
          args: [address as `0x${string}`, BigInt(i)]
        });
        activities.push(activity);
      }
      
      return activities;
    } catch (error) {
      logError('Error getting user activities:', error);
      return [];
    }
  }
  
  /**
   * Get the number of activities that can be claimed for rewards
   * @param userAddress Address of the user, defaults to connected account
   * @returns Number of claimable activities
   */
  async getClaimableActivityCount(userAddress?: string): Promise<number> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return 0;
      }
      
      // Get claimable activity count
      const count = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'getClaimableActivityCount',
        args: [address as `0x${string}`]
      });
      
      return Number(count);
    } catch (error) {
      logError('Error getting claimable activity count:', error);
      return 0;
    }
  }
  
  /**
   * Get the total unclaimed rewards for a user
   * @param userAddress Address of the user, defaults to connected account
   * @returns Total unclaimed rewards (as a BigInt)
   */
  async getTotalUnclaimedRewards(userAddress?: string): Promise<bigint> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return BigInt(0);
      }
      
      // Get total unclaimed rewards
      const rewards = await this.publicClient.readContract({
        address: CONTRACT_ADDRESSES.FixieRun as `0x${string}`,
        abi: fixieRunABI,
        functionName: 'getTotalUnclaimedRewards',
        args: [address as `0x${string}`]
      });
      
      return rewards as bigint;
    } catch (error) {
      logError('Error getting total unclaimed rewards:', error);
      return BigInt(0);
    }
  }
  
  /**
   * Get the token balance for a user
   * @param userAddress Address of the user, defaults to connected account
   * @returns Token balance formatted as a string with 18 decimal places
   */
  async getTokenBalance(userAddress?: string): Promise<string> {
    try {
      const address = userAddress || this.account?.address;
      if (!address) {
        logWarn('No address provided and wallet not connected');
        return '0';
      }
      
      // Get token balance
      const balance = await this.publicClient.readContract({

