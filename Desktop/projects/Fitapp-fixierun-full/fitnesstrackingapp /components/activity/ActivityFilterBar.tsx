import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ActivityFilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function ActivityFilterBar({ activeFilter, onFilterChange }: ActivityFilterBarProps) {
  const { colors } = useTheme();

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'running', label: 'Running' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'walking', label: 'Walking' },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            activeFilter === filter.id 
              ? { backgroundColor: colors.primary } 
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
          ]}
          onPress={() => onFilterChange(filter.id)}
        >
          <Text 
            style={[
              styles.filterText,
              { color: activeFilter === filter.id ? colors.white : colors.text }
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});