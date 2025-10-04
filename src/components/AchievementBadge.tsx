import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

type Achievement = {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  category: 'streak' | 'community' | 'tasks' | 'profile';
};

type AchievementBadgeProps = {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showUnlockAnimation?: boolean;
};

const { width } = Dimensions.get('window');

export function AchievementBadge({ 
  achievement, 
  size = 'medium', 
  onPress,
  showUnlockAnimation = false 
}: AchievementBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const sizes = {
    small: { container: 50, icon: 20, text: 10 },
    medium: { container: 70, icon: 28, text: 12 },
    large: { container: 90, icon: 36, text: 14 }
  };
  
  const currentSize = sizes[size];
  
  const categoryColors = {
    streak: '#FF6B35',      // Energy orange for streaks
    community: '#00C851',   // Growth green for community
    tasks: '#4A90E2',       // Focus blue for tasks
    profile: '#6C5CE7'      // Creative purple for profile
  };

  useEffect(() => {
    if (showUnlockAnimation && achievement.unlocked) {
      // Unlock celebration animation sequence
      Animated.sequence([
        // Initial pop-in
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        // Settle back
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous glow pulse for unlocked badges
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showUnlockAnimation, achievement.unlocked]);

  useEffect(() => {
    if (achievement.unlocked) {
      // Gentle continuous pulse for unlocked achievements
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
  }, [achievement.unlocked]);

  const handlePress = () => {
    // Satisfying press animation
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
    
    onPress?.();
  };

  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View 
        style={[
          styles.container,
          {
            width: currentSize.container,
            height: currentSize.container,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ]
          }
        ]}
      >
        {/* Glow effect for unlocked badges */}
        {achievement.unlocked && (
          <Animated.View 
            style={[
              styles.glowEffect,
              {
                width: currentSize.container + 20,
                height: currentSize.container + 20,
                borderRadius: (currentSize.container + 20) / 2,
                backgroundColor: categoryColors[achievement.category],
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3]
                })
              }
            ]}
          />
        )}
        
        {/* Badge container */}
        <View 
          style={[
            styles.badge,
            {
              width: currentSize.container,
              height: currentSize.container,
              borderRadius: currentSize.container / 2,
              backgroundColor: achievement.unlocked 
                ? categoryColors[achievement.category]
                : '#2A2A2A',
              borderColor: achievement.unlocked 
                ? categoryColors[achievement.category]
                : '#444',
            }
          ]}
        >
          {/* Progress ring for partially completed achievements */}
          {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    height: `${progressPercentage}%`,
                    backgroundColor: categoryColors[achievement.category],
                  }
                ]}
              />
            </View>
          )}
          
          {/* Icon */}
          <Text 
            style={[
              styles.icon,
              {
                fontSize: currentSize.icon,
                opacity: achievement.unlocked ? 1 : 0.4
              }
            ]}
          >
            {achievement.icon}
          </Text>
        </View>
        
        {/* Achievement name */}
        <Text 
          style={[
            styles.name,
            {
              fontSize: currentSize.text,
              color: achievement.unlocked ? '#FFF' : '#888'
            }
          ]}
          numberOfLines={2}
        >
          {achievement.name}
        </Text>
        
        {/* Progress indicator for locked achievements */}
        {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
          <Text style={styles.progress}>
            {achievement.progress}/{achievement.maxProgress}
          </Text>
        )}
        
        {/* New achievement indicator */}
        {achievement.unlocked && showUnlockAnimation && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW!</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    borderRadius: 50,
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.3,
  },
  icon: {
    fontWeight: 'bold',
  },
  name: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
    width: 80,
  },
  progress: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  newText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
});