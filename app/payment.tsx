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
import { useSubscription } from '../src/context/SubscriptionContext';
// import { iapService } from '../src/services/InAppPurchaseService'; // Disabled for now - will enable in production

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const { upgradeToPremium } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [iapInitialized, setIapInitialized] = useState(false);

  // Initialize IAP service
  useEffect(() => {
    initializeIAP();
  }, []);

  // Initialize IAP service - Mock for development
  const initializeIAP = async () => {
    try {
      // Mock initialization for development
      console.log('🔧 Development mode - using mock IAP service');
      setIapInitialized(true);
    } catch (error) {
      console.error('❌ IAP initialization error:', error);
      setIapInitialized(false);
    }
  };

  const handleAppStorePayment = async () => {
    setIsProcessing(true);
    
    try {
      if (!iapInitialized) {
        throw new Error('Payment service not available');
      }

      console.log('🛒 Mock payment processing...');
      
      // Mock payment processing for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Upgrade user subscription
      await upgradeToPremium();
      
      Alert.alert(
        '🎉 Payment Successful!',
        __DEV__ 
          ? '✅ Development mode: Mock payment processed successfully!\n\n🚀 In production, this will handle real App Store/Google Play payments.'
          : 'Welcome to Premium! You now have access to all premium features.',
        [
          {
            text: 'Start Using Premium',
            onPress: () => {
              router.replace('/');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      
      Alert.alert(
        'Payment Processing Error',
        __DEV__ 
          ? `Development mode error: ${error.message}\n\nThis will be resolved in production with real payment integration.`
          : 'There was an issue processing your payment. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodInfo = () => {
    if (Platform.OS === 'ios') {
      return {
        icon: '🍎',
        title: 'App Store',
        subtitle: 'Pay with Apple ID • Touch ID/Face ID • Secure',
        buttonText: '🍎 Pay with App Store'
      };
    } else {
      return {
        icon: '🤖',
        title: 'Google Play',
        subtitle: 'Pay with Google • Saved payment methods • Secure',
        buttonText: '🤖 Pay with Google Play'
      };
    }
  };

  const paymentInfo = getPaymentMethodInfo();

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
          <Text style={styles.headerTitle}>👑 Complete Your Premium Upgrade</Text>
          <Text style={styles.headerSubtitle}>
            Join thousands of ADHD users already using premium features
          </Text>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>📋 Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ADHDers Social Club Premium</Text>
            <Text style={styles.summaryValue}>$4.99</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Billing Period</Text>
            <Text style={styles.summaryValue}>Monthly</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Today</Text>
            <Text style={styles.summaryTotalValue}>$4.99</Text>
          </View>
          
          <Text style={styles.summaryNote}>
            ✨ Cancel anytime in {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} • 🔄 Auto-renews monthly • 📱 Instant access
          </Text>
        </LinearGradient>

        {/* Payment Method */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
          style={styles.paymentMethodCard}
        >
          <Text style={styles.paymentMethodTitle}>💳 Payment Method</Text>
          
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodIcon}>{paymentInfo.icon}</Text>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>{paymentInfo.title}</Text>
              <Text style={styles.paymentMethodDescription}>{paymentInfo.subtitle}</Text>
            </View>
            <View style={styles.securityBadge}>
              <Text style={styles.securityBadgeText}>🔒 Secure</Text>
            </View>
          </View>
          
          <View style={styles.paymentBenefits}>
            <Text style={styles.benefitItem}>✅ Use existing payment methods</Text>
            <Text style={styles.benefitItem}>✅ Biometric authentication</Text>
            <Text style={styles.benefitItem}>✅ Easy subscription management</Text>
            <Text style={styles.benefitItem}>✅ Automatic receipt via email</Text>
          </View>
        </LinearGradient>

        {/* Premium Features */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
          style={styles.featuresCard}
        >
          <Text style={styles.featuresTitle}>🎯 What You're Getting:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureText}>Completely ad-free experience</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>Unlimited focus sessions</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Advanced analytics & insights</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Unlimited friends & connections</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Priority customer support</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎨</Text>
              <Text style={styles.featureText}>Premium themes & customization</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Payment Button */}
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleAppStorePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.paymentButtonGradient}
          >
            <Text style={styles.paymentButtonText}>
              {isProcessing ? 'Processing Payment...' : paymentInfo.buttonText}
            </Text>
            {!isProcessing && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>

        {/* Subscription Management Info */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']}
          style={styles.managementCard}
        >
          <Text style={styles.managementTitle}>📱 Subscription Management</Text>
          <Text style={styles.managementText}>
            Your subscription will be managed through {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}. 
            You can cancel, upgrade, or modify your subscription anytime in your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Account'} settings.
          </Text>
          <View style={styles.managementSteps}>
            <Text style={styles.managementStep}>
              1. Go to {Platform.OS === 'ios' ? 'Settings > Apple ID > Subscriptions' : 'Play Store > Subscriptions'}
            </Text>
            <Text style={styles.managementStep}>
              2. Find "ADHDers Social Club Premium"
            </Text>
            <Text style={styles.managementStep}>
              3. Cancel or modify as needed
            </Text>
          </View>
        </LinearGradient>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>🔒 100% Secure Payment</Text>
          <View style={styles.trustFeatures}>
            <Text style={styles.trustItem}>🛡️ {Platform.OS === 'ios' ? 'Apple' : 'Google'} Security</Text>
            <Text style={styles.trustItem}>💳 No card details stored</Text>
            <Text style={styles.trustItem}>🔄 Cancel anytime</Text>
            <Text style={styles.trustItem}>📱 Instant activation</Text>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Order Summary
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '900',
  },
  summaryNote: {
    color: '#10B981',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  
  // Payment Method
  paymentMethodCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  paymentMethodTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  paymentMethodIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  securityBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  securityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  paymentBenefits: {
    gap: 8,
  },
  benefitItem: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Features
  featuresCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  featuresTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 16,
    width: 20,
  },
  featureText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  
  // Payment Button
  paymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Management
  managementCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  managementTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  managementText: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  managementSteps: {
    gap: 6,
  },
  managementStep: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Trust
  trustSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trustTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  trustFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  trustItem: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
});