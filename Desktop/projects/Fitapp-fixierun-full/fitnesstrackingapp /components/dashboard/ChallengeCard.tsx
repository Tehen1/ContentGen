import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ChallengeCardProps {
  title: string;
  progress: number;
  reward: string;
  daysLeft: number;
}

export default function ChallengeCard({ title, progress, reward, daysLeft }: ChallengeCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <View style={styles.rewardContainer}>
        <Text style={[styles.rewardLabel, { color: colors.secondaryText }]}>
          Reward:
        </Text>
        <Text style={[styles.rewardValue, { color: colors.accent }]}>
          {reward}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTextContainer}>
          <Text style={[styles.progressText, { color: colors.secondaryText }]}>
            Progress
          </Text>
          <Text style={[styles.progressPercentage, { color: colors.primary }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${progress * 100}%` 
              }
            ]} 
          />
        </View>
      </View>
      
      <Text style={[styles.daysLeft, { color: colors.secondaryText }]}>
        {daysLeft} days left
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    width: 200,
    marginRight: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rewardLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 4,
  },
  rewardValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  progressPercentage: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  daysLeft: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});