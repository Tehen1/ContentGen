import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Route, Clock, TrendingUp, Flame } from 'lucide-react-native';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  const { colors } = useTheme();

  const renderIcon = () => {
    switch (icon) {
      case 'route':
        return <Route size={20} color={colors.primary} />;
      case 'clock':
        return <Clock size={20} color={colors.primary} />;
      case 'trending-up':
        return <TrendingUp size={20} color={colors.primary} />;
      case 'flame':
        return <Flame size={20} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.secondaryText }]}>
          {title}
        </Text>
        {renderIcon()}
      </View>
      
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
});