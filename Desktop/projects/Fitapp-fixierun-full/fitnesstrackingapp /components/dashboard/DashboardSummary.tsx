import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Play } from 'lucide-react-native';

export default function DashboardSummary() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Today's Activity
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.badgeText, { color: colors.success }]}>
            +12% from last week
          </Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            3.5 km
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            Distance
          </Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            28:45
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            Duration
          </Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            8,452
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            Steps
          </Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressTextContainer}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            Daily Goal
          </Text>
          <Text style={[styles.progressValue, { color: colors.primary }]}>
            68%
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: '68%' 
              }
            ]} 
          />
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Play size={20} color={colors.white} />
        <Text style={[styles.buttonText, { color: colors.white }]}>
          Start Activity
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
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
  progressSection: {
    marginBottom: 24,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  progressValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
});