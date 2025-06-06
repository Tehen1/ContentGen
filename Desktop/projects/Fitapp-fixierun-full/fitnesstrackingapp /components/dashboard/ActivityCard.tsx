import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Sun as Run, Bike, Scaling as Walking } from 'lucide-react-native';

interface ActivityCardProps {
  type: string;
  distance: number;
  duration: string;
  date: string;
}

export default function ActivityCard({ type, distance, duration, date }: ActivityCardProps) {
  const { colors } = useTheme();

  const getActivityIcon = () => {
    switch (type.toLowerCase()) {
      case 'running':
        return <Run size={20} color={colors.primary} />;
      case 'cycling':
        return <Bike size={20} color={colors.primary} />;
      case 'walking':
      default:
        return <Walking size={20} color={colors.primary} />;
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        {getActivityIcon()}
      </View>
      
      <Text style={[styles.type, { color: colors.text }]}>
        {type}
      </Text>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {distance} km
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            Distance
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {duration}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
            Duration
          </Text>
        </View>
      </View>
      
      <Text style={[styles.date, { color: colors.secondaryText }]}>
        {date}
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  type: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});