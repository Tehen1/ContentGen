import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Heart, MessageSquare, Share2 } from 'lucide-react-native';

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  activity: {
    type: string;
    distance: number;
    duration: string;
    image: string;
  };
  likes: number;
  comments: number;
  timestamp: string;
}

interface ActivityPostProps {
  post: Post;
}

export default function ActivityPost({ post }: ActivityPostProps) {
  const { colors } = useTheme();
  const [liked, setLiked] = React.useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Image 
          source={{ uri: post.user.avatar }}
          style={styles.avatar}
        />
        
        <View style={styles.headerInfo}>
          <Text style={[styles.username, { color: colors.text }]}>
            {post.user.name}
          </Text>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
            {post.timestamp}
          </Text>
        </View>
      </View>
      
      <View style={styles.activityInfo}>
        <Text style={[styles.activityText, { color: colors.text }]}>
          Completed a {post.activity.type.toLowerCase()} activity
        </Text>
        
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: colors.secondaryText }]}>
            {post.activity.distance} km
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.secondaryText }]} />
          <Text style={[styles.statText, { color: colors.secondaryText }]}>
            {post.activity.duration}
          </Text>
        </View>
      </View>
      
      <Image 
        source={{ uri: post.activity.image }}
        style={styles.activityImage}
      />
      
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setLiked(!liked)}
        >
          <Heart 
            size={20} 
            color={liked ? colors.error : colors.secondaryText}
            fill={liked ? colors.error : 'transparent'}
          />
          <Text 
            style={[
              styles.actionText, 
              { color: liked ? colors.error : colors.secondaryText }
            ]}
          >
            {liked ? post.likes + 1 : post.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MessageSquare size={20} color={colors.secondaryText} />
          <Text style={[styles.actionText, { color: colors.secondaryText }]}>
            {post.comments}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    marginLeft: 12,
  },
  username: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  activityInfo: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  divider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  activityImage: {
    width: '100%',
    height: 200,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
});