import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  actionRoute?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({
  title,
  actionText,
  actionRoute,
  onActionPress,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handleAction = () => {
    if (onActionPress) {
      onActionPress();
    } else if (actionRoute) {
      router.push(actionRoute);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      {actionText && (
        <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {actionText}
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 2,
  },
});