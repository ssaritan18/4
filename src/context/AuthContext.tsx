import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { Alert } from "react-native";
import { PERSIST_ENABLED, KEYS } from "../config";
import { loadJSON, saveJSON } from "../utils/persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken, getBackendBaseUrl } from "../lib/api";
import { setInMemoryToken, setAuthToken as setSecureAuthToken, clearAuthToken } from "../utils/authTokenHelper";
import { googleSignInService, GoogleUser } from "../services/googleSignInService";


export type User = {
  id?: string;
  name: string;
  email?: string;
  photoBase64?: string | null;
  token?: string;
};

export type Palette = { primary: string; secondary: string; accent: string };

export type Credentials = {
  email: string;
  password: string;
};

type AuthContextType = {
  isAuthed: boolean;
  user: User | null;
  loading: boolean;
  palette: Palette;
  token: string | null;
  setPalette: (p: Palette) => void;
  signIn: (user: Partial<User>) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resetCredentials: (email?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [palette, setPaletteState] = useState<Palette>({ primary: "#A3C9FF", secondary: "#FFCFE1", accent: "#B8F1D9" });
  const [token, _setToken] = useState<string | null>(null);

  const setToken = async (t: string | null) => {
    _setToken(t);
    if (t) {
      // Set both API and secure storage
      setAuthToken(t);
      await setSecureAuthToken(t);
      setInMemoryToken(t);
      
      // Legacy support - also save via saveJSON for backward compatibility
      await saveJSON(KEYS.token, t);
      console.log('💾 Token saved to all storage locations');
    } else {
      // Clear from all locations
      setAuthToken(null);
      await clearAuthToken();
      console.log('🗑️ Token cleared from all storage locations');
    }
  };

  useEffect(() => {
    (async () => {
      if (PERSIST_ENABLED) {
        const storedPalette = await loadJSON<Palette | null>(KEYS.palette, null);
        if (storedPalette) setPaletteState(storedPalette);
        const storedUser = await loadJSON<User | null>(KEYS.user, null);
        if (storedUser) { setUser(storedUser); setAuthed(true); }
        
        // Load token from storage if not already loaded
        if (!token) {
          const t = await loadJSON<string | null>(KEYS.token, null);
          if (t) {
            await setToken(t);
            try {
              const me = await api.get("/api/me");
              const u: User = { name: me.data.name, email: me.data.email, photoBase64: me.data.photo_base64, token: t };
              setUser(u); setAuthed(true);
              if (PERSIST_ENABLED) await saveJSON(KEYS.user, u);
            } catch (error) {
              console.warn('⚠️ Token validation failed:', error);
              await setToken(null); // Clear invalid token
            }
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  const setPalette = (p: Palette) => {
    setPaletteState(p);
    if (PERSIST_ENABLED) saveJSON(KEYS.palette, p);
  };

  const signIn = async (u: Partial<User>) => {
    const cleaned: User = { name: (u.name || "You").trim(), email: u.email?.trim(), photoBase64: u.photoBase64 || null };
    setUser(cleaned);
    setAuthed(true);
    if (PERSIST_ENABLED) await saveJSON(KEYS.user, cleaned);
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("🔧 register called:", { syncEnabled: true, name, email });
    if (true) {
      console.log("📡 Making register API call to backend...");
      console.log("🔗 Backend URL:", getBackendBaseUrl());
      try {
        const res = await api.post("/api/auth/register", { name, email, password });
        console.log("✅ Register response:", res.data);
        
        // New flow: Registration returns message instead of token
        const message = res.data?.message || "Registration successful!";
        const emailSent = res.data?.email_sent || false;
        
        Alert.alert(
          "Registration Successful! 🎉", 
          `${message}\n\n${emailSent ? "📧 Verification email sent!" : "⚠️ Email not configured - check with admin"}`,
          [{ text: "OK" }]
        );
        
        console.log("📧 Email verification required - user should check email");
        
        // Set user state even without token for UI consistency
        const newUser: User = { 
          name: name.trim() || "You", 
          email: email.trim(),
          id: res.data?.user_id  // Store user ID from response
        };
        setUser(newUser);
        setAuthed(true);
        if (PERSIST_ENABLED) await saveJSON(KEYS.user, newUser);
        console.log("✅ User state set after registration");
        
        // Auto-login after registration for better UX
        console.log("🔄 Auto-login after registration...");
        try {
          const loginRes = await api.post("/api/auth/login", { email, password });
          if (loginRes.data?.access_token) {
            const token = loginRes.data.access_token;
            console.log('🔐 Auto-login successful, setting token');
            await setToken(token);
            
            // Update user with token
            const userWithToken = { ...newUser, token };
            setUser(userWithToken);
            if (PERSIST_ENABLED) await saveJSON(KEYS.user, userWithToken);
            console.log('✅ User updated with token after auto-login');
          }
        } catch (loginError) {
          console.warn('⚠️ Auto-login failed, user can login manually:', loginError);
        }
        
      } catch (e: any) {
        console.error("❌ Register API call failed:", e);
        const message =
          e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          "Registration failed. Please try again.";
        Alert.alert("Registration Error", message);
        throw e;
      }
      return;
    }
    console.log("📱 Using local register (sync disabled)");
    const newUser: User = { name: name.trim() || "You", email: email.trim() };
    const creds: Credentials = { email: email.trim(), password };
    setUser(newUser);
    setAuthed(true);
    if (PERSIST_ENABLED) { await saveJSON(KEYS.user, newUser); await saveJSON(KEYS.credentials, creds); }
  };

  const login = async (email: string, password: string) => {
    console.log("🔧 login called:", { syncEnabled: true, email });
    if (true) {
      console.log("📡 Making login API call to backend...");
      try {
        const res = await api.post("/api/auth/login", { email, password });
        console.log("✅ Login API response received:", res.status);
        
        if (res.data?.access_token) {
          const token = res.data.access_token;
          console.log('🔐 Login successful, setting token and auth state');
          
          // Set token using our secure storage system
          await setToken(token);
          setAuthed(true);
          
          // Broadcast authentication success
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('authStateChanged', { 
              detail: { isAuthenticated: true, token } 
            }));
          }
          // Try to get user profile
          try {
            const profileRes = await api.get("/api/auth/me");
            if (profileRes.data) {
              const userData = { 
                name: profileRes.data.name || email, 
                email: profileRes.data.email || email,
                token: token  // ✅ Add token to user object
              };
              setUser(userData);
              await saveJSON(KEYS.user, userData);
              console.log('✅ User profile set and authenticated with token');
            }
          } catch (profileError) {
            console.warn("⚠️ Profile fetch failed, using email as name:", profileError);
            const userData = { name: email, email, token: token };  // ✅ Add token here too
            setUser(userData);
            await saveJSON(KEYS.user, userData);
            console.log('✅ Fallback user profile set and authenticated');
          }
        } else {
          throw new Error("No access token received");
        }
      } catch (error: any) {
        console.error("❌ Login error:", error);
        
        // Handle specific error types
        if (error.response?.status === 401) {
          throw new Error("Invalid email or password. Please check your credentials.");
        } else if (error.response?.status === 403) {
          throw new Error("Account not verified. Please check your email for verification instructions.");
        } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('timeout')) {
          throw new Error("Connection timeout. Please check your internet connection and try again.");
        } else if (error.response?.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(error.response?.data?.detail || error.message || "Login failed. Please try again.");
        }
      }
    } else {
      // Local mode fallback
      const fakeUser = { name: email.split("@")[0], email };
      setUser(fakeUser);
      await saveJSON(KEYS.user, fakeUser);
      setAuthed(true);
    }
  };

  const loginWithGoogle = async () => {
    console.log("🔐 Google Sign-In initiated");
    
    try {
      // Check if Google Sign-In is available
      const isAvailable = await googleSignInService.isGoogleSignInAvailable();
      if (!isAvailable) {
        throw new Error('Google Sign-In is not available on this device');
      }

      // Sign in with Google
      const googleUser = await googleSignInService.signIn();
      if (!googleUser) {
        console.log('Google Sign-In was cancelled by user');
        return;
      }

      console.log('✅ Google Sign-In successful, verifying with backend...');

      // Send Google ID token to backend for verification
      const response = await api.post('/api/auth/google', {
        idToken: googleUser.idToken,
        email: googleUser.email,
        name: googleUser.name,
        photo: googleUser.photo,
        serverAuthCode: googleUser.serverAuthCode
      });

      if (response.data?.access_token) {
        const token = response.data.access_token;
        console.log('✅ Backend verification successful, setting auth state');
        
        // Set token using our secure storage system
        await setToken(token);
        setAuthed(true);
        
        // Set user data
        const userData = {
          id: response.data.user?.id || googleUser.id,
          name: response.data.user?.name || googleUser.name,
          email: response.data.user?.email || googleUser.email,
          photoBase64: googleUser.photo ? `data:image/jpeg;base64,${googleUser.photo}` : null,
          token: token
        };
        
        setUser(userData);
        await saveJSON(KEYS.user, userData);
        
        // Broadcast authentication success
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { isAuthenticated: true, token } 
          }));
        }
        
        console.log('✅ Google Sign-In completed successfully');
      } else {
        throw new Error('No access token received from backend');
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In failed:', error);
      
      // Sign out from Google if there was an error
      try {
        await googleSignInService.signOut();
      } catch (signOutError) {
        console.error('Failed to sign out from Google:', signOutError);
      }
      
      // Show user-friendly error message
      if (error.message?.includes('Google Play Services')) {
        Alert.alert('Google Sign-In Error', 'Google Play Services not available. Please update Google Play Services and try again.');
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        Alert.alert('Connection Error', 'Unable to connect to server. Please check your internet connection and try again.');
      } else {
        Alert.alert('Sign-In Failed', error.message || 'Google Sign-In failed. Please try again.');
      }
      
      throw error;
    }
  };

  const resetCredentials = async (email?: string) => {
    if (PERSIST_ENABLED) {
      const stored = await loadJSON<Credentials | null>(KEYS.credentials, null);
      await AsyncStorage.removeItem(KEYS.credentials);
      if (stored && email && stored.email?.toLowerCase() === email.trim().toLowerCase()) {
        await AsyncStorage.removeItem(KEYS.user);
        setUser(null); setAuthed(false); // reset auth after clearing credentials
      }
    }
  };

  const forgotPassword = async (email: string) => {
    console.log("🔑 Forgot password initiated for:", email);
    console.log("🔗 API Base URL:", api.defaults.baseURL);
    console.log("📡 Making POST request to:", `${api.defaults.baseURL}/api/auth/forgot-password`);
    
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      console.log("✅ Forgot password email sent successfully");
      console.log("📧 Response data:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Forgot password error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        throw new Error("Email address not found. Please check your email address and try again.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a few minutes before trying again.");
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('timeout')) {
        throw new Error("Connection timeout. Please check your internet connection and try again.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.detail || error.message || "Failed to send reset email. Please try again.");
      }
    }
  };

  const resetPassword = async (token: string, password: string) => {
    console.log("🔑 Reset password initiated");
    
    try {
      const response = await api.post('/api/auth/reset-password', { token, password });
      console.log("✅ Password reset successfully");
      return response.data;
    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      
      if (error.response?.status === 400) {
        throw new Error("Invalid or expired reset token. Please request a new password reset.");
      } else if (error.response?.status === 422) {
        throw new Error("Password does not meet requirements. Please choose a stronger password.");
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('timeout')) {
        throw new Error("Connection timeout. Please check your internet connection and try again.");
      } else if (error.response?.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.detail || error.message || "Failed to reset password. Please try again.");
      }
    }
  };

  const signOut = async () => {
    console.log("🚪 signOut called");
    
    // Clear all authentication state
    setUser(null);
    setAuthed(false);
    await setToken(null);
    
    // Clear other persisted data
    if (PERSIST_ENABLED) {
      await AsyncStorage.removeItem(KEYS.user);
      await AsyncStorage.removeItem(KEYS.credentials);
    }
    
    // Broadcast sign out event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: false, token: null } 
      }));
    }
    
    console.log("✅ SignOut completed - all storage cleared");
  };

  const value = useMemo(() => ({ 
    isAuthed, 
    isAuthenticated: isAuthed,  // Add alias for compatibility
    user, 
    loading,
    palette, 
    token, 
    setPalette, 
    signIn, 
    register, 
    login, 
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    resetCredentials, 
    signOut 
  }), [isAuthed, user, loading, palette, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within AuthProvider"); return ctx; }
