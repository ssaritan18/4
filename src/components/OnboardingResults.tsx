import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingSubscriptionModal } from './OnboardingSubscriptionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../lib/api';

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

type OnboardingResultsProps = {
  result: OnboardingResult;
  onContinue: () => void;
};

const { width } = Dimensions.get('window');

export function OnboardingResults({ result, onContinue }: OnboardingResultsProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Subscription modal state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Save assessment result to backend
  const saveAssessmentResult = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Get user ID from AsyncStorage or context
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        console.log('No user data found, saving locally only');
        await AsyncStorage.setItem('pending_assessment_result', JSON.stringify(result));
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.id || user._id;
      
      if (!userId) {
        console.log('No user ID found, saving locally only');
        await AsyncStorage.setItem('pending_assessment_result', JSON.stringify(result));
        return;
      }
      
      // Save to backend
      const response = await fetch(`${API_BASE_URL}/users/${userId}/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(result)
      });
      
      if (response.ok) {
        console.log('✅ Assessment result saved to backend');
        // Also save locally as backup
        await AsyncStorage.setItem(`assessment_result_${userId}`, JSON.stringify(result));
      } else {
        console.log('❌ Failed to save to backend, saving locally only');
        await AsyncStorage.setItem('pending_assessment_result', JSON.stringify(result));
      }
    } catch (error) {
      console.log('❌ Error saving assessment result:', error);
      // Fallback to local storage
      await AsyncStorage.setItem('pending_assessment_result', JSON.stringify(result));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for continue button
    setTimeout(() => {
      Animated.loop(
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
      ).start();
    }, 2000);

    // Save assessment result
    saveAssessmentResult();
  }, []);

  const getTypeDescription = () => {
    switch (result.adhd_type) {
      case 'primarily_inattentive':
        return {
          title: 'Primarily Inattentive',
          icon: '🎯',
          description: 'You show strong patterns of inattention. You might struggle with focus, organization, and completing tasks, but you\'re probably not hyperactive.',
          color: '#4A90E2'
        };
      case 'primarily_hyperactive':
        return {
          title: 'Primarily Hyperactive-Impulsive',
          icon: '⚡',
          description: 'You show strong patterns of hyperactivity and impulsivity. You might fidget, talk excessively, or act without thinking, but attention might not be your main challenge.',
          color: '#FF6B35'
        };
      case 'combined':
        return {
          title: 'Combined Presentation',
          icon: '🌟',
          description: 'You show patterns of both inattention and hyperactivity-impulsivity. This is the most common ADHD presentation.',
          color: '#6C5CE7'
        };
      case 'mild_traits':
        return {
          title: 'Mild ADHD Traits',
          icon: '🌱',  
          description: 'You show some ADHD-like traits, but they may not significantly impact your daily life. Many neurodivergent people have some ADHD characteristics.',
          color: '#00C851'
        };
    }
  };

  const getCategoryColor = (score: number) => {
    if (score >= 90) return '#8B0000'; // Very High - Dark Red
    if (score >= 80) return '#FF3547'; // High - Red
    if (score >= 70) return '#FF6B35'; // High-Medium - Orange-Red
    if (score >= 60) return '#FF8C00'; // Medium-High - Dark Orange
    if (score >= 50) return '#FFD700'; // Medium - Yellow
    if (score >= 40) return '#4A90E2'; // Medium-Low - Blue
    if (score >= 30) return '#32CD32'; // Low-Medium - Green
    if (score >= 20) return '#00C851'; // Low - Dark Green
    return '#228B22'; // Very Low - Forest Green
  };

  const getCategoryLevel = (score: number) => {
    if (score >= 90) return { level: 'Very High', description: 'Significant ADHD traits' };
    if (score >= 80) return { level: 'High', description: 'Strong ADHD traits' };
    if (score >= 70) return { level: 'High-Medium', description: 'Moderate to strong traits' };
    if (score >= 60) return { level: 'Medium-High', description: 'Moderate traits' };
    if (score >= 50) return { level: 'Medium', description: 'Some ADHD traits' };
    if (score >= 40) return { level: 'Medium-Low', description: 'Mild traits' };
    if (score >= 30) return { level: 'Low-Medium', description: 'Very mild traits' };
    if (score >= 20) return { level: 'Low', description: 'Minimal traits' };
    return { level: 'Very Low', description: 'No significant traits' };
  };

  const typeInfo = getTypeDescription();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🧠✨</Text>
            <Text style={styles.headerTitle}>Your ADHD Profile</Text>
            <Text style={styles.headerSubtitle}>
              Understanding your unique neurodivergent brain
            </Text>
          </View>

          {/* Overall Score */}
          <View style={styles.scoreSection}>
            <Text style={styles.sectionTitle}>Overall Assessment</Text>
            <View style={[styles.scoreCard, { borderColor: getCategoryColor(result.overall_score) }]}>
              <Text style={styles.scoreNumber}>{result.overall_score}%</Text>
              <Text style={styles.scoreLabel}>ADHD Traits Present</Text>
              
              {/* Level Information */}
              <View style={styles.levelInfoContainer}>
                <Text style={[styles.levelText, { color: getCategoryColor(result.overall_score) }]}>
                  {getCategoryLevel(result.overall_score).level}
                </Text>
                <Text style={styles.levelDescription}>
                  {getCategoryLevel(result.overall_score).description}
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${result.overall_score}%`,
                        backgroundColor: getCategoryColor(result.overall_score)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressBarLabel}>
                  {result.overall_score}/100
                </Text>
              </View>
            </View>
          </View>

          {/* Type Description */}
          <View style={styles.typeSection}>
            <Text style={styles.sectionTitle}>Your ADHD Type</Text>
            <View style={[styles.typeCard, { borderColor: typeInfo.color }]}>
              <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
              <Text style={[styles.typeTitle, { color: typeInfo.color }]}>
                {typeInfo.title}
              </Text>
              <Text style={styles.typeDescription}>
                {typeInfo.description}
              </Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {Object.entries(result.categories).map(([category, score]) => {
              const categoryNames = {
                attention: { name: 'Attention', icon: '🎯' },
                hyperactivity: { name: 'Hyperactivity', icon: '⚡' },
                organization: { name: 'Organization', icon: '📋' },
                emotional: { name: 'Emotional', icon: '💚' },
                social: { name: 'Social', icon: '👥' }
              };
              
              const categoryInfo = categoryNames[category as keyof typeof categoryNames];
              const color = getCategoryColor(score);
              const levelInfo = getCategoryLevel(score);
              
              return (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
                    <Text style={styles.categoryName}>{categoryInfo.name}</Text>
                    <Text style={[styles.categoryScore, { color }]}>{score}%</Text>
                  </View>
                  <View style={styles.categoryBarContainer}>
                    <View 
                      style={[
                        styles.categoryBar,
                        {
                          width: `${score}%`,
                          backgroundColor: color
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.categoryLevel, { color }]}>
                    {levelInfo.level} - {levelInfo.description}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            <Text style={styles.recommendationsIntro}>
              Based on your results, here are some features that might help you:
            </Text>
            {result.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>

          {/* Encouragement */}
          <View style={styles.encouragementSection}>
            <Text style={styles.encouragementTitle}>Remember: You're Amazing! 💜</Text>
            <Text style={styles.encouragementText}>
              ADHD brains are creative, innovative, and full of potential. This assessment 
              helps us personalize your experience in the ADHDers Social Club. You're 
              joining a community that understands and celebrates neurodiversity!
            </Text>
          </View>

          {/* Continue Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={() => setShowSubscriptionModal(true)}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>
                  Continue to Your Dashboard 🚀
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </Animated.View>
      
      {/* Subscription Modal */}
      <OnboardingSubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          onContinue(); // Continue to main app after modal closes
        }}
        assessmentResult={
          result.overall_score >= 70 ? 'high' :
          result.overall_score >= 40 ? 'moderate' : 'low'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show parent gradient
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  scoreCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
  },
  scoreNumber: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 8,
  },
  scoreLabel: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
  },
  typeSection: {
    marginBottom: 24,
  },
  typeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  typeDescription: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryLevel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationsIntro: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  recommendationItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    padding: 16,
    marginBottom: 12,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  encouragementSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  encouragementTitle: {
    color: '#6C5CE7',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  encouragementText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  levelInfoContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  levelDescription: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  progressBarContainer: {
    marginTop: 16,
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarLabel: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});