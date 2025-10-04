import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';

const { width, height } = Dimensions.get('window');

interface SubscriptionCancellationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionCancellationModal({ 
  visible, 
  onClose 
}: SubscriptionCancellationModalProps) {
  const { subscription, cancelSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    
    try {
      await cancelSubscription();
      
      Alert.alert(
        '💔 Subscription Cancelled',
        'Your subscription has been cancelled and you\'ve been moved to the Free plan. We\'re sorry to see you go, but you can always upgrade again anytime!',
        [
          {
            text: 'Got it',
            onPress: () => {
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatExpiryDate = () => {
    if (subscription.expiresAt) {
      return subscription.expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'End of current billing period';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.backdrop}
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f172a']}
              style={styles.modalContent}
            >
              {/* Header */}
              <LinearGradient
                colors={['#EF4444', '#DC2626', '#B91C1C']}
                style={styles.header}
              >
                <Text style={styles.headerEmoji}>😢</Text>
                <Text style={styles.headerTitle}>Cancel Subscription?</Text>
                <Text style={styles.headerSubtitle}>We're sorry to see you go!</Text>
              </LinearGradient>

              {/* Cancellation Details */}
              <View style={styles.detailsSection}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.1)']}
                  style={styles.warningCard}
                >
                  <Text style={styles.warningTitle}>⚠️ What happens next:</Text>
                  <View style={styles.warningPoints}>
                    <Text style={styles.warningPoint}>• Premium features stay active until {formatExpiryDate()}</Text>
                    <Text style={styles.warningPoint}>• No more charges after cancellation</Text>
                    <Text style={styles.warningPoint}>• You'll automatically switch to Free plan</Text>
                    <Text style={styles.warningPoint}>• You can resubscribe anytime</Text>
                  </View>
                </LinearGradient>

                {/* What You'll Lose */}
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
                  style={styles.lossCard}
                >
                  <Text style={styles.lossTitle}>💔 You'll lose these premium features:</Text>
                  <View style={styles.lossList}>
                    <Text style={styles.lossItem}>✨ Ad-free experience → Ads will return</Text>
                    <Text style={styles.lossItem}>🎯 Unlimited focus sessions → Limited to 3/day</Text>
                    <Text style={styles.lossItem}>📊 Advanced analytics → Basic stats only</Text>
                    <Text style={styles.lossItem}>👥 Unlimited friends → Limited to 5 friends</Text>
                    <Text style={styles.lossItem}>🏆 Priority support → Standard support</Text>
                  </View>
                </LinearGradient>

                {/* Retention Offer */}
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
                  style={styles.retentionCard}
                >
                  <Text style={styles.retentionTitle}>🎁 Wait! Special offer just for you:</Text>
                  <Text style={styles.retentionOffer}>
                    How about we give you <Text style={styles.highlight}>7 extra days FREE</Text> to 
                    reconsider? Your ADHD journey is important to us!
                  </Text>
                </LinearGradient>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                {/* Keep Subscription */}
                <TouchableOpacity
                  style={styles.keepButton}
                  onPress={onClose}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.keepButtonGradient}
                  >
                    <Text style={styles.keepButtonText}>💖 Keep My Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Cancel Subscription */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelSubscription}
                  disabled={isProcessing}
                >
                  <LinearGradient
                    colors={['#6B7280', '#4B5563']}
                    style={styles.cancelButtonGradient}
                  >
                    <Text style={styles.cancelButtonText}>
                      {isProcessing ? 'Cancelling...' : '😢 Yes, Cancel Subscription'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Fine Print */}
              <View style={styles.fineprint}>
                <Text style={styles.fineprintText}>
                  You can reactivate your subscription anytime. 
                  All your data and progress will be saved.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
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
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.9,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalContent: {
    flex: 1,
  },
  
  // Header
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Details
  detailsSection: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  warningPoints: {
    gap: 6,
  },
  warningPoint: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  
  lossCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  lossTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  lossList: {
    gap: 8,
  },
  lossItem: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '500',
  },
  
  retentionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  retentionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  retentionOffer: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    color: '#10B981',
    fontWeight: '700',
  },
  
  // Buttons
  buttonsContainer: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  keepButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  keepButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  keepButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  cancelButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Fine Print
  fineprint: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  fineprintText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});