import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';

type Challenge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'focus' | 'tasks' | 'community';
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
  max_progress: number;
  reward: {
    points: number;
    badge: string;
    description: string;
  };
  deadline: string;
  tips: string[];
};

type WeeklyChallengesProps = {
  challenges?: Challenge[];
  onChallengePress?: (challenge: Challenge) => void;
  onChallengeComplete?: (challengeId: string) => void;
  showAnimation?: boolean;
};

const { width } = Dimensions.get('window');

export function WeeklyChallenges({ 
  challenges = [], 
  onChallengePress,
  onChallengeComplete,
  showAnimation = true 
}: WeeklyChallengesProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (showAnimation) {
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Continuous pulse for active challenges
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showAnimation]);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '#00C851';    // Green
      case 'medium': return '#FF6B35';  // Orange  
      case 'hard': return '#FF3547';    // Red
      default: return '#4A90E2';        // Blue
    }
  };

  const getCategoryColor = (category: Challenge['category']) => {
    switch (category) {
      case 'focus': return '#6C5CE7';     // Purple
      case 'tasks': return '#4A90E2';     // Blue
      case 'community': return '#00C851'; // Green
      default: return '#888';
    }
  };

  const getProgressPercentage = (challenge: Challenge) => {
    return (challenge.progress / challenge.max_progress) * 100;
  };

  const isCompleted = (challenge: Challenge) => {
    return challenge.progress >= challenge.max_progress || completedChallenges.has(challenge.id);
  };

  const handleChallengePress = (challenge: Challenge) => {
    onChallengePress?.(challenge);
    
    // Show challenge details
    Alert.alert(
      `${challenge.icon} ${challenge.name}`,
      `${challenge.description}\n\nProgress: ${challenge.progress}/${challenge.max_progress}\nReward: ${challenge.reward.points} points\n\nTips:\n${challenge.tips.map(tip => `• ${tip}`).join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isCompleted(challenge) ? 'Completed! 🎉' : 'Start Challenge', 
          onPress: () => {
            if (!isCompleted(challenge)) {
              handleStartChallenge(challenge);
            }
          },
          style: isCompleted(challenge) ? 'default' : 'default'
        }
      ]
    );
  };

  const handleStartChallenge = (challenge: Challenge) => {
    Alert.alert(
      'Challenge Started! 🚀',
      `Good luck with "${challenge.name}"! Remember:\n\n${challenge.tips.slice(0, 2).map(tip => `• ${tip}`).join('\n')}\n\nYou can do this! 💪`,
      [{ text: 'Let\'s Go!', style: 'default' }]
    );
  };

  const handleCompleteChallenge = (challenge: Challenge) => {
    if (isCompleted(challenge)) return;

    setCompletedChallenges(prev => new Set([...prev, challenge.id]));
    onChallengeComplete?.(challenge.id);

    // Celebration animation and alert
    Alert.alert(
      '🎉 Challenge Completed! 🎉',
      `Congratulations! You've completed "${challenge.name}"!\n\n🏆 Reward: ${challenge.reward.points} points\n🎖️ Badge: ${challenge.reward.badge}\n\n${challenge.reward.description}`,
      [{ text: 'Amazing!', style: 'default' }]
    );
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Challenges 🏆</Text>
      <Text style={styles.subtitle}>ADHD-friendly challenges to boost your motivation!</Text>
      
      <Animated.View 
        style={[
          styles.challengesContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {challenges.map((challenge, index) => {
            const completed = isCompleted(challenge);
            const progressPercentage = getProgressPercentage(challenge);
            
            return (
              <Animated.View
                key={challenge.id}
                style={[
                  styles.challengeCard,
                  {
                    transform: [{ scale: completed ? 1 : pulseAnim }],
                    opacity: completed ? 0.9 : 1,
                  }
                ]}
              >
                <TouchableOpacity 
                  onPress={() => handleChallengePress(challenge)}
                  activeOpacity={0.8}
                  style={styles.cardTouchable}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                    <View style={styles.headerInfo}>
                      <Text style={styles.challengeName} numberOfLines={2}>
                        {challenge.name}
                      </Text>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(challenge.difficulty) }
                      ]}>
                        <Text style={styles.difficultyText}>
                          {challenge.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.challengeDescription} numberOfLines={3}>
                    {challenge.description}
                  </Text>

                  {/* Progress */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressText}>
                        {challenge.progress}/{challenge.max_progress}
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {Math.round(progressPercentage)}%
                      </Text>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar,
                          { 
                            width: `${progressPercentage}%`,
                            backgroundColor: getCategoryColor(challenge.category)
                          }
                        ]}
                      />
                    </View>
                  </View>

                  {/* Reward */}
                  <View style={styles.rewardSection}>
                    <Text style={styles.rewardText}>
                      🏆 {challenge.reward.points} points
                    </Text>
                    <Text style={styles.badgeText}>
                      🎖️ {challenge.reward.badge}
                    </Text>
                  </View>

                  {/* Deadline */}
                  <View style={styles.deadlineSection}>
                    <Text style={styles.deadlineText}>
                      ⏰ {formatTimeLeft(challenge.deadline)}
                    </Text>
                  </View>

                  {/* Completion Status */}
                  {completed && (
                    <View style={styles.completedOverlay}>
                      <Text style={styles.completedText}>✅ COMPLETED!</Text>
                    </View>
                  )}

                  {/* Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: completed 
                          ? '#00C851' 
                          : getCategoryColor(challenge.category)
                      }
                    ]}
                    onPress={() => completed ? null : handleCompleteChallenge(challenge)}
                    disabled={completed}
                  >
                    <Text style={styles.actionButtonText}>
                      {completed ? 'Completed! 🎉' : 'Start Challenge 🚀'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {completedChallenges.size}/{challenges.length} challenges completed this week
        </Text>
        <Text style={styles.summarySubtext}>
          Keep going! Every challenge helps build your ADHD superpowers! 💪
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  challengesContainer: {
    marginBottom: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  challengeCard: {
    width: width * 0.75,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#333',
    overflow: 'hidden',
  },
  cardTouchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#BBB',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#888',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  rewardSection: {
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#888',
  },
  deadlineSection: {
    marginBottom: 16,
  },
  deadlineText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  completedOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#00C851',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summary: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});