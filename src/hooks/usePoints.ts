import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../lib/api';
export type PointsBreakdown = {
  achievements: number;
  tasks: number;
  focus_sessions: number;
  community: number;
  streaks: number;
  challenges: number;
};

export type PointsMultipliers = {
  current_streak_bonus: number;
  weekly_challenge_bonus: number;
  achievement_tier_bonus: number;
};

export type PointsData = {
  total_points: number;
  level: number;
  points_to_next_level: number;
  breakdown: PointsBreakdown;
  multipliers: PointsMultipliers;
};

export function usePoints() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, mode } = useAuth();

  // Fetch points data from backend
  const fetchPoints = async () => {
    if (mode === 'sync' && user?.token) {
      try {
         const response = await fetch(`${API_BASE_URL}/user/points`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPointsData(data);
        } else {
          throw new Error(`Failed to fetch points: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching points:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fall back to mock data
        setPointsData(getMockPoints());
      }
    } else {
      // Local mode - use mock data
      setPointsData(getMockPoints());
    }
    setLoading(false);
  };

  // Mock points for local mode
  const getMockPoints = (): PointsData => ({
    total_points: 1250,
    level: 7,
    points_to_next_level: 150,
    breakdown: {
      achievements: 450,
      tasks: 300,
      focus_sessions: 250,
      community: 100,
      streaks: 100,
      challenges: 50
    },
    multipliers: {
      current_streak_bonus: 1.2,
      weekly_challenge_bonus: 1.0,
      achievement_tier_bonus: 1.1
    }
  });

  useEffect(() => {
    fetchPoints();
  }, [user, mode]);

  // Get level progress percentage
  const getLevelProgress = () => {
    if (!pointsData) return 0;
    
    const levelPoints = 200; // Points needed per level
    const currentLevelPoints = pointsData.total_points % levelPoints;
    return (currentLevelPoints / levelPoints) * 100;
  };

  // Get level info
  const getLevelInfo = () => {
    if (!pointsData) return null;
    
    const levelTitles = [
      'Starter',
      'Explorer', 
      'Achiever',
      'Focused',
      'Dedicated',
      'Champion',
      'Expert',
      'Master',
      'Legend',
      'ADHD Hero'
    ];
    
    const levelIndex = Math.min(pointsData.level - 1, levelTitles.length - 1);
    const nextLevelIndex = Math.min(pointsData.level, levelTitles.length - 1);
    
    return {
      current: {
        level: pointsData.level,
        title: levelTitles[levelIndex] || 'Champion',
        icon: getLevelIcon(pointsData.level)
      },
      next: {
        level: pointsData.level + 1,
        title: levelTitles[nextLevelIndex] || 'Ultimate Hero',
        icon: getLevelIcon(pointsData.level + 1)
      }
    };
  };

  // Get level icon
  const getLevelIcon = (level: number): string => {
    if (level <= 2) return '🌱';
    if (level <= 4) return '🚀';
    if (level <= 6) return '⭐';
    if (level <= 8) return '🏆';
    return '👑';
  };

  // Get points by category with colors
  const getCategorizedPoints = () => {
    if (!pointsData) return [];
    
    return [
      {
        category: 'Achievements',
        points: pointsData.breakdown.achievements,
        color: '#FFD700',
        icon: '🏆'
      },
      {
        category: 'Tasks',
        points: pointsData.breakdown.tasks,
        color: '#4A90E2',
        icon: '✅'
      },
      {
        category: 'Focus Sessions',
        points: pointsData.breakdown.focus_sessions,
        color: '#6C5CE7',
        icon: '🎯'
      },
      {
        category: 'Community',
        points: pointsData.breakdown.community,
        color: '#00C851',
        icon: '🤝'
      },
      {
        category: 'Streaks',
        points: pointsData.breakdown.streaks,
        color: '#FF6B35',
        icon: '🔥'
      },
      {
        category: 'Challenges',
        points: pointsData.breakdown.challenges,
        color: '#FF3547',
        icon: '💪'
      }
    ].filter(item => item.points > 0).sort((a, b) => b.points - a.points);
  };

  // Get active multipliers
  const getActiveMultipliers = () => {
    if (!pointsData) return [];
    
    const multipliers = [];
    
    if (pointsData.multipliers.current_streak_bonus > 1.0) {
      multipliers.push({
        name: 'Streak Bonus',
        multiplier: pointsData.multipliers.current_streak_bonus,
        icon: '🔥',
        description: 'Keep your streak going!'
      });
    }
    
    if (pointsData.multipliers.weekly_challenge_bonus > 1.0) {
      multipliers.push({
        name: 'Challenge Bonus',
        multiplier: pointsData.multipliers.weekly_challenge_bonus,
        icon: '💪',
        description: 'Complete weekly challenges!'
      });
    }
    
    if (pointsData.multipliers.achievement_tier_bonus > 1.0) {
      multipliers.push({
        name: 'Achievement Tier',
        multiplier: pointsData.multipliers.achievement_tier_bonus,
        icon: '🎖️',
        description: 'Unlock higher tier achievements!'
      });
    }
    
    return multipliers;
  };

  // PHASE 2: Earn points from rewarded ads
  const earnRewardedAdPoints = async () => {
    const adPoints = 50;
    
    if (mode === 'sync' && user?.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/points/earn-ad`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ points: adPoints })
        });

        if (response.ok) {
          const data = await response.json();
          await fetchPoints(); // Refresh points
          return { success: true, points: adPoints, message: data.message };
        } else {
          throw new Error(`Failed to earn ad points: ${response.status}`);
        }
      } catch (err) {
        console.error('Error earning ad points:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    } else {
      // Local mode simulation
      if (pointsData) {
        const newPoints = pointsData.total_points + adPoints;
        setPointsData({
          ...pointsData,
          total_points: newPoints,
          breakdown: {
            ...pointsData.breakdown,
            community: pointsData.breakdown.community + adPoints
          }
        });
      }
      return { success: true, points: adPoints, message: `Earned ${adPoints} points from ad!` };
    }
  };

  // PHASE 2: Spend points on items
  const spendPoints = async (amount: number, itemType: string, itemId: string) => {
    if (!pointsData || pointsData.total_points < amount) {
      return { success: false, error: 'Insufficient points' };
    }

    if (mode === 'sync' && user?.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/points/spend`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            points: amount, 
            item_type: itemType, 
            item_id: itemId 
          })
        });

        if (response.ok) {
          const data = await response.json();
          await fetchPoints(); // Refresh points
          return { success: true, message: data.message };
        } else {
          throw new Error(`Failed to spend points: ${response.status}`);
        }
      } catch (err) {
        console.error('Error spending points:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    } else {
      // Local mode simulation
      const newPoints = pointsData.total_points - amount;
      setPointsData({
        ...pointsData,
        total_points: newPoints
      });
      return { success: true, message: `Spent ${amount} points on ${itemType}!` };
    }
  };

  // PHASE 2: Check if user can afford item
  const canAfford = (cost: number) => {
    return pointsData ? pointsData.total_points >= cost : false;
  };

  // Refresh points
  const refreshPoints = () => {
    fetchPoints();
  };

  return {
    pointsData,
    loading,
    error,
    getLevelProgress,
    getLevelInfo,
    getCategorizedPoints,
    getActiveMultipliers,
    refreshPoints,
    // PHASE 2: New methods
    earnRewardedAdPoints,
    spendPoints,
    canAfford,
  };
}
