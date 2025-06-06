import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ChevronRight } from 'lucide-react-native';

interface ChallengeItemProps {
  title: string;
  description: string;
  reward: string;
  progress: number;
  daysLeft?: number;
  completed?: boolean;
  sponsored?: string;
  icon: React.ReactNode;
}

export default function ChallengeItem({
  title,
  description,
  reward,
  progress,
  daysLeft,
  completed = false,
  sponsored,
  icon,
}: ChallengeItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderLeftColor: completed ? colors.success : colors.primary,
          borderLeftWidth: 4,
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconAndTitle}>
          {icon}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            {sponsored && (
              <View style={[styles.sponsorBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.sponsorText, { color: colors.accent }]}>
                  Sponsored by {sponsored}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={colors.muted} />
      </View>
      
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        {description}
      </Text>
      
      <View style={styles.rewardAndProgress}>
        <View style={styles.rewardContainer}>
          <Text style={[styles.rewardLabel, { color: colors.secondaryText }]}>
            Reward:
          </Text>
          <Text style={[styles.rewardValue, { color: colors.accent }]}>
            {reward}
          </Text>
        </View>
        
        {completed ? (
          <View style={[styles.completedBadge, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.completedText, { color: colors.success }]}>
              Completed
            </Text>
          </View>
        ) : (
          <Text style={[styles.daysLeft, { color: colors.secondaryText }]}>
            {daysLeft} days left
          </Text>
        )}
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: completed ? colors.success : colors.primary,
              width: `${progress * 100}%` 
            }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  sponsorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sponsorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  rewardAndProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
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
  daysLeft: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedText: {
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
});