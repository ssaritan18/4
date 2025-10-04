import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingSubscriptionModal } from '../src/components/OnboardingSubscriptionModal';

export default function TestSubscriptionModal() {
  const [showModal, setShowModal] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<'high' | 'moderate' | 'low'>('moderate');

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Test Subscription Modal</Text>
        <Text style={styles.subtitle}>Test the scrollable subscription modal with different assessment results</Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setAssessmentResult('high');
              setShowModal(true);
            }}
          >
            <Text style={styles.buttonText}>Test High ADHD Result</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setAssessmentResult('moderate');
              setShowModal(true);
            }}
          >
            <Text style={styles.buttonText}>Test Moderate ADHD Result</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setAssessmentResult('low');
              setShowModal(true);
            }}
          >
            <Text style={styles.buttonText}>Test Low ADHD Result</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <OnboardingSubscriptionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        assessmentResult={assessmentResult}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttons: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});