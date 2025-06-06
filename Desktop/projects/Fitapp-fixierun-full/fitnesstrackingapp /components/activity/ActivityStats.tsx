import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function ActivityStats() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            145.2 km
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            This Month
          </Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            12,845
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            Calories Burned
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
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
    marginHorizontal: 16,
  },
});