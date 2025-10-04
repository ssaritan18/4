import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DeleteAccountScreen() {
  const { user, token, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State management
  const [currentStep, setCurrentStep] = useState<'info' | 'form' | 'confirmation'>('info');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedReasons = [
    'Privacy concerns',
    'No longer needed',
    'Switching to another app',
    'Dissatisfied with service',
    'Too many notifications',
    'Account security concerns',
    'Other (please specify)'
  ];

  const handleDeleteRequest = async () => {
    if (!reason) {
      Alert.alert('Missing Information', 'Please select a reason for deletion.');
      return;
    }

    if (reason === 'Other (please specify)' && !customReason.trim()) {
      Alert.alert('Missing Information', 'Please specify your reason for deletion.');
      return;
    }

    if (!userEmail.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }

    if (confirmationText.toLowerCase() !== 'delete my account') {
      Alert.alert('Confirmation Error', 'Please type "DELETE MY ACCOUNT" to confirm.');
      return;
    }

    try {
      setLoading(true);

      const finalReason = reason === 'Other (please specify)' ? customReason : reason;

      const response = await api.post('/api/account/delete', {
        reason: finalReason,
        user_email: userEmail,
        confirmation: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert(
          'Deletion Request Submitted',
          'Your account deletion request has been submitted successfully. You will receive a confirmation email shortly. We will process your request within 2-3 business days.',
          [
            {
              text: 'OK',
              onPress: () => {
                signOut(); // Sign out the user
                router.replace('/'); // Redirect to home
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Failed to submit deletion request:', error);
      Alert.alert(
        'Request Failed',
        'Failed to submit deletion request. Please try again or contact support at adhderssocialclub@gmail.com'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === 'form') {
      setCurrentStep('info');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('form');
    } else {
      router.back();
    }
  };

  const renderInfoStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.1)']}
        style={styles.warningCard}
      >
        <Text style={styles.warningEmoji}>⚠️</Text>
        <Text style={styles.warningTitle}>Important: Account Deletion</Text>
        <Text style={styles.warningText}>
          This action will permanently delete your ADHDers Social Club account and cannot be undone.
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.infoCard}
      >
        <Text style={styles.sectionTitle}>🗑️ What Will Be Deleted</Text>
        <View style={styles.deleteList}>
          <Text style={styles.deleteItem}>• Your profile information and account details</Text>
          <Text style={styles.deleteItem}>• All your posts, comments, and social interactions</Text>
          <Text style={styles.deleteItem}>• Chat messages and voice recordings</Text>
          <Text style={styles.deleteItem}>• Friend connections and requests</Text>
          <Text style={styles.deleteItem}>• Task data and achievement records</Text>
          <Text style={styles.deleteItem}>• All personal data stored in our systems</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']}
        style={styles.infoCard}
      >
        <Text style={styles.sectionTitle}>⏱️ Deletion Process</Text>
        <View style={styles.processList}>
          <Text style={styles.processItem}>1. Submit your deletion request</Text>
          <Text style={styles.processItem}>2. Receive confirmation email</Text>
          <Text style={styles.processItem}>3. Our team reviews your request (2-3 business days)</Text>
          <Text style={styles.processItem}>4. Account and data permanently deleted</Text>
          <Text style={styles.processItem}>5. Final confirmation email sent</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
        style={styles.infoCard}
      >
        <Text style={styles.sectionTitle}>📧 Contact Information</Text>
        <Text style={styles.contactText}>
          If you have questions or want to cancel your deletion request, contact us immediately:
        </Text>
        <Text style={styles.contactEmail}>adhderssocialclub@gmail.com</Text>
      </LinearGradient>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => setCurrentStep('form')}>
          <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.proceedButton}>
            <Text style={styles.proceedButtonText}>Proceed with Deletion</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={goBack}>
          <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderFormStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.formCard}
      >
        <Text style={styles.sectionTitle}>📝 Deletion Request Form</Text>
        
        {/* Reason Selection */}
        <Text style={styles.fieldLabel}>Why are you deleting your account? *</Text>
        {predefinedReasons.map((reasonOption) => (
          <TouchableOpacity
            key={reasonOption}
            onPress={() => setReason(reasonOption)}
            style={[styles.reasonOption, reason === reasonOption && styles.selectedReason]}
          >
            <View style={[styles.radio, reason === reasonOption && styles.radioSelected]}>
              {reason === reasonOption && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.reasonText, reason === reasonOption && styles.selectedReasonText]}>
              {reasonOption}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Custom Reason Input */}
        {reason === 'Other (please specify)' && (
          <View style={styles.customReasonContainer}>
            <Text style={styles.fieldLabel}>Please specify your reason:</Text>
            <TextInput
              style={styles.textInput}
              value={customReason}
              onChangeText={setCustomReason}
              placeholder="Enter your reason..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Email Confirmation */}
        <Text style={styles.fieldLabel}>Confirm your email address: *</Text>
        <TextInput
          style={styles.textInput}
          value={userEmail}
          onChangeText={setUserEmail}
          placeholder="your-email@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </LinearGradient>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => setCurrentStep('confirmation')}
          disabled={!reason || !userEmail.trim()}
        >
          <LinearGradient 
            colors={!reason || !userEmail.trim() ? ['#6B7280', '#4B5563'] : ['#EF4444', '#DC2626']} 
            style={styles.proceedButton}
          >
            <Text style={styles.proceedButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={goBack}>
          <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderConfirmationStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.2)']}
        style={styles.confirmationCard}
      >
        <Text style={styles.confirmationEmoji}>🚨</Text>
        <Text style={styles.confirmationTitle}>Final Confirmation</Text>
        <Text style={styles.confirmationText}>
          This is your last chance to cancel. Once you proceed, your account deletion request will be submitted and cannot be easily reversed.
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.summaryCard}
      >
        <Text style={styles.sectionTitle}>📋 Request Summary</Text>
        <Text style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Email:</Text> {userEmail}
        </Text>
        <Text style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Reason:</Text> {reason === 'Other (please specify)' ? customReason : reason}
        </Text>
        <Text style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Processing Time:</Text> 2-3 business days
        </Text>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.confirmationInputCard}
      >
        <Text style={styles.fieldLabel}>
          Type "DELETE MY ACCOUNT" to confirm: *
        </Text>
        <TextInput
          style={styles.textInput}
          value={confirmationText}
          onChangeText={setConfirmationText}
          placeholder="DELETE MY ACCOUNT"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
        />
      </LinearGradient>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={handleDeleteRequest}
          disabled={loading || confirmationText.toLowerCase() !== 'delete my account'}
        >
          <LinearGradient 
            colors={loading || confirmationText.toLowerCase() !== 'delete my account' 
              ? ['#6B7280', '#4B5563'] 
              : ['#EF4444', '#DC2626']} 
            style={styles.proceedButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.proceedButtonText}>Submit Deletion Request</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={goBack} disabled={loading}>
          <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <LinearGradient
        colors={['#EF4444', '#DC2626', '#B91C1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressStep,
            currentStep === 'info' && styles.activeProgressStep
          ]}>
            <Text style={styles.progressStepText}>1</Text>
          </View>
          <View style={[
            styles.progressLine,
            (currentStep === 'form' || currentStep === 'confirmation') && styles.activeProgressLine
          ]} />
          <View style={[
            styles.progressStep,
            currentStep === 'form' && styles.activeProgressStep
          ]}>
            <Text style={styles.progressStepText}>2</Text>
          </View>
          <View style={[
            styles.progressLine,
            currentStep === 'confirmation' && styles.activeProgressLine
          ]} />
          <View style={[
            styles.progressStep,
            currentStep === 'confirmation' && styles.activeProgressStep
          ]}>
            <Text style={styles.progressStepText}>3</Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Information</Text>
          <Text style={styles.progressLabel}>Details</Text>
          <Text style={styles.progressLabel}>Confirm</Text>
        </View>
      </View>

      {/* Content */}
      {currentStep === 'info' && renderInfoStep()}
      {currentStep === 'form' && renderFormStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProgressStep: {
    backgroundColor: '#EF4444',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  activeProgressLine: {
    backgroundColor: '#EF4444',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  warningCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  deleteList: {
    marginLeft: 8,
  },
  deleteItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    lineHeight: 20,
  },
  processList: {
    marginLeft: 8,
  },
  processItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  proceedButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedReason: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#EF4444',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  reasonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  selectedReasonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customReasonContainer: {
    marginTop: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 40,
  },
  confirmationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  confirmationEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    lineHeight: 20,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmationInputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});