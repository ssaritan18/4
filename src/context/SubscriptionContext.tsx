import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'premium';

interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: Date;
  features: {
    adFree: boolean;
    unlimitedFocusSessions: boolean;
    fullCommunityAccess: boolean;
    advancedAnalytics: boolean;
    unlimitedFriends: boolean;
    premiumThemes: boolean;
    prioritySupport: boolean;
  };
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  focusSessionsUsedToday: number;
  upgradeToPremium: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  hasFeature: (feature: keyof SubscriptionState['features']) => boolean;
  isFeatureLimited: (feature: string) => boolean;
  getFocusSessionsRemaining: () => number;
  getFriendsLimit: () => number;
  incrementFocusSession: () => boolean; // Returns true if allowed, false if limit reached
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const SUBSCRIPTION_STORAGE_KEY = '@adhd_social_subscription';

const FREE_SUBSCRIPTION: SubscriptionState = {
  tier: 'free',
  isActive: true,
  features: {
    adFree: false,
    unlimitedFocusSessions: false,
    fullCommunityAccess: false,
    advancedAnalytics: false,
    unlimitedFriends: false,
    premiumThemes: false,
    prioritySupport: false,
  }
};

const PREMIUM_SUBSCRIPTION: SubscriptionState = {
  tier: 'premium',
  isActive: true,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  features: {
    adFree: true,
    unlimitedFocusSessions: true,
    fullCommunityAccess: true,
    advancedAnalytics: true,
    unlimitedFriends: true,
    premiumThemes: true,
    prioritySupport: true,
  }
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>(FREE_SUBSCRIPTION);
  const [focusSessionsUsedToday, setFocusSessionsUsedToday] = useState(0);

  // Load subscription data from storage
  const loadSubscriptionData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Check if subscription is still valid
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          // Subscription expired, revert to free
          setSubscription(FREE_SUBSCRIPTION);
          await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
        } else {
          setSubscription({
            ...parsed,
            expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined
          });
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  // Save subscription data to storage
  const saveSubscriptionData = async (subscriptionData: SubscriptionState) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionData));
    } catch (error) {
      console.error('Error saving subscription data:', error);
    }
  };

  // Upgrade to premium
  const upgradeToPremium = async () => {
    const premiumSubscription = {
      ...PREMIUM_SUBSCRIPTION,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
    
    setSubscription(premiumSubscription);
    await saveSubscriptionData(premiumSubscription);
  };

  // Cancel subscription (immediately downgrade to free)
  const cancelSubscription = async () => {
    if (subscription.tier === 'premium') {
      // Immediately downgrade to free plan
      setSubscription(FREE_SUBSCRIPTION);
      await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    } else {
      // Already free, no action needed
      setSubscription(FREE_SUBSCRIPTION);
      await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    }
  };

  // Schedule subscription to expire (for cancelled premium users)
  const scheduleSubscriptionExpiry = async () => {
    if (subscription.tier === 'premium' && !subscription.isActive && subscription.expiresAt) {
      const now = new Date();
      if (now >= subscription.expiresAt) {
        // Subscription has expired, downgrade to free
        setSubscription(FREE_SUBSCRIPTION);
        await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
      }
    }
  };

  // Check if user has a specific feature
  const hasFeature = (feature: keyof SubscriptionState['features']) => {
    return subscription.features[feature];
  };

  // Check if a feature is limited for free users
  const isFeatureLimited = (feature: string) => {
    if (subscription.tier === 'premium') return false;
    
    switch (feature) {
      case 'focus_sessions':
        return focusSessionsUsedToday >= 3;
      case 'friends':
        return false; // Will be checked with getFriendsLimit
      case 'community_post':
        return true; // Free users can only read
      case 'ads':
        return true; // Free users see ads
      default:
        return false;
    }
  };

  // Get remaining focus sessions for today (free users)
  const getFocusSessionsRemaining = () => {
    if (subscription.tier === 'premium') return Infinity;
    return Math.max(0, 3 - focusSessionsUsedToday);
  };

  // Increment focus session usage
  const incrementFocusSession = (): boolean => {
    if (subscription.tier === 'premium') {
      return true; // Premium users have unlimited sessions
    }
    
    if (focusSessionsUsedToday >= 3) {
      return false; // Limit reached for free users
    }
    
    setFocusSessionsUsedToday(prev => prev + 1);
    return true;
  };

  // Reset daily limits at midnight
  useEffect(() => {
    const resetDailyLimits = () => {
      setFocusSessionsUsedToday(0);
    };

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set initial timeout
    const timeoutId = setTimeout(() => {
      resetDailyLimits();
      
      // Then set interval for every 24 hours
      const intervalId = setInterval(resetDailyLimits, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    loadSubscriptionData();
    
    // Check subscription expiry on app start
    scheduleSubscriptionExpiry();
  }, []);

  // Get friends limit
  const getFriendsLimit = () => {
    if (subscription.tier === 'premium') return Infinity;
    return 5;
  };

  const contextValue: SubscriptionContextType = {
    subscription,
    focusSessionsUsedToday,
    upgradeToPremium,
    cancelSubscription,
    hasFeature,
    isFeatureLimited,
    getFocusSessionsRemaining,
    getFriendsLimit,
    incrementFocusSession,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Utility function to check if user should see ads
export function shouldShowAds(subscription: SubscriptionState): boolean {
  return subscription.tier === 'free' && !subscription.features.adFree;
}

// Utility function to get subscription status display
export function getSubscriptionStatusDisplay(subscription: SubscriptionState): string {
  if (subscription.tier === 'premium') {
    return subscription.expiresAt 
      ? `Premium until ${subscription.expiresAt.toLocaleDateString()}`
      : 'Premium Active';
  }
  return 'Free Plan';
}