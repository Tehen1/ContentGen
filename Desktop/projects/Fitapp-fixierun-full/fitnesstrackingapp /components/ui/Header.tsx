import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Wallet } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  showWallet?: boolean;
  right?: React.ReactNode;
}

export default function Header({ title, showWallet = false, right }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      ) : (
        <View />
      )}
      
      {showWallet ? (
        <TouchableOpacity 
          style={[styles.walletButton, { backgroundColor: colors.card }]}
        >
          <Wallet size={16} color={colors.primary} />
          <Text style={[styles.walletText, { color: colors.text }]}>
            1,250 FIT
          </Text>
        </TouchableOpacity>
      ) : right ? (
        right
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  walletText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
});