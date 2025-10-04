import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useMood, MOOD_CONFIG } from '../context/MoodContext';
import { LinearGradient } from 'expo-linear-gradient';

type StatisticData = {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  emoji: string;
  subtitle?: string;
};

type ProfileStatisticsProps = {
  weeklyStats: StatisticData[];
  monthlyStats: StatisticData[];
  totalStats: {
    tasksCompleted: number;
    communityPosts: number;
    friendsCount: number;
    achievementsUnlocked: number;
  };
  showAnimation?: boolean;
};

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

function AnimatedBar({ stat, delay = 0 }: { stat: StatisticData; delay?: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  const percentage = stat.maxValue > 0 ? (stat.value / stat.maxValue) * 100 : 0;
  const barWidth = (chartWidth - 100) * (percentage / 100);

  useEffect(() => {
    // Delayed animation for each bar
    const timer = setTimeout(() => {
      // Bar fill animation
      Animated.timing(widthAnim, {
        toValue: barWidth,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Glow effect for high values
      if (percentage > 70) {
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
        ).start();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [stat.value, delay]);

  return (
    <View style={styles.statRow}>
      <View style={styles.statLabel}>
        <Text style={styles.emoji}>{stat.emoji}</Text>
        <View style={styles.labelText}>
          <Text style={styles.statName}>{stat.label}</Text>
          {stat.subtitle && (
            <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.barContainer}>
        <View style={[styles.barBackground, { width: chartWidth - 100 }]}>
          {/* Glow effect */}
          {percentage > 70 && (
            <Animated.View 
              style={[
                styles.barGlow,
                {
                  backgroundColor: stat.color,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.4]
                  })
                }
              ]}
            />
          )}
          
          {/* Animated bar */}
          <Animated.View 
            style={[
              styles.bar,
              {
                backgroundColor: stat.color,
                width: widthAnim,
              }
            ]}
          />
        </View>
        
        <Text style={styles.statValue}>
          {stat.value}
          {percentage >= 100 && <Text style={styles.completedIndicator}> ✨</Text>}
        </Text>
      </View>
    </View>
  );
}

function StatCard({ title, value, emoji, color, subtitle }: {
  title: string;
  value: number;
  emoji: string;
  color: string;
  subtitle?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Entry animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Count up animation
    Animated.timing(countAnim, {
      toValue: value,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animated counter
    const listener = countAnim.addListener(({ value: animValue }) => {
      setDisplayValue(Math.floor(animValue));
    });

    return () => countAnim.removeListener(listener);
  }, [value]);

  return (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          borderColor: color,
          transform: [{ scale: scaleAnim }] 
        }
      ]}
    >
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={[styles.cardValue, { color }]}>{displayValue.toLocaleString()}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}

export function ProfileStatistics({ 
  weeklyStats, 
  monthlyStats, 
  totalStats,
  showAnimation = true 
}: ProfileStatisticsProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  
  // Add mood data
  const { getMoodHistory, getMoodStats } = useMood();
  const moodStats = getMoodStats();
  const recentMoods = getMoodHistory(7); // Last 7 days

  useEffect(() => {
    Animated.timing(tabIndicatorAnim, {
      toValue: activeTab === 'weekly' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const currentStats = activeTab === 'weekly' ? weeklyStats : monthlyStats;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Total Statistics Cards */}
      <Text style={styles.sectionTitle}>🏆 Your Achievements</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        <StatCard
          title="Tasks Done"
          value={totalStats.tasksCompleted}
          emoji="✅"
          color="#00C851"
          subtitle="Total completed"
        />
        <StatCard
          title="Community Posts"
          value={totalStats.communityPosts}
          emoji="📝"
          color="#4A90E2"
          subtitle="Shared with others"
        />
        <StatCard
          title="Friends"
          value={totalStats.friendsCount}
          emoji="👥"
          color="#6C5CE7"
          subtitle="ADHD buddies"
        />
        <StatCard
          title="Badges"
          value={totalStats.achievementsUnlocked}
          emoji="🏅"
          color="#FF6B35"
          subtitle="Unlocked achievements"
        />
      </ScrollView>

      {/* Mood Patterns Section */}
      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>💭 Mood Patterns</Text>
        
        {moodStats.totalEntries > 0 ? (
          <>
            {/* Mood Statistics Cards */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              <StatCard
                title="Mood Streak"
                value={moodStats.currentStreak}
                emoji="🔥"
                color="#FF6B35"
                subtitle="Days tracked"
              />
              <StatCard
                title="Most Common"
                value={0}
                emoji={
                  Object.entries(MOOD_CONFIG).find(([key, config]) => 
                    config.label === moodStats.mostCommonMood
                  )?.[1]?.emoji || '😊'
                }
                color="#8B5CF6"
                subtitle={moodStats.mostCommonMood}
              />
              <StatCard
                title="Total Entries"
                value={moodStats.totalEntries}
                emoji="📊"
                color="#10B981"
                subtitle="Mood logs"
              />
              <StatCard
                title="Best Streak"
                value={moodStats.longestStreak}
                emoji="🏆"
                color="#F97316"
                subtitle="Personal record"
              />
            </ScrollView>

            {/* Recent Mood Timeline */}
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.moodTimelineCard}
            >
              <Text style={styles.moodTimelineTitle}>📅 Last 7 Days</Text>
              <View style={styles.moodTimeline}>
                {recentMoods.slice(0, 7).map((mood, index) => {
                  const date = new Date(mood.date);
                  const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                  
                  return (
                    <View key={mood.id} style={styles.moodTimelineItem}>
                      <Text style={styles.moodTimelineDay}>{dayName}</Text>
                      <View style={styles.moodTimelineEmoji}>
                        <Text style={styles.moodEmojiLarge}>{mood.emoji}</Text>
                      </View>
                      <Text style={styles.moodTimelineLabel}>
                        {MOOD_CONFIG[mood.mood].label}
                      </Text>
                    </View>
                  );
                })}
                
                {/* Fill empty days */}
                {Array.from({ length: Math.max(0, 7 - recentMoods.length) }).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.moodTimelineItem}>
                    <Text style={styles.moodTimelineDay}>--</Text>
                    <View style={[styles.moodTimelineEmoji, styles.emptyMoodEmoji]}>
                      <Text style={styles.emptyMoodText}>?</Text>
                    </View>
                    <Text style={styles.moodTimelineLabel}>No data</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.moodInsight}>
                💡 Track your mood daily to discover patterns and improve your well-being!
              </Text>
            </LinearGradient>
          </>
        ) : (
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={styles.moodEmptyCard}
          >
            <Text style={styles.moodEmptyEmoji}>💭✨</Text>
            <Text style={styles.moodEmptyTitle}>Start Tracking Your Mood!</Text>
            <Text style={styles.moodEmptyDescription}>
              Begin logging your daily mood to see patterns and insights here. 
              Your mood data helps you understand what affects your well-being.
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Progress Charts */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>📊 Progress Charts</Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('weekly')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'weekly' && styles.tabTextActive
            ]}>
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => setActiveTab('monthly')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'monthly' && styles.tabTextActive
            ]}>
              This Month
            </Text>
          </TouchableOpacity>
          
          {/* Animated indicator */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              {
                transform: [{
                  translateX: tabIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, (chartWidth / 2) - 16]
                  })
                }]
              }
            ]}
          />
        </View>

        {/* Stats Bars */}
        <View style={styles.barsContainer}>
          {currentStats.map((stat, index) => (
            <AnimatedBar 
              key={`${activeTab}-${stat.label}`}
              stat={stat} 
              delay={index * 200}
            />
          ))}
        </View>

        {/* Motivational Messages */}
        <View style={styles.motivationContainer}>
          {totalStats.tasksCompleted === 0 && (
            <Text style={styles.motivationText}>
              🌱 Ready to start your journey? Complete your first task to see progress!
            </Text>
          )}
          {totalStats.tasksCompleted > 0 && totalStats.tasksCompleted < 10 && (
            <Text style={styles.motivationText}>
              🚀 Great start! You're building momentum with each completed task.
            </Text>
          )}
          {totalStats.tasksCompleted >= 10 && totalStats.tasksCompleted < 50 && (
            <Text style={styles.motivationText}>
              💪 You're getting the hang of this! Consistency is key to success.
            </Text>
          )}
          {totalStats.tasksCompleted >= 50 && (
            <Text style={styles.motivationText}>
              🏆 Incredible progress! You're becoming a productivity champion.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  // Cards Section
  cardsContainer: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardSubtitle: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  // Charts Section
  chartsSection: {
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (chartWidth / 2) - 16,
    height: 32,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  
  // Progress Bars
  barsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  labelText: {
    flex: 1,
  },
  statName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statSubtitle: {
    color: '#888',
    fontSize: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  barGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    bottom: -2,
    borderRadius: 6,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  statValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 30,
  },
  completedIndicator: {
    color: '#FFD700',
  },
  
  // Motivation
  motivationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  motivationText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },

  // Mood Patterns Styles
  moodSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  moodTimelineCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  moodTimelineTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  moodTimelineItem: {
    alignItems: 'center',
    gap: 8,
  },
  moodTimelineDay: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  moodTimelineEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  emptyMoodEmoji: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodEmojiLarge: {
    fontSize: 18,
  },
  emptyMoodText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  moodTimelineLabel: {
    color: '#E5E7EB',
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
  moodInsight: {
    color: '#8B5CF6',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
  moodEmptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  moodEmptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  moodEmptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  moodEmptyDescription: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});