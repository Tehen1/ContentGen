import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius
} from '../theme';

interface RewardIndicatorProps {
  currentDistance: number;
  nextRewardDistance: number;
}

const RewardIndicator: React.FC<RewardIndicatorProps> = ({ 
  currentDistance, 
  nextRewardDistance 
}) => {
  // Calculate progress percentage (capped at 100%)
  const progress = Math.min((currentDistance / nextRewardDistance) * 100, 100);
  
  // Format values for display
  const currentFormatted = currentDistance.toFixed(2);
  const nextFormatted = nextRewardDistance.toFixed(1);
  
  return (
    <View style={styles.rewardIndicator}>
      <Text style={styles.rewardText}>
        Next reward at {nextFormatted} km ({currentFormatted}/{nextFormatted})
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rewardIndicator: {
    marginTop: spacing.sm,
  },
  rewardText: {
    ...typography.bodySmall,
    color: semanticColors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  progressBarContainer: {
    padding: spacing.xs / 2,
  },
  progressBar: {
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
});

export default RewardIndicator;

