import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocationTracking } from '../hooks/useLocationTracking';

// Import component files
import ActivityMode from '../components/ActivityMode';
import MetricCard from '../components/MetricCard';
import TokenCounter from '../components/TokenCounter';
import ActivityControls from '../components/ActivityControls';
import RewardIndicator from '../components/RewardIndicator';
import AchievementCard from '../components/AchievementCard';

// Import formatters
import { formatDistance, formatSpeed, formatDuration } from '../utils/formatters';

// Import services and utilities
import { 
  calculateTokens, 
  getNextRewardDistance, 
  calculateAchievementProgress,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_USER_STATS,
  Activity,
  Achievement,
  UserStats,
  updateUserStats
} from '../services/activityService';
import {
  loadTokens,
  saveTokens,
  loadAchievements,
  saveAchievements,
  loadUserStats,
  saveUserStats
} from '../utils/storage';

// Define types for navigation props
type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};
// Default achievements and utility functions are now imported from activityService

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [mode, setMode] = useState<'run' | 'bike'>('run');
  const [tokens, setTokens] = useState(0);
  const [recentReward, setRecentReward] = useState(0);
  const [nextRewardDistance, setNextRewardDistance] = useState(5.0);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardModalData, setRewardModalData] = useState({ tokens: 0, distance: 0 });
  
  // Use the location tracking hook
  const {
    isTracking,
    hasPermission,
    distance,
    speed,
    duration,
    startTracking,
    stopTracking,
    resetTracking
  } = useLocationTracking();
  
  // Load user data from storage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Load tokens, achievements, and user stats from storage
        const storedTokens = await loadTokens();
        const storedAchievements = await loadAchievements();
        const storedUserStats = await loadUserStats();
        
        setTokens(storedTokens);
        setAchievements(storedAchievements);
        setUserStats(storedUserStats);
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load your saved data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Update next reward distance when current distance changes
  useEffect(() => {
    if (isTracking) {
      setNextRewardDistance(getNextRewardDistance(distance));
    }
  }, [distance, isTracking]);
  
  // No need for a separate location permission check since it's handled by the hook
  
  
  const handleStart = async () => {
    const success = await startTracking();
    if (success) {
      Alert.alert('Started Tracking', `${mode === 'run' ? 'Run' : 'Bike ride'} started!`);
    }
  };
  const handleFinish = async () => {
    try {
      const result = stopTracking();
      
      // Create activity object
      const activity: Activity = {
        type: mode,
        distance: result.distance,
        averageSpeed: result.averageSpeed,
        duration: result.duration,
        completed: true
      };
      
      // Calculate tokens earned
      const newTokens = calculateTokens(result.distance, mode);
      const updatedTokens = tokens + newTokens;
      
      if (newTokens > 0) {
        setTokens(updatedTokens);
        setRecentReward(newTokens);
        
        // Show reward alert
        Alert.alert(
          'Reward Earned!',
          `You earned ${newTokens} $FIXIE tokens for your ${result.distance.toFixed(2)} km ${mode}!`
        );
        
        // Save tokens to storage
        await saveTokens(updatedTokens);
      }
      
      // Update and save achievements
      const updatedAchievements = calculateAchievementProgress(achievements, activity);
      setAchievements(updatedAchievements);
      await saveAchievements(updatedAchievements);
      
      // Update and save user stats
      const updatedStats = updateUserStats(userStats, activity, newTokens);
      setUserStats(updatedStats);
      await saveUserStats(updatedStats);
      
      // Reset for next activity
      resetTracking();
    } catch (error) {
      console.error('Error finishing activity:', error);
      Alert.alert('Error', 'Failed to save your activity data.');
      resetTracking();
    }
  };
  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading your data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Handle navigation to profile screen
  const handleNavigateToProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>FixieRun</Text>
            <Text style={styles.subtitle}>Earn $FIXIE Tokens While Running</Text>
            <Text style={styles.duration}>{formatDuration(duration)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={handleNavigateToProfile}
          >
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityCard}>
          <ActivityMode 
            mode={mode} 
            setMode={setMode} 
            disabled={isTracking}
          />
          
          <View style={styles.metricsContainer}>
            <MetricCard 
              label="Distance" 
              value={formatDistance(distance)} 
              unit="km" 
            />
            <MetricCard 
              label="Speed" 
              value={formatSpeed(speed)} 
              unit="km/h" 
            />
            <TokenCounter 
              tokens={tokens} 
              recentReward={recentReward} 
            />
          </View>
          
          <ActivityControls 
            isTracking={isTracking} 
            onStart={handleStart} 
            onFinish={handleFinish} 
          />
          
          <RewardIndicator 
            currentDistance={distance} 
            nextRewardDistance={nextRewardDistance} 
          />
        </View>
        
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  achievementsList: {
    gap: 12,
  },
  achievementsSection: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  duration: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    flex: 1,
  },
  headerContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default HomeScreen;
