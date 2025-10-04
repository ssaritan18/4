import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { API_BASE_URL } from '../lib/api';
export type Achievement = {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  category: 'streak' | 'community' | 'tasks' | 'profile';
  reward: {
    points: number;
    badge: string;
    description: string;
  };
};

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, mode } = useAuth();

  // Fetch achievements from backend
  const fetchAchievements = async () => {
    if (mode === 'sync' && user?.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/user/achievements`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
        } else {
          throw new Error(`Failed to fetch achievements: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fall back to mock data
        setAchievements(getMockAchievements());
      }
    } else {
      // Local mode - use mock data
      setAchievements(getMockAchievements());
    }
    setLoading(false);
  };

  // Mock achievements for local mode
  const getMockAchievements = (): Achievement[] => [
    {
      id: 'first_day',
      name: 'First Step',
      icon: '🌱',
      description: 'Complete your first day of tasks',
      category: 'streak',
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      unlockedAt: new Date().toISOString(),
      reward: {
        points: 50,
        badge: 'Starter',
        description: 'Every journey begins with a single step!'
      }
    },
    {
      id: 'task_starter',
      name: 'Task Starter',
      icon: '✅',
      description: 'Complete your first 10 tasks',
      category: 'tasks',
      unlocked: true,
      progress: 8,
      maxProgress: 10,
      unlockedAt: new Date().toISOString(),
      reward: {
        points: 100,
        badge: 'Achiever',
        description: 'You\'re getting things done!'
      }
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      icon: '⚔️',
      description: 'Maintain a 7-day streak',
      category: 'streak',
      unlocked: false,
      progress: 3,
      maxProgress: 7,
      reward: {
        points: 200,
        badge: 'Consistent',
        description: 'One week of consistency - you\'re building a habit!'
      }
    },
    {
      id: 'community_voice',
      name: 'Community Voice',
      icon: '📢',
      description: 'Share your first community post',
      category: 'community',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      reward: {
        points: 100,
        badge: 'Contributor',
        description: 'Thank you for sharing with the community!'
      }
    },
    {
      id: 'profile_complete',
      name: 'Profile Master',
      icon: '👤',
      description: 'Complete your entire profile',
      category: 'profile',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      reward: {
        points: 150,
        badge: 'Complete',
        description: 'Your profile is looking great!'
      }
    }
  ];

  useEffect(() => {
    fetchAchievements();
  }, [user, mode]);

  // Get achievements by category
  const getAchievementsByCategory = (category: Achievement['category']) => {
    return achievements.filter(a => a.category === category);
  };

  // Get completion stats
  const getCompletionStats = () => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.reward.points, 0);
    
    return {
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      totalPoints,
      remainingPoints: achievements
        .filter(a => !a.unlocked)
        .reduce((sum, a) => sum + a.reward.points, 0)
    };
  };

  // Refresh achievements
  const refreshAchievements = () => {
    fetchAchievements();
  };

  return {
    achievements,
    loading,
    error,
    getAchievementsByCategory,
    getCompletionStats,
    refreshAchievements,
  };
}
