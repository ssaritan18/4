import React from "react";
import { Alert } from "react-native";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { api } from "../lib/api";

WebBrowser.maybeCompleteAuthSession();

export type Palette = { primary: string; secondary: string; accent: string };

interface AuthState {
  userId: string | null;
  name: string | null;
  email: string | null;
  photo_base64?: string | null;
  palette: Palette;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  name: null,
  email: null,
  photo_base64: null,
  palette: { primary: "#A3C9FF", secondary: "#FFCFE1", accent: "#B8F1D9" },
  isAuthenticated: false,
  bootstrap: async () => {
    const id = await AsyncStorage.getItem("user_id");
    const palette = await AsyncStorage.getItem("palette");
    if (id) {
      set({ userId: id, isAuthenticated: true });
    }
    if (palette) {
      try { set({ palette: JSON.parse(palette) }); } catch {}
    }
  },
  signInWithGoogle: async () => {
    // NOTE: Requires client IDs. If not configured, show alert.
    const clientIdMissing = !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (clientIdMissing) {
      Alert.alert("Google Sign-In", "Please provide Google OAuth client IDs to enable sign-in.");
      return;
    }

    const [request, response, promptAsync] = Google.useAuthRequest({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      scopes: ["profile", "email"],
    });

    // In store context we cannot render hooks. So fallback simple approach:
    Alert.alert("Action Needed", "Tap the Google button again after keys are set.");
  },
  signOut: async () => {
    await AsyncStorage.multiRemove(["user_id"]);
    set({ userId: null, isAuthenticated: false });
  },
}));

// Helper to complete Google login when we have id_token (handled in screen with hooks)
export async function completeGoogleLogin(id_token: string) {
  try {
    const res = await api.post("/api/auth/google", { id_token });
    const { user_id, palette } = res.data;
    await AsyncStorage.setItem("user_id", user_id);
    if (palette) await AsyncStorage.setItem("palette", JSON.stringify(palette));
    useAuthStore.setState({ userId: user_id, isAuthenticated: true, palette: palette || useAuthStore.getState().palette });
  } catch (e: any) {
    Alert.alert("Login failed", e?.response?.data?.detail || "Please try again.");
  }
}