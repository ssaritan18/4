import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface MockInterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  adType: 'achievement' | 'feature_unlock';
  context?: {
    taskName?: string;
    featureName?: string;
    limitReached?: string;
  };
}

export function MockInterstitialAd({
  visible,
  onClose,
  adType,
  context = {}
}: MockInterstitialAdProps) {
  const { subscription } = useSubscription();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  // Don't show ads for premium users
  if (subscription.tier === 'premium') {
    return null;
  }

  useEffect(() => {
    if (visible) {
      setCountdown(5);
      setCanSkip(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible]);

  const getAdContent = () => {
    switch (adType) {
      case 'achievement':
        return {
          title: '🎉 Great Job Completing That Task!',
          subtitle: `You finished "${context.taskName || 'your task'}" - keep up the momentum!`,
          adText: '📱 Advertisement',
          ctaText: 'Upgrade to Premium for ad-free celebrations!'
        };
      case 'feature_unlock':
        return {
          title: '⚡ Focus Session Limit Reached',
          subtitle: `${context.limitReached || 'You\'ve used your 3 daily focus sessions'}`,
          adText: '👑 Unlock Unlimited Sessions',
          ctaText: 'Upgrade to Premium for unlimited focus sessions!'
        };
      default:
        return {
          title: '📱 Advertisement',
          subtitle: 'Support ADHDers Social Club',
          adText: 'Sample Ad Content',
          ctaText: 'Upgrade to Premium for ad-free experience!'
        };
    }
  };

  const content = getAdContent();

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription');
  };

  const handleSkip = () => {
    console.log(`📊 Interstitial ad skipped - Type: ${adType}`);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={canSkip ? handleSkip : undefined}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
          style={styles.backdrop}
        >
          {/* Skip Button */}
          <TouchableOpacity
            style={[styles.skipButton, !canSkip && styles.skipButtonDisabled]}
            onPress={canSkip ? handleSkip : undefined}
            disabled={!canSkip}
          >
            <Text style={styles.skipButtonText}>
              {canSkip ? '✕ Skip Ad' : `Skip in ${countdown}s`}
            </Text>
          </TouchableOpacity>

          {/* Context Header */}
          <View style={styles.contextHeader}>
            <Text style={styles.contextTitle}>{content.title}</Text>
            <Text style={styles.contextSubtitle}>{content.subtitle}</Text>
          </View>

          {/* Ad Content */}
          <View style={styles.adContainer}>
            <LinearGradient
              colors={adType === 'feature_unlock' 
                ? ['#8B5CF6', '#EC4899'] 
                : ['#6B7280', '#9CA3AF']
              }
              style={styles.adContent}
            >
              <Text style={styles.adTitle}>{content.adText}</Text>
              <Text style={styles.adDescription}>{content.ctaText}</Text>
              
              {adType === 'feature_unlock' && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.upgradeButtonGradient}
                  >
                    <Text style={styles.upgradeButtonText}>👑 Upgrade Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* Development Info */}
          <View style={styles.devInfo}>
            <Text style={styles.devInfoText}>
              🔧 Development Mode: Mock Interstitial Ad
            </Text>
            <Text style={styles.devInfoSubtext}>
              Real ads will be shown in production
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, !canSkip && styles.continueButtonDisabled]}
            onPress={canSkip ? handleSkip : undefined}
            disabled={!canSkip}
          >
            <LinearGradient
              colors={canSkip ? ['#8B5CF6', '#EC4899'] : ['#4B5563', '#6B7280']}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {canSkip ? 'Continue' : `Wait ${countdown}s`}
              </Text>
              {canSkip && <Ionicons name="arrow-forward" size={20} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

export default MockInterstitialAd;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Skip Button
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonDisabled: {
    opacity: 0.5,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Context Header
  contextHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  contextTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  contextSubtitle: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Ad Content
  adContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  adContent: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  adTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  adDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Upgrade Button
  upgradeButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Dev Info
  devInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  devInfoText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  devInfoSubtext: {
    color: '#6B7280',
    fontSize: 11,
  },
  
  // Continue Button
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 300,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});