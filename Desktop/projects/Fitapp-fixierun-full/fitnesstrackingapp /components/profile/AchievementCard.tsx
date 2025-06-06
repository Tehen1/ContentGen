import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Award, CircleCheck as CheckCircle } from 'lucide-react-native';

interface AchievementCardProps {
  title: string;
  description: string;
  progress: number;
  date?: string;
  remaining?: string;
  achieved?: boolean;
}

export default function AchievementCard({
  title,
  description,
  progress,
  date,
  remaining,
  achieved = false,
}: AchievementCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            {description}
          </Text>
        </View>
        
        <View style={[
          styles.iconContainer, 
          { backgroundColor: achieved ? colors.successLight : colors.primaryLight }
        ]}>
          {achieved ? (
            <CheckCircle size={20} color={colors.success} />
          ) : (
            <Award size={20} color={colors.primary} />
          )}
        </View>
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: achieved ? colors.success : colors.primary,
              width: `${progress * 100}%` 
            }
          ]} 
        />
      </View>
      
      {achieved ? (
        <Text style={[styles.dateText, { color: colors.success }]}>
          {date}
        </Text>
      ) : (
        <Text style={[styles.remainingText, { color: colors.secondaryText }]}>
          {remaining}
        </Text>
      )}
    </View>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'right',
  },
  remainingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'right',
  },
});