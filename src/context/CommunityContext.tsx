import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { api, setAuthToken as setApiAuthToken } from '../lib/api';
import { getAuthToken } from '../utils/authTokenHelper';
import { KEYS } from '../config';
import { saveJSON, loadJSON } from '../utils/persist';
export type Post = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  timestamp: string;
  likes: number;
  replies: number;
  shares: number;
  userLiked: boolean;
};

type CommunityContextType = {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refreshPosts: () => Promise<void>;
  createPost: (content: string, category?: string) => Promise<void>;
  reactToPost: (postId: string, reactionType?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
};

const CommunityContext = createContext<CommunityContextType | null>(null);

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}

function normalizePost(input: any): Post {
  return {
    id: input.id || input._id || `post_${Date.now()}`,
    content: input.content || input.text || '',
    author: input.author || input.author_name || 'Anonymous',
    authorId: input.author_id || input.authorId || '',
    category: input.category || 'general',
    timestamp: input.timestamp || input.created_at || new Date().toISOString(),
    likes: typeof input.likes === 'number' ? input.likes : 0,
    replies: typeof input.replies === 'number' ? input.replies : (input.comments_count ?? 0),
    shares: typeof input.shares === 'number' ? input.shares : 0,
    userLiked: Boolean(input.user_liked ?? input.userLiked ?? false),
  };
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const ensureToken = useCallback(async () => {
    try {
      const token = await getAuthToken();
      console.log('🔍 CommunityContext ensureToken - token found:', !!token);
      if (token) {
        setApiAuthToken(token);
        console.log('✅ CommunityContext - API token set successfully');
        return token;
      } else {
        console.warn('⚠️ CommunityContext - No token found, user needs to authenticate');
        return null;
      }
    } catch (error) {
      console.error('❌ CommunityContext ensureToken error:', error);
      return null;
    }
  }, []);

  const refreshPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/community/posts');
      const data = response.data;

      if (data?.success && Array.isArray(data.posts)) {
        setPosts(data.posts.map(normalizePost));
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Failed to load community posts:', err);
      setError('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (content: string, category = 'general') => {
    if (!content.trim()) {
      return;
    }

    try {
      const token = await ensureToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please sign in to create posts.');
        return;
      }

      const response = await api.post('/api/community/posts', { content: content.trim(), category });
      const data = response.data;

      if (data?.success && data.post) {
        setPosts(prev => [normalizePost(data.post), ...prev]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to create community post:', err);
      Alert.alert('Error', 'Failed to create post.');
    }
  }, [ensureToken]);

  const reactToPost = useCallback(async (postId: string, reactionType = 'like') => {
    if (reactionType !== 'like') {
      console.warn('Only like reactions are supported for community posts at this time.');
    }

    try {
      const token = await ensureToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please sign in to react to posts.');
        return;
      }

      const response = await api.post(`/api/community/posts/${postId}/like`);
      const data = response.data;

      if (data?.success) {
        setPosts(prev => prev.map(post => post.id === postId
          ? { ...post, userLiked: Boolean(data.liked), likes: typeof data.likes === 'number' ? data.likes : post.likes }
          : post));
      }
    } catch (err) {
      console.error('Failed to react to community post:', err);
      Alert.alert('Error', 'Failed to react to post.');
    }
  }, [ensureToken]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const token = await ensureToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please sign in to delete posts.');
        return;
      }

      await api.delete(`/api/community/posts/${postId}`);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Failed to delete community post:', err);
      Alert.alert('Error', 'Failed to delete post.');
    }
  }, [ensureToken]);

  const addComment = useCallback(async (postId: string, text: string) => {
    if (!text.trim()) {
      return;
    }

    try {
      console.log('💬 CommunityContext addComment - starting for post:', postId);
      const token = await ensureToken();
      if (!token) {
        console.warn('⚠️ CommunityContext addComment - no token, showing auth alert');
        Alert.alert('Authentication Required', 'Please sign in to reply to posts. Go to Profile → Sync Mode to enable authentication.');
        return;
      }

      console.log('📤 CommunityContext addComment - sending request to backend');
      const response = await api.post(`/api/community/posts/${postId}/reply`, { content: text.trim() });
      const data = response.data;

      console.log('📥 CommunityContext addComment - backend response:', data);

      if (data?.success) {
        setPosts(prev => prev.map(post => post.id === postId
          ? { ...post, replies: typeof data.replies === 'number' ? data.replies : post.replies }
          : post));
        console.log('✅ CommunityContext addComment - reply added successfully');
      } else {
        console.warn('⚠️ CommunityContext addComment - backend returned success: false');
        Alert.alert('Error', 'Failed to add reply. Please try again.');
      }
    } catch (err: any) {
      console.error('❌ CommunityContext addComment - error:', err);
      
      // Handle specific error cases
      if (err?.response?.status === 401) {
        Alert.alert('Authentication Required', 'Your session has expired. Please sign in again in Profile → Sync Mode.');
      } else if (err?.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to reply to this post.');
      } else if (err?.response?.status === 404) {
        Alert.alert('Post Not Found', 'This post may have been deleted.');
      } else {
        Alert.alert('Error', `Failed to add reply: ${err?.message || 'Unknown error'}`);
      }
    }
  }, [ensureToken]);

  // Load posts from storage on mount
  useEffect(() => {
    const loadStoredPosts = async () => {
      try {
        const storedPosts = await loadJSON<Post[] | null>(KEYS.communityPosts, null);
        if (storedPosts && Array.isArray(storedPosts)) {
          setPosts(storedPosts);
          console.log('📱 Loaded community posts from storage:', storedPosts.length);
        }
      } catch (error) {
        console.error('❌ Failed to load community posts from storage:', error);
      } finally {
        setHydrated(true);
      }
    };
    
    loadStoredPosts();
  }, []);

  // Auto-save posts to storage when they change
  useEffect(() => {
    if (hydrated && posts.length > 0) {
      console.log('💾 Auto-saving community posts to storage...');
      saveJSON(KEYS.communityPosts, posts);
    }
  }, [posts, hydrated]);

  useEffect(() => {
    if (hydrated) {
      refreshPosts();
    }
  }, [refreshPosts, hydrated]);

  const value: CommunityContextType = {
    posts,
    loading,
    error,
    refreshPosts,
    createPost,
    reactToPost,
    deletePost,
    addComment,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
