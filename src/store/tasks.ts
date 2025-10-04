import { create } from "zustand";
import { api } from "../lib/api";
import { Alert } from "react-native";

export type Task = {
  _id: string;
  user_id: string;
  title: string;
  goal: number;
  progress: number;
  color?: string;
  date: string;
};

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetchToday: () => Promise<void>;
  createTask: (t: { title: string; goal: number; color?: string }) => Promise<void>;
  increment: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
}

export const useTasksStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  fetchToday: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/api/tasks/today");
      set({ tasks: res.data.tasks || [] });
    } catch (e) {
      // ignore for now
    } finally {
      set({ loading: false });
    }
  },
  createTask: async (t) => {
    try {
      const res = await api.post("/api/tasks", t);
      set({ tasks: [...get().tasks, res.data] });
    } catch (e) {
      Alert.alert("Error", "Unable to create task.");
    }
  },
  increment: async (taskId) => {
    try {
      const res = await api.post(`/api/tasks/${taskId}/increment`);
      set({ tasks: get().tasks.map((tk) => (tk._id === taskId ? res.data : tk)) });
    } catch (e) {
      // ignore
    }
  },
  removeTask: async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      set({ tasks: get().tasks.filter((t) => t._id !== taskId) });
    } catch (e) {
      // ignore
    }
  },
}));