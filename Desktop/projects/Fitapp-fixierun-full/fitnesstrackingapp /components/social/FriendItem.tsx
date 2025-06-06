import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { UserPlus } from 'lucide-react-native';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
}

interface FriendItemProps {
  friend: Friend;
}

export default function FriendItem({ friend }: FriendItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: colors.border }]}>
      <Image 
        source={{ uri: friend.avatar }} 
        style={styles.avatar}
      />
      
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>
          {friend.name}
        </Text>
        <Text style={[styles.username, { color: colors.secondaryText }]}>
          {friend.username}
        </Text>
      </View>
      
      <View style={[styles.levelBadge, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.levelText, { color: colors.primary }]}>
          Lvl {friend.level}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 2,
  },
  username: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});