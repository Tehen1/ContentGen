import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIntegration } from '../../utils/blockchain/activityIntegration';
import { logInfo, logError, logWarn } from '../../utils/logging';

// Types for component state
interface Activity {
  id: string;
  date: string;
  distance: number;
  duration: number;
  calories: number;
  status: 'pending' | 'processing' | 'validated' | 'claimed' | 'failed';
  errorMessage?: string;
}

interface BikeInfo {
  id: string;
  model: string;
  efficiency: number;
  active: boolean;
  distance: string;
}

interface TokenInfo {
  balance: string;
  pendingRewards: string;
  rewardRate: string;
}

/**
 * ActivityDataSync Component
 * 
 * This component demonstrates the complete workflow to sync Google Health data
 * with the FixieRun smart contract system:
 * 
 * 1. Connect to Google Health API
 * 2. Fetch activity data
 * 3. Process and validate activities
 * 4. Submit to blockchain
 * 5. Claim rewards
 */
const ActivityDataSync: React.FC = () => {
  // State for Google Auth
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  
  // State for Ethereum Wallet
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // State for activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // State for bikes
  const [bikes, setBikes] = useState<BikeInfo[]>([]);
  const [isLoadingBikes, setIsLoadingBikes] = useState(false);
  const [hasActiveBike, setHasActiveBike] = useState(false);
  
  // State for tokens
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    balance: '0',
    pendingRewards: '0',
    rewardRate: '0'
  });
  
  // Form state for new bike registration
  const [newBikeModel, setNewBikeModel] = useState('');
  const [newBikeEfficiency, setNewBikeEfficiency] = useState(100);
  
  // Loading and transaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // Create ActivityIntegration instance
  const [integration] = useState(() => new ActivityIntegration());
  
  /**
   * Connect wallet using ActivityIntegration
   */
  const connectWallet = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const address = await integration.connectWallet();
      
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
        
        // Load user's blockchain data
        await loadUserBikes(address);
        // Additional data loading can be added here
      }
    } catch (error) {
      logError('Failed to connect wallet:', error);
      setWalletAddress(null);
      setIsWalletConnected(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [integration]);
  
  /**
   * Connect to Google Health API
   * Note: This is a simplified version. In a real app, you would use OAuth2 flow.
   */
  const connectGoogleHealth = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Simulate Google OAuth flow
      // In a real app, this would redirect to Google's OAuth page
      setTimeout(() => {
        // Mock token - in real implementation, this would come from OAuth callback
        const mockToken = 'google_oauth_token_' + Math.random().toString(36).substring(2, 15);
        setGoogleToken(mockToken);
        setIsGoogleAuthorized(true);
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      logError('Google Health API connection failed:', error);
      setIsSubmitting(false);
      setFetchError('Failed to connect to Google Health API');
    }
  }, []);
  
  /**
   * Fetch activities from Google Health API
   */
  const fetchActivities = useCallback(async () => {
    try {
      if (!googleToken) {
        setFetchError('Google token is missing. Please connect Google Health first.');
        return;
      }
      
      setIsLoadingActivities(true);
      setFetchError(null);
      
      // In a real implementation, this would use the actual token and API
      // Here we're creating mock data for demonstration
      const mockActivities = Array.from({ length: 3 }, (_, i) => {
        const days = i * 2;
        const date = new Date();
        date.setDate(date.getDate() - days);
        
        return {
          id: `activity-${i}`,
          date: date.toISOString(),
          distance: 5000 + Math.random() * 10000, // 5-15km in meters
          duration: 1200 + Math.random() * 3600, // 20-80 minutes in seconds
          calories: 200 + Math.random() * 500, // 200-700 calories
          status: 'pending' as const
        };
      });
      
      setActivities(mockActivities);
      logInfo('Fetched activities:', mockActivities);
      
    } catch (error) {
      logError('Error fetching activities:', error);
      setFetchError('Failed to fetch activities from Google Health API');
    } finally {
      setIsLoadingActivities(false);
    }
  }, [googleToken]);
  
  /**
   * Process and validate activities
   */
  const validateActivityData = useCallback((activity: Activity) => {
    // Check minimum requirements (similar to what's in ActivityIntegration)
    if (activity.distance < 100) {
      return { 
        isValid: false, 
        message: 'Distance is too short (minimum 100m)' 
      };
    }
    
    if (activity.duration < 60) {
      return { 
        isValid: false, 
        message: 'Duration is too short (minimum 60s)' 
      };
    }
    
    if (activity.calories <= 0) {
      return { 
        isValid: false, 
        message: 'Calories must be positive' 
      };
    }
    
    // Check for realistic speed
    const speedKmh = (activity.distance / 1000) / (activity.duration / 3600);
    if (speedKmh < 5 || speedKmh > 50) {
      return { 
        isValid: false, 
        message: `Unrealistic speed: ${speedKmh.toFixed(2)} km/h (expected: 5-50 km/h)` 
      };
    }
    
    return { isValid: true };
  }, []);
  
  /**
   * Submit activity to blockchain
   */
  const submitActivity = useCallback(async (activityIndex: number) => {
    try {
      if (!isWalletConnected) {
        throw new Error('Wallet not connected');
      }
      
      if (!hasActiveBike) {
        throw new Error('No active bike. Please register or activate a bike first.');
      }
      
      const activity = activities[activityIndex];
      if (!activity) return;
      
      // Update activity status
      setActivities(prev => {
        const updated = [...prev];
        updated[activityIndex] = {
          ...updated[activityIndex],
          status: 'processing'
        };
        return updated;
      });
      
      setIsSubmitting(true);
      
      // Validate activity
      const validationResult = validateActivityData(activity);
      if (!validationResult.isValid) {
        throw new Error(validationResult.message);
      }
      
      // Prepare activity data
      const processedActivity = {
        timestamp: Math.floor(new Date(activity.date).getTime() / 1000),
        distance: Math.round(activity.distance),
        duration: Math.round(activity.duration),
        calories: Math.round(activity.calories),
        activityType: 'cycling',
        valid: true
      };
      
      // Submit to blockchain
      const hash = await integration.submitActivity(processedActivity);
      setTransactionHash(hash);
      
      // Update activity status on success
      setActivities(prev => {
        const updated = [...prev];
        updated[activityIndex] = {
          ...updated[activityIndex],
          status: 'validated'
        };
        return updated;
      });
      
      logInfo('Activity submitted successfully:', hash);
      
      // Refresh token info to show updated pending rewards
      await loadTokenInfo();
      
    } catch (error) {
      logError('Failed to submit activity:', error);
      
      // Update activity status on failure
      setActivities(prev => {
        const updated = [...prev];
        updated[activityIndex] = {
          ...updated[activityIndex],
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
        return updated;
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [activities, hasActiveBike, integration, isWalletConnected, loadTokenInfo, validateActivityData]);
  
  /**
   * Claim rewards for validated activities
   */
  const claimRewards = useCallback(async () => {
    try {
      if (!isWalletConnected) {
        throw new Error('Wallet not connected');
      }
      
      setIsClaiming(true);
      
      // Get claimable count before claiming
      const claimableCount = await integration.getClaimableActivityCount();
      if (claimableCount === 0) {
        throw new Error('No rewards to claim');
      }
      
      // Claim rewards
      const hash = await integration.claimRewards();
      setTransactionHash(hash);
      
      // Update all validated activities to claimed
      setActivities(prev => 
        prev.map(activity => 
          activity.status === 'validated' 
            ? { ...activity, status: 'claimed' } 
            : activity
        )
      );
      
      // Refresh token info
      await loadTokenInfo();
      
      logInfo('Rewards claimed successfully:', hash);
    } catch (error) {
      logError('Failed to claim rewards:', error);
      alert(`Failed to claim rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClaiming(false);
    }
  }, [integration, isWalletConnected, loadTokenInfo]);
  
  /**
   * Register a new bike
   */
  const registerBike = useCallback(async () => {
    try {
      if (!isWalletConnected) {
        throw new Error('Wallet not connected');
      }
      
      if (!newBikeModel.trim()) {
        throw new Error('Please enter a bike model name');
      }
      
      setIsRegistering(true);
      
      // Register bike
      const hash = await integration.registerBike(
        newBikeModel,
        newBikeEfficiency
      );
      
      setTransactionHash(hash);
      
      // Clear form
      setNewBikeModel('');
      setNewBikeEfficiency(100);
      
      // Refresh bikes
      await loadUserBikes(walletAddress!);
      
      logInfo('Bike registered successfully:', hash);
    } catch (error) {
      logError('Failed to register bike:', error);
      alert(`Failed to register bike: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegistering(false);
    }
  }, [integration, isWalletConnected, loadUserBikes, newBikeEfficiency, newBikeModel, walletAddress]);
  
  /**
   * Toggle bike active status
   */
  const toggleBike = useCallback(async (bikeIndex: number) => {
    try {
      if (!isWalletConnected) {
        throw new Error('Wallet not connected');
      }
      
      setIsSubmitting(true);
      
      // Toggle bike status
      const hash = await integration.toggleBikeStatus(bikeIndex);
      setTransactionHash(hash);
      
      // Refresh bikes
      await loadUserBikes(walletAddress!);
      
      logInfo('Bike status toggled successfully:', hash);
    } catch (error) {
      logError('Failed to toggle bike status:', error);
      alert(`Failed to toggle bike: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [integration, isWalletConnected, loadUserBikes, walletAddress]);
  
  /**
   * Load user's bikes from blockchain
   */
  async function loadUserBikes(address: string) {
    try {
      setIsLoadingBikes(true);
      
      // Get bikes
      const userBikes = await integration.getUserBikes(address);
      
      // Transform to component state format
      const formattedBikes: BikeInfo[] = userBikes.map((bike, index) => ({
        id: `bike-${index}`,
        model: bike.model,
        efficiency: Number(bike.efficiency),
        active: bike.active,
        distance: `${(Number(bike.totalDistance) / 1000).toFixed(2)} km`
      }));
      
      setBikes(formattedBikes);
      
      // Check if user has an active bike
      const hasActive = await integration.hasActiveBike(address);
      setHasActiveBike(hasActive);
      
      logInfo('Loaded user bikes:', formattedBikes);
    } catch (error) {
      logError('Failed to load bikes:', error);
    } finally {
      setIsLoadingBikes(false);
    }
  }
  
  /**
   * Load token information
   */
  async function loadTokenInfo() {
    try {
      if (!walletAddress) return;
      
      // Get token balance
      const balance = await integration.getTokenBalance(walletAddress);
      
      // Get unclaimed rewards
      const pendingRewards = await integration.getTotalUnclaimedRewards(walletAddress);
      
      // Format values for display
      const formattedBalance = formatTokenAmount(balance);
      const formattedRewards = formatTokenAmount(pendingRewards.toString());
      
      setTokenInfo({
        balance: formattedBalance,
        pendingRewards: formattedRewards,
        rewardRate: '10 FIXIE per km' //

