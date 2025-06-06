import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  colors, 
  semanticColors, 
  typography, 
  createCardStyle, 
  spacing, 
  borderRadius,
  fontSize,
  fontWeight
} from '../theme';
import { Achievement } from '../services/activityService';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  // Format progress as a percentage
  const progressPercent = Math.round(achievement.progress);
  
  return (
    <View style={[
      styles.card,
      achievement.completed ? styles.completedCard : null
    ]}>
      <View style={styles.achievementHeader}>
        <Text style={styles.titleText}>{achievement.title}</Text>
        <Text style={[
          styles.progressText,
          achievement.completed ? styles.completedText : null
        ]}>
          {progressPercent}%
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${achievement.progress}%` },
            achievement.completed ? styles.progressComplete : null
          ]} 
        />
      </View>
      
      <Text style={styles.description}>
        {achievement.description}
      </Text>
      
      {achievement.completed && (
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>COMPLETED</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...createCardStyle(),
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
  },
  completedCard: {
    borderLeftColor: colors.success,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleText: {
    ...typography.h4,
    color: colors.primary,
  },
  progressText: {
    ...typography.bodySmall,
    fontWeight: fontWeight.semibold,
  },
  completedText: {
    color: colors.success,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  description: {
    ...typography.bodySmall,
    color: semanticColors.textSecondary,
    marginBottom: spacing.sm,
  },
  rewardBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs/2,
  },
  rewardText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});

export default AchievementCard;

