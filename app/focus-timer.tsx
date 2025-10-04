import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../src/context/SubscriptionContext';
import { MockInterstitialAd } from '../src/components/MockInterstitialAd';

export default function FocusTimer() {
  const { mode, duration } = useLocalSearchParams<{ mode: string; duration: string }>();
  const insets = useSafeAreaInsets();
  const { incrementFocusSession, getFocusSessionsRemaining, subscription } = useSubscription();
  
  const [timeLeft, setTimeLeft] = useState(parseInt(duration || '25') * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((parseInt(duration || '25') * 60 - timeLeft) / (parseInt(duration || '25') * 60)) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            // Show completion alert
            Alert.alert(
              '🎉 Focus Session Complete!',
              'Great job! You completed your ' + mode + ' session.',
              [
                {
                  text: '✨ Awesome!',
                  onPress: () => router.back()
                }
              ]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const handleStart = () => {
    // Check if this is the first start of this session
    if (!sessionStarted) {
      const canStart = incrementFocusSession();
      
      if (!canStart) {
        // Show interstitial ad for limit reached
        setShowInterstitial(true);
        return;
      }
      
      setSessionStarted(true);
    }
    
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(parseInt(duration || '25') * 60);
    setIsCompleted(false);
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Focus Session?',
      'Are you sure you want to stop your focus session?',
      [
        { text: 'Continue', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'Pomodoro': return '🍅';
      case 'Deep Work': return '🧠';
      case 'ADHD Sprint': return '⚡';
      default: return '🎯';
    }
  };

  const getModeGradient = () => {
    switch (mode) {
      case 'Pomodoro': return ['#F97316', '#FBBF24'];
      case 'Deep Work': return ['#8B5CF6', '#A855F7'];
      case 'ADHD Sprint': return ['#10B981', '#34D399'];
      default: return ['#4A90E2', '#60A5FA'];
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Glow Header */}
      <LinearGradient
        colors={getModeGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.glowHeader}
      >
        <TouchableOpacity 
          onPress={handleStop}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {getModeIcon()} {mode} Mode
        </Text>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <LinearGradient
            colors={getModeGradient()}
            style={[styles.progressCircle]}
          >
            <View style={styles.progressInner}>
              <View style={styles.timerDisplay}>
                <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.timeLabel}>
                  {isCompleted ? '🎉 Completed!' : isRunning ? '🔥 Focus Time' : '⚡ Ready to Focus'}
                </Text>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={getModeGradient()}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isCompleted && (
          <>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleReset}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>Reset</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryControlButton} 
              onPress={isRunning ? handlePause : handleStart}
            >
              <LinearGradient
                colors={getModeGradient()}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name={isRunning ? "pause" : "play"} size={32} color="#fff" />
                <Text style={styles.primaryButtonText}>{isRunning ? 'Pause' : 'Start'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleStop}
            >
              <LinearGradient
                colors={['rgba(220, 38, 38, 0.8)', 'rgba(185, 28, 28, 0.8)']}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>Stop</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        
        {isCompleted && (
          <TouchableOpacity 
            style={styles.primaryControlButton} 
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={['#10B981', '#34D399']}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="checkmark" size={32} color="#fff" />
              <Text style={styles.primaryButtonText}>✨ Complete!</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.ceil(progress)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{duration}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Feature Unlock Interstitial */}
      <MockInterstitialAd
        visible={showInterstitial}
        onClose={() => {
          setShowInterstitial(false);
          router.back();
        }}
        adType="feature_unlock"
        context={{
          featureName: 'Focus Sessions',
          limitReached: `You've used all 3 focus sessions today (${subscription.tier === 'free' ? 'Free Plan' : 'Current Plan'})`
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Glow Header
  glowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSpacer: {
    width: 40,
  },
  
  // Timer Container
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  progressContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    padding: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  progressInner: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  timeLabel: {
    color: '#E5E7EB',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
    fontWeight: '600',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  controlButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonGradient: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 80,
  },
  primaryControlButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  primaryButtonGradient: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Stats
  statsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    marginHorizontal: 20,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
});