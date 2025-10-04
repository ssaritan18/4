import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

type StreakVisualizationProps = {
  streak: number;
  bestStreak?: number;
  onPress?: () => void;
  showAnimation?: boolean;
};

const { width } = Dimensions.get('window');

export function StreakVisualization({ 
  streak, 
  bestStreak = streak, 
  onPress,
  showAnimation = true 
}: StreakVisualizationProps) {
  const fireScale = useRef(new Animated.Value(1)).current;
  const fireOpacity = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  const [displayStreak, setDisplayStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Determine fire intensity and color based on streak
  const getFireIntensity = (streakCount: number) => {
    if (streakCount === 0) return { emoji: '🔥', color: '#666', intensity: 'none' };
    if (streakCount < 7) return { emoji: '🔥', color: '#FF6B35', intensity: 'low' };
    if (streakCount < 14) return { emoji: '🔥', color: '#FF4500', intensity: 'medium' };
    if (streakCount < 30) return { emoji: '🔥🔥', color: '#FF2500', intensity: 'high' };
    if (streakCount < 60) return { emoji: '🔥🔥🔥', color: '#FF0000', intensity: 'extreme' };
    return { emoji: '🔥🔥🔥🔥', color: '#8B0000', intensity: 'legendary' };
  };

  const fireData = getFireIntensity(streak);
  const isNewBest = streak > 0 && streak === bestStreak && streak > 1;

  // Milestone celebrations
  const getMilestone = (streakCount: number) => {
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    return milestones.find(m => m === streakCount);
  };

  const milestone = getMilestone(streak);

  useEffect(() => {
    if (showAnimation && streak > displayStreak) {
      // Animate counter up
      const timer = setInterval(() => {
        setDisplayStreak(prev => {
          const next = prev + 1;
          if (next >= streak) {
            clearInterval(timer);
            return streak;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(timer);
    } else {
      setDisplayStreak(streak);
    }
  }, [streak, showAnimation]);

  useEffect(() => {
    if (showAnimation && streak > 0) {
      // Continuous fire animation
      const fireAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(fireScale, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(fireScale, {
              toValue: 0.95,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      // Glow effect for high streaks
      if (streak >= 7) {
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

      fireAnimation();
    }
  }, [streak, showAnimation]);

  useEffect(() => {
    // Milestone celebration
    if (milestone && showAnimation) {
      setShowCelebration(true);
      
      // Celebration bounce
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCelebration(false));

      // Sparkle effect
      Animated.loop(
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        { iterations: 3 }
      ).start();
    }
  }, [milestone, showAnimation]);

  const handlePress = () => {
    // Satisfying press feedback
    Animated.sequence([
      Animated.timing(fireScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fireScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress?.();
  };

  const getMilestoneMessage = (milestone: number) => {
    const messages: { [key: number]: string } = {
      7: "One week champion! 🏆",
      14: "Two week warrior! ⚔️",
      30: "Monthly master! 👑",
      60: "Consistency king! 💎",
      90: "Habit hero! 🦸‍♂️",
      180: "Six month legend! 🌟",
      365: "YEARLY CHAMPION! 🎉🏆🎉"
    };
    return messages[milestone] || "Amazing streak! 🎯";
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.container}>
        {/* Glow effect */}
        {streak >= 7 && (
          <Animated.View 
            style={[
              styles.glow,
              {
                backgroundColor: fireData.color,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3]
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })
                  }
                ]
              }
            ]}
          />
        )}

        {/* Main streak display */}
        <Animated.View 
          style={[
            styles.streakContainer,
            {
              transform: [
                { scale: fireScale },
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20]
                  })
                }
              ]
            }
          ]}
        >
          {/* Fire emoji */}
          <Animated.Text 
            style={[
              styles.fireEmoji,
              {
                opacity: fireOpacity,
              }
            ]}
          >
            {streak === 0 ? '💤' : fireData.emoji}
          </Animated.Text>

          {/* Streak number */}
          <Text style={[styles.streakNumber, { color: fireData.color }]}>
            {displayStreak}
          </Text>
          
          <Text style={styles.streakLabel}>
            {streak === 0 ? 'Start your streak!' : 
             streak === 1 ? 'day streak' : 'day streak'}
          </Text>
        </Animated.View>

        {/* Best streak indicator */}
        {bestStreak > streak && streak > 0 && (
          <View style={styles.bestStreakContainer}>
            <Text style={styles.bestStreakText}>
              🏆 Best: {bestStreak} days
            </Text>
          </View>
        )}

        {/* New best indicator */}
        {isNewBest && (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestText}>NEW BEST! 🎉</Text>
          </View>
        )}

        {/* Milestone celebration */}
        {showCelebration && milestone && (
          <Animated.View 
            style={[
              styles.celebrationContainer,
              {
                opacity: bounceAnim,
                transform: [
                  {
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.celebrationText}>
              🎉 {milestone} DAYS! 🎉
            </Text>
            <Text style={styles.celebrationSubtext}>
              {getMilestoneMessage(milestone)}
            </Text>
          </Animated.View>
        )}

        {/* Sparkle effects for milestones */}
        {(milestone || isNewBest) && showAnimation && (
          <>
            {[...Array(6)].map((_, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.sparkle,
                  {
                    left: 20 + (i * 25) + Math.sin(i) * 30,
                    top: 30 + Math.cos(i) * 20,
                    opacity: sparkleAnim,
                    transform: [
                      {
                        rotate: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      },
                      {
                        scale: sparkleAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                ✨
              </Animated.Text>
            ))}
          </>
        )}

        {/* Motivational messages based on streak */}
        <View style={styles.messageContainer}>
          {streak === 0 && (
            <Text style={styles.motivationText}>
              🌱 Every journey starts with a single step
            </Text>
          )}
          {streak === 1 && (
            <Text style={styles.motivationText}>
              🚀 Great start! Keep the momentum going
            </Text>
          )}
          {streak >= 2 && streak < 7 && (
            <Text style={styles.motivationText}>
              💪 Building that habit! You're doing amazing
            </Text>
          )}
          {streak >= 7 && streak < 14 && (
            <Text style={styles.motivationText}>
              🔥 On fire! This is becoming a real habit
            </Text>
          )}
          {streak >= 14 && (
            <Text style={styles.motivationText}>
              🏆 Unstoppable! You're a consistency champion
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: 20,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#333',
    minWidth: 140,
  },
  fireEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  streakLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  bestStreakContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
  },
  bestStreakText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  newBestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBestText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  celebrationContainer: {
    position: 'absolute',
    top: -20,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  celebrationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  celebrationSubtext: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
  },
  messageContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  motivationText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});