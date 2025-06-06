import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/ui/Header';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import ActivityCard from '@/components/dashboard/ActivityCard';
import RewardCard from '@/components/dashboard/RewardCard';
import ChallengeCard from '@/components/dashboard/ChallengeCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { useActivity } from '@/hooks/useActivity';

export default function Home() {
  const { colors } = useTheme();
  const { recentActivities } = useActivity();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Dashboard" showWallet />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <DashboardSummary />
        
        <SectionHeader title="Recent Activities" actionText="View All" actionRoute="activity" />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          {recentActivities.map((activity) => (
            <ActivityCard 
              key={activity.id}
              type={activity.type}
              distance={activity.distance}
              duration={activity.duration}
              date={formatDistanceToNow(activity.date)}
            />
          ))}
        </ScrollView>
        
        <SectionHeader title="Active Challenges" actionText="View All" actionRoute="challenges" />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          <ChallengeCard 
            title="10K Steps Daily"
            progress={0.7}
            reward="50 FIT"
            daysLeft={3}
          />
          <ChallengeCard 
            title="Weekly Cycling"
            progress={0.4}
            reward="100 FIT"
            daysLeft={5}
          />
          <ChallengeCard 
            title="Community Run"
            progress={0.2}
            reward="NFT Badge"
            daysLeft={10}
          />
        </ScrollView>
        
        <SectionHeader title="Rewards" actionText="View All" actionRoute="rewards" />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          <RewardCard 
            title="Daily Streak"
            description="7 days completed"
            tokenAmount="25 FIT"
          />
          <RewardCard 
            title="Level Up"
            description="Reached Level 5"
            tokenAmount="100 FIT"
          />
          <RewardCard 
            title="Top 10%"
            description="Last week's performance"
            tokenAmount="75 FIT"
          />
        </ScrollView>
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  horizontalList: {
    marginBottom: 24,
  },
  spacer: {
    height: 80,
  }
});