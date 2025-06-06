import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Award } from 'lucide-react-native';

interface RewardCardProps {
  title: string;
  description: string;
  tokenAmount: string;
}

export default function RewardCard({ title, description, tokenAmount }: RewardCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Award size={20} color={colors.primary} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        {description}
      </Text>
      
      <View style={[styles.tokenContainer, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.tokenAmount, { color: colors.primary }]}>
          {tokenAmount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    width: 180,
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  tokenContainer: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  tokenAmount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});