import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Constants from 'expo-constants';
import AdHelper from '../services/AdHelper';

// Platform-specific imports
let BannerAd: any = null;
let BannerAdSize: any = null;

// AdMob temporarily disabled to fix crash
// if (Platform.OS !== 'web') {
//   try {
//     const AdModule = require('react-native-google-mobile-ads');
//     BannerAd = AdModule.BannerAd;
//     BannerAdSize = AdModule.BannerAdSize;
//   } catch (error) {
//     console.log('AdMob not available on this platform');
//   }
// }

interface SafeBannerAdProps {
  size?: any;
  style?: any;
  showFallback?: boolean;
}

const SafeBannerAd: React.FC<SafeBannerAdProps> = ({ 
  size, 
  style,
  showFallback = true 
}) => {
  const ENABLE_ADMOB = Constants.expoConfig?.extra?.ENABLE_ADMOB || false;
  
  // Feature flag kontrolü
  if (!ENABLE_ADMOB) {
    return null;
  }
  const [adState, setAdState] = useState({
    loading: true,
    loaded: false,
    failed: false,
    retryCount: 0
  });

  const maxRetries = 2;

  // Web fallback - show placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>🌟 Advertisement Space 🌟</Text>
        <Text style={styles.fallbackSubtext}>Real ads will show on mobile devices</Text>
      </View>
    );
  }

  // Native platforms - check if AdMob is available
  if (!BannerAd || !BannerAdSize) {
    return showFallback ? (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>✨ Advertisement ✨</Text>
        <Text style={styles.fallbackSubtext}>AdMob not available</Text>
      </View>
    ) : null;
  }

  const adUnitId = AdHelper.getBannerAdUnitId();
  const adSize = size || BannerAdSize.BANNER;

  const handleAdLoaded = () => {
    setAdState({ 
      loading: false, 
      loaded: true, 
      failed: false,
      retryCount: 0 
    });
    AdHelper.logAdEvent('LOADED', 'banner');
  };

  const handleAdFailedToLoad = (error: any) => {
    AdHelper.logAdEvent('FAILED', 'banner', error);
    
    if (adState.retryCount < maxRetries) {
      // Retry after delay
      setTimeout(() => {
        setAdState(prev => ({ 
          ...prev,
          loading: true, 
          retryCount: prev.retryCount + 1 
        }));
      }, 2000);
    } else {
      setAdState({ 
        loading: false, 
        loaded: false, 
        failed: true,
        retryCount: adState.retryCount
      });
    }
  };

  const handleAdOpened = () => {
    AdHelper.logAdEvent('OPENED', 'banner');
  };

  const handleAdClosed = () => {
    AdHelper.logAdEvent('CLOSED', 'banner');
  };

  const renderContent = () => {
    if (adState.loading) {
      return (
        <View style={[styles.bannerContainer, style]}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading ad...</Text>
        </View>
      );
    }

    if (adState.loaded) {
      return (
        <View style={[styles.bannerContainer, style]}>
          <BannerAd
            unitId={adUnitId}
            size={adSize}
            requestOptions={{
              requestNonPersonalizedAdsOnly: false,
              keywords: ['adhd', 'focus', 'productivity', 'wellness'],
            }}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
            onAdOpened={handleAdOpened}
            onAdClosed={handleAdClosed}
          />
        </View>
      );
    }

    if (adState.failed && showFallback) {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackText}>✨ Advertisement ✨</Text>
          <Text style={styles.fallbackSubtext}>Upgrade to Premium for ad-free experience</Text>
        </View>
      );
    }

    return null;
  };

  return renderContent();
};

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    minHeight: 50,
    margin: 8,
  },
  loadingText: {
    color: '#8B5CF6',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  fallbackContainer: {
    minHeight: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  fallbackText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fallbackSubtext: {
    color: '#8B5CF6',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
});

export default SafeBannerAd;