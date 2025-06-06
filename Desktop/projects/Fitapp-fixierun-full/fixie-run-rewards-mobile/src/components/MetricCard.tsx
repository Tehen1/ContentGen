import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  semanticColors,
  typography,
  spacing
} from '../theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit }) => {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
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
  metricUnit: {
    ...typography.caption,
    color: semanticColors.textSecondary,
  },
  metricValue: {
    ...typography.h4,
  },
});

export default MetricCard;

