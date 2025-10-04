import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';

type FocusSession = {
  id?: string;
  type: 'pomodoro' | 'deep_work' | 'adhd_sprint';
  duration_minutes: number;
  status: 'idle' | 'active' | 'paused' | 'completed';
  time_remaining?: number;
  points_potential?: number;
};

type FocusSessionTrackerProps = {
  onSessionStart?: (session: FocusSession) => void;
  onSessionComplete?: (sessionId: string, data: any) => void;
  showAnimation?: boolean;
};

const { width } = Dimensions.get('window');

export function FocusSessionTracker({ 
  onSessionStart,
  onSessionComplete,
  showAnimation = true 
}: FocusSessionTrackerProps) {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  const sessionTypes = [
    {
      type: 'pomodoro' as const,
      name: 'Pomodoro',
      icon: '🍅',
      duration: 25,
      description: '25 minutes of focused work',
      color: '#FF6B35',
      points: 150
    },
    {
      type: 'deep_work' as const,
      name: 'Deep Work',
      icon: '🧠',
      duration: 50,
      description: '50 minutes of deep focus',
      color: '#6C5CE7',
      points: 400
    },
    {
      type: 'adhd_sprint' as const,  
      name: 'ADHD Sprint',
      icon: '⚡',
      duration: 15,
      description: '15 minutes burst of energy',
      color: '#00C851',
      points: 150
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentSession?.status === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession?.status, timeRemaining]);

  useEffect(() => {
    if (showAnimation && currentSession?.status === 'active') {
      // Timer pulse animation
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

      // Glow effect for active sessions
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [currentSession?.status, showAnimation]);

  useEffect(() => {
    if (currentSession) {
      const totalTime = currentSession.duration_minutes * 60;
      const elapsed = totalTime - timeRemaining;
      const progress = elapsed / totalTime;
      
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, currentSession]);

  const handleStartSession = (sessionType: typeof sessionTypes[0]) => {
    const newSession: FocusSession = {
      id: `session_${Date.now()}`,
      type: sessionType.type,
      duration_minutes: sessionType.duration,
      status: 'active',
      points_potential: sessionType.points
    };
    
    setCurrentSession(newSession);
    setTimeRemaining(sessionType.duration * 60);
    setTasksCompleted(0);
    setInterruptions(0);
    
    onSessionStart?.(newSession);
    
    Alert.alert(
      `${sessionType.icon} ${sessionType.name} Started!`,
      `${sessionType.duration} minutes of focused work ahead. You can do this! 💪\n\nTips:\n• Turn off notifications\n• Have water nearby\n• Focus on one task at a time`,
      [{ text: 'Let\'s Focus!', style: 'default' }]
    );
  };

  const handlePauseSession = () => {
    if (!currentSession) return;
    
    setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
    
    Alert.alert(
      'Session Paused ⏸️',
      'Take a breather! Your progress is saved.',
      [
        { text: 'Resume', onPress: handleResumeSession },
        { text: 'End Session', onPress: handleEndSession, style: 'destructive' }
      ]
    );
  };

  const handleResumeSession = () => {
    if (!currentSession) return;
    setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
  };

  const handleSessionComplete = () => {
    if (!currentSession) return;
    
    const focusRating = Math.floor(Math.random() * 3) + 8; // Mock high rating
    const pointsEarned = calculatePoints();
    
    setCurrentSession(prev => prev ? { ...prev, status: 'completed' } : null);
    
    if (currentSession.id) {
      onSessionComplete?.(currentSession.id, {
        tasks_completed: tasksCompleted,
        interruptions: interruptions,
        focus_rating: focusRating,
        points_earned: pointsEarned
      });
    }
    
    // Celebration
    Alert.alert(
      '🎉 Session Complete! 🎉',
      `Amazing focus! Here's your summary:\n\n⏰ Session: ${currentSession.duration_minutes} minutes\n✅ Tasks: ${tasksCompleted}\n📱 Interruptions: ${interruptions}\n⭐ Focus Rating: ${focusRating}/10\n🏆 Points Earned: ${pointsEarned}\n\nYour ADHD brain is getting stronger! 💪`,
      [
        { text: 'Celebrate! 🎉', style: 'default' },
        { text: 'Start Another', onPress: handleNewSession }
      ]
    );
  };

  const handleEndSession = () => {
    setCurrentSession(null);
    setTimeRemaining(0);
    progressAnim.setValue(0);
  };

  const handleNewSession = () => {
    handleEndSession();
  };

  const calculatePoints = () => {
    if (!currentSession) return 0;
    
    const basePoints = currentSession.points_potential || 150;
    const taskBonus = tasksCompleted * 25;
    const interruptionPenalty = interruptions * 10;
    
    return Math.max(50, basePoints + taskBonus - interruptionPenalty);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionType = () => {
    if (!currentSession) return null;
    return sessionTypes.find(s => s.type === currentSession.type);
  };

  const activeSessionType = getSessionType();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Sessions 🎯</Text>
      <Text style={styles.subtitle}>ADHD-friendly focus tracking</Text>

      {!currentSession || currentSession.status === 'completed' ? (
        // Session Selection
        <View style={styles.sessionSelection}>
          <Text style={styles.selectionTitle}>Choose Your Focus Mode:</Text>
          {sessionTypes.map((sessionType, index) => (
            <TouchableOpacity
              key={sessionType.type}
              style={[styles.sessionButton, { borderColor: sessionType.color }]}
              onPress={() => handleStartSession(sessionType)}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.sessionIcon}>{sessionType.icon}</Text>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{sessionType.name}</Text>
                  <Text style={styles.sessionDescription}>{sessionType.description}</Text>
                  <Text style={[styles.sessionPoints, { color: sessionType.color }]}>
                    🏆 {sessionType.points} points potential
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Active Session
        <View style={styles.activeSession}>
          {/* Glow Effect */}
          {activeSessionType && (
            <Animated.View 
              style={[
                styles.glowEffect,
                {
                  backgroundColor: activeSessionType.color,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3]
                  })
                }
              ]}
            />
          )}

          {/* Session Header */}
          <View style={styles.sessionHeader}>
            <Text style={styles.activeSessionIcon}>{activeSessionType?.icon}</Text>
            <Text style={styles.activeSessionName}>{activeSessionType?.name}</Text>
            <Text style={[styles.sessionStatus, { 
              color: currentSession.status === 'active' ? '#00C851' : '#FF6B35' 
            }]}>
              {currentSession.status === 'active' ? '🔥 ACTIVE' : '⏸️ PAUSED'}
            </Text>
          </View>

          {/* Timer */}
          <Animated.View 
            style={[
              styles.timerContainer,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: activeSessionType?.color || '#4A90E2'
                }
              ]}
            />
          </View>

          {/* Session Stats */}
          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <TouchableOpacity 
                style={styles.statButton}
                onPress={() => setTasksCompleted(prev => prev + 1)}
              >
                <Text style={styles.statValue}>✅ {tasksCompleted}</Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statItem}>
              <TouchableOpacity 
                style={styles.statButton}
                onPress={() => setInterruptions(prev => prev + 1)}
              >
                <Text style={styles.statValue}>📱 {interruptions}</Text>
                <Text style={styles.statLabel}>Interruptions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {currentSession.status === 'active' ? (
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={handlePauseSession}
              >
                <Text style={styles.controlButtonText}>⏸️ Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, styles.resumeButton]}
                onPress={handleResumeSession}
              >
                <Text style={styles.controlButtonText}>▶️ Resume</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.controlButton, styles.endButton]}
              onPress={handleEndSession}
            >
              <Text style={styles.controlButtonText}>🛑 End</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sessionSelection: {
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sessionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#BBB',
    marginBottom: 4,
  },
  sessionPoints: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeSession: {
    alignItems: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 20,
  },
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  activeSessionIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  activeSessionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderWidth: 3,
    borderColor: '#333',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  sessionStats: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF6B35',
  },
  resumeButton: {
    backgroundColor: '#00C851',
  },
  endButton: {
    backgroundColor: '#666',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});