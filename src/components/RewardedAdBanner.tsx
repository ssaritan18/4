import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePoints } from '../hooks/usePoints';
import { useSubscription } from '../context/SubscriptionContext';

interface RewardedAdBannerProps {
  style?: any;
}

export function RewardedAdBanner({ style }: RewardedAdBannerProps) {
  const { subscription } = useSubscription();
  const { earnRewardedAdPoints, canAfford } = usePoints();
  const [lastAdTime, setLastAdTime] = useState<Date | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  // Check if user can watch ad (once per day)
  const canWatchAd = () => {
    if (subscription.tier === 'premium') return false; // Premium users don't see ads
    
    if (!lastAdTime) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastAdTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff >= 24; // Once per 24 hours
  };

  // Get next ad availability
  const getNextAdTime = () => {
    if (!lastAdTime) return null;
    
    const nextTime = new Date(lastAdTime.getTime() + 24 * 60 * 60 * 1000);
    return nextTime;
  };

  // Watch rewarded ad
  const watchRewardedAd = async () => {
    if (!canWatchAd()) {
      const nextTime = getNextAdTime();
      Alert.alert(
        'Ad Already Watched',
        `You can watch your next ad after ${nextTime?.toLocaleTimeString()}`
      );
      return;
    }

    setIsWatching(true);
    
    try {
      // Simulate ad watching (in real app, this would trigger AdMob rewarded ad)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Award points
      const result = await earnRewardedAdPoints();
      
      if (result.success) {
        setLastAdTime(new Date());
        Alert.alert(
          '🎉 Points Earned!',
          `Congratulations! You earned ${result.points} points for watching the ad!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to earn points');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to watch ad');
    } finally {
      setIsWatching(false);
    }
  };

  // Don't show for premium users
  if (subscription.tier === 'premium') {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(249, 115, 22, 0.2)', 'rgba(234, 179, 8, 0.2)']}
        style={styles.adBanner}
      >
        <View style={styles.adContent}>
          <View style={styles.adHeader}>
            <Text style={styles.adEmoji}>🎁</Text>
            <View style={styles.adTextContainer}>
              <Text style={styles.adTitle}>Watch Ad for Points</Text>
              <Text style={styles.adSubtitle}>Earn 50 points • Once per day</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.adButton,
              (!canWatchAd() || isWatching) && styles.adButtonDisabled
            ]}
            onPress={watchRewardedAd}
            disabled={!canWatchAd() || isWatching}
          >
            <LinearGradient
              colors={canWatchAd() && !isWatching ? 
                ['#F97316', '#EAB308'] : 
                ['#666666', '#555555']
              }
              style={styles.adButtonGradient}
            >
              {isWatching ? (
                <Text style={styles.adButtonText}>Watching...</Text>
              ) : canWatchAd() ? (
                <>
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.adButtonText}>Watch Ad</Text>
                </>
              ) : (
                <Text style={styles.adButtonText}>Come Back Later</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {!canWatchAd() && (
          <View style={styles.cooldownContainer}>
            <Text style={styles.cooldownText}>
              Next ad available: {getNextAdTime()?.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  adBanner: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  adSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  adButton: {
    marginLeft: 12,
  },
  adButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adButtonDisabled: {
    opacity: 0.5,
  },
  adButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cooldownContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  cooldownText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
});

export default RewardedAdBanner;