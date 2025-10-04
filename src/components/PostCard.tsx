import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Post } from '../context/CommunityContext';

type PostCardProps = {
  post: Post;
  onReact: (postId: string, reactionType: string) => void;
  onDelete?: (postId: string) => void;
  onComment?: (postId: string) => void;
  isOwner?: boolean;
};

export function PostCard({ post, onReact, onDelete, onComment, isOwner }: PostCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.author_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author_name}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(post.created_at)}</Text>
        </View>
        {isOwner && onDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete(post._id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={styles.text}>{post.text}</Text>
      
      {/* Image if present */}
      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.image} />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Reactions */}
      <View style={styles.reactionsContainer}>
        <TouchableOpacity 
          style={styles.reactionButton}
          onPress={() => onReact(post._id, 'like')}
        >
          <Text style={styles.reactionEmoji}>👍</Text>
          <Text style={styles.reactionCount}>{post.reactions.like}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reactionButton}
          onPress={() => onReact(post._id, 'heart')}
        >
          <Text style={styles.reactionEmoji}>❤️</Text>
          <Text style={styles.reactionCount}>{post.reactions.heart}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reactionButton}
          onPress={() => onReact(post._id, 'clap')}
        >
          <Text style={styles.reactionEmoji}>👏</Text>
          <Text style={styles.reactionCount}>{post.reactions.clap}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reactionButton}
          onPress={() => onReact(post._id, 'star')}
        >
          <Text style={styles.reactionEmoji}>⭐</Text>
          <Text style={styles.reactionCount}>{post.reactions.star}</Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity 
          style={styles.commentsButton}
          onPress={() => {
            console.log('Comment button clicked, onComment:', !!onComment);
            if (onComment) {
              onComment(post._id);
            }
          }}
        >
          <Text style={styles.commentsEmoji}>💬</Text>
          <Text style={styles.commentsCount}>
            {post.comments_count || 0} comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '500',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    padding: 4,
  },
  commentsEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  commentsCount: {
    color: '#888',
    fontSize: 12,
  },
});