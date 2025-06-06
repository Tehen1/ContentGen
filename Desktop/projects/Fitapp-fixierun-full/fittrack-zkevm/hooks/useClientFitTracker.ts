import { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
import { 
  Workout, 
  StepRecord, 
  Achievement,
  FitTrackerHookReturn,
  Transaction,
  ZKActivityProof,
  VerificationResult,
  Reward
} from '../types';

// Define a default empty state that's safe to use during SSR
const defaultFitTrackerState: FitTrackerHookReturn = {
  contractState: {
    address: '',
    isInitialized: false,
    totalWorkouts: 0,
    totalUsers: 0,
    totalRewards: 0,
    ownerAddress: ''
  },
  isLoading: false,
  error: null,
  
  // Workout functions
  addWorkout: async () => ({ 
    hash: '', 
    from: '', 
    to: '', 
    value: BigNumber.from(0), 
    gasPrice: BigNumber.from(0), 
    gasLimit: BigNumber.from(0), 
    nonce: 0, 
    timestamp: 0, 
    status: 'pending' 
  }),
  getWorkouts: async () => [],
  verifyWorkout: async () => ({ success: false }),
  
  // Step tracking functions
  recordSteps: async () => ({ 
    hash: '', 
    from: '', 
    to: '', 
    value: BigNumber.from(0), 
    gasPrice: BigNumber.from(0), 
    gasLimit: BigNumber.from(0), 
    nonce: 0, 
    timestamp: 0, 
    status: 'pending' 
  }),
  getStepRecords: async () => [],
  
  // Achievement functions
  getAchievements: async () => [],
  claimAchievement: async () => ({ 
    hash: '', 
    from: '', 
    to: '', 
    value: BigNumber.from(0), 
    gasPrice: BigNumber.from(0), 
    gasLimit: BigNumber.from(0), 
    nonce: 0, 
    timestamp: 0, 
    status: 'pending' 
  }),
  
  // Reward functions
  getRewards: async () => [],
  claimReward: async () => ({ 
    hash: '', 
    from: '', 
    to: '', 
    value: BigNumber.from(0), 
    gasPrice: BigNumber.from(0), 
    gasLimit: BigNumber.from(0), 
    nonce: 0, 
    timestamp: 0, 
    status: 'pending' 
  }),
  
  // Utility functions
  refreshData: async () => {},
  isUserAuthorized: async () => false
};

export const useClientFitTracker = (): FitTrackerHookReturn => {
  // Start with safe default values for SSR
  const [fitTrackerState, setFitTrackerState] = useState<FitTrackerHookReturn>(defaultFitTrackerState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Dynamic import of the actual hook to ensure it only runs on the client
    const loadFitTracker = async () => {
      try {
        // Dynamically import the hook only on the client side
        const { useFitTracker } = await import('./useFitTracker');
        
        // Since we can't use hooks inside useEffect directly,
        // we'll create a small component to use the hook and get its state
        const { 
          contractState,
          isLoading,
          error,
          addWorkout,
          getWorkouts,
          verifyWorkout,
          recordSteps,
          getStepRecords,
          getAchievements,
          claimAchievement,
          getRewards,
          claimReward,
          refreshData,
          isUserAuthorized
        } = useFitTracker();

        // Update our state with the values from the real hook
        setFitTrackerState({
          contractState,
          isLoading,
          error,
          addWorkout,
          getWorkouts,
          verifyWorkout,
          recordSteps,
          getStepRecords,
          getAchievements,
          claimAchievement,
          getRewards,
          claimReward,
          refreshData,
          isUserAuthorized
        });
      } catch (error) {
        console.error('Failed to load FitTracker hook:', error);
        setFitTrackerState({
          ...defaultFitTrackerState,
          error: error instanceof Error ? error.message : 'Failed to load FitTracker hook'
        });
      }
    };

    if (typeof window !== 'undefined') {
      loadFitTracker();
    }

    return () => {
      setIsMounted(false);
    };
  }, []);

  return fitTrackerState;
};

export default useClientFitTracker;

