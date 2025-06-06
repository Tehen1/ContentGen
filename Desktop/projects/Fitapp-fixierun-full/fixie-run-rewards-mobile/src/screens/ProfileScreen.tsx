import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loadUserStats } from '../utils/storage';
import { UserStats, DEFAULT_USER_STATS } from '../services/activityService';
import { formatDistance } from '../utils/formatters';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const stats = await loadUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
        Alert.alert('Error', 'Failed to load your statistics.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Track your progress and achievements</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalTokens}</Text>
            <Text style={styles.statLabel}>Total $FIXIE Tokens</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.totalActivities}</Text>
              <Text style={styles.statLabel}>Total Activities</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatDistance(userStats.totalRunDistance + userStats.totalBikeDistance)}</Text>
              <Text style={styles.statLabel}>Total Distance (km)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Activity Breakdown</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.runActivities}</Text>
              <Text style={styles.statLabel}>Runs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatDistance(userStats.totalRunDistance)}</Text>
              <Text style={styles.statLabel}>Run Distance (km)</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.bikeActivities}</Text>
              <Text style={styles.statLabel}>Bike Rides</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatDistance(userStats.totalBikeDistance)}</Text>
              <Text style={styles.statLabel}>Bike Distance (km)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statValue: {
    color: '#3B82F6',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 24,
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

export default ProfileScreen;

