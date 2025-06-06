import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/ui/Header';
import TabBar from '@/components/ui/TabBar';
import FriendItem from '@/components/social/FriendItem';
import ActivityPost from '@/components/social/ActivityPost';
import LeaderboardItem from '@/components/social/LeaderboardItem';
import { Search } from 'lucide-react-native';

const SAMPLE_FRIENDS = [
  { id: '1', name: 'Emma Wilson', username: '@emmaw', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', level: 21 },
  { id: '2', name: 'Michael Johnson', username: '@mjohnson', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', level: 18 },
  { id: '3', name: 'Sophia Lee', username: '@sophial', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', level: 24 },
];

const SAMPLE_FEED = [
  { 
    id: '1', 
    user: { name: 'Emma Wilson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
    activity: { type: 'Running', distance: 5.2, duration: '28:45', image: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg' },
    likes: 24,
    comments: 5,
    timestamp: '2h ago'
  },
  { 
    id: '2', 
    user: { name: 'Michael Johnson', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
    activity: { type: 'Cycling', distance: 15.8, duration: '45:12', image: 'https://images.pexels.com/photos/5867453/pexels-photo-5867453.jpeg' },
    likes: 18,
    comments: 2,
    timestamp: '4h ago'
  },
];

export default function SocialScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('feed');

  const tabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'friends', label: 'Friends' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <FlatList
            data={SAMPLE_FEED}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ActivityPost post={item} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedContent}
          />
        );
      case 'friends':
        return (
          <View style={styles.friendsContainer}>
            <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
              <Search size={20} color={colors.secondaryText} />
              <Text style={[styles.searchPlaceholder, { color: colors.secondaryText }]}>
                Search friends...
              </Text>
            </View>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Friends
            </Text>
            
            {SAMPLE_FRIENDS.map(friend => (
              <FriendItem 
                key={friend.id}
                friend={friend}
              />
            ))}
            
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.addButtonText, { color: colors.white }]}>
                Find Friends
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 'leaderboard':
        return (
          <View style={styles.leaderboardContainer}>
            <View style={styles.weekSelector}>
              <TouchableOpacity>
                <Text style={[styles.weekSelectorText, { color: colors.text }]}>This Week</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.weekSelectorText, { color: colors.secondaryText }]}>All Time</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.topThree}>
              <View style={[styles.topThreeItem, styles.secondPlace]}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
                  style={styles.topThreeAvatar}
                />
                <View style={[styles.topThreeBadge, { backgroundColor: colors.silver }]}>
                  <Text style={styles.topThreeRank}>2</Text>
                </View>
                <Text style={[styles.topThreeName, { color: colors.text }]}>Michael</Text>
                <Text style={[styles.topThreePoints, { color: colors.secondaryText }]}>2,450 pts</Text>
              </View>
              
              <View style={[styles.topThreeItem, styles.firstPlace]}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }}
                  style={styles.topThreeAvatar}
                />
                <View style={[styles.topThreeBadge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.topThreeRank}>1</Text>
                </View>
                <Text style={[styles.topThreeName, { color: colors.text }]}>Sophia</Text>
                <Text style={[styles.topThreePoints, { color: colors.secondaryText }]}>3,120 pts</Text>
              </View>
              
              <View style={[styles.topThreeItem, styles.thirdPlace]}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }}
                  style={styles.topThreeAvatar}
                />
                <View style={[styles.topThreeBadge, { backgroundColor: colors.bronze }]}>
                  <Text style={styles.topThreeRank}>3</Text>
                </View>
                <Text style={[styles.topThreeName, { color: colors.text }]}>Emma</Text>
                <Text style={[styles.topThreePoints, { color: colors.secondaryText }]}>1,980 pts</Text>
              </View>
            </View>
            
            <View style={styles.leaderboardList}>
              <LeaderboardItem rank={4} name="James Wilson" points={1820} avatar="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" />
              <LeaderboardItem rank={5} name="Olivia Martinez" points={1760} avatar="https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg" />
              <LeaderboardItem rank={6} name="Daniel Lee" points={1640} avatar="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg" />
              <LeaderboardItem rank={7} name="Ava Johnson" points={1540} avatar="https://images.pexels.com/photos/1308885/pexels-photo-1308885.jpeg" />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Social" />
      
      <TabBar 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 80,
  },
  friendsContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  leaderboardContainer: {
    flex: 1,
    padding: 16,
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  weekSelectorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginHorizontal: 12,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  topThreeItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  firstPlace: {
    marginBottom: -20,
  },
  secondPlace: {},
  thirdPlace: {},
  topThreeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  topThreeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  topThreeRank: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 14,
  },
  topThreeName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  topThreePoints: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  leaderboardList: {
    marginTop: 16,
  },
});