import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/ui/Header';
import TabBar from '@/components/ui/TabBar';
import ChallengeItem from '@/components/challenges/ChallengeItem';
import { Award, Trophy, Banknote } from 'lucide-react-native';

export default function ChallengesScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'sponsored', label: 'Sponsored' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'active':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <ChallengeItem
              title="Daily 10K Steps"
              description="Complete 10,000 steps every day for 7 days"
              reward="50 FIT + Daily Streak NFT"
              progress={0.7}
              daysLeft={3}
              icon={<Award color={colors.primary} size={24} />}
            />
            <ChallengeItem
              title="Weekend Warrior"
              description="Complete 3 workouts this weekend"
              reward="75 FIT"
              progress={0.33}
              daysLeft={5}
              icon={<Trophy color={colors.primary} size={24} />}
            />
            <ChallengeItem
              title="Cycling Champion"
              description="Cycle 100km in a week"
              reward="150 FIT + Cycling Badge NFT"
              progress={0.45}
              daysLeft={4}
              icon={<Award color={colors.primary} size={24} />}
            />
          </ScrollView>
        );
      case 'completed':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <ChallengeItem
              title="Morning Routine"
              description="Complete a workout before 9am for 5 days"
              reward="30 FIT"
              progress={1}
              completed
              icon={<Trophy color={colors.success} size={24} />}
            />
            <ChallengeItem
              title="First 5K"
              description="Complete your first 5K run"
              reward="100 FIT + Runner NFT"
              progress={1}
              completed
              icon={<Award color={colors.success} size={24} />}
            />
          </ScrollView>
        );
      case 'sponsored':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <ChallengeItem
              title="Nike Running Challenge"
              description="Run 50km in Nike shoes this month"
              reward="300 FIT + Limited Edition NFT"
              progress={0.2}
              daysLeft={21}
              sponsored="Nike"
              icon={<Banknote color={colors.accent} size={24} />}
            />
            <ChallengeItem
              title="Adidas Training"
              description="Complete 15 strength training sessions"
              reward="250 FIT + Adidas Discount Code"
              progress={0.4}
              daysLeft={18}
              sponsored="Adidas"
              icon={<Banknote color={colors.accent} size={24} />}
            />
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Challenges" />
      
      <View style={styles.featuredContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/2827400/pexels-photo-2827400.jpeg' }}
          style={styles.featuredImage}
        />
        <View style={[styles.featuredContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.featuredTitle, { color: colors.text }]}>
            Global Running Challenge
          </Text>
          <Text style={[styles.featuredSubtitle, { color: colors.secondaryText }]}>
            Join 10,000+ runners worldwide
          </Text>
          <View style={styles.featuredReward}>
            <Text style={[styles.rewardText, { color: colors.accent }]}>
              500 FIT + Exclusive NFT
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.joinButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.joinButtonText, { color: colors.white }]}>
              Join Challenge
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TabBar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  featuredContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    height: 150,
    width: '100%',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  featuredReward: {
    marginBottom: 16,
  },
  rewardText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  joinButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});