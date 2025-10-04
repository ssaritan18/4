// AdMob temporarily disabled to fix crash
// import mobileAds, { 
//   AdEventType, 
//   BannerAd, 
//   BannerAdSize,
//   RewardedAd,
//   RewardedAdEventType,
//   TestIds 
// } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Test Ad Unit IDs provided by Google for development
const TEST_AD_UNITS = {
  BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
};

// Production Ad Unit IDs - Replace with your actual ad unit IDs
const PRODUCTION_AD_UNITS = {
  BANNER_ANDROID: 'ca-app-pub-xxxxxxxxxxxxxxxx/1111111111',
  BANNER_IOS: 'ca-app-pub-xxxxxxxxxxxxxxxx/2222222222',
  REWARDED_ANDROID: 'ca-app-pub-xxxxxxxxxxxxxxxx/3333333333',
  REWARDED_IOS: 'ca-app-pub-xxxxxxxxxxxxxxxx/4444444444',
};

export interface RewardResult {
  success: boolean;
  reward?: {
    amount: number;
    type: string;
  };
  error?: string;
}

class AdMobService {
  private static instance: AdMobService;
  private isInitialized = false;
  private rewardedAd: RewardedAd | null = null;

  private constructor() {}

  static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing AdMob...');
      
      await mobileAds().initialize();
      
      // Set request configuration for development
      if (__DEV__) {
        const requestConfiguration = {
          // Configure test device IDs if needed
          testDeviceIdentifiers: [],
          // For GDPR compliance
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
        };
        
        await mobileAds().setRequestConfiguration(requestConfiguration);
        console.log('🔧 AdMob configured for development with test ads');
      }
      
      this.isInitialized = true;
      console.log('✅ AdMob initialized successfully');
      
      // Preload rewarded ad
      this.preloadRewardedAd();
      
      return true;
    } catch (error) {
      console.error('❌ AdMob initialization failed:', error);
      return false;
    }
  }

  // Get appropriate ad unit ID based on environment and platform
  private getAdUnitId(adType: 'BANNER' | 'REWARDED'): string {
    const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    const adUnits = __DEV__ ? TEST_AD_UNITS : PRODUCTION_AD_UNITS;
    return adUnits[`${adType}_${platform}` as keyof typeof adUnits];
  }

  // Get banner ad unit ID
  getBannerAdUnitId(): string {
    return this.getAdUnitId('BANNER');
  }

  // Get rewarded ad unit ID
  getRewardedAdUnitId(): string {
    return this.getAdUnitId('REWARDED');
  }

  // Check if ads should be shown (not for premium users)
  shouldShowAds(isPremiumUser: boolean): boolean {
    return !isPremiumUser;
  }

  // Preload rewarded ad for better user experience
  private preloadRewardedAd(): void {
    try {
      const adUnitId = this.getRewardedAdUnitId();
      
      this.rewardedAd = RewardedAd.createForAdUnitId(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Set up event listeners
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('✅ Rewarded ad loaded and ready');
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        console.log('📱 Rewarded ad closed');
        // Preload next ad
        setTimeout(() => {
          this.preloadRewardedAd();
        }, 1000);
      });

      // Load the ad
      this.rewardedAd.load();
    } catch (error) {
      console.error('❌ Error preloading rewarded ad:', error);
    }
  }

  // Show rewarded ad
  async showRewardedAd(): Promise<RewardResult> {
    return new Promise((resolve) => {
      if (!this.isInitialized) {
        resolve({ success: false, error: 'AdMob not initialized' });
        return;
      }

      if (!this.rewardedAd) {
        resolve({ success: false, error: 'Rewarded ad not available' });
        return;
      }

      // Set up reward listener
      const rewardListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('🎁 User earned reward:', reward);
          resolve({
            success: true,
            reward: {
              amount: reward.amount,
              type: reward.type,
            },
          });
        }
      );

      // Set up error listener
      const errorListener = this.rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error('❌ Rewarded ad error:', error);
          rewardListener();
          errorListener();
          resolve({ success: false, error: error.message });
        }
      );

      // Set up close listener for cases where user doesn't complete
      const closeListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.CLOSED,
        () => {
          console.log('📱 Rewarded ad closed without reward');
          rewardListener();
          errorListener();
          closeListener();
          // Don't resolve here as reward might have been earned
        }
      );

      // Show the ad
      try {
        this.rewardedAd.show();
      } catch (error) {
        console.error('❌ Error showing rewarded ad:', error);
        rewardListener();
        errorListener();
        closeListener();
        resolve({ success: false, error: 'Failed to show rewarded ad' });
      }
    });
  }

  // Check if rewarded ad is ready
  isRewardedAdReady(): boolean {
    return this.rewardedAd !== null && this.isInitialized;
  }

  // Analytics and debugging helpers
  logAdEvent(eventName: string, parameters: Record<string, any> = {}): void {
    if (__DEV__) {
      console.log(`📊 Ad Event: ${eventName}`, parameters);
    }
    
    // In production, send to your analytics service
    // Example: analytics.logEvent(`ad_${eventName}`, parameters);
  }

  // Get AdMob status for debugging
  getStatus(): {
    initialized: boolean;
    rewardedAdReady: boolean;
    environment: string;
  } {
    return {
      initialized: this.isInitialized,
      rewardedAdReady: this.isRewardedAdReady(),
      environment: __DEV__ ? 'development' : 'production',
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.rewardedAd) {
      // Remove all listeners and cleanup
      this.rewardedAd = null;
    }
    this.isInitialized = false;
    console.log('🧹 AdMob service cleaned up');
  }
}

// Export singleton instance
export const adMobService = AdMobService.getInstance();

// Export constants for easy access
export { BannerAdSize, TestIds };

// Export types
export type { RewardResult };