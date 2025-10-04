import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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

type OnboardingSignupPromptProps = {
  result: OnboardingResult;
  onBackToWelcome: () => void;
};

const { width } = Dimensions.get('window');

export function OnboardingSignupPrompt({ result, onBackToWelcome }: OnboardingSignupPromptProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for signup button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Navigate to signup with assessment results stored
  const handleSignUp = async () => {
    try {
      // Store assessment results for later use
      // This will be retrieved after signup in the Profile/Journey section
      await AsyncStorage.setItem('pending_assessment_result', JSON.stringify(result));
      
      // Navigate to signup
      router.push('/(auth)/signup');
    } catch (error) {
      console.error('Error storing assessment result:', error);
      // Navigate anyway
      router.push('/(auth)/signup');
    }
  };

  // Get assessment summary for teaser
  const getAssessmentSummary = () => {
    const score = result.overall_score;
    if (score >= 70) {
      return {
        level: "Significant",
        color: "#F97316",
        emoji: "🧠"
      };
    } else if (score >= 40) {
      return {
        level: "Moderate", 
        color: "#8B5CF6",
        emoji: "🎯"
      };
    } else {
      return {
        level: "Mild",
        color: "#22C55E", 
        emoji: "🌟"
      };
    }
  };

  const summary = getAssessmentSummary();

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Celebration Header */}
        <View style={styles.celebrationContainer}>
          <Animated.View style={[styles.celebrationIcon, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </Animated.View>
          <Text style={styles.celebrationTitle}>Assessment Complete!</Text>
          <Text style={styles.celebrationSubtitle}>
            Great job completing your ADHD assessment
          </Text>
        </View>

        {/* Assessment Teaser */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.teaserCard}
        >
          <View style={styles.teaserHeader}>
            <Text style={styles.teaserEmoji}>{summary.emoji}</Text>
            <Text style={styles.teaserTitle}>Your Results Are Ready</Text>
          </View>
          
          <View style={styles.teaserPreview}>
            <View style={[styles.levelIndicator, { backgroundColor: summary.color }]}>
              <Text style={styles.levelText}>{summary.level}</Text>
            </View>
            <Text style={styles.teaserDescription}>
              Personalized insights and recommendations based on your responses
            </Text>
          </View>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={16} color="#8B5CF6" />
              <Text style={styles.featureText}>Detailed score breakdown</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bulb" size={16} color="#F97316" />
              <Text style={styles.featureText}>Personalized recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up" size={16} color="#22C55E" />
              <Text style={styles.featureText}>Progress tracking</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Sign up to save and see your results
          </Text>
        </View>
        
        <Text style={styles.warningSubtext}>
          Your assessment results will appear in your Profile after signup
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Sign Up Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={handleSignUp}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupButton}
              >
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.signupButtonText}>Sign Up Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Back to Welcome Button */}
          <TouchableOpacity onPress={onBackToWelcome} style={styles.backButton}>
            <Ionicons name="arrow-back" size={16} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.backButtonText}>Back to Welcome</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationEmoji: {
    fontSize: 36,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  teaserCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  teaserHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  teaserEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  teaserTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  teaserPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  teaserDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    textAlign: 'center',
  },
  warningSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default OnboardingSignupPrompt;