import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";

interface Post {
  id: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  timestamp: Date;
  likes: number;
  replies: number;
  shares: number;
  userLiked: boolean;
}

const categories = [
  { id: 'general', name: '🏠 General', icon: '🏠' },
  { id: 'tips', name: '💡 Tips & Tricks', icon: '💡' },
  { id: 'research', name: '🧠 ADHD Research', icon: '🧠' },
  { id: 'success', name: '💪 Success Stories', icon: '💪' },
  { id: 'support', name: '🆘 Support & Help', icon: '🆘' }
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // State
  const [activeCategory, setActiveCategory] = useState('general');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState('');

  // Create new post - Twitter style
  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    if (!user) {
      Alert.alert('Login Required', 'Please log in to create posts');
      return;
    }

    const post: Post = {
      id: `post_${Date.now()}`,
      content: newPost.trim(),
      author: user.name || 'Anonymous',
      authorId: user.id || user.email || 'anonymous',
      category: activeCategory,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
      shares: 0,
      userLiked: false
    };

    setPosts(prev => [post, ...prev]); // Latest first
    setNewPost('');
    
    console.log('✅ New post created:', post);
    Alert.alert('Success', 'Post created successfully!');
  };

  // Handle delete post
  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPosts(prev => prev.filter(post => post.id !== postId));
            console.log('✅ Post deleted:', postId);
            Alert.alert('Success', 'Post deleted successfully!');
          },
        },
      ]
    );
  };

  // Handle like
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newLiked = !post.userLiked;
        return {
          ...post,
          userLiked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  // Handle reply
  const handleReply = (post: Post) => {
    setSelectedPost(post);
    setShowReplyModal(true);
    setReplyText('');
  };

  // Handle share
  const handleShare = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          shares: post.shares + 1
        };
      }
      return post;
    }));
    
    Alert.alert('Shared!', 'Post shared successfully');
  };

  // Submit reply
  const handleSubmitReply = () => {
    if (!replyText.trim() || !selectedPost) return;
    
    // For now, create reply as new post
    const reply: Post = {
      id: `reply_${Date.now()}`,
      content: `@${selectedPost.author} ${replyText.trim()}`,
      author: user?.name || 'Anonymous',
      authorId: user?.id || user?.email || 'anonymous',
      category: selectedPost.category,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
      shares: 0,
      userLiked: false
    };

    setPosts(prev => [reply, ...prev]);
    
    // Update reply count
    setPosts(prev => prev.map(post => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          replies: post.replies + 1
        };
      }
      return post;
    }));

    setShowReplyModal(false);
    setReplyText('');
    setSelectedPost(null);
    
    Alert.alert('Success', 'Reply posted!');
  };

  // Get filtered posts by category
  const getFilteredPosts = () => {
    return posts.filter(post => post.category === activeCategory);
  };

  // Get relative time
  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return timestamp.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ADHDers Social Club</Text>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Post Creation - Twitter Style */}
        <View style={styles.postCreationContainer}>
          <View style={styles.postInputContainer}>
            <TextInput
              style={styles.postInput}
              placeholder="What's happening?"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={newPost}
              onChangeText={setNewPost}
              multiline={true}
              maxLength={280}
            />
          </View>
          <TouchableOpacity 
            style={[styles.postButton, !newPost.trim() && styles.disabledButton]}
            onPress={handleCreatePost}
            disabled={!newPost.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
          {getFilteredPosts().length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No posts in {categories.find(c => c.id === activeCategory)?.name} yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Be the first to share something!
              </Text>
            </View>
          ) : (
            getFilteredPosts().map(post => (
              <View key={post.id} style={styles.postCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.05)']}
                  style={styles.postGradient}
                >
                  {/* Post Header */}
                  <View style={styles.postHeader}>
                    <View style={styles.postAuthorInfo}>
                      <Text style={styles.postAuthor}>{post.author}</Text>
                      <Text style={styles.postTime}>{getRelativeTime(post.timestamp)}</Text>
                    </View>
                    
                    {/* Delete button - only show for own posts */}
                    {post.authorId === (user?.id || user?.email) && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeletePost(post.id)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Post Content */}
                  <Text style={styles.postContent}>{post.content}</Text>

                  {/* Post Actions - Twitter Style */}
                  <View style={styles.postActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleReply(post)}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.actionText}>{post.replies}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleShare(post.id)}
                    >
                      <Ionicons name="repeat-outline" size={18} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.actionText}>{post.shares}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleLike(post.id)}
                    >
                      <Ionicons 
                        name={post.userLiked ? "heart" : "heart-outline"} 
                        size={18} 
                        color={post.userLiked ? "#EC4899" : "rgba(255,255,255,0.7)"} 
                      />
                      <Text style={[
                        styles.actionText,
                        post.userLiked && { color: '#EC4899' }
                      ]}>
                        {post.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
        </ScrollView>

        {/* Reply Modal - Simple Twitter Style */}
        {showReplyModal && selectedPost && (
          <View style={styles.modalOverlay}>
            <View style={styles.replyModal}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.95)', 'rgba(168, 85, 247, 0.95)']}
                style={styles.replyModalGradient}
              >
                <View style={styles.replyHeader}>
                  <Text style={styles.replyTitle}>Reply to {selectedPost.author}</Text>
                  <TouchableOpacity onPress={() => setShowReplyModal(false)}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.originalPost}>{selectedPost.content}</Text>

                <TextInput
                  style={styles.replyInput}
                  placeholder="Post your reply..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline={true}
                  maxLength={280}
                />

                <View style={styles.replyActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowReplyModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.replyButton, !replyText.trim() && styles.disabledButton]}
                    onPress={handleSubmitReply}
                    disabled={!replyText.trim()}
                  >
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 50,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  categoryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postCreationContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  postInputContainer: {
    flex: 1,
    marginRight: 15,
  },
  postInput: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    padding: 15,
    color: 'white',
    fontSize: 16,
    minHeight: 50,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  postButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  postCard: {
    marginVertical: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  postGradient: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  postTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  postContent: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  actionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 15,
    overflow: 'hidden',
  },
  replyModalGradient: {
    padding: 20,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  replyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  originalPost: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  replyInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  replyButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  replyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});