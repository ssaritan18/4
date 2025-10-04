import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { api, setAuthToken as setApiAuthToken } from "../../src/lib/api";
import { getAuthToken } from "../../src/utils/authTokenHelper";
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
  { id: 'general', name: '🏠 General', icon: '  ' },
  { id: 'tips', name: '💡 Tips & Tricks', icon: '  ' },
  { id: 'research', name: '🧠 ADHD Research', icon: '  ' },
  { id: 'success', name: '   Success Stories', icon: '  ' },
  { id: 'support', name: '🆘 Support & Help', icon: '🆘' }
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  
  // State
  const [activeCategory, setActiveCategory] = useState('general');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showMoreOptionsModal, setShowMoreOptionsModal] = useState(false);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<Post | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  
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
  const loadProfileImage = () => {
    if (Platform.OS === 'web') {
      const userKey = user?.id || user?.email || 'default';
      const savedProfile = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(`profile_data_${userKey}`) : null;
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileImage(parsedProfile.profile_image || null);
        console.log('✅ Profile image loaded for community:', parsedProfile.profile_image ? 'YES' : 'NO');
      }
    }
  };

  useEffect(() => {
    loadProfileImage();
  }, []);

  // Listen for storage changes to sync profile image updates
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleStorageChange = (e: StorageEvent) => {
        const userKey = user?.id || user?.email || 'default';
        if (e.key === `profile_data_${userKey}`) {
          console.log('🔄 Profile data changed, reloading profile image...');
          loadProfileImage();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // Also check for profile image changes when component gains focus
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleFocus = () => {
        console.log('   Community tab focused, checking for profile image updates...');
        loadProfileImage();
      };

      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;

    const syncToken = async () => {
      try {
        const storedToken = await getAuthToken();
        if (!isMounted) {
          return;
        }
        setAuthTokenState(storedToken);
        if (storedToken) {
          setApiAuthToken(storedToken);
        }
      } catch (error) {
        console.error('❌ Failed to sync auth token for community tab:', error);
      }
    };

    syncToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadPostsFromBackend = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/community/posts', { params: { category: activeCategory } });
      const data = response.data;

      if (data?.success && Array.isArray(data.posts)) {
        const formattedPosts: Post[] = data.posts.map((post: any) => ({
          id: post.id || post._id || `post_${Date.now()}`,
          content: post.content || post.text || '',
          author: post.author || post.author_name || 'Anonymous',
          authorId: post.author_id || post.authorId || '',
          category: post.category || activeCategory,
          timestamp: post.timestamp ? new Date(post.timestamp) : new Date(),
          likes: typeof post.likes === 'number' ? post.likes : 0,
          replies: typeof post.replies === 'number' ? post.replies : 0,
          shares: typeof post.shares === 'number' ? post.shares : 0,
          userLiked: Boolean(post.user_liked ?? post.userLiked ?? false),
        }));

        setPosts(formattedPosts);
        console.log(`✅ Loaded ${formattedPosts.length} posts from backend for category: ${activeCategory}`);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      showToast('Failed to load posts from server', 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadPostsFromBackend();
  }, [loadPostsFromBackend]);
  
  const ensureAuthToken = useCallback(async () => {
    let tokenToUse = authToken;

    if (!tokenToUse) {
      tokenToUse = await getAuthToken();
      if (tokenToUse) {
        setAuthTokenState(tokenToUse);
        setApiAuthToken(tokenToUse);
      }
    }

    return tokenToUse;
  }, [authToken]);
  
  // Get user avatar for posts
  const getUserAvatar = (authorId: string) => {
    // Return profile image if it's current user's post
    if (authorId === (user?.id || user?.email)) {
      return profileImage;
    }
    // For other users, try to get from localStorage or return default
    try {
      const storedUsers = localStorage.getItem('adhders_friends_v1');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userData = users.find((u: any) => u.id === authorId || u.email === authorId);
        return userData?.profileImage || null;
      }
    } catch (error) {
      console.log('Error getting user avatar:', error);
    }
    return null;
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
    const categoryPosts = posts.filter((post: Post) => post.category === activeCategory);
    const allHashtags: string[] = [];
    
    categoryPosts.forEach((post: Post) => {
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
    let filtered = posts.filter((post: Post) => post.category === activeCategory);
    
    // Filter by hashtag if selected
    if (selectedHashtag) {
      filtered = filtered.filter((post: Post) => {
        const hashtags = extractHashtags(post.content);
        return hashtags.includes(selectedHashtag.toLowerCase());
      });
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post: Post) => {
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
            suppressHighlighting={true}
            selectable={false}
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
    
    setNotifications((prev: Notification[]) => [notification, ...prev]);
    
    // Show toast
    showToast(notification.message, 'info');
    
    console.log('🔔 Notification created:', notification);
  };
  
  // Get unread notification count
  const getUnreadCount = (): number => {
    return notifications.filter((n: Notification) => !n.read).length;
  };
  
  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev: Notification[]) => 
      prev.map((notif: Notification) => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev: Notification[]) => 
      prev.map((notif: Notification) => ({ ...notif, read: true }))
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
    const token = await ensureAuthToken();
    if (!token) {
      showToast('Authentication required to create posts', 'warning');
      return;
    }

    const response = await api.post('/api/community/posts', {
      content: newPost.trim(),
      category: activeCategory
    });

    const data = response.data;
    if (data?.success && data.post) {
      const created = data.post;
      const normalizedPost: Post = {
        id: created.id || created._id || `post_${Date.now()}`,
        content: created.content || '',
        author: created.author || user.name || 'Anonymous',
        authorId: created.author_id || created.authorId || user.id || user.email || 'anonymous',
        category: created.category || activeCategory,
        timestamp: created.timestamp ? new Date(created.timestamp) : new Date(),
        likes: typeof created.likes === 'number' ? created.likes : 0,
        replies: typeof created.replies === 'number' ? created.replies : 0,
        shares: typeof created.shares === 'number' ? created.shares : 0,
        userLiked: Boolean(created.user_liked ?? created.userLiked ?? false),
      };

      setPosts((prev: Post[]) => [normalizedPost, ...prev]);
      showToast('Post created and saved!', 'success');
      setNewPost('');
    } else {
      showToast('Failed to create post', 'warning');
    }
  } catch (error) {
    console.error('❌ Error creating post:', error);
    showToast('Failed to create post', 'warning');
  } finally {
    setIsLoading(false);
  }
};
  // Handle delete post
  const handleDeletePost = (postId: string) => {
    const performDelete = async () => {
      try {
        const token = await ensureAuthToken();
        if (!token) {
          showToast('Authentication required to delete posts', 'warning');
          return;
        }

        await api.delete(`/api/community/posts/${postId}`);
        setPosts((prev: Post[]) => prev.filter((post: Post) => post.id !== postId));
        showToast('Post deleted successfully!', 'success');
      } catch (error) {
        console.error('❌ Failed to delete post:', error);
        showToast('Failed to delete post', 'warning');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = (typeof window !== 'undefined' && window.confirm) ? window.confirm('Are you sure you want to delete this post?') : true;
      if (confirmed) {
        performDelete();
      }
    } else {
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
            onPress: () => performDelete(),
          },
        ]
      );
    }
  };

  // Handle like
  const handleLike = async (postId: string) => {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    try {
      const token = await ensureAuthToken();
      if (!token) {
        showToast('Authentication required to react to posts', 'warning');
        return;
      }

      const response = await api.post(`/api/community/posts/${postId}/like`);
      const data = response.data;

      if (data?.success) {
        setPosts((prev: Post[]) => prev.map((post: Post) => (
          post.id === postId
            ? {
                ...post,
                userLiked: Boolean(data.liked),
                likes: typeof data.likes === 'number' ? data.likes : post.likes,
              }
            : post
        )));

        if (data.liked && targetPost.authorId !== (user?.id || user?.email)) {
          createNotification('like', user?.name || 'Someone', postId, targetPost.content);
        }

        showToast(data.liked ? 'Post liked!' : 'Like removed', 'success');
      } else {
        showToast('Failed to toggle like', 'warning');
      }
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      showToast('Failed to toggle like', 'warning');
    }
  };

  // Load replies for a post
  const loadReplies = async (postId: string) => {
    try {
      const token = await ensureAuthToken();
      if (!token) {
        showToast('Authentication required to view replies', 'warning');
        return;
      }

      const response = await api.get(`/api/community/posts/${postId}/replies`);
      const data = response.data;

      if (data?.success && Array.isArray(data.replies)) {
        setReplies(prev => ({
          ...prev,
          [postId]: data.replies
        }));
        console.log(`✅ Loaded ${data.replies.length} replies for post ${postId}`);
      }
    } catch (error) {
      console.error('❌ Failed to load replies:', error);
      showToast('Failed to load replies', 'warning');
    }
  };

  // Toggle replies visibility
  const toggleReplies = async (postId: string) => {
    console.log('🔄 Toggling replies for post:', postId);
    const isCurrentlyShowing = showReplies[postId];
    console.log('📊 Current state:', { isCurrentlyShowing, hasReplies: !!replies[postId] });
    
    if (!isCurrentlyShowing) {
      // If not showing, load replies and show them
      if (!replies[postId]) {
        console.log('📥 Loading replies for post:', postId);
        await loadReplies(postId);
      }
      console.log('🔄 Setting showReplies to: true');
      setShowReplies(prev => ({
        ...prev,
        [postId]: true
      }));
    } else {
      // If showing, hide them
      console.log('🔄 Setting showReplies to: false');
      setShowReplies(prev => ({
        ...prev,
        [postId]: false
      }));
    }
  };

  // Handle reply
  const handleReply = (post: Post) => {
    setSelectedPost(post);
    setShowReplyModal(true);
    setReplyText('');
  };

  // Handle share
  const handleShare = async (postId: string) => {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    try {
      const token = await ensureAuthToken();
      if (!token) {
        showToast('Authentication required to share posts', 'warning');
        return;
      }

      const response = await api.post(`/api/community/posts/${postId}/share`);
      const data = response.data;

      if (data?.success) {
        setPosts((prev: Post[]) => prev.map((post: Post) => (
          post.id === postId
            ? {
                ...post,
                shares: typeof data.shares === 'number' ? data.shares : post.shares,
              }
            : post
        )));

        if (targetPost.authorId !== (user?.id || user?.email)) {
          createNotification('share', user?.name || 'Someone', postId, targetPost.content);
        }

        showToast('Post shared!', 'success');
      } else {
        showToast('Failed to share post', 'warning');
      }
    } catch (error) {
      console.error('❌ Failed to share post:', error);
      showToast('Failed to share post', 'warning');
    }
  };

  // Submit reply
  const handleSubmitReply = async () => {
    if (!replyText.trim() || !selectedPost) return;

    try {
      const token = await ensureAuthToken();
      if (!token) {
        showToast('Authentication required to reply', 'warning');
        return;
      }

      const response = await api.post(`/api/community/posts/${selectedPost.id}/reply`, {
        content: replyText.trim()
      });

      const data = response.data;
      if (data?.success) {
        setPosts((prev: Post[]) => prev.map((post: Post) => (
          post.id === selectedPost.id
            ? {
                ...post,
                replies: typeof data.replies === 'number' ? data.replies : post.replies,
              }
            : post
        )));

        if (selectedPost.authorId !== (user?.id || user?.email)) {
          createNotification('reply', user?.name || 'Someone', selectedPost.id, selectedPost.content);
        }

        setReplyText('');
        setShowReplyModal(false);
        setSelectedPost(null);
        showToast('Reply posted!', 'success');
      } else {
        showToast('Failed to reply to post', 'warning');
      }
    } catch (error) {
      console.error('❌ Failed to create reply:', error);
      showToast('Failed to reply to post', 'warning');
    }
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
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={[styles.container, { paddingTop: insets.top }]}>
      {/* Compact Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#EC4899', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.compactHeader, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.compactHeaderContent}>
          <View style={styles.compactHeaderLeft}>
            <Text style={styles.compactIcon}>🌟</Text>
            <View>
              <Text style={styles.compactTitle}>Community Hub</Text>
              <Text style={styles.compactSubtitle}>Share experiences</Text>
            </View>
          </View>
        </View>
      </LinearGradient>


      {/* Categories - Compact */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
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

      {/* Search Bar - Compact */}
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
          <Text style={styles.trendingTitle}>   Trending in {categories.find(c => c.id === activeCategory)?.name}</Text>
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
      <ScrollView 
        style={styles.feedContainer} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Syncing with server...
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
          </View>
        ) : (
          getFilteredPosts().map((post: Post) => (
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
                        <View style={styles.avatarImageContainer}>
                          <img 
                            src={getUserAvatar(post.authorId)} 
                            alt="Profile" 
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        </View>
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
                  
                  {/* More Options Menu */}
                  <TouchableOpacity 
                    style={styles.moreOptionsButton}
                    onPress={() => {
                      setSelectedPostForOptions(post);
                      setShowMoreOptionsModal(true);
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>

                {/* Post Content */}
                <View style={styles.postContentContainer}>
                  {renderPostContent(post.content)}
                </View>

                {/* Post Actions - Twitter Style */}
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => toggleReplies(post.id)}
                  >
                    <Ionicons name={showReplies[post.id] ? "chevron-up" : "chevron-down"} size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.actionText}>{post.replies}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleReply(post)}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.actionText}>Reply</Text>
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

                {/* Replies Section */}
                {showReplies[post.id] && (
                  <View style={styles.repliesContainer}>
                    {console.log('🎯 Rendering replies for post:', post.id, 'showReplies:', showReplies[post.id], 'replies count:', replies[post.id]?.length || 0)}
                    <View style={styles.repliesHeader}>
                      <Text style={styles.repliesTitle}>
                        {replies[post.id]?.length || 0} replies
                      </Text>
                      <TouchableOpacity 
                        style={styles.replyButton}
                        onPress={() => handleReply(post)}
                      >
                        <Ionicons name="add" size={16} color="#8B5CF6" />
                        <Text style={styles.replyButtonText}>Add Reply</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {replies[post.id]?.map((reply, index) => (
                      <View key={reply.id || index} style={styles.replyItem}>
                        <View style={styles.replyHeader}>
                          <View style={styles.replyAuthorInfo}>
                            <View style={styles.replyAvatar}>
                              <Text style={styles.replyAvatarText}>
                                {getUserInitials(reply.author || 'U')}
                              </Text>
                            </View>
                            <View style={styles.replyAuthorDetails}>
                              <Text style={styles.replyAuthorName}>
                                {reply.author || 'Unknown'}
                              </Text>
                              <Text style={styles.replyTime}>
                                {getRelativeTime(new Date(reply.timestamp || reply.created_at || Date.now()))}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.replyContent}>
                          {reply.content || reply.text || ''}
                        </Text>
                      </View>
                    )) || []}
                    
                    {(!replies[post.id] || replies[post.id].length === 0) && (
                      <View style={styles.noRepliesContainer}>
                        <Text style={styles.noRepliesText}>No replies yet</Text>
                        <Text style={styles.noRepliesSubtext}>Be the first to reply!</Text>
                      </View>
                    )}
                  </View>
                )}
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
                      <View style={styles.avatarImageContainer}>
                        <Text style={styles.avatarText}>  </Text>
                      </View>
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

      {/* More Options Modal */}
      {showMoreOptionsModal && selectedPostForOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.moreOptionsModal}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.95)', 'rgba(168, 85, 247, 0.95)']}
              style={styles.moreOptionsModalGradient}
            >
              <View style={styles.moreOptionsHeader}>
                <Text style={styles.moreOptionsTitle}>Post Options</Text>
                <TouchableOpacity onPress={() => setShowMoreOptionsModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.moreOptionsContent}>
                {selectedPostForOptions.authorId === (user?.id || user?.email) ? (
                  // Owner options
                  <TouchableOpacity 
                    style={styles.moreOptionsItem}
                    onPress={async () => {
                      try {
                        await handleDeletePost(selectedPostForOptions.id);
                        showToast('Post deleted successfully!', 'success');
                        setShowMoreOptionsModal(false);
                      } catch (error) {
                        showToast('Failed to delete post', 'warning');
                      }
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#FF6B6B" />
                    <Text style={[styles.moreOptionsText, { color: '#FF6B6B' }]}>Delete Post</Text>
                  </TouchableOpacity>
                ) : (
                  // Other user options
                  <>
                    <TouchableOpacity 
                      style={styles.moreOptionsItem}
                      onPress={() => {
                        showToast('User blocked successfully!', 'success');
                        setShowMoreOptionsModal(false);
                      }}
                    >
                      <Ionicons name="person-remove" size={20} color="#FF6B6B" />
                      <Text style={[styles.moreOptionsText, { color: '#FF6B6B' }]}>Block User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.moreOptionsItem}
                      onPress={() => {
                        showToast('User reported successfully!', 'success');
                        setShowMoreOptionsModal(false);
                      }}
                    >
                      <Ionicons name="flag" size={20} color="#FFA500" />
                      <Text style={[styles.moreOptionsText, { color: '#FFA500' }]}>Report User</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Toast Notification */}
      {toastNotification && (
        <View style={[
          styles.toastContainer,
          styles.toastContainer
        ]}>
          <Text>{toastNotification.message}</Text>
        </View>
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View style={{width: '90%', borderRadius: 20, overflow: 'hidden'}}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.95)', 'rgba(168, 85, 247, 0.95)']}
              style={{padding: 0}}
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
                  <React.Fragment>
                    <View style={styles.emptyNotifications}>
                      <Ionicons name="notifications-off" size={48} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
                      <Text style={styles.emptyNotificationsSubtext}>
                        You'll see notifications when people interact with your posts
                      </Text>
                    </View>
                  </React.Fragment>
                ) : (
                  notifications.map((notification: Notification) => (
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
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  // Compact Header Styles
  compactHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
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
    paddingVertical: 2,
    marginBottom: 2,
  },
  categoriesContent: {
    paddingRight: 15,
    alignItems: 'center',
    minHeight: 40,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 1,
    marginBottom: 2,
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
  moreOptionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  moreOptionsModal: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  moreOptionsModalGradient: {
    padding: 0,
  },
  moreOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  moreOptionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreOptionsContent: {
    padding: 10,
  },
  moreOptionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  moreOptionsText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: 'white',
  },
  postAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationModalGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    marginRight: 10,
  },
  markAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    maxHeight: 400,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  emptyNotificationsSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
    fontWeight: '600',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899',
    marginTop: 6,
    marginLeft: 8,
  },
  postContent: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  hashtag: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  postAuthorDetails: {
    flex: 1,
  },
  postAuthor: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  postTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  postContentContainer: {
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
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
    zIndex: 1000,
  },
  replyModal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 20,
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  replyHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replyAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  replyTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 15,
    padding: 15,
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 15,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  replyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
  },
  replyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
  },
  repliesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  repliesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  repliesTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  replyButtonText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  replyItem: {
    marginBottom: 12,
    paddingLeft: 20,
  },
  replyHeader: {
    marginBottom: 6,
  },
  replyAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  replyAvatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  replyAuthorDetails: {
    flex: 1,
  },
  replyAuthorName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  replyTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  replyContent: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 18,
  },
  noRepliesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noRepliesText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  noRepliesSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
  },
});
