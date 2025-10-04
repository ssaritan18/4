import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  mood: 'great' | 'okay' | 'low' | 'stressed' | 'tired';
  emoji: string;
  timestamp: number;
}

interface MoodContextType {
  todayMood: MoodEntry | null;
  moodHistory: MoodEntry[];
  moodStreak: number;
  setTodayMood: (mood: 'great' | 'okay' | 'low' | 'stressed' | 'tired') => Promise<void>;
  getMoodHistory: (days?: number) => MoodEntry[];
  getMoodStats: () => {
    totalEntries: number;
    mostCommonMood: string;
    currentStreak: number;
    longestStreak: number;
  };
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const MOOD_STORAGE_KEY = '@adhd_social_mood_data';

const MOOD_CONFIG = {
  great: { emoji: '😊', label: 'Great' },
  okay: { emoji: '😐', label: 'Okay' },
  low: { emoji: '😔', label: 'Low' },
  stressed: { emoji: '😤', label: 'Stressed' },
  tired: { emoji: '😴', label: 'Tired' }
};

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [todayMood, setTodayMoodState] = useState<MoodEntry | null>(null);
  const [moodStreak, setMoodStreak] = useState(0);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load mood data from storage
  const loadMoodData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
      if (storedData) {
        const history: MoodEntry[] = JSON.parse(storedData);
        setMoodHistory(history);
        
        // Find today's mood
        const today = getTodayDate();
        const todayEntry = history.find(entry => entry.date === today);
        setTodayMoodState(todayEntry || null);
        
        // Calculate streak
        calculateStreak(history);
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  };

  // Save mood data to storage
  const saveMoodData = async (history: MoodEntry[]) => {
    try {
      await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving mood data:', error);
    }
  };

  // Calculate mood streak (consecutive days with mood entries)
  const calculateStreak = (history: MoodEntry[]) => {
    if (history.length === 0) {
      setMoodStreak(0);
      return;
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) { // Check last 365 days
      const dateString = currentDate.toISOString().split('T')[0];
      const hasEntry = sortedHistory.some(entry => entry.date === dateString);
      
      if (hasEntry) {
        streak++;
      } else if (i > 0) { // Allow today to be missing, but break if any other day is missing
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }

    setMoodStreak(streak);
  };

  // Set today's mood
  const setTodayMood = async (mood: 'great' | 'okay' | 'low' | 'stressed' | 'tired') => {
    const today = getTodayDate();
    const moodConfig = MOOD_CONFIG[mood];
    
    const newEntry: MoodEntry = {
      id: `mood_${today}_${Date.now()}`,
      date: today,
      mood,
      emoji: moodConfig.emoji,
      timestamp: Date.now()
    };

    // Update or add today's mood
    const updatedHistory = moodHistory.filter(entry => entry.date !== today);
    updatedHistory.push(newEntry);
    
    setMoodHistory(updatedHistory);
    setTodayMoodState(newEntry);
    calculateStreak(updatedHistory);
    
    await saveMoodData(updatedHistory);
  };

  // Get mood history for specified days
  const getMoodHistory = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return moodHistory
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get mood statistics
  const getMoodStats = () => {
    const totalEntries = moodHistory.length;
    
    // Find most common mood
    const moodCounts: Record<string, number> = {};
    moodHistory.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    
    // Calculate longest streak
    const sortedHistory = [...moodHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let longestStreak = 0;
    let currentStreakCount = 0;
    
    for (let i = 0; i < sortedHistory.length; i++) {
      if (i === 0) {
        currentStreakCount = 1;
      } else {
        const prevDate = new Date(sortedHistory[i - 1].date);
        const currentDate = new Date(sortedHistory[i].date);
        const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreakCount++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreakCount);
    
    return {
      totalEntries,
      mostCommonMood: MOOD_CONFIG[mostCommonMood as keyof typeof MOOD_CONFIG]?.label || 'None',
      currentStreak: moodStreak,
      longestStreak
    };
  };

  useEffect(() => {
    loadMoodData();
  }, []);

  return (
    <MoodContext.Provider value={{
      todayMood,
      moodHistory,
      moodStreak,
      setTodayMood,
      getMoodHistory,
      getMoodStats
    }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}

export { MOOD_CONFIG };