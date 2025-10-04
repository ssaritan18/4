import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

type TimeSegment = {
  id: string;
  label: string;
  emoji: string;
  timeRange: string;
  color: string;
  progress: number;
  maxProgress: number;
  isActive: boolean;
  isCompleted: boolean;
};

type SegmentedProgressBarProps = {
  segments: TimeSegment[];
  currentTimeHour?: number;
  onSegmentPress?: (segment: TimeSegment) => void;
  showAnimation?: boolean;
};

const { width } = Dimensions.get('window');

function ProgressSegment({ 
  segment, 
  index, 
  isCurrentSegment, 
  onPress,
  showAnimation = true 
}: {
  segment: TimeSegment;
  index: number;
  isCurrentSegment: boolean;
  onPress?: (segment: TimeSegment) => void;
  showAnimation?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showCelebration, setShowCelebration] = useState(false);

  const progressPercentage = segment.maxProgress > 0 ? (segment.progress / segment.maxProgress) * 100 : 0;

  useEffect(() => {
    if (showAnimation) {
      // Animate progress fill
      Animated.timing(progressAnim, {
        toValue: progressPercentage / 100,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Current segment pulse
      if (isCurrentSegment) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
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

        // Glow effect for current segment
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

      // Completion celebration
      if (segment.isCompleted) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, [isCurrentSegment, segment.isCompleted, progressPercentage, showAnimation]);

  const handlePress = () => {
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
    
    onPress?.(segment);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.segmentContainer}>
      <Animated.View 
        style={[
          styles.segment,
          {
            backgroundColor: segment.color,
            opacity: segment.isCompleted ? 1 : (isCurrentSegment ? 0.9 : 0.6),
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ]
          }
        ]}
      >
        {/* Glow effect for current segment */}
        {isCurrentSegment && (
          <Animated.View 
            style={[
              styles.segmentGlow,
              {
                backgroundColor: segment.color,
                opacity: glowAnim,
              }
            ]}
          />
        )}

        {/* Progress fill */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                backgroundColor: segment.isCompleted ? '#00C851' : '#FFD700',
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>

        {/* Segment content */}
        <View style={styles.segmentContent}>
          <Text style={styles.segmentEmoji}>{segment.emoji}</Text>
          
          {/* "You Are Here" indicator */}
          {isCurrentSegment && (
            <View style={styles.youAreHereIndicator}>
              <Text style={styles.youAreHereText}>You Are Here!</Text>
              <View style={styles.arrow} />
            </View>
          )}
          
          {/* Completion checkmark */}
          {segment.isCompleted && (
            <View style={styles.completionBadge}>
              <Text style={styles.completionCheck}>✓</Text>
            </View>
          )}
        </View>

        {/* Celebration sparkles */}
        {showCelebration && (
          <>
            {[...Array(3)].map((_, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.celebrationSparkle,
                  {
                    left: 10 + (i * 15),
                    top: 5 + (i * 3),
                  }
                ]}
              >
                ✨
              </Animated.Text>
            ))}
          </>
        )}
      </Animated.View>

      {/* Segment info */}
      <View style={styles.segmentInfo}>
        <Text style={styles.segmentLabel}>{segment.label}</Text>
        <Text style={styles.segmentTime}>{segment.timeRange}</Text>
        <Text style={[
          styles.segmentProgress,
          { color: isCurrentSegment ? segment.color : '#666' }
        ]}>
          {segment.progress}/{segment.maxProgress}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function SegmentedProgressBar({ 
  segments, 
  currentTimeHour = new Date().getHours(),
  onSegmentPress,
  showAnimation = true 
}: SegmentedProgressBarProps) {
  const containerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (showAnimation) {
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [showAnimation]);

  // Determine current segment based on time
  const getCurrentSegmentIndex = () => {
    if (currentTimeHour >= 6 && currentTimeHour < 12) return 0; // Morning
    if (currentTimeHour >= 12 && currentTimeHour < 17) return 1; // Afternoon  
    if (currentTimeHour >= 17 && currentTimeHour < 21) return 2; // Evening
    return 3; // Night/Early Morning
  };

  const currentSegmentIndex = getCurrentSegmentIndex();
  
  // Calculate overall progress
  const totalProgress = segments.reduce((sum, seg) => sum + seg.progress, 0);
  const totalMax = segments.reduce((sum, seg) => sum + seg.maxProgress, 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalProgress / totalMax) * 100) : 0;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: containerAnim,
          transform: [{
            translateY: containerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })
          }]
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌅 Daily Journey Progress</Text>
        <Text style={styles.headerSubtitle}>
          Follow your path through the day • {overallPercentage}% complete
        </Text>
      </View>

      {/* Progress Journey */}
      <View style={styles.journeyContainer}>
        <Text style={styles.journeyTitle}>Your ADHD-Friendly Daily Path</Text>
        
        {/* Connecting line */}
        <View style={styles.connectingLine} />
        
        {/* Segments */}
        <View style={styles.segmentsContainer}>
          {segments.map((segment, index) => (
            <ProgressSegment
              key={segment.id}
              segment={segment}
              index={index}
              isCurrentSegment={index === currentSegmentIndex}
              onPress={onSegmentPress}
              showAnimation={showAnimation}
            />
          ))}
        </View>
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationContainer}>
        {overallPercentage === 0 && (
          <Text style={styles.motivationText}>
            🌱 Ready to start your day? Every small step counts toward your goals!
          </Text>
        )}
        {overallPercentage > 0 && overallPercentage < 25 && (
          <Text style={styles.motivationText}>
            🚀 Great start! You're building momentum with each completed task.
          </Text>
        )}
        {overallPercentage >= 25 && overallPercentage < 75 && (
          <Text style={styles.motivationText}>
            💪 You're making solid progress! Keep up the amazing work.
          </Text>
        )}
        {overallPercentage >= 75 && overallPercentage < 100 && (
          <Text style={styles.motivationText}>
            🔥 Almost there! You're crushing your daily goals.
          </Text>
        )}
        {overallPercentage === 100 && (
          <Text style={styles.motivationText}>
            🎉 AMAZING! You've completed your entire daily journey. You're incredible!
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },

  // Journey Container
  journeyContainer: {
    position: 'relative',
  },
  journeyTitle: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  connectingLine: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#333',
    zIndex: 0,
  },

  // Segments
  segmentsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  segmentContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  segment: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#333',
    position: 'relative',
    overflow: 'visible',
  },
  segmentGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -10,
    left: -10,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    opacity: 0.3,
  },
  segmentContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  segmentEmoji: {
    fontSize: 24,
  },
  
  // You Are Here Indicator
  youAreHereIndicator: {
    position: 'absolute',
    top: -35,
    alignItems: 'center',
  },
  youAreHereText: {
    color: '#FF6B35',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#FF6B35',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF6B35',
    marginTop: 2,
  },

  // Completion
  completionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00C851',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionCheck: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Celebration
  celebrationSparkle: {
    position: 'absolute',
    fontSize: 12,
    color: '#FFD700',
  },

  // Segment Info
  segmentInfo: {
    alignItems: 'center',
    minHeight: 50,
  },
  segmentLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentTime: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  segmentProgress: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Motivation
  motivationContainer: {
    marginTop: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
  },
  motivationText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});