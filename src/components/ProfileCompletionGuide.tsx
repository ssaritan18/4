import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

type CompletionItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  completed: boolean;
  reward: {
    points: number;
    badge?: string;
    description: string;
  };
  action?: () => void;
};

type ProfileCompletionGuideProps = {
  completionItems: CompletionItem[];
  onItemPress?: (item: CompletionItem) => void;
  showAnimation?: boolean;
};

function CompletionItem({ 
  item, 
  index, 
  onPress,
  showAnimation = true 
}: { 
  item: CompletionItem;
  index: number;
  onPress?: (item: CompletionItem) => void;
  showAnimation?: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      // Staggered entry animation
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, index * 150);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(1);
    }
  }, [showAnimation, index]);

  useEffect(() => {
    if (item.completed && showAnimation) {
      // Completion celebration
      Animated.sequence([
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Show reward animation
      setShowReward(true);
      
      // Sparkle effect
      Animated.loop(
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        { iterations: 3 }
      ).start(() => {
        setTimeout(() => setShowReward(false), 2000);
      });

      // Success glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [item.completed, showAnimation]);

  const handlePress = () => {
    if (!item.completed && onPress) {
      // Press feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      onPress(item);
    }
  };

  return (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })
            },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.item,
          item.completed && styles.completedItem,
          !item.completed && styles.pendingItem
        ]}
        activeOpacity={item.completed ? 1 : 0.8}
      >
        {/* Glow effect for completed items */}
        {item.completed && (
          <Animated.View 
            style={[
              styles.completionGlow,
              {
                opacity: glowAnim,
              }
            ]}
          />
        )}

        {/* Main content */}
        <View style={styles.itemContent}>
          <View style={styles.leftSection}>
            <View style={[
              styles.emojiContainer,
              item.completed ? styles.emojiCompleted : styles.emojiPending
            ]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              
              {/* Checkmark overlay */}
              {item.completed && (
                <Animated.View 
                  style={[
                    styles.checkmark,
                    {
                      opacity: checkAnim,
                      transform: [{
                        scale: checkAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1]
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.checkmarkText}>✓</Text>
                </Animated.View>
              )}
            </View>

            <View style={styles.textContent}>
              <Text style={[
                styles.itemTitle,
                item.completed && styles.completedText
              ]}>
                {item.title}
              </Text>
              <Text style={styles.itemDescription}>
                {item.description}
              </Text>
              
              {/* Reward info */}
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardText}>
                  🏆 {item.reward.points} points
                  {item.reward.badge && ` • ${item.reward.badge} badge`}
                </Text>
              </View>
            </View>
          </View>

          {/* Status indicator */}
          <View style={styles.statusIndicator}>
            {item.completed ? (
              <View style={styles.completedIndicator}>
                <Text style={styles.completedIndicatorText}>Done!</Text>
              </View>
            ) : (
              <View style={styles.pendingIndicator}>
                <Text style={styles.pendingIndicatorText}>→</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reward popup */}
        {showReward && (
          <Animated.View 
            style={[
              styles.rewardPopup,
              {
                opacity: sparkleAnim,
                transform: [{
                  translateY: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -10]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.rewardPopupText}>
              +{item.reward.points} points! 🎉
            </Text>
            {item.reward.badge && (
              <Text style={styles.rewardBadgeText}>
                {item.reward.badge} unlocked!
              </Text>
            )}
          </Animated.View>
        )}

        {/* Sparkle effects */}
        {item.completed && showAnimation && (
          <>
            {[...Array(4)].map((_, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.sparkle,
                  {
                    left: 20 + (i * 30),
                    top: 20 + Math.sin(i) * 15,
                    opacity: sparkleAnim,
                    transform: [{
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }
                ]}
              >
                ✨
              </Animated.Text>
            ))}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ProfileCompletionGuide({ 
  completionItems, 
  onItemPress,
  showAnimation = true 
}: ProfileCompletionGuideProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const completedCount = completionItems.filter(item => item.completed).length;
  const totalCount = completionItems.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const totalPoints = completionItems
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.reward.points, 0);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completionPercentage / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [completionPercentage]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.headerTitle}>🎯 Profile Completion</Text>
        <Text style={styles.headerSubtitle}>
          Complete tasks to unlock rewards and badges!
        </Text>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} completed ({Math.round(completionPercentage)}%)
          </Text>
        </View>

        {/* Points earned */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>
            🏆 {totalPoints.toLocaleString()} points earned
          </Text>
        </View>
      </View>

      {/* Completion Items */}
      <View style={styles.itemsList}>
        {completionItems.map((item, index) => (
          <CompletionItem
            key={item.id}
            item={item}
            index={index}
            onPress={onItemPress}
            showAnimation={showAnimation}
          />
        ))}
      </View>

      {/* Completion celebration */}
      {completedCount === totalCount && totalCount > 0 && (
        <View style={styles.allCompletedContainer}>
          <Text style={styles.allCompletedTitle}>
            🎉 PROFILE COMPLETE! 🎉
          </Text>
          <Text style={styles.allCompletedSubtitle}>
            You've unlocked all profile rewards! Your ADHD journey is off to an amazing start.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Progress Header
  progressHeader: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00C851',
    borderRadius: 6,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pointsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'center',
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },

  // Items List
  itemsList: {
    gap: 12,
  },
  itemContainer: {
    marginHorizontal: 4,
  },
  item: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  completedItem: {
    backgroundColor: '#0D2818',
    borderColor: '#00C851',
  },
  pendingItem: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
  },
  completionGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#00C851',
    borderRadius: 18,
    opacity: 0.2,
  },

  // Item Content
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  emojiCompleted: {
    backgroundColor: '#00C851',
  },
  emojiPending: {
    backgroundColor: '#2A2A2A',
  },
  emoji: {
    fontSize: 24,
  },
  checkmark: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContent: {
    flex: 1,
  },
  itemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedText: {
    color: '#00C851',
  },
  itemDescription: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  rewardInfo: {
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  rewardText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '500',
  },

  // Status
  statusIndicator: {
    marginLeft: 12,
  },
  completedIndicator: {
    backgroundColor: '#00C851',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingIndicator: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingIndicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Reward Popup
  rewardPopup: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  rewardPopupText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardBadgeText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },

  // Sparkles
  sparkle: {
    position: 'absolute',
    fontSize: 12,
  },

  // All Completed
  allCompletedContainer: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  allCompletedTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  allCompletedSubtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});