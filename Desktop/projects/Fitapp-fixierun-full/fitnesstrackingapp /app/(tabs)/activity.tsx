import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/ui/Header';
import ActivityListItem from '@/components/activity/ActivityListItem';
import ActivityFilterBar from '@/components/activity/ActivityFilterBar';
import ActivityStats from '@/components/activity/ActivityStats';
import { useActivity } from '@/hooks/useActivity';

export default function ActivityScreen() {
  const { colors } = useTheme();
  const { allActivities } = useActivity();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredActivities = activeFilter === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type.toLowerCase() === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Activity" />
      
      <ActivityStats />
      
      <ActivityFilterBar 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      
      <FlatList
        data={filteredActivities}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ActivityListItem activity={item} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No activities found
            </Text>
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.startButtonText, { color: colors.white }]}>
                Start a new activity
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 16,
  },
  startButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});