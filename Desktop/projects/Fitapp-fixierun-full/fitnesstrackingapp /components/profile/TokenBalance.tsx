import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

export default function TokenBalance() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Banknote size={24} color={colors.primary} />
        </View>
        
        <View style={styles.balanceInfo}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>
            Your Balance
          </Text>
          <Text style={[styles.balance, { color: colors.text }]}>
            1,250 FIT
          </Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
        >
          <ArrowUpRight size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Send
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
        >
          <ArrowDownRight size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Receive
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.transactionsHeader}>
        <Text style={[styles.transactionsTitle, { color: colors.text }]}>
          Recent Transactions
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionsList}>
        <View style={styles.transactionItem}>
          <View style={[styles.transactionIcon, { backgroundColor: colors.successLight }]}>
            <ArrowDownRight size={16} color={colors.success} />
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionTitle, { color: colors.text }]}>
              Reward: Weekly Challenge
            </Text>
            <Text style={[styles.transactionDate, { color: colors.secondaryText }]}>
              May 15, 2024
            </Text>
          </View>
          
          <Text style={[styles.transactionAmount, { color: colors.success }]}>
            +100 FIT
          </Text>
        </View>
        
        <View style={styles.transactionItem}>
          <View style={[styles.transactionIcon, { backgroundColor: colors.successLight }]}>
            <ArrowDownRight size={16} color={colors.success} />
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionTitle, { color: colors.text }]}>
              Reward: Daily Streak (7 days)
            </Text>
            <Text style={[styles.transactionDate, { color: colors.secondaryText }]}>
              May 12, 2024
            </Text>
          </View>
          
          <Text style={[styles.transactionAmount, { color: colors.success }]}>
            +50 FIT
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  balanceInfo: {},
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  transactionsList: {},
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  transactionAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
});