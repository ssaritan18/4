import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'adhders_token_v1';

// In-memory token cache for fastest access
let inMemoryToken: string | null = null;

/**
 * Cross-platform secure token storage
 * - Web: Uses localStorage (secure enough for web apps)
 * - Native: Uses expo-secure-store (encrypted storage)
 */
async function setStoredToken(token: string): Promise<void> {
  try {
    // Check if we're in web environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Web platform - use localStorage
      localStorage.setItem(TOKEN_KEY, token);
      // Also store in sessionStorage as backup
      sessionStorage.setItem(TOKEN_KEY, token);
      console.log('💾 Token stored in web storage (localStorage + sessionStorage)');
    } else {
      // Native platform - use expo-secure-store  
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('💾 Token stored in secure storage (encrypted)');
    }
  } catch (error) {
    console.error('❌ Failed to store token:', error);
  }
}

/**
 * Cross-platform secure token retrieval
 */
async function getStoredToken(): Promise<string | null> {
  try {
    // Check if we're in web environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Web platform - try localStorage first, then sessionStorage
      const localToken = localStorage.getItem(TOKEN_KEY);
      if (localToken) {
        console.log('🔍 Token retrieved from localStorage');
        return localToken;
      }
      
      const sessionToken = sessionStorage.getItem(TOKEN_KEY);
      if (sessionToken) {
        console.log('🔍 Token retrieved from sessionStorage');
        return sessionToken;
      }
    } else {
      // Native platform - use expo-secure-store
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        console.log('🔍 Token retrieved from secure storage');
        return token;
      }
    }
    
    console.log('⚠️ No token found in storage');
    return null;
  } catch (error) {
    console.error('❌ Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Cross-platform token clearing
 */
async function clearStoredToken(): Promise<void> {
  try {
    // Check if we're in web environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Web platform
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Token cleared from web storage');
    } else {
      // Native platform
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('🗑️ Token cleared from secure storage');
    }
  } catch (error) {
    console.error('❌ Failed to clear token:', error);
  }
}

/**
 * Set in-memory token (fastest access)
 */
export function setInMemoryToken(token: string | null): void {
  inMemoryToken = token;
  console.log(`🧠 In-memory token updated: ${token ? 'Set' : 'Cleared'}`);
}

/**
 * Main token retrieval function - tries all sources in priority order
 * Priority: 1) In-memory 2) Platform-specific secure storage
 */
export async function getAuthToken(): Promise<string | null> {
  console.log('🔍 getAuthToken() called - checking all sources...');
  
  // 1. Try in-memory first (fastest)
  if (inMemoryToken) {
    console.log('🧠 Using in-memory token');
    return inMemoryToken;
  }
  
  // 2. Try platform-specific storage
  const storedToken = await getStoredToken();
  if (storedToken) {
    // Cache in memory for faster future access
    inMemoryToken = storedToken;
    return storedToken;
  }
  
  console.log('⚠️ No token found in any storage method');
  return null;
}

/**
 * Store token in both memory and persistent storage
 */
export async function setAuthToken(token: string): Promise<void> {
  // Set in memory immediately
  setInMemoryToken(token);
  
  // Store persistently
  await setStoredToken(token);
}

/**
 * Clear token from all storage locations
 */
export async function clearAuthToken(): Promise<void> {
  // Clear memory
  setInMemoryToken(null);
  
  // Clear persistent storage
  await clearStoredToken();
  
  console.log('✅ Auth token cleared from all sources');
}

export function hasValidAuthToken(): boolean {
  return !!getAuthToken();
}