import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ADHDOnboarding } from '../src/components/ADHDOnboarding';
import { OnboardingSignupPrompt } from '../src/components/OnboardingSignupPrompt';

type OnboardingResult = {
  overall_score: number;
  categories: {
    attention: number;
    hyperactivity: number;
    organization: number;
    emotional: number;
    social: number;
  };
  recommendations: string[];
  adhd_type: 'primarily_inattentive' | 'primarily_hyperactive' | 'combined' | 'mild_traits';
};

export default function OnboardingScreen() {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<OnboardingResult | null>(null);

  const handleOnboardingComplete = (result: OnboardingResult) => {
    console.log('🧠 ADHD Assessment Results:', result);
    setResults(result);
    setShowResults(true);
  };

  const handleSkip = () => {
    console.log('📋 Onboarding skipped');
    router.replace('/(tabs)/');
  };

  const handleBackToWelcome = () => {
    console.log('🔙 Back to welcome page');
    router.replace('/(auth)/welcome');
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#8B5CF6', '#A855F7']}
      style={styles.container}
    >
      {showResults && results ? (
        <OnboardingSignupPrompt 
          result={results}
          onBackToWelcome={handleBackToWelcome}
        />
      ) : (
        <ADHDOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleSkip}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
});