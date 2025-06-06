import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/ui/Header';
import StatsCard from '@/components/profile/StatsCard';
import AchievementCard from '@/components/profile/AchievementCard';
import TokenBalance from '@/components/profile/TokenBalance';
import NftCollection from '@/components/profile/NftCollection';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Award, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('stats');

  const renderContent = () => {
    switch (activeSection) {
      case 'stats':
        return (
          <>
            <View style={styles.statsRow}>
              <StatsCard title="Total Distance" value="245.8 km" icon="route" />
              <StatsCard title="Total Time" value="32h 45m" icon="clock" />
            </View>
            <View style={styles.statsRow}>
              <StatsCard title="Avg. Pace" value="5:24 /km" icon="trending-up" />
              <StatsCard title="Calories" value="28,450" icon="flame" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Breakdown</Text>
            <View style={[styles.activityBreakdown, { backgroundColor: colors.card }]}>
              <View style={styles.activityType}>
                <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.activityText, { color: colors.text }]}>Running</Text>
                <Text style={[styles.activityPercentage, { color: colors.secondaryText }]}>45%</Text>
              </View>
              <View style={styles.activityType}>
                <View style={[styles.activityDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.activityText, { color: colors.text }]}>Cycling</Text>
                <Text style={[styles.activityPercentage, { color: colors.secondaryText }]}>30%</Text>
              </View>
              <View style={styles.activityType}>
                <View style={[styles.activityDot, { backgroundColor: colors.secondary }]} />
                <Text style={[styles.activityText, { color: colors.text }]}>Walking</Text>
                <Text style={[styles.activityPercentage, { color: colors.secondaryText }]}>25%</Text>
              </View>
            </View>
          </>
        );
      case 'achievements':
        return (
          <View style={styles.achievementsContainer}>
            <AchievementCard 
              title="Early Bird"
              description="Complete 5 workouts before 8am"
              progress={1}
              date="Achieved May 12"
              achieved
            />
            <AchievementCard 
              title="Marathon Ready"
              description="Run a total of 100km"
              progress={0.85}
              remaining="15km to go"
            />
            <AchievementCard 
              title="Cycling Pro"
              description="Cycle for 5 days in a row"
              progress={0.6}
              remaining="2 days to go"
            />
            <AchievementCard 
              title="Social Butterfly"
              description="Connect with 10 friends"
              progress={0.4}
              remaining="6 more friends"
            />
          </View>
        );
      case 'tokens':
        return (
          <>
            <TokenBalance />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>NFT Collection</Text>
            <NftCollection />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        right={
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' }}
            style={styles.profileImage}
          />
          <Text style={[styles.profileName, { color: colors.text }]}>
            Alex Johnson
          </Text>
          <Text style={[styles.profileUsername, { color: colors.secondaryText }]}>
            @alexjohnson
          </Text>
          
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={[styles.statValue, { color: colors.text }]}>Level 15</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Fitness Level</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.profileStat}>
              <Text style={[styles.statValue, { color: colors.text }]}>103</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.profileStat}>
              <Text style={[styles.statValue, { color: colors.text }]}>28</Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Achievements</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionTabs}>
          <TouchableOpacity 
            style={[
              styles.sectionTab, 
              activeSection === 'stats' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveSection('stats')}
          >
            <Text style={[
              styles.sectionTabText, 
              { color: activeSection === 'stats' ? colors.primary : colors.secondaryText }
            ]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.sectionTab, 
              activeSection === 'achievements' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveSection('achievements')}
          >
            <Text style={[
              styles.sectionTabText, 
              { color: activeSection === 'achievements' ? colors.primary : colors.secondaryText }
            ]}>
              Achievements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.sectionTab, 
              activeSection === 'tokens' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveSection('tokens')}
          >
            <Text style={[
              styles.sectionTabText, 
              { color: activeSection === 'tokens' ? colors.primary : colors.secondaryText }
            ]}>
              Tokens
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {renderContent()}
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={signOut}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Log Out
          </Text>
        </TouchableOpacity>
        
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
  },
  settingsButton: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  profileUsername: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  profileStat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 40,
  },
  sectionTabs: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sectionTabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  activityBreakdown: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  activityType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activityText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  activityPercentage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  achievementsContainer: {
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  spacer: {
    height: 80,
  },
});