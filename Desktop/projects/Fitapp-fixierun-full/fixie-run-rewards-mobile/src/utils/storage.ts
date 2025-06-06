import * as SecureStore from 'expo-secure-store';
import { Achievement, DEFAULT_ACHIEVEMENTS, UserStats, DEFAULT_USER_STATS } from '../services/activityService';

// Storage keys
const STORAGE_KEYS = {
  TOKENS: 'fixie_tokens',
  ACHIEVEMENTS: 'fixie_achievements',
  USER_STATS: 'fixie_user_stats',
};

/**
 * Save tokens to secure storage
 * 
 * @param tokens Number of tokens to save
 * @returns Promise that resolves when tokens are saved
 */
export const saveTokens = async (tokens: number): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, tokens.toString());
  } catch (error) {
    console.error('Error saving tokens to secure storage:', error);
    throw error;
  }
};

/**
 * Load tokens from secure storage
 * 
 * @returns Promise that resolves with the number of tokens or 0 if not found
 */
export const loadTokens = async (): Promise<number> => {
  try {
    const tokensString = await SecureStore.getItemAsync(STORAGE_KEYS.TOKENS);
    if (!tokensString) {
      return 0;
    }
    return parseInt(tokensString, 10);
  } catch (error) {
    console.error('Error loading tokens from secure storage:', error);
    return 0;
  }
};

/**
 * Save achievements to secure storage
 * 
 * @param achievements Array of achievements to save
 * @returns Promise that resolves when achievements are saved
 */
export const saveAchievements = async (achievements: Achievement[]): Promise<void> => {
  try {
    const achievementsString = JSON.stringify(achievements);
    await SecureStore.setItemAsync(STORAGE_KEYS.ACHIEVEMENTS, achievementsString);
  } catch (error) {
    console.error('Error saving achievements to secure storage:', error);
    throw error;
  }
};

/**
 * Load achievements from secure storage
 * 
 * @returns Promise that resolves with the achievements array or default achievements if not found
 */
export const loadAchievements = async (): Promise<Achievement[]> => {
  try {
    const achievementsString = await SecureStore.getItemAsync(STORAGE_KEYS.ACHIEVEMENTS);
    if (!achievementsString) {
      return DEFAULT_ACHIEVEMENTS;
    }
    return JSON.parse(achievementsString) as Achievement[];
  } catch (error) {
    console.error('Error loading achievements from secure storage:', error);
    return DEFAULT_ACHIEVEMENTS;
  }
};

/**
 * Save user stats to secure storage
 * 
 * @param stats User stats object to save
 * @returns Promise that resolves when stats are saved
 */
export const saveUserStats = async (stats: UserStats): Promise<void> => {
  try {
    const statsString = JSON.stringify(stats);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_STATS, statsString);
  } catch (error) {
    console.error('Error saving user stats to secure storage:', error);
    throw error;
  }
};

/**
 * Load user stats from secure storage
 * 
 * @returns Promise that resolves with the user stats or default stats if not found
 */
export const loadUserStats = async (): Promise<UserStats> => {
  try {
    const statsString = await SecureStore.getItemAsync(STORAGE_KEYS.USER_STATS);
    if (!statsString) {
      return DEFAULT_USER_STATS;
    }
    return JSON.parse(statsString) as UserStats;
  } catch (error) {
    console.error('Error loading user stats from secure storage:', error);
    return DEFAULT_USER_STATS;
  }
};

/**
 * Clear all stored data (for logout or reset)
 * 
 * @returns Promise that resolves when all data is cleared
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKENS);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACHIEVEMENTS);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_STATS);
  } catch (error) {
    console.error('Error clearing data from secure storage:', error);
    throw error;
  }
};

