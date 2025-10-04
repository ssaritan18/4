import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSubscription } from '../context/SubscriptionContext';
// import { adMobService, RewardResult } from '../services/AdMobService';

interface RewardedAdButtonProps {
  onRewardEarned?: (amount: number, type: string) => void;
  rewardDescription?: string;
  style?: any;
  buttonText?: string;
}

export function RewardedAdButton({
  onRewardEarned,
  rewardDescription = "Watch ad for reward",
  style,
  buttonText = "🎁 Watch Ad for Bonus"
}: RewardedAdButtonProps) {
  const ENABLE_ADMOB = Constants.expoConfig?.extra?.ENABLE_ADMOB || false;
  
  // Feature flag kontrolü
  if (!ENABLE_ADMOB) {
    return null;
  }
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);

  useEffect(() => {
    // Check ad readiness periodically
    const checkAdReadiness = () => {
      setIsAdReady(adMobService.isRewardedAdReady());
    };

    checkAdReadiness();
    const interval = setInterval(checkAdReadiness, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't show for premium users (they don't need to watch ads)
  if (subscription.tier === 'premium') {
    return null;
  }

  const handleWatchAd = async () => {
    if (!isAdReady) {
      Alert.alert(
        'Ad Not Ready',
        'Please wait a moment for the ad to load, then try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const result: RewardResult = await adMobService.showRewardedAd();

      if (result.success && result.reward) {
        // Show success message
        Alert.alert(
          '🎉 Reward Earned!',
          `You earned ${result.reward.amount} ${result.reward.type}! Thanks for watching the ad.`,
          [
            {
              text: 'Awesome!',
              onPress: () => {
                if (onRewardEarned) {
                  onRewardEarned(result.reward!.amount, result.reward!.type);
                }
              }
            }
          ]
        );

        adMobService.logAdEvent('rewarded_completed', {
          amount: result.reward.amount,
          type: result.reward.type
        });
      } else if (result.error) {
        console.warn('Rewarded ad error:', result.error);
        
        // Don't show error to user for common issues
        if (!result.error.includes('cancelled') && !result.error.includes('closed')) {
          Alert.alert(
            'Ad Unavailable',
            'Sorry, no ads are available right now. Please try again later.',
            [{ text: 'OK' }]
          );
        }

        adMobService.logAdEvent('rewarded_failed', { error: result.error });
      }
    } catch (error: any) {
      console.error('Rewarded ad error:', error);
      Alert.alert(
        'Something went wrong',
        'Unable to show ad right now. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleWatchAd}
      disabled={isLoading || !isAdReady}
    >
      <LinearGradient
        colors={
          isAdReady && !isLoading
            ? ['#F97316', '#FBBF24'] // Orange gradient when ready
            : ['#6B7280', '#9CA3AF'] // Gray when not ready
        }
        style={styles.button}
      >
        <Ionicons 
          name={isLoading ? "hourglass" : isAdReady ? "play-circle" : "time"} 
          size={20} 
          color="#fff" 
        />
        <Text style={styles.buttonText}>
          {isLoading 
            ? 'Loading...' 
            : isAdReady 
            ? buttonText 
            : 'Ad Loading...'
          }
        </Text>
      </LinearGradient>

      {rewardDescription && (
        <Text style={styles.description}>{rewardDescription}</Text>
      )}
    </TouchableOpacity>
  );
}

export default RewardedAdButton;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});