import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../lib/api';
export type Challenge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'focus' | 'tasks' | 'community';
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
  max_progress: number;
  reward: {
    points: number;
    badge: string;
    description: string;
  };
  deadline: string;
  tips: string[];
};

export type WeeklyChallengesData = {
  challenges: Challenge[];
  week_start: string;
  completed_this_week: number;
  total_points_available: number;
};

export function useChallenges() {
  const [challenges, setChallenges] = useState<WeeklyChallengesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, mode } = useAuth();

  // Fetch weekly challenges from backend
  const fetchChallenges = async () => {
    if (mode === 'sync' && user?.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/challenges/weekly`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setChallenges(data);
        } else {
          throw new Error(`Failed to fetch challenges: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fall back to mock data
        setChallenges(getMockChallenges());
      }
    } else {
      // Local mode - use mock data
      setChallenges(getMockChallenges());
    }
    setLoading(false);
  };

  // Complete a challenge
  const completeChallenge = async (challengeId: string) => {
    if (mode === 'sync' && user?.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Refresh challenges to get updated data
          await fetchChallenges();
          return data;
        } else {
          throw new Error(`Failed to complete challenge: ${response.status}`);
        }
      } catch (err) {
        console.error('Error completing challenge:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    } else {
      // Local mode - mock completion
      if (challenges) {
        const updatedChallenges = {
          ...challenges,
          challenges: challenges.challenges.map(c => 
            c.id === challengeId 
              ? { ...c, progress: c.max_progress }
              : c
          ),
          completed_this_week: challenges.completed_this_week + 1
        };
        setChallenges(updatedChallenges);
        
        return {
          success: true,
          challenge_id: challengeId,
          completion_time: new Date().toISOString(),
          reward: { points: 500, badge: "Champion" },
          celebration: {
            title: "Challenge Completed! 🎉",
            message: "You've earned 500 points!",
            confetti: true,
            sound: "celebration"
          }
        };
      }
      return null;
    }
  };

  // Mock challenges for local mode
  const getMockChallenges = (): WeeklyChallengesData => ({
    challenges: [
      {
        id: 'focus_marathon',
        name: 'Focus Marathon',
        icon: '🏃‍♂️',
        description: 'Complete 5 focus sessions this week',
        category: 'focus',
        difficulty: 'medium',
        progress: 2,
        max_progress: 5,
        reward: {
          points: 500,
          badge: 'Marathon Runner',
          description: "You've mastered sustained focus!"
        },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tips: [
          'Start with 15-minute sessions',
          'Take breaks between sessions',
          'Use your hyperfocus when it comes naturally'
        ]
      },
      {
        id: 'task_tornado',
        name: 'Task Tornado',
        icon: '🌪️',
        description: 'Complete 15 tasks in 3 days',
        category: 'tasks',
        difficulty: 'hard',
        progress: 8,
        max_progress: 15,
        reward: {
          points: 750,
          badge: 'Tornado',
          description: 'You swept through those tasks!'
        },
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        tips: [
          'Break big tasks into smaller ones',
          'Use body doubling if possible',
          'Ride your motivation waves'
        ]
      },
      {
        id: 'community_connector',
        name: 'Community Connector',
        icon: '🤝',
        description: 'Help 3 community members this week',
        category: 'community',
        difficulty: 'easy',
        progress: 1,
        max_progress: 3,
        reward: {
          points: 300,
          badge: 'Helper',
          description: 'Your support means everything!'
        },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tips: [
          'Share your own ADHD experiences',
          'Offer encouragement on posts',
          'Answer questions from your expertise'
        ]
      }
    ],
    week_start: new Date().toISOString(),
    completed_this_week: 0,
    total_points_available: 1550
  });

  useEffect(() => {
    fetchChallenges();
  }, [user, mode]);

  // Get challenges by category
  const getChallengesByCategory = (category: Challenge['category']) => {
    return challenges?.challenges.filter(c => c.category === category) || [];
  };

  // Get completion stats
  const getCompletionStats = () => {
    if (!challenges) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = challenges.challenges.filter(c => c.progress >= c.max_progress).length;
    const total = challenges.challenges.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  // Get available points
  const getAvailablePoints = () => {
    if (!challenges) return 0;
    
    return challenges.challenges
      .filter(c => c.progress < c.max_progress)
      .reduce((sum, c) => sum + c.reward.points, 0);
  };

  // Refresh challenges
  const refreshChallenges = () => {
    fetchChallenges();
  };

  return {
    challenges: challenges?.challenges || [],
    weeklyData: challenges,
    loading,
    error,
    completeChallenge,
    getChallengesByCategory,
    getCompletionStats,
    getAvailablePoints,
    refreshChallenges,
  };
}
