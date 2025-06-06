import { useState, useEffect, useCallback } from 'react';
import { ethers, Contract } from 'ethers';
import { getZkEvmProvider, switchToZkEvmNetwork, isConnectedToZkEvm } from '../lib/zkEvmConfig';

// ABI is simplified version focused on the functions we need
// In a production environment, you would import a complete ABI from a build process
const FitTrackerABI = [
  // Workout functions
  "function addWorkout(string calldata workoutType, uint256 duration, uint256 caloriesBurned, string calldata metadata) external",
  "function getTotalWorkouts(address user) external view returns (uint256)",
  "function getWorkout(address user, uint256 workoutId) external view returns (tuple(uint256 id, uint256 timestamp, string workoutType, uint256 duration, uint256 caloriesBurned, string metadata))",
  
  // Step functions
  "function recordSteps(uint256 date, uint256 count, uint256 distance) external",
  "function addSteps(uint256 date, uint256 additionalSteps, uint256 additionalDistance) external",
  "function bulkRecordSteps(uint256[] calldata dates, uint256[] calldata stepCounts, uint256[] calldata distances) external",
  "function getStepRecord(address user, uint256 date) external view returns (tuple(uint256 date, uint256 count, uint256 distance))",
  
  // Achievement functions
  "function unlockAchievement(string calldata name, string calldata description) external",
  "function getAchievements(address user) external view returns (tuple(uint256 id, string name, string description, uint256 unlockedAt)[])",
  
  // App authorization
  "function setAppAuthorization(address app, bool authorized) external",
  "function isAppAuthorized(address user, address app) external view returns (bool)"
];

// Type definitions for contract return values
interface Workout {
  id: number;
  timestamp: number;
  workoutType: string;
  duration: number;
  caloriesBurned: number;
  metadata: string;
}

interface StepRecord {
  date: number;
  count: number;
  distance: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  unlockedAt: number;
}

interface UseFitTrackerProps {
  contractAddress?: string;
  autoConnect?: boolean;
}

interface FitTrackerHookResult {
  // Connection state
  isConnected: boolean;
  connect: () => Promise<boolean>;
  userAddress: string | null;
  error: Error | null;
  
  // Workout methods
  addWorkout: (workoutType: string, duration: number, caloriesBurned: number, metadata: string) => Promise<void>;
  getTotalWorkouts: (userAddress?: string) => Promise<number>;
  getWorkout: (workoutId: number, userAddress?: string) => Promise<Workout>;
  
  // Step methods
  recordSteps: (date: number, count: number, distance: number) => Promise<void>;
  addSteps: (date: number, additionalSteps: number, additionalDistance: number) => Promise<void>;
  bulkRecordSteps: (dates: number[], stepCounts: number[], distances: number[]) => Promise<void>;
  getStepRecord: (date: number, userAddress?: string) => Promise<StepRecord>;
  
  // Achievement methods
  unlockAchievement: (name: string, description: string) => Promise<void>;
  getAchievements: (userAddress?: string) => Promise<Achievement[]>;
  
  // App authorization methods
  authorizeApp: (appAddress: string, authorized: boolean) => Promise<void>;
  isAppAuthorized: (appAddress: string, userAddress?: string) => Promise<boolean>;
  
  // Loading state
  loading: boolean;
}

/**
 * React hook for interacting with the FitTrackerStorage smart contract on zkEVM
 * @param contractAddress The address of the deployed FitTrackerStorage contract
 * @param autoConnect Whether to automatically connect to the wallet
 * @returns Object containing methods to interact with the FitTracker contract
 */
export function useFitTracker({ 
  contractAddress,
  autoConnect = false 
}: UseFitTrackerProps = {}): FitTrackerHookResult {
  const [contract, setContract] = useState<Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to connect to the wallet and set up the contract
  const connect = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're on the right network
      if (!(await isConnectedToZkEvm())) {
        // Try to switch to zkEVM network
        const switched = await switchToZkEvmNetwork();
        if (!switched) {
          throw new Error('Failed to switch to zkEVM network');
        }
      }
      
      // Request account access
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet detected');
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const address = accounts[0];
      setUserAddress(address);
      
      if (!contractAddress) {
        throw new Error('FitTracker contract address not provided');
      }
      
      // Create a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance with the signer
      const fitTrackerContract = new ethers.Contract(
        contractAddress,
        FitTrackerABI,
        signer
      );
      
      setContract(fitTrackerContract);
      setIsConnected(true);
      return true;
    } catch (err: any) {
      console.error('Error connecting to FitTracker contract:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [contractAddress]);

  // Auto-connect on component mount if enabled
  useEffect(() => {
    if (autoConnect && window.ethereum) {
      connect();
    }
    
    // Set up event listeners for wallet changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setUserAddress(null);
        setIsConnected(false);
      } else if (accounts[0] !== userAddress) {
        // User switched accounts
        setUserAddress(accounts[0]);
      }
    };
    
    const handleChainChanged = () => {
      // When the chain changes, we need to refresh the page or reconnect
      window.location.reload();
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [autoConnect, connect, userAddress]);

  // Helper to ensure the contract is connected
  const ensureContract = async (): Promise<Contract> => {
    if (!contract) {
      const success = await connect();
      if (!success || !contract) {
        throw new Error('Not connected to FitTracker contract');
      }
    }
    return contract;
  };

  // Workout functions
  const addWorkout = async (
    workoutType: string, 
    duration: number, 
    caloriesBurned: number, 
    metadata: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const fitTracker = await ensureContract();
      const tx = await fitTracker.addWorkout(workoutType, duration, caloriesBurned, metadata);
      await tx.wait();
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalWorkouts = async (address?: string): Promise<number> => {
    try {
      const fitTracker = await ensureContract();
      const targetAddress = address || userAddress;
      if (!targetAddress) throw new Error('No user address provided');
      
      const result = await fitTracker.getTotalWorkouts(targetAddress);
      return Number(result);
    } catch (err: any) {
      console.error('Error getting total workouts:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    }
  };

  const getWorkout = async (workoutId: number, address?: string): Promise<Workout> => {
    try {
      const fitTracker = await ensureContract();
      const targetAddress = address || userAddress;
      if (!targetAddress) throw new Error('No user address provided');
      
      const result = await fitTracker.getWorkout(targetAddress, workoutId);
      
      // Convert the result to our Workout interface
      return {
        id: Number(result.id),
        timestamp: Number(result.timestamp),
        workoutType: result.workoutType,
        duration: Number(result.duration),
        caloriesBurned: Number(result.caloriesBurned),
        metadata: result.metadata
      };
    } catch (err: any) {
      console.error('Error getting workout:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    }
  };

  // Step functions
  const recordSteps = async (date: number, count: number, distance: number): Promise<void> => {
    setLoading(true);
    try {
      const fitTracker = await ensureContract();
      const tx = await fitTracker.recordSteps(date, count, distance);
      await tx.wait();
    } catch (err: any) {
      console.error('Error recording steps:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addSteps = async (date: number, additionalSteps: number, additionalDistance: number): Promise<void> => {
    setLoading(true);
    try {
      const fitTracker = await ensureContract();
      const tx = await fitTracker.addSteps(date, additionalSteps, additionalDistance);
      await tx.wait();
    } catch (err: any) {
      console.error('Error adding steps:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkRecordSteps = async (dates: number[], stepCounts: number[], distances: number[]): Promise<void> => {
    setLoading(true);
    try {
      const fitTracker = await ensureContract();
      const tx = await fitTracker.bulkRecordSteps(dates, stepCounts, distances);
      await tx.wait();
    } catch (err: any) {
      console.error('Error bulk recording steps:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStepRecord = async (date: number, address?: string): Promise<StepRecord> => {
    try {
      const fitTracker = await ensureContract();
      const targetAddress = address || userAddress;
      if (!targetAddress) throw new Error('No user address provided');
      
      const result = await fitTracker.getStepRecord(targetAddress, date);
      
      return {
        date: Number(result.date),
        count: Number(result.count),
        distance: Number(result.distance)
      };
    } catch (err: any) {
      console.error('Error getting step record:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    }
  };

  // Achievement functions
  const unlockAchievement = async (name: string, description: string): Promise<void> => {
    setLoading(true);
    try {
      const fitTracker = await ensureContract();
      const tx = await fitTracker.unlockAchievement(name, description);
      await tx.wait();
    } catch (err: any) {
      console.error('Error unlocking achievement:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAchievements = async (address?: string): Promise<Achievement[]> => {
    try {
      const fitTracker = await ensureContract();
      const targetAddress = address || userAddress;
      if (!targetAddress) throw new Error('No user address provided');
      
      const results = await fitTracker.getAchievements(targetAddress);
      
      return results.map((result: any) => ({
        id: Number(result.id),
        name: result.name,
        description: result.description,
        unlockedAt: Number(result.unlockedAt)
      }));
    } catch (err: any) {
      console.error('Error getting achievements:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    }
  };

  // App authorization methods
  const authorizeApp = async (appAddress: string, authorized: boolean): Promise<void> => {
    setLoading(true);
    try {
      const fitTracker = await ensureContract();
      const tx = await fitTracker.setAppAuthorization(appAddress, authorized);
      await tx.wait();
    } catch (err: any) {
      console.error('Error setting app authorization:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAppAuthorized = async (appAddress: string, address?: string): Promise<boolean> => {
    try {
      const fitTracker = await ensureContract();
      const targetAddress = address || userAddress;
      if (!targetAddress) throw new Error('No user address provided');
      
      return fitTracker.isAppAuthorized(targetAddress, appAddress);
    } catch (err: any) {
      console.error('Error checking app authorization:', err);
      setError(

