import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSubscription } from '../context/SubscriptionContext';
import { SubscriptionCancellationModal } from './SubscriptionCancellationModal';

interface FeatureItem {
  icon: string;
  text: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  gradient: string[];
  features: FeatureItem[];
  popular?: boolean;
  buttonText: string;
  pricePerMonth?: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: '🆓 Free Tier',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with ADHD support',
    gradient: ['#6B7280', '#9CA3AF'],
    buttonText: 'Current Plan',
    features: [
      { icon: '✅', text: 'Basic task management', included: true },
      { icon: '🎯', text: '3 focus sessions per day', included: true },
      { icon: '👥', text: 'Community access (read-only)', included: true },
      { icon: '👤', text: 'Basic profile features', included: true },
      { icon: '👥', text: 'Up to 5 friends', included: true },
      { icon: '💭', text: 'Daily mood tracking', included: true },
      { icon: '📱', text: 'Banner ads shown', included: false },
      { icon: '🚫', text: 'Limited features', included: false },
    ]
  },
  {
    id: 'premium',
    name: '👑 Premium',
    price: '$4.99',
    period: 'per month',
    pricePerMonth: '$4.99/month',
    description: 'Unlock your full ADHD potential',
    gradient: ['#8B5CF6', '#EC4899', '#F97316'],
    buttonText: 'Upgrade Now',
    popular: true,
    features: [
      { icon: '✨', text: 'Ad-free experience', included: true },
      { icon: '🎯', text: 'Unlimited focus sessions', included: true },
      { icon: '👥', text: 'Full community participation', included: true },
      { icon: '📊', text: 'Advanced analytics & insights', included: true },
      { icon: '👥', text: 'Unlimited friends', included: true },
      { icon: '🎨', text: 'Premium themes & customization', included: true },
      { icon: '🏆', text: 'Priority support', included: true },
      { icon: '📈', text: 'Detailed mood patterns', included: true },
    ]
  }
];

export function SubscriptionPage() {
  const insets = useSafeAreaInsets();
  const { subscription, upgradeToPremium } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<string>(subscription.tier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  // Update selectedTier when subscription changes
  useEffect(() => {
    setSelectedTier(subscription.tier);
  }, [subscription.tier]);

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'free' && subscription.tier === 'free') {
      Alert.alert('Current Plan', 'You are already on the free plan!');
      return;
    }

    if (tierId === 'premium' && subscription.tier === 'premium') {
      Alert.alert('Already Premium', 'You already have a premium subscription!');
      return;
    }

    if (tierId === 'free' && subscription.tier === 'premium') {
      // User wants to downgrade from premium to free
      setShowCancellationModal(true);
      return;
    }

    if (tierId === 'premium') {
      // For premium upgrade, redirect to payment page
      router.push('/payment');
    }
  };

  // Update pricing tiers based on current subscription
  const updatedPricingTiers = pricingTiers.map(tier => {
    if (tier.id === 'free') {
      return {
        ...tier,
        buttonText: subscription.tier === 'free' ? 'Current Plan' : 'Downgrade to Free'
      };
    } else {
      return {
        ...tier,
        buttonText: subscription.tier === 'premium' ? 'Current Plan' : 'Upgrade Now'
      };
    }
  });

  const renderFeature = (feature: FeatureItem, index: number) => (
    <View key={index} style={styles.featureItem}>
      <Text style={styles.featureIcon}>{feature.icon}</Text>
      <Text style={[
        styles.featureText,
        !feature.included && styles.featureTextDisabled
      ]}>
        {feature.text}
      </Text>
      {!feature.included && <Ionicons name="close" size={16} color="#EF4444" />}
    </View>
  );

  const renderPricingCard = (tier: PricingTier) => (
    <View key={tier.id} style={styles.pricingCardContainer}>
      {tier.popular && (
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          style={styles.popularBadge}
        >
          <Text style={styles.popularBadgeText}>🔥 Most Popular</Text>
        </LinearGradient>
      )}
      
      <LinearGradient
        colors={tier.gradient}
        style={[styles.pricingCard, tier.popular && styles.popularCard]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.tierName}>{tier.name}</Text>
          <Text style={styles.tierDescription}>{tier.description}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{tier.price}</Text>
            <Text style={styles.period}>/{tier.period}</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {tier.features.map((feature, index) => renderFeature(feature, index))}
        </View>

        <TouchableOpacity
          style={styles.subscribeButtonContainer}
          onPress={() => handleSubscribe(tier.id)}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={tier.id === 'free' 
              ? ['#374151', '#4B5563'] 
              : ['#10B981', '#059669']
            }
            style={styles.subscribeButton}
          >
            <Text style={styles.subscribeButtonText}>
              {isProcessing && tier.id === 'premium' ? 'Processing...' : tier.buttonText}
            </Text>
            {tier.id === 'premium' && !isProcessing && (
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F97316']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>💎 Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Unlock your full ADHD potential with Premium features
          </Text>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Value Proposition */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
          style={styles.valueCard}
        >
          <Text style={styles.valueTitle}>🧠 Built for Neurodivergent Minds</Text>
          <Text style={styles.valueDescription}>
            Our features are specifically designed to support ADHD brains with dopamine-friendly 
            interactions, clear progress tracking, and community support.
          </Text>
          
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🎯</Text>
              <Text style={styles.benefitText}>Focus Enhancement</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>📊</Text>
              <Text style={styles.benefitText}>Progress Tracking</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💭</Text>
              <Text style={styles.benefitText}>Mood Insights</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>👥</Text>
              <Text style={styles.benefitText}>Community Support</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pricing Cards */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Choose Your Adventure</Text>
          {updatedPricingTiers.map(renderPricingCard)}
        </View>

        {/* FAQ Section */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
          style={styles.faqCard}
        >
          <Text style={styles.faqTitle}>❓ Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can cancel your subscription at any time. You'll continue to have access 
              to premium features until the end of your billing period.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens to my data if I downgrade?</Text>
            <Text style={styles.faqAnswer}>
              Your data is always safe! If you downgrade, you'll keep all your existing data 
              but some premium features will be limited.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is this designed specifically for ADHD?</Text>
            <Text style={styles.faqAnswer}>
              Absolutely! Every feature is designed with neurodivergent minds in mind, 
              incorporating principles that work best for ADHD brains.
            </Text>
          </View>
        </LinearGradient>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>🔒 Your Privacy & Security</Text>
          <View style={styles.trustItems}>
            <Text style={styles.trustItem}>🛡️ End-to-end encryption</Text>
            <Text style={styles.trustItem}>🚫 No data selling</Text>
            <Text style={styles.trustItem}>💳 Secure payments</Text>
            <Text style={styles.trustItem}>📱 Cancel anytime</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Cancellation Modal */}
      <SubscriptionCancellationModal
        visible={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  headerGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Value Proposition
  valueCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  valueTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  valueDescription: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  benefitItem: {
    alignItems: 'center',
    width: '40%',
  },
  benefitEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  benefitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Pricing Section
  pricingSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pricingCardContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  pricingCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  popularCard: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    transform: [{ scale: 1.02 }],
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tierName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  tierDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  period: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginLeft: 4,
  },
  
  // Features
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  featureIcon: {
    fontSize: 16,
    width: 20,
  },
  featureText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  featureTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  
  // Subscribe Button
  subscribeButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // FAQ Section
  faqCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  faqTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  faqAnswer: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Trust Section
  trustSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trustTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  trustItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  trustItem: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});