import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface OnboardingSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  assessmentResult?: string; // "high", "moderate", "low" ADHD indicators
}

export function OnboardingSubscriptionModal({ 
  visible, 
  onClose, 
  assessmentResult = "moderate" 
}: OnboardingSubscriptionModalProps) {
  const { subscription, upgradeToPremium } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium'>('free');
  const [isProcessing, setIsProcessing] = useState(false);

  // Personalized messaging based on assessment results
  const getPersonalizedMessage = () => {
    switch (assessmentResult) {
      case 'high':
        return {
          title: "Your ADHD Journey Starts Here! 🎯",
          subtitle: "Based on your assessment, premium features could significantly help your focus and productivity.",
          benefits: ["Advanced focus tracking", "Unlimited sessions", "Detailed progress insights"]
        };
      case 'moderate':
        return {
          title: "Welcome to Your ADHD Support Hub! 🌟",
          subtitle: "You're ready to take control of your ADHD with tools designed just for you.",
          benefits: ["Smart task management", "Community support", "Progress tracking"]
        };
      default:
        return {
          title: "Start Your Neurodivergent Journey! 💭",
          subtitle: "Discover tools and community support tailored for your unique brain.",
          benefits: ["ADHD-friendly features", "Supportive community", "Personal insights"]
        };
    }
  };

  const personalizedContent = getPersonalizedMessage();

  const handlePlanSelection = async (tier: 'free' | 'premium') => {
    setIsProcessing(true);
    
    try {
      if (tier === 'premium') {
        // For premium, we'll navigate to payment page
        onClose();
        router.push('/payment'); // We'll create this payment page
      } else {
        // For free, just continue to app
        setSelectedTier('free');
        setTimeout(() => {
          onClose();
          setIsProcessing(false);
        }, 500);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  const freeFeatures = [
    { icon: '✅', text: 'Basic task management', available: true },
    { icon: '🎯', text: '3 focus sessions daily', available: true },
    { icon: '💭', text: 'Daily mood tracking', available: true },
    { icon: '👥', text: '5 friends maximum', available: true },
    { icon: '📱', text: 'Banner ads included', available: false },
  ];

  const premiumFeatures = [
    { icon: '✨', text: 'Ad-free experience', available: true },
    { icon: '🎯', text: 'Unlimited focus sessions', available: true },
    { icon: '📊', text: 'Advanced analytics', available: true },
    { icon: '👥', text: 'Unlimited friends', available: true },
    { icon: '🏆', text: 'Priority support', available: true },
  ];

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
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Header */}
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899', '#F97316']}
                  style={styles.header}
                >
                  <Text style={styles.headerTitle}>{personalizedContent.title}</Text>
                  <Text style={styles.headerSubtitle}>{personalizedContent.subtitle}</Text>
                </LinearGradient>

                {/* Benefits Preview */}
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>🧠 Perfect for ADHD Brains:</Text>
                  <View style={styles.benefitsList}>
                    {personalizedContent.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Text style={styles.benefitDot}>•</Text>
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Plan Selection */}
                <View style={styles.plansSection}>
                  <Text style={styles.plansSectionTitle}>Choose Your Starting Plan:</Text>
                  
                  <View style={styles.plansContainer}>
                    {/* Free Plan */}
                    <TouchableOpacity
                      style={[styles.planCard, selectedTier === 'free' && styles.selectedPlan]}
                      onPress={() => setSelectedTier('free')}
                    >
                      <LinearGradient
                        colors={selectedTier === 'free' 
                          ? ['rgba(139, 92, 246, 0.2)', 'rgba(168, 85, 247, 0.2)']
                          : ['rgba(107, 114, 128, 0.1)', 'rgba(156, 163, 175, 0.1)']
                        }
                        style={styles.planCardGradient}
                      >
                        <View style={styles.planHeader}>
                          <Text style={styles.planEmoji}>🆓</Text>
                          <Text style={styles.planName}>Free Plan</Text>
                          <Text style={styles.planPrice}>$0/forever</Text>
                        </View>
                        
                        <View style={styles.featuresContainer}>
                          {freeFeatures.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                              <Text style={styles.featureIcon}>{feature.icon}</Text>
                              <Text style={[
                                styles.featureText,
                                !feature.available && styles.featureTextDisabled
                              ]}>
                                {feature.text}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Premium Plan */}
                    <TouchableOpacity
                      style={[styles.planCard, selectedTier === 'premium' && styles.selectedPlan]}
                      onPress={() => setSelectedTier('premium')}
                    >
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>🔥 Recommended</Text>
                      </View>
                      
                      <LinearGradient
                        colors={selectedTier === 'premium' 
                          ? ['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)']
                          : ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']
                        }
                        style={styles.planCardGradient}
                      >
                        <View style={styles.planHeader}>
                          <Text style={styles.planEmoji}>👑</Text>
                          <Text style={styles.planName}>Premium</Text>
                          <Text style={styles.planPrice}>$4.99/month</Text>
                        </View>
                        
                        <View style={styles.featuresContainer}>
                          {premiumFeatures.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                              <Text style={styles.featureIcon}>{feature.icon}</Text>
                              <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => handlePlanSelection(selectedTier)}
                    disabled={isProcessing}
                  >
                    <LinearGradient
                      colors={selectedTier === 'premium' 
                        ? ['#10B981', '#059669']
                        : ['#8B5CF6', '#EC4899']
                      }
                      style={styles.continueButtonGradient}
                    >
                      <Text style={styles.continueButtonText}>
                        {isProcessing 
                          ? 'Processing...' 
                          : selectedTier === 'premium' 
                            ? '👑 Start Premium Journey'
                            : '🆓 Start Free Journey'
                        }
                      </Text>
                      {!isProcessing && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose} style={styles.skipButton}>
                    <Text style={styles.skipButtonText}>I'll decide later</Text>
                  </TouchableOpacity>
                </View>

                {/* Trust Indicators */}
                <View style={styles.trustSection}>
                  <Text style={styles.trustText}>🔒 Cancel anytime • 💳 Secure payment • 🎯 ADHD-focused</Text>
                </View>
              </ScrollView>
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
    maxHeight: height * 0.85, // Reduced from 0.9 to allow more space
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Header
  header: {
    padding: 24,
    alignItems: 'center',
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
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Benefits
  benefitsSection: {
    paddingHorizontal: 24,
    marginBottom: 20, // Reduced from 24
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitDot: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '900',
  },
  benefitText: {
    color: '#E5E7EB',
    fontSize: 14,
    flex: 1,
  },
  
  // Plans
  plansSection: {
    paddingHorizontal: 24,
    marginBottom: 20, // Reduced from 24
  },
  plansSectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#8B5CF6',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: '#EC4899',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  planCardGradient: {
    padding: 16,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  planName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  planPrice: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 14,
    width: 20,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  featureTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  
  // Buttons
  buttonsContainer: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 12, // Reduced from 16
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Trust
  trustSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  trustText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});