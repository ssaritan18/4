import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KEY_COMPLETED_DATES } from "../context/TasksContext";

function toISODate(d: Date) { return d.toISOString().slice(0, 10); }
function prevDate(d: Date) { const p = new Date(d); p.setDate(d.getDate() - 1); return p; }

export function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  let c = 0;
  let pointer = new Date();
  while (set.has(toISODate(pointer))) {
    c += 1;
    pointer = prevDate(pointer);
  }
  return c;
}

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [lastBonusStreak, setLastBonusStreak] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY_COMPLETED_DATES);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const currentStreak = computeStreak(arr);
      setStreak(currentStreak);
      
      // Load last bonus streak
      const lastBonus = await AsyncStorage.getItem('last_bonus_streak');
      setLastBonusStreak(lastBonus ? parseInt(lastBonus) : 0);
    } catch {
      setStreak(0);
      setLastBonusStreak(0);
    }
  }, []);

  // PHASE 2: Calculate streak bonus points
  const getStreakBonusPoints = () => {
    if (streak >= 7) return 100;  // Weekly bonus
    if (streak >= 3) return 50;   // 3-day bonus
    return 0;
  };

  // PHASE 2: Get streak multiplier for other activities
  const getStreakMultiplier = () => {
    if (streak >= 30) return 2.0;   // 30-day streak = 2x points
    if (streak >= 14) return 1.5;   // 2-week streak = 1.5x points
    if (streak >= 7) return 1.2;    // 1-week streak = 1.2x points
    return 1.0;                     // No streak = normal points
  };

  // PHASE 2: Check if user is eligible for streak bonus
  const canClaimStreakBonus = () => {
    return streak > 0 && streak > lastBonusStreak && (streak % 3 === 0);
  };

  // PHASE 2: Claim streak bonus points
  const claimStreakBonus = async () => {
    if (!canClaimStreakBonus()) return { success: false, error: 'No bonus available' };
    
    try {
      await AsyncStorage.setItem('last_bonus_streak', streak.toString());
      setLastBonusStreak(streak);
      
      const bonusPoints = getStreakBonusPoints();
      return { 
        success: true, 
        points: bonusPoints, 
        message: `🔥 ${streak}-day streak bonus! Earned ${bonusPoints} points!` 
      };
    } catch (error) {
      return { success: false, error: 'Failed to claim bonus' };
    }
  };

  // PHASE 2: Get streak tier info
  const getStreakTier = () => {
    if (streak >= 30) return { tier: 'Legend', icon: '👑', color: '#FFD700' };
    if (streak >= 21) return { tier: 'Master', icon: '🏆', color: '#C0392B' };
    if (streak >= 14) return { tier: 'Champion', icon: '⭐', color: '#9B59B6' };
    if (streak >= 7) return { tier: 'Focused', icon: '🔥', color: '#E67E22' };
    if (streak >= 3) return { tier: 'Building', icon: '📈', color: '#3498DB' };
    return { tier: 'Starting', icon: '🌱', color: '#2ECC71' };
  };

  useEffect(() => { refresh(); }, [refresh]);

  return { 
    streak, 
    refresh,
    // PHASE 2: New streak features
    getStreakBonusPoints,
    getStreakMultiplier,
    canClaimStreakBonus,
    claimStreakBonus,
    getStreakTier,
    lastBonusStreak,
  };
}