import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
} from 'react-native';

type FocusSession = {
  duration: number; // in minutes
  breakDuration: number; // in minutes
  type: 'focus' | 'break';
};

type FocusModeTimerProps = {
  onSessionComplete?: (session: FocusSession) => void;
  onBreakStart?: () => void;
  onFocusStart?: () => void;
  showAnimation?: boolean;
};

const FOCUS_PRESETS = [
  { name: 'Quick Focus', focus: 15, break: 5, emoji: '⚡' },
  { name: 'Pomodoro', focus: 25, break: 5, emoji: '🍅' },
  { name: 'Deep Work', focus: 45, break: 15, emoji: '🧠' },
  { name: 'ADHD Sprint', focus: 10, break: 3, emoji: '🏃‍♂️' },
];

export function FocusModeTimer({
  onSessionComplete,
  onBreakStart,
  onFocusStart,
  showAnimation = true,
}: FocusModeTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [selectedPreset, setSelectedPreset] = useState(FOCUS_PRESETS[1]); // Pomodoro default
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const totalDuration = sessionType === 'focus' 
    ? selectedPreset.focus * 60 
    : selectedPreset.break * 60;
  
  const progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (showAnimation) {
      // Progress animation
      Animated.timing(progressAnim, {
        toValue: progressPercentage / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Pulse animation for active timer
      if (isActive) {
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
      } else {
        pulseAnim.setValue(1);
      }
    }
  }, [isActive, progressPercentage, showAnimation]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // Vibration feedback
    Vibration.vibrate([200, 100, 200]);
    
    // Celebration animation
    if (showAnimation) {
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (sessionType === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      onSessionComplete?.({
        duration: selectedPreset.focus,
        breakDuration: selectedPreset.break,
        type: 'focus'
      });
      
      // Switch to break
      Alert.alert(
        "🎉 Focus Session Complete!",
        `Great job! You focused for ${selectedPreset.focus} minutes. Ready for a break?`,
        [
          { text: "Skip Break", onPress: startNewFocus },
          { text: "Take Break", onPress: startBreak, style: "default" }
        ]
      );
    } else {
      onSessionComplete?.({
        duration: selectedPreset.break,
        breakDuration: selectedPreset.break,
        type: 'break'
      });
      
      // Switch to focus
      Alert.alert(
        "⚡ Break Complete!",
        "Time to get back to focused work. You've got this!",
        [
          { text: "Start Focus", onPress: startNewFocus, style: "default" }
        ]
      );
    }
  };

  const startTimer = () => {
    setIsActive(true);
    if (sessionType === 'focus') {
      onFocusStart?.();
    } else {
      onBreakStart?.();
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? selectedPreset.focus * 60 : selectedPreset.break * 60);
  };

  const startNewFocus = () => {
    setSessionType('focus');
    setTimeLeft(selectedPreset.focus * 60);
    setIsActive(true);
    onFocusStart?.();
  };

  const startBreak = () => {
    setSessionType('break');
    setTimeLeft(selectedPreset.break * 60);
    setIsActive(true);
    onBreakStart?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    return sessionType === 'focus' ? '#4A90E2' : '#00C851';
  };

  const getSessionEmoji = () => {
    return sessionType === 'focus' ? '🎯' : '☕';
  };

  return (
    <View style={styles.container}>
      {/* Session Type Header */}
      <View style={[styles.sessionHeader, { backgroundColor: getSessionColor() }]}>
        <Text style={styles.sessionEmoji}>{getSessionEmoji()}</Text>
        <Text style={styles.sessionTitle}>
          {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
        </Text>
        <Text style={styles.sessionCounter}>
          Session {sessionsCompleted + 1}
        </Text>
      </View>

      {/* Timer Display */}
      <Animated.View 
        style={[
          styles.timerContainer,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        {/* Progress Ring Background */}
        <View style={[styles.progressRing, { borderColor: getSessionColor() }]}>
          {/* Progress Fill */}
          <Animated.View 
            style={[
              styles.progressFill,
              {
                backgroundColor: getSessionColor(),
                height: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>

        {/* Timer Text */}
        <Text style={[styles.timerText, { color: getSessionColor() }]}>
          {formatTime(timeLeft)}
        </Text>

        <Text style={styles.timerSubtext}>
          {sessionType === 'focus' ? selectedPreset.name : 'Break Time'}
        </Text>

        {/* Celebration Effect */}
        <Animated.View 
          style={[
            styles.celebrationEffect,
            {
              opacity: celebrationAnim,
              transform: [{
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 2]
                })
              }]
            }
          ]}
        >
          <Text style={styles.celebrationText}>🎉</Text>
        </Animated.View>
      </Animated.View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isActive ? (
          <TouchableOpacity 
            style={[styles.controlButton, styles.startButton, { backgroundColor: getSessionColor() }]}
            onPress={startTimer}
          >
            <Text style={styles.controlButtonText}>
              {timeLeft === totalDuration ? 'Start' : 'Resume'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.controlButton, styles.pauseButton]}
            onPress={pauseTimer}
          >
            <Text style={styles.controlButtonText}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetTimer}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Preset Selection */}
      {!isActive && (
        <View style={styles.presetsContainer}>
          <Text style={styles.presetsTitle}>Choose Your Focus Style</Text>
          <View style={styles.presetsRow}>
            {FOCUS_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetButton,
                  selectedPreset.name === preset.name && styles.selectedPreset
                ]}
                onPress={() => {
                  setSelectedPreset(preset);
                  setTimeLeft(preset.focus * 60);
                  setSessionType('focus');
                }}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <Text style={styles.presetName}>{preset.name}</Text>
                <Text style={styles.presetTime}>{preset.focus}m / {preset.break}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ADHD Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 ADHD Focus Tips</Text>
        {sessionType === 'focus' ? (
          <Text style={styles.tipsText}>
            • Remove distractions from your workspace
            • Have water and snacks ready
            • Break large tasks into smaller steps
          </Text>
        ) : (
          <Text style={styles.tipsText}>
            • Step away from your workspace
            • Do light stretching or movement  
            • Avoid checking social media
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },

  // Session Header
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sessionEmoji: {
    fontSize: 24,
  },
  sessionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  sessionCounter: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },

  // Timer
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.3,
  },
  timerText: {
    position: 'absolute',
    fontSize: 36,
    fontWeight: '900',
    top: '40%',
  },
  timerSubtext: {
    position: 'absolute',
    color: '#888',
    fontSize: 14,
    top: '60%',
  },
  celebrationEffect: {
    position: 'absolute',
    top: '30%',
  },
  celebrationText: {
    fontSize: 60,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    // backgroundColor set dynamically
  },
  pauseButton: {
    backgroundColor: '#FF6B35',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Presets
  presetsContainer: {
    marginTop: 20,
  },
  presetsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPreset: {
    borderColor: '#4A90E2',
    backgroundColor: '#0D1A2D',
  },
  presetEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  presetName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  presetTime: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },

  // Tips
  tipsContainer: {
    marginTop: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
});