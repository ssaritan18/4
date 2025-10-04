import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useMood, MOOD_CONFIG } from '../context/MoodContext';

export function MoodTracker() {
  const { todayMood, moodStreak, setTodayMood } = useMood();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMoodSelect = async (mood: 'great' | 'okay' | 'low' | 'stressed' | 'tired') => {
    try {
      await setTodayMood(mood);
      setIsSelecting(false);
      
      // Show celebration feedback
      Alert.alert(
        '🎉 Mood Logged!',
        `Thanks for sharing how you're feeling today. Your ${MOOD_CONFIG[mood].label.toLowerCase()} mood has been recorded!`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error setting mood:', error);
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
    }
  };

  const moodOptions = [
    { key: 'great', gradient: ['#10B981', '#34D399'] },
    { key: 'okay', gradient: ['#6366F1', '#8B5CF6'] },
    { key: 'low', gradient: ['#3B82F6', '#60A5FA'] },
    { key: 'stressed', gradient: ['#EF4444', '#F87171'] },
    { key: 'tired', gradient: ['#8B5CF6', '#A855F7'] }
  ] as const;

  return (
    <LinearGradient
      colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>💭 Daily Mood Check</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>
        
        {moodStreak > 0 && (
          <LinearGradient
            colors={['#F97316', '#FBBF24']}
            style={styles.streakBadge}
          >
            <Ionicons name="flame" size={16} color="#fff" />
            <Text style={styles.streakText}>{moodStreak}</Text>
          </LinearGradient>
        )}
      </View>

      {todayMood ? (
        // Already logged today's mood
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(168, 85, 247, 0.15)']}
          style={styles.loggedMoodCard}
        >
          <View style={styles.loggedMoodContent}>
            <View style={styles.currentMoodDisplay}>
              <Text style={styles.currentMoodEmoji}>{todayMood.emoji}</Text>
              <View>
                <Text style={styles.currentMoodLabel}>Today's mood</Text>
                <Text style={styles.currentMoodText}>
                  {MOOD_CONFIG[todayMood.mood].label}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => setIsSelecting(true)}
              style={styles.changeButton}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.changeButtonGradient}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.changeButtonText}>Change</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      ) : (
        // Haven't logged today's mood yet
        <View style={styles.selectMoodCard}>
          <Text style={styles.selectPrompt}>Select your current mood:</Text>
          <View style={styles.moodOptionsGrid}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleMoodSelect(option.key)}
                style={styles.moodOption}
              >
                <LinearGradient
                  colors={option.gradient}
                  style={styles.moodOptionGradient}
                >
                  <Text style={styles.moodEmoji}>
                    {MOOD_CONFIG[option.key].emoji}
                  </Text>
                  <Text style={styles.moodLabel}>
                    {MOOD_CONFIG[option.key].label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Mood selection overlay */}
      {isSelecting && (
        <View style={styles.selectionOverlay}>
          <Text style={styles.overlayTitle}>Update your mood:</Text>
          <View style={styles.overlayMoodGrid}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleMoodSelect(option.key)}
                style={styles.overlayMoodOption}
              >
                <LinearGradient
                  colors={option.gradient}
                  style={styles.overlayMoodGradient}
                >
                  <Text style={styles.overlayMoodEmoji}>
                    {MOOD_CONFIG[option.key].emoji}
                  </Text>
                  <Text style={styles.overlayMoodLabel}>
                    {MOOD_CONFIG[option.key].label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            onPress={() => setIsSelecting(false)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loggedMoodCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  loggedMoodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentMoodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentMoodEmoji: {
    fontSize: 32,
  },
  currentMoodLabel: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '500',
  },
  currentMoodText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  changeButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  changeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  selectMoodCard: {
    alignItems: 'center',
  },
  selectPrompt: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  moodOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  moodOptionGradient: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  overlayMoodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 20,
  },
  overlayMoodOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayMoodGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  overlayMoodEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  overlayMoodLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
});