import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { useStreak } from './useStreak';
import { API_BASE_URL } from '../lib/api';
export type FocusSessionType = 'pomodoro' | 'deep_work' | 'adhd_sprint';

export type FocusSession = {
  id?: string;
  type: FocusSessionType;
  duration_minutes: number;
  status: 'idle' | 'active' | 'paused' | 'completed';
  time_remaining?: number;
  points_potential?: number;
  start_time?: string;
};

export type FocusSessionCompletion = {
  session_id: string;
  completion_time: string;
  points_earned: number;
  breakdown: {
    base_points: number;
    task_bonus: number;
    focus_bonus: number;
    interruption_penalty: number;
  };
  celebration: {
    title: string;
    message: string;
    achievement_unlocked: boolean;
  };
  next_suggestion: string;
};

export function useFocusSession() {
  const { getStreakMultiplier } = useStreak(); // PHASE 2: Get streak multiplier
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, mode } = useAuth();

  // Start a new focus session
  const startSession = async (
    sessionType: FocusSessionType,
    durationMinutes: number
  ): Promise<FocusSession | null> => {
    setLoading(true);
    
    if (mode === 'sync' && user?.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/focus/session/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_type: sessionType,
            duration_minutes: durationMinutes
          })
        });

        if (response.ok) {
          const data = await response.json();
          const session: FocusSession = {
            ...data.session,
            status: 'active'
          };
          setCurrentSession(session);
          setLoading(false);
          return session;
        } else {
          throw new Error(`Failed to start session: ${response.status}`);
        }
      } catch (err) {
        console.error('Error starting session:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        // Fall back to local session
        return createLocalSession(sessionType, durationMinutes);
      }
    } else {
      // Local mode
      const session = createLocalSession(sessionType, durationMinutes);
      setCurrentSession(session);
      setLoading(false);
      return session;
    }
  };

  // Complete a focus session
  const completeSession = async (
    sessionId: string,
    tasksCompleted: number = 0,
    interruptions: number = 0,
    focusRating: number = 8
  ): Promise<FocusSessionCompletion | null> => {
    if (mode === 'sync' && user?.token) {
      try {
       const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tasks_completed: tasksCompleted,
            interruptions: interruptions,
            focus_rating: focusRating
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentSession(prev => prev ? { ...prev, status: 'completed' } : null);
          return data;
        } else {
          throw new Error(`Failed to complete session: ${response.status}`);
        }
      } catch (err) {
        console.error('Error completing session:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fall back to local completion
        return createLocalCompletion(sessionId, tasksCompleted, interruptions, focusRating);
      }
    } else {
      // Local mode
      const completion = createLocalCompletion(sessionId, tasksCompleted, interruptions, focusRating);
      setCurrentSession(prev => prev ? { ...prev, status: 'completed' } : null);
      return completion;
    }
  };

  // Pause current session
  const pauseSession = () => {
    setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
  };

  // Resume paused session
  const resumeSession = () => {
    setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
  };

  // End current session
  const endSession = () => {
    setCurrentSession(null);
    setError(null);
  };

  // Create local session (for local mode or fallback)
  const createLocalSession = (
    sessionType: FocusSessionType,
    durationMinutes: number
  ): FocusSession => {
    const pointsMap = {
      pomodoro: 150,
      deep_work: 400,
      adhd_sprint: 150
    };

    return {
      id: `local_session_${Date.now()}`,
      type: sessionType,
      duration_minutes: durationMinutes,
      status: 'active',
      time_remaining: durationMinutes * 60,
      points_potential: pointsMap[sessionType],
      start_time: new Date().toISOString()
    };
  };

  // Create local completion (for local mode or fallback)
  const createLocalCompletion = (
    sessionId: string,
    tasksCompleted: number,
    interruptions: number,
    focusRating: number,
    streakMultiplier: number = 1.0
  ): FocusSessionCompletion => {
    const basePoints = 150;
    const taskBonus = tasksCompleted * 25;
    const focusBonus = focusRating * 10;
    const interruptionPenalty = interruptions * 10;
    
    // PHASE 2: Apply streak multiplier
    const subtotal = Math.max(50, basePoints + taskBonus + focusBonus - interruptionPenalty);
    const totalPoints = Math.floor(subtotal * streakMultiplier);

    return {
      session_id: sessionId,
      completion_time: new Date().toISOString(),
      points_earned: totalPoints,
      breakdown: {
        base_points: basePoints,
        task_bonus: taskBonus,
        focus_bonus: focusBonus,
        interruption_penalty: -interruptionPenalty
      },
      celebration: {
        title: 'Focus Session Complete! 🎯',
        message: `Amazing focus! You earned ${totalPoints} points!`,
        achievement_unlocked: focusRating >= 9
      },
      next_suggestion: getNextSuggestion(focusRating, interruptions)
    };
  };

  // Get next focus suggestion
  const getNextSuggestion = (rating: number, interruptions: number): string => {
    if (rating >= 8 && interruptions <= 1) {
      return "Great session! Try extending to 30 minutes next time? 🚀";
    } else if (interruptions > 3) {
      return "Lots of interruptions? Try a shorter 15-minute sprint next time 💪";
    } else if (rating <= 5) {
      return "Tough session? Take a break and try again when you feel ready 🌱";
    } else {
      return "Solid work! Keep building that focus muscle! 🎯";
    }
  };

  // Get session type info
  const getSessionTypeInfo = (type: FocusSessionType) => {
    const sessionTypes = {
      pomodoro: {
        name: 'Pomodoro',
        icon: '🍅',
        description: '25 minutes of focused work',
        color: '#FF6B35',
        defaultDuration: 25
      },
      deep_work: {
        name: 'Deep Work',
        icon: '🧠',
        description: '50 minutes of deep focus',
        color: '#6C5CE7',
        defaultDuration: 50
      },
      adhd_sprint: {
        name: 'ADHD Sprint',
        icon: '⚡',
        description: '15 minutes burst of energy',
        color: '#00C851',
        defaultDuration: 15
      }
    };

    return sessionTypes[type];
  };

  // Get all session types
  const getAllSessionTypes = () => {
    return [
      getSessionTypeInfo('pomodoro'),
      getSessionTypeInfo('deep_work'),
      getSessionTypeInfo('adhd_sprint')
    ];
  };

  return {
    currentSession,
    loading,
    error,
    startSession,
    completeSession,
    pauseSession,
    resumeSession,
    endSession,
    getSessionTypeInfo,
    getAllSessionTypes,
  };
}
