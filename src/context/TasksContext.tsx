import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PERSIST_ENABLED, KEYS } from "../config";
import { loadJSON, saveJSON } from "../utils/persist";

export const KEY_COMPLETED_DATES = KEYS.completedDates;

export type Task = {
  id: string;
  title: string;
  goal: number; // target units
  progress: number; // current units
  color?: string;
};

type TasksContextType = {
  tasks: Task[];
  addTask: (title: string, goal: number, color?: string) => void;
  increment: (id: string) => Promise<boolean>; // returns true if this action completed the task
  remove: (id: string) => void;
  resetToday: () => void;
  reorder: (next: Task[]) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

function uid() { return Math.random().toString(36).slice(2); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

async function markTodayCompleted() {
  try {
    const key = KEY_COMPLETED_DATES;
    const raw = await AsyncStorage.getItem(key);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    const t = todayStr();
    if (!arr.includes(t)) {
      arr.push(t);
      await AsyncStorage.setItem(key, JSON.stringify(arr));
    }
  } catch {}
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: uid(), title: "Hydrate (glasses)", goal: 6, progress: 2, color: "#A3C9FF" },
    { id: uid(), title: "Stretch (sets)", goal: 3, progress: 1, color: "#FFCFE1" },
    { id: uid(), title: "Gratitude (notes)", goal: 1, progress: 0, color: "#B8F1D9" },
  ]);

  useEffect(() => {
    if (!PERSIST_ENABLED) { setHydrated(true); return; }
    (async () => {
      const stored = await loadJSON<Task[] | null>(KEYS.tasks, null);
      if (stored && Array.isArray(stored) && stored.length) setTasks(stored);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!PERSIST_ENABLED) return;
    if (!hydrated) return;
    saveJSON(KEYS.tasks, tasks);
  }, [tasks, hydrated]);

  const value = useMemo<TasksContextType>(() => ({
    tasks,
    addTask: (title, goal, color) => setTasks((prev) => [...prev, { id: uid(), title, goal, progress: 0, color }]),
    increment: async (id) => {
      let completedNow = false;
      
      // Find the task to check if it will be completed
      const task = tasks.find(t => t.id === id);
      if (task) {
        const newProgress = Math.min(task.progress + 1, task.goal);
        completedNow = task.progress < task.goal && newProgress >= task.goal;
      }
      
      // Update local state optimistically
      setTasks((prev) => prev.map((t) => {
        if (t.id !== id) return t;
        const newProgress = Math.min(t.progress + 1, t.goal);
        return { ...t, progress: newProgress };
      }));
      
      // Try to sync with backend
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://adhders-social-club.onrender.com'}/api/tasks/${id}/increment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const updatedTask = await response.json();
          // Update with backend response
          setTasks((prev) => prev.map((t) => t.id === id ? { ...t, progress: updatedTask.progress } : t));
        }
      } catch (error) {
        console.error('Failed to sync task increment with backend:', error);
        // Local state is already updated, so we continue
      }
      
      if (completedNow) await markTodayCompleted();
      return completedNow;
    },
    remove: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
    resetToday: () => setTasks((prev) => prev.map((t) => ({ ...t, progress: 0 }))),
    reorder: (next) => setTasks(next),
  }), [tasks]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}