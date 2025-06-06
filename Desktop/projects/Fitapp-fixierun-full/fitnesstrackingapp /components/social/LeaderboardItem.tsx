import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface LeaderboardItemProps {
  rank: number;
  name: string;
  points: number;
  avatar: string;
}

export default function LeaderboardItem({ rank, name, points, avatar }: LeaderboardItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rank, { color: colors.text }]}>
        {rank}
      </Text>
      
      <Image 
        source={{ uri: avatar }}
        style={styles.avatar}
      />
      
      <Text style={[styles.name, { color: colors.text }]}>
        {name}
      </Text>
      
      <Text style={[styles.points, { color: colors.primary }]}>
        {points} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rank: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    width: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  points: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});