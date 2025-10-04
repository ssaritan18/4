import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';

interface MockRewardedAdButtonProps {
  onRewardEarned?: (amount: number, type: string) => void;
  rewardDescription?: string;
  style?: any;
  buttonText?: string;
}

export function MockRewardedAdButton({
  onRewardEarned,
  rewardDescription = "Watch ad for reward",
  style,
  buttonText = "🎁 Watch Ad for Bonus"
}: MockRewardedAdButtonProps) {
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  // Don't show for premium users
  if (subscription.tier === 'premium') {
    return null;
  }

  const handleWatchAd = async () => {
    setIsLoading(true);

    // Simulate ad loading
    setTimeout(() => {
      setIsLoading(false);
      
      // Show mock reward
      Alert.alert(
        '🎉 Mock Reward Earned!',
        '✅ In development mode: You earned 50 bonus points!\n\n🚀 Real AdMob rewards will be implemented in production.',
        [
          {
            text: 'Awesome!',
            onPress: () => {
              if (onRewardEarned) {
                onRewardEarned(50, 'points');
              }
            }
          }
        ]
      );
    }, 2000);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleWatchAd}
      disabled={isLoading}
    >
      <LinearGradient
        colors={isLoading ? ['#6B7280', '#9CA3AF'] : ['#F97316', '#FBBF24']}
        style={styles.button}
      >
        <Ionicons 
          name={isLoading ? "hourglass" : "play-circle"} 
          size={20} 
          color="#fff" 
        />
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading Ad...' : buttonText}
        </Text>
      </LinearGradient>

      {rewardDescription && (
        <Text style={styles.description}>{rewardDescription}</Text>
      )}
    </TouchableOpacity>
  );
}

export default MockRewardedAdButton;

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