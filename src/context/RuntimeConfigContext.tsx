import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, getBackendBaseUrl } from "../lib/api";
import { getAuthToken } from "../utils/authTokenHelper";

const KEY_SYNC = "adhders_sync_enabled";
const KEY_WS = "adhders_ws_enabled";

type RuntimeConfig = {
  hydrated: boolean;
  syncEnabled: boolean;
  wsEnabled: boolean;
  webSocket: WebSocket | null;
  mode: "sync" | "local";
  setSyncEnabled: (v: boolean) => Promise<void>;
  setWsEnabled: (v: boolean) => Promise<void>;
};

const Ctx = createContext<RuntimeConfig | undefined>(undefined);

export function RuntimeConfigProvider({ children, token }: { children: React.ReactNode; token?: string }) {
  const backendBaseUrl = getBackendBaseUrl();
  const [hydrated, setHydrated] = useState(false);
  // Force sync/online mode in production, allow local mode only for development/demo
   const isPreviewBackend = backendBaseUrl.includes("preview.emergentagent.com");
  const isProduction = process.env.NODE_ENV === "production" || isPreviewBackend;

  const [syncEnabledState, setSyncEnabledState] = useState<boolean>(true);
  const syncEnabled = true; // Force sync mode for testing
  const [wsEnabled, setWsEnabledState] = useState(true);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    (async () => {
      try {
           if (!isProduction) {
          const rawS = await AsyncStorage.getItem(KEY_SYNC);
          if (rawS != null) setSyncEnabledState(rawS === "true");
        } else {
          setSyncEnabledState(true);
        }
        const rawW = await AsyncStorage.getItem(KEY_WS);
        if (rawW != null) setWsEnabledState(rawW === "true");
      } catch {}
      setHydrated(true);
    })();
  }, [isProduction]);

  // WebSocket management with proper cleanup
  useEffect(() => {
    let isMounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let heartbeatTimer: NodeJS.Timeout | null = null;
    let pollingTimer: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const handleAuthStateChange = async (event: any) => {
      console.log('🔄 WebSocket: Auth state change detected, reconnecting...');
      setTimeout(async () => {
        if (!isMounted) return;
        const newToken = await getAuthToken();
        if (syncEnabled && newToken) {
          connectWebSocket();
        }
      }, 1000);
    };

    const handleTokenRefresh = async (event: any) => {
      console.log('🔄 WebSocket: Token refreshed, reconnecting...');
      setTimeout(async () => {
        if (!isMounted) return;
        const newToken = await getAuthToken();
        if (syncEnabled && newToken) {
          connectWebSocket();
        }
      }, 500);
    };

    const startPollingMode = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
      
      console.log('🔄 Starting polling fallback for preview environment');
      pollingTimer = setInterval(async () => {
        try {
          const token = await getAuthToken();
          
          if (token) {
            const pollingUrl = `${API_BASE_URL}/poll-updates`;
            const response = await fetch(pollingUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('📡 Polling data received - friend requests:', data.updates?.friends?.new_requests || 0);
              
              // Broadcast polling data as WebSocket message for other contexts
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('websocketMessage', {
                  detail: {
                    type: 'pollingUpdate',
                    data: data.updates
                  }
                }));
              }
            }
          }
        } catch (pollingError) {
          // Silently handle polling errors to avoid console spam
          console.log('📡 Polling temporarily unavailable');
        }
      }, 30000); // Poll every 30 seconds to avoid rate limits
    };

    const connectWebSocket = async () => {
      if (!isMounted) return;
      
      const storedToken = await getAuthToken();
      if (!syncEnabled) {
        console.log("🔌 RuntimeConfig: Sync disabled, skipping WebSocket");
        setWebSocket(null);
        setWsEnabled(false);
        return;
      }
      
      if (!storedToken) {
        console.log("🔌 RuntimeConfig: No token available for WebSocket");
        setWebSocket(null);
        setWsEnabled(false);
        return;
      }
      
      try {
        const cleanToken = typeof storedToken === 'string' 
          ? storedToken.replace(/^["']|["']$/g, '').trim()
          : storedToken;
        
        // Ensure token is properly encoded and handle Bearer prefix
        const finalToken = cleanToken.startsWith('Bearer ') 
          ? cleanToken.substring(7).trim()
          : cleanToken;
        const encodedToken = encodeURIComponent(finalToken);
        const wsProtocol = backendBaseUrl.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = backendBaseUrl.replace(/^https?/, wsProtocol);
        const wsUrl = `${wsBaseUrl}/api/ws?token=${encodedToken}`;
        console.log('🔌 RuntimeConfig: Connecting WebSocket:', wsUrl.replace(encodedToken, 'TOKEN_HIDDEN'));
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ RuntimeConfig: WebSocket connected successfully');
          setWebSocket(ws);
          setWsEnabled(true);
          reconnectAttempts = 0;
          
          // Start heartbeat
          heartbeatTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              console.log('💓 RuntimeConfig: Heartbeat sent');
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'pong') {
              console.log('💓 RuntimeConfig: Heartbeat pong received');
              return;
            }
            
            if (data.type === 'connectionEstablished') {
              console.log('✅ RuntimeConfig: WebSocket connection established');
              setWsEnabled(true);
              reconnectAttempts = 0;
            }
            
            console.log('📨 RuntimeConfig: WebSocket message received:', data.type);
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('websocketMessage', {
                detail: data
              }));
            }
            
          } catch (error) {
            console.error('❌ RuntimeConfig: WebSocket message parsing error:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.log('🔌 RuntimeConfig: WebSocket error - switching to polling mode');
          setWsEnabled(false);
          
          // Start polling mode as fallback immediately
          startPollingMode();
        };
        
        ws.onclose = (event) => {
          console.log('🔌 RuntimeConfig: WebSocket closed', event.code, event.reason);
          setWebSocket(null);
          setWsEnabled(false);
          
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
          
          // Don't reconnect if it was a clean close or auth error
          if (event.code === 1000 || event.code === 4401) {
            console.log('🔌 RuntimeConfig: WebSocket closed cleanly or auth error, not reconnecting');
            return;
          }
          
          if (isMounted && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`🔄 RuntimeConfig: Attempting to reconnect in ${delay}ms... (${reconnectAttempts}/${maxReconnectAttempts})`);
            reconnectTimer = setTimeout(() => {
              if (isMounted) connectWebSocket();
            }, delay);
          } else {
            console.log('🔌 RuntimeConfig: Max reconnection attempts reached, switching to polling mode');
            startPollingMode();
          }
        };
        
      } catch (error) {
        console.error('❌ RuntimeConfig: WebSocket connection error:', error);
      }
    };

    // Initialize connection
    const initializeConnection = async () => {
      try {
        const token = await getAuthToken();
        if (syncEnabled && token) {
          console.log('🚀 RuntimeConfig: Initiating WebSocket connection...');
          await connectWebSocket();
        } else {
          console.log('📱 RuntimeConfig: Staying in local mode');
        }
      } catch (error) {
        console.error('❌ Error initializing connection:', error);
      }
    };
    
    initializeConnection();

    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('authStateChanged', handleAuthStateChange);
      window.addEventListener('tokenRefreshed', handleTokenRefresh);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('authStateChanged', handleAuthStateChange);
        window.removeEventListener('tokenRefresh', handleTokenRefresh);
      }
      
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (pollingTimer) clearInterval(pollingTimer);
      
      if (ws) {
        ws.close();
        setWebSocket(null);
        setWsEnabled(false);
      }
    };
  }, [syncEnabled]);

  const setSyncEnabled = async (v: boolean) => {
    const nextValue = isProduction ? true : v;
    setSyncEnabledState(nextValue);
    try { await AsyncStorage.setItem(KEY_SYNC, nextValue ? "true" : "false"); } catch {}
  };
  const setWsEnabled = async (v: boolean) => {
    setWsEnabledState(v);
    try { await AsyncStorage.setItem(KEY_WS, v ? "true" : "false"); } catch {}
  };

  const value = useMemo<RuntimeConfig>(() => ({
    hydrated,
    syncEnabled,
    wsEnabled,
    webSocket,
    mode: syncEnabled ? "sync" : "local",
    setSyncEnabled,
    setWsEnabled,
  }), [hydrated, syncEnabled, wsEnabled, webSocket]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRuntimeConfig() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRuntimeConfig must be used within RuntimeConfigProvider");
  return ctx;
}
