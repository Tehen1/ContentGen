import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Sun as Run, Bike, Scaling as Walking, ChevronRight } from 'lucide-react-native';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface Activity {
  id: string;
  type: string;
  distance: number;
  duration: string;
  date: Date;
  calories: number;
}

interface ActivityListItemProps {
  activity: Activity;
}

export default function ActivityListItem({ activity }: ActivityListItemProps) {
  const { colors } = useTheme();

  const getActivityIcon = () => {
    switch (activity.type.toLowerCase()) {
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
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            {activity.type}
          </Text>
          <Text style={[styles.date, { color: colors.secondaryText }]}>
            {formatDistanceToNow(activity.date)}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {activity.distance} km
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Distance
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {activity.duration}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Duration
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {activity.calories}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
              Calories
            </Text>
          </View>
        </View>
      </View>
      
      <ChevronRight size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 16,
  },
  statValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});