import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  fontSize,
  fontWeight
} from '../theme';

interface TokenCounterProps {
  tokens: number;
  recentReward: number;
}

const TokenCounter: React.FC<TokenCounterProps> = ({ tokens, recentReward }) => {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>Tokens</Text>
      <Text style={styles.metricValue}>{tokens}</Text>
      <Text style={styles.metricUnit}>$FIXIE</Text>
      
      {recentReward > 0 && (
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardBadgeText}>+{recentReward}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    position: 'relative',
  },
  metricLabel: {
    ...typography.caption,
    color: semanticColors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h4,
  },
  metricUnit: {
    ...typography.caption,
    color: semanticColors.textSecondary,
  },
  rewardBadge: {
    position: 'absolute',
    top: -spacing.sm,
    right: 0,
    backgroundColor: colors.success,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs / 2,
  },
  rewardBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});

export default TokenCounter;

