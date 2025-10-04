import React, { createContext, useState, useContext, useEffect } from "react";
import { getStoredToken, setStoredToken, clearStoredToken } from "../utils/tokenHelper";

interface AuthContextType {
  token: string | null;
  setToken: (t: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, _setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredToken();
      console.log('🔐 SimpleAuthContext init token:', stored ? 'Found' : 'Missing');
      if (stored) {
        console.log('✅ Token found on initialization - user should be authenticated');
      }
      return stored;
    }
    return null;
  });

  // Force authentication state sync on mount and token changes
  React.useEffect(() => {
    const currentToken = getStoredToken();
    if (currentToken && currentToken !== token) {
      console.log('🔄 Hydrating token from storage on mount');
      _setToken(currentToken);
    }
  }, []);

  // Listen for auth state changes and check token storage
  React.useEffect(() => {
    const handleAuthStateChange = (event: any) => {
      console.log('🔄 Auth state change detected:', event.detail);
      if (event.detail.isAuthenticated && event.detail.token) {
        _setToken(event.detail.token);
        console.log('✅ Token synchronized from auth event');
      }
    };
    
    const checkToken = () => {
      const stored = getStoredToken();
      if (stored && stored !== token) {
        console.log('🔄 Token updated from robust storage');
        _setToken(stored);
      }
    };
    
    // Listen for custom auth events
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    // Also check storage periodically as fallback
    const interval = setInterval(checkToken, 2000);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
      clearInterval(interval);
    };
  }, [token]);

  const setToken = (t: string | null) => {
    _setToken(t);
    if (t) {
      setStoredToken(t);
      console.log("💾 Token saved with robust storage");
    } else {
      clearStoredToken();
      console.log("🗑️ Token cleared with robust storage");
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, setToken, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);