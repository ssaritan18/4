import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

type CelebrationType = 'achievement' | 'streak' | 'challenge' | 'focus' | 'level_up' | 'points';

type CelebrationData = {
  type: CelebrationType;
  title: string;
  message: string;
  points?: number;
  badge?: string;
  level?: number;
  streak?: number;
  icon?: string;
};

type EnhancedCelebrationProps = {
  visible: boolean;
  data: CelebrationData;
  onClose: () => void;
  duration?: number;
};

const { width, height } = Dimensions.get('window');

export function EnhancedCelebration({ 
  visible, 
  data, 
  onClose, 
  duration = 4000 
}: EnhancedCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation refs
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(-50),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;
  const sparkleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  ).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      startCelebrationAnimation();
      
      // Auto-close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const startCelebrationAnimation = () => {
    // Main container animations
    const mainAnimations = Animated.parallel([
      // Backdrop fade in
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Scale in with bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    // Confetti animation
    const confettiAnimations = confettiAnims.map((anim, index) => {
      const startX = (Math.random() - 0.5) * width;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = height + 100;
      const rotationEnd = Math.random() * 720;

      return Animated.parallel([
        Animated.timing(anim.translateX, {
          toValue: endX,
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: endY,
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: rotationEnd,
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]);
    });

    // Sparkle animation
    const sparkleAnimations = sparkleAnims.map((anim, index) => {
      const delay = index * 100;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 100,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });

    // Continuous pulse and glow
    const continuousAnimations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ];

    // Start all animations
    Animated.parallel([
      mainAnimations,
      Animated.parallel(confettiAnimations),
      Animated.parallel(sparkleAnimations),
      Animated.parallel(continuousAnimations),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  const getCelebrationColor = () => {
    switch (data.type) {
      case 'achievement': return '#FFD700';
      case 'streak': return '#FF6B35';
      case 'challenge': return '#00C851';
      case 'focus': return '#6C5CE7';
      case 'level_up': return '#FF3547';
      case 'points': return '#4A90E2';
      default: return '#FFD700';
    }
  };

  const getCelebrationIcon = () => {
    if (data.icon) return data.icon;
    
    switch (data.type) {
      case 'achievement': return '🏆';
      case 'streak': return '🔥';
      case 'challenge': return '💪';
      case 'focus': return '🎯';
      case 'level_up': return '⬆️';
      case 'points': return '💎';
      default: return '🎉';
    }
  };

  const getConfettiColors = () => {
    const colors = ['#FF6B35', '#FFD700', '#00C851', '#6C5CE7', '#FF3547', '#4A90E2'];
    return colors;
  };

  if (!isVisible) return null;

  const celebrationColor = getCelebrationColor();
  const celebrationIcon = getCelebrationIcon();
  const confettiColors = getConfettiColors();

  return (
    <Animated.View 
      style={[
        styles.backdrop,
        {
          opacity: backdropAnim,
        }
      ]}
    >
      {/* Confetti */}
      {confettiAnims.map((anim, index) => {
        const color = confettiColors[index % confettiColors.length];
        return (
          <Animated.View
            key={`confetti-${index}`}
            style={[
              styles.confetti,
              {
                backgroundColor: color,
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ],
                opacity: anim.opacity,
              }
            ]}
          />
        );
      })}

      {/* Sparkles */}
      {sparkleAnims.map((anim, index) => {
        const angle = (index / sparkleAnims.length) * 2 * Math.PI;
        const radius = 150;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <Animated.Text
            key={`sparkle-${index}`}
            style={[
              styles.sparkle,
              {
                left: width / 2 + x - 10,
                top: height / 2 + y - 10,
                transform: [
                  { scale: anim.scale },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ],
                opacity: anim.opacity,
              }
            ]}
          >
            ✨
          </Animated.Text>
        );
      })}

      {/* Main celebration content */}
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Glow effect */}
        <Animated.View 
          style={[
            styles.glowEffect,
            {
              backgroundColor: celebrationColor,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4]
              }),
            }
          ]}
        />

        {/* Main card */}
        <Animated.View 
          style={[
            styles.card,
            {
              borderColor: celebrationColor,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          {/* Icon */}
          <Text style={styles.icon}>{celebrationIcon}</Text>
          
          {/* Title */}
          <Text style={[styles.title, { color: celebrationColor }]}>
            {data.title}
          </Text>
          
          {/* Message */}
          <Text style={styles.message}>{data.message}</Text>
          
          {/* Details */}
          <View style={styles.details}>
            {data.points && (
              <View style={[styles.detailItem, { backgroundColor: celebrationColor + '20' }]}>
                <Text style={styles.detailText}>
                  💎 {data.points} points
                </Text>
              </View>
            )}
            
            {data.badge && (
              <View style={[styles.detailItem, { backgroundColor: celebrationColor + '20' }]}>
                <Text style={styles.detailText}>
                  🎖️ {data.badge} badge
                </Text>
              </View>
            )}
            
            {data.level && (
              <View style={[styles.detailItem, { backgroundColor: celebrationColor + '20' }]}>
                <Text style={styles.detailText}>
                  ⬆️ Level {data.level}
                </Text>
              </View>
            )}
            
            {data.streak && (
              <View style={[styles.detailItem, { backgroundColor: celebrationColor + '20' }]}>
                <Text style={styles.detailText}>
                  🔥 {data.streak} day streak
                </Text>
              </View>
            )}
          </View>
          
          {/* ADHD motivational message */}
          <Text style={styles.motivationalText}>
            Your ADHD brain is amazing! Keep building those dopamine pathways! 🧠✨
          </Text>
          
          {/* Close button */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: celebrationColor }]}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Awesome! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 3,
    padding: 32,
    alignItems: 'center',
    maxWidth: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  detailItem: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  motivationalText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
    lineHeight: 18,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});