import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal
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

interface Notification {
  id: string;
  type: 'like' | 'reply' | 'share';
  message: string;
  fromUser: string;
  postId: string;
  postPreview: string;
  timestamp: Date;
  read: boolean;
}

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  visible: boolean;
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
  
  // Production mode toggle - set to false for testing, true for production
  const [isProductionMode, setIsProductionMode] = useState(false);
  
  // State
  const [activeCategory, setActiveCategory] = useState('general');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Search & Hashtag state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState<ToastNotification | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile image state - sync with Profile tab
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Load profile image from localStorage (sync with Profile tab)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedProfile = localStorage.getItem('profile_data');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileImage(parsedProfile.profile_image || null);
        console.log('✅ Profile image loaded for community:', parsedProfile.profile_image ? 'YES' : 'NO');
      }
    }
  }, []);
  
  // Load posts from backend when production mode is enabled
  useEffect(() => {
    if (isProductionMode) {
      loadPostsFromBackend();
    }
  }, [activeCategory, isProductionMode]);
  
  // Backend integration functions
  const getBackendUrl = () => {
    return process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  };
  
  const getAuthToken = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('@auth_token');
    }
    // For mobile, we'd use AsyncStorage here
    return null;
  };
  
  const loadPostsFromBackend = async () => {
    if (!isProductionMode) return;
    
    try {
      setIsLoading(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/community/posts?category=${activeCategory}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.posts) {
          // Convert backend posts to frontend format
          const formattedPosts = data.posts.map((post: any) => ({
            ...post,
            timestamp: new Date(post.timestamp),
            userLiked: false // We'd need to check if current user liked this post
          }));
          
          setPosts(formattedPosts);
          console.log(`✅ Loaded ${formattedPosts.length} posts from backend for category: ${activeCategory}`);
        }
      } else {
        console.error('❌ Failed to load posts from backend:', response.status);
        showToast('Failed to load posts from server', 'warning');
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      showToast('Network error loading posts', 'warning');
    } finally {
      setIsLoading(false);
    }
  };
  
  const savePostToBackend = async (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'replies' | 'shares' | 'userLiked'>) => {
    if (!isProductionMode) return null;
    
    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error('No authentication token');
      }
      
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: post.content,
          category: post.category
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Post saved to backend:', data.post);
        return data.post;
      } else {
        throw new Error(`Backend responded with ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to save post to backend:', error);
      showToast('Failed to save post to server', 'warning');
      return null;
    }
  };
  
  // Get user avatar for posts
  const getUserAvatar = (authorId: string) => {
    // Return profile image if it's current user's post
    if (authorId === (user?.id || user?.email)) {
      return profileImage;
    }
    return null; // Other users don't have profile images yet
  };
  
  // Get user initials for fallback avatar
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };
  
  // Extract hashtags from text
  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  };
  
  // Get trending hashtags for current category
  const getTrendingHashtags = (): string[] => {
    const categoryPosts = posts.filter(post => post.category === activeCategory);
    const allHashtags: string[] = [];
    
    categoryPosts.forEach(post => {
      const hashtags = extractHashtags(post.content);
      allHashtags.push(...hashtags);
    });
    
    // Count hashtag frequency
    const hashtagCounts: Record<string, number> = {};
    allHashtags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
    
    // Return top 5 trending hashtags
    return Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  };
  
  // Filter posts based on search query and selected hashtag
  const getFilteredPosts = () => {
    let filtered = posts.filter(post => post.category === activeCategory);
    
    // Filter by hashtag if selected
    if (selectedHashtag) {
      filtered = filtered.filter(post => {
        const hashtags = extractHashtags(post.content);
        return hashtags.includes(selectedHashtag.toLowerCase());
      });
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => {
        return post.content.toLowerCase().includes(query) ||
               post.author.toLowerCase().includes(query) ||
               extractHashtags(post.content).some(tag => tag.includes(query));
      });
    }
    
    return filtered;
  };
  
  // Handle hashtag click
  const handleHashtagClick = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setSearchQuery('');
    console.log('🏷️ Hashtag selected:', hashtag);
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedHashtag(null);
    setShowSearch(false);
  };
  
  // Render post content with clickable hashtags
  const renderPostContent = (content: string) => {
    const parts = content.split(/(#\w+)/g);
    
    return parts.map((part, index) => {
      if (part.match(/#\w+/)) {
        // This is a hashtag
        return (
          <Text
            key={index}
            style={styles.hashtag}
            onPress={() => handleHashtagClick(part.toLowerCase())}
          >
            {part}
          </Text>
        );
      } else {
        // Regular text
        return (
          <Text key={index} style={styles.postContent}>
            {part}
          </Text>
        );
      }
    });
  };
  
  // Show toast notification
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const toast: ToastNotification = {
      id: `toast_${Date.now()}`,
      message,
      type,
      visible: true
    };
    
    setToastNotification(toast);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToastNotification(null);
    }, 3000);
  };
  
  // Create notification
  const createNotification = (
    type: 'like' | 'reply' | 'share',
    fromUser: string,
    postId: string,
    postContent: string
  ) => {
    const messages = {
      like: `${fromUser} liked your post`,
      reply: `${fromUser} replied to your post`,
      share: `${fromUser} shared your post`
    };
    
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      message: messages[type],
      fromUser,
      postId,
      postPreview: postContent.slice(0, 50) + (postContent.length > 50 ? '...' : ''),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Show toast
    showToast(notification.message, 'info');
    
    console.log('🔔 Notification created:', notification);
  };
  
  // Get unread notification count
  const getUnreadCount = (): number => {
    return notifications.filter(n => !n.read).length;
  };
  
  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Create new post - Twitter style
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    if (!user) {
      Alert.alert('Login Required', 'Please log in to create posts');
      return;
    }

    setIsLoading(true);
    
    try {
      const postData = {
        content: newPost.trim(),
        author: user.name || 'Anonymous',
        authorId: user.id || user.email || 'anonymous',
        category: activeCategory
      };

      if (isProductionMode) {
        // Save to backend first
        const backendPost = await savePostToBackend(postData);
        if (backendPost) {
          // Use backend response
          const post: Post = {
            ...backendPost,
            timestamp: new Date(backendPost.timestamp),
            userLiked: false
          };
          setPosts(prev => [post, ...prev]);
          showToast('Post created and saved!', 'success');
        } else {
          // Backend failed, still create locally
          const localPost: Post = {
            id: `post_${Date.now()}`,
            ...postData,
            timestamp: new Date(),
            likes: 0,
            replies: 0,
            shares: 0,
            userLiked: false
          };
          setPosts(prev => [localPost, ...prev]);
          showToast('Post created locally (server unavailable)', 'warning');
        }
      } else {
        // Test mode - create locally only
        const post: Post = {
          id: `post_${Date.now()}`,
          ...postData,
          timestamp: new Date(),
          likes: 0,
          replies: 0,
          shares: 0,
          userLiked: false
        };
        setPosts(prev => [post, ...prev]);
        showToast('Test post created!', 'success');
        console.log('🧪 Test post created (not saved to backend):', post);
      }

      setNewPost('');
    } catch (error) {
      console.error('❌ Error creating post:', error);
      showToast('Failed to create post', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete post
  const handleDeletePost = (postId: string) => {
    console.log('🔴 DELETE BUTTON CLICKED for post:', postId);
    
    if (Platform.OS === 'web') {
      // Web fallback - use confirm instead of Alert.alert
      const confirmed = window.confirm('Are you sure you want to delete this post?');
      if (confirmed) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        console.log('✅ Post deleted:', postId);
        alert('Post deleted successfully!');
      }
    } else {
      // Mobile Alert.alert
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
    }
  };

  // Handle like
  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newLiked = !post.userLiked;
        const updatedPost = {
          ...post,
          userLiked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1
        };
        
        // Create notification for post author (if not own post)
        if (newLiked && post.authorId !== (user?.id || user?.email)) {
          createNotification('like', user?.name || 'Someone', postId, post.content);
        }
        
        return updatedPost;
      }
      return post;
    }));
    
    // Show success toast
    showToast('Post liked!', 'success');
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
        const updatedPost = {
          ...post,
          shares: post.shares + 1
        };
        
        // Create notification for post author (if not own post)
        if (post.authorId !== (user?.id || user?.email)) {
          createNotification('share', user?.name || 'Someone', postId, post.content);
        }
        
        return updatedPost;
      }
      return post;
    }));
    
    showToast('Post shared!', 'success');
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
        const updatedPost = {
          ...post,
          replies: post.replies + 1
        };
        
        // Create notification for post author (if not own post)
        if (post.authorId !== (user?.id || user?.email)) {
          createNotification('reply', user?.name || 'Someone', post.id, post.content);
        }
        
        return updatedPost;
      }
      return post;
    }));

    setShowReplyModal(false);
    setReplyText('');
    setSelectedPost(null);
    
    showToast('Reply posted!', 'success');
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
          
          <View style={styles.headerActions}>
            {/* Production Mode Toggle */}
            <TouchableOpacity 
              style={[
                styles.productionToggle, 
                isProductionMode && styles.productionToggleActive
              ]}
              onPress={() => {
                setIsProductionMode(!isProductionMode);
                showToast(
                  `${!isProductionMode ? 'Production' : 'Test'} mode enabled`,
                  'info'
                );
                console.log(`🔄 Switched to ${!isProductionMode ? 'production' : 'test'} mode`);
              }}
            >
              <Text style={[
                styles.productionToggleText,
                isProductionMode && styles.productionToggleTextActive
              ]}>
                {isProductionMode ? 'LIVE' : 'TEST'}
              </Text>
            </TouchableOpacity>
            
            {/* Notification Bell */}
            <TouchableOpacity 
              style={styles.notificationBell}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications" size={24} color="white" />
              {getUnreadCount() > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {getUnreadCount() > 99 ? '99+' : getUnreadCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts or hashtags..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setShowSearch(true)}
            />
            {(searchQuery || selectedHashtag) && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Active filters display */}
          {selectedHashtag && (
            <View style={styles.activeFilters}>
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{selectedHashtag}</Text>
                <TouchableOpacity onPress={() => setSelectedHashtag(null)}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Trending Hashtags */}
        {getTrendingHashtags().length > 0 && (
          <View style={styles.trendingContainer}>
            <Text style={styles.trendingTitle}>🔥 Trending in {categories.find(c => c.id === activeCategory)?.name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
              {getTrendingHashtags().map((hashtag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.trendingTag,
                    selectedHashtag === hashtag && styles.selectedTrendingTag
                  ]}
                  onPress={() => handleHashtagClick(hashtag)}
                >
                  <Text style={[
                    styles.trendingTagText,
                    selectedHashtag === hashtag && styles.selectedTrendingTagText
                  ]}>
                    {hashtag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {isProductionMode ? 'Saving to server...' : 'Creating post...'}
              </Text>
            </View>
          )}
          
          {getFilteredPosts().length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No posts in {categories.find(c => c.id === activeCategory)?.name} yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Be the first to share something!
              </Text>
              {!isProductionMode && (
                <Text style={styles.testModeNote}>
                  🧪 Test mode - posts won't be saved to server
                </Text>
              )}
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
                      {/* Profile Avatar */}
                      <View style={styles.postAvatar}>
                        {getUserAvatar(post.authorId) ? (
                          <img 
                            src={getUserAvatar(post.authorId)!} 
                            alt="Profile" 
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Text style={styles.postAvatarText}>
                            {getUserInitials(post.author)}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.postAuthorDetails}>
                        <Text style={styles.postAuthor}>{post.author}</Text>
                        <Text style={styles.postTime}>{getRelativeTime(post.timestamp)}</Text>
                      </View>
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
                  <View style={styles.postContentContainer}>
                    {renderPostContent(post.content)}
                  </View>

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
                  <View style={styles.replyHeaderInfo}>
                    {/* User's avatar in reply modal */}
                    <View style={styles.replyAvatar}>
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Your Profile" 
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Text style={styles.replyAvatarText}>
                          {getUserInitials(user?.name || 'You')}
                        </Text>
                      )}
                    </View>
                    
                    <Text style={styles.replyTitle}>Reply to {selectedPost.author}</Text>
                  </View>
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

        {/* Toast Notification */}
        {toastNotification && (
          <View style={[
            styles.toastContainer,
            toastNotification.type === 'success' && styles.toastSuccess,
            toastNotification.type === 'info' && styles.toastInfo,
            toastNotification.type === 'warning' && styles.toastWarning
          ]}>
            <Text style={styles.toastText}>{toastNotification.message}</Text>
          </View>
        )}

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.notificationModalOverlay}>
            <View style={styles.notificationModal}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.95)', 'rgba(168, 85, 247, 0.95)']}
                style={styles.notificationModalGradient}
              >
                {/* Modal Header */}
                <View style={styles.notificationModalHeader}>
                  <Text style={styles.notificationModalTitle}>Notifications</Text>
                  <View style={styles.notificationModalActions}>
                    {notifications.length > 0 && (
                      <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                        <Text style={styles.markAllButtonText}>Mark all read</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setShowNotifications(false)}>
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Notifications List */}
                <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                  {notifications.length === 0 ? (
                    <View style={styles.emptyNotifications}>
                      <Ionicons name="notifications-off" size={48} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
                      <Text style={styles.emptyNotificationsSubtext}>
                        You'll see notifications when people interact with your posts
                      </Text>
                    </View>
                  ) : (
                    notifications.map(notification => (
                      <TouchableOpacity
                        key={notification.id}
                        style={[
                          styles.notificationItem,
                          !notification.read && styles.unreadNotification
                        ]}
                        onPress={() => markAsRead(notification.id)}
                      >
                        <View style={styles.notificationIcon}>
                          <Ionicons 
                            name={
                              notification.type === 'like' ? 'heart' :
                              notification.type === 'reply' ? 'chatbubble' : 'repeat'
                            }
                            size={20} 
                            color={
                              notification.type === 'like' ? '#EC4899' :
                              notification.type === 'reply' ? '#3B82F6' : '#10B981'
                            }
                          />
                        </View>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationMessage}>{notification.message}</Text>
                          <Text style={styles.notificationPreview}>"{notification.postPreview}"</Text>
                          <Text style={styles.notificationTime}>
                            {getRelativeTime(notification.timestamp)}
                          </Text>
                        </View>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productionToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  productionToggleActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  productionToggleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productionToggleTextActive: {
    color: 'white',
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
  postContentContainer: {
    marginBottom: 15,
  },
  hashtag: {
    color: '#8B5CF6',
    fontWeight: 'bold',
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
  replyHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  replyAvatarText: {
    color: 'white',
    fontSize: 12,
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
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  postAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postAuthorDetails: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.2)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
    padding: 4,
  },
  activeFilters: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4,
  },
  filterTagText: {
    color: "white",
    fontSize: 14,
    marginRight: 6,
  },
  trendingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.2)",
  },
  trendingTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trendingScroll: {
    maxHeight: 40,
  },
  trendingTag: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  selectedTrendingTag: {
    backgroundColor: "rgba(139, 92, 246, 0.5)",
    borderColor: "#8B5CF6",
  },
  trendingTagText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedTrendingTagText: {
    color: "white",
    fontWeight: "bold",
  },
  
  // Notification Bell Styles
  notificationBell: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  
  // Toast Notification Styles
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
  },
  toastSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  toastInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
  },
  toastWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModal: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  notificationModalGradient: {
    flex: 1,
    padding: 20,
  },
  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationModalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
  },
  markAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyNotificationsSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationPreview: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  notificationTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  testModeNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});