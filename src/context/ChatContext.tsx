import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PERSIST_ENABLED, KEYS } from "../config";
import { loadJSON, saveJSON } from "../utils/persist";
import * as chatAPI from "../lib/chatAPI";
import { useAuth } from "./AuthContext";
import { useRuntimeConfig } from "./RuntimeConfigContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReactionType = "like" | "heart" | "clap" | "star";

export type Message = {
  id: string;
  _id?: string;
  chatId: string;
  author: string; // "me" or a name
  author_id?: string;
  author_name?: string;
  type: "text" | "voice";
  text?: string;
  durationSec?: number; // for voice mock
  durationMs?: number;
  duration_ms?: number;
  ts: number;
  created_at?: string;
  server_timestamp?: string;
  reactions?: Record<ReactionType, number>;
  status?: "sending" | "sent" | "delivered" | "read"; // WhatsApp-like status
  read_by?: string[]; // Array of user IDs who read the message
  voiceUrl?: string;
  voice_url?: string;
};

export type Chat = {
  id: string;
  _id?: string;
  title: string;
  members: string[]; // names or IDs
  unread?: number;
  inviteCode: string;
  invite_code?: string;
};

function uid() { return Math.random().toString(36).slice(2); }
function makeCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

type ChatContextType = {
  chats: Chat[];
  messagesByChat: Record<string, Message[]>;
  sendText: (chatId: string, text: string) => Promise<void>;
  sendVoiceMock: (chatId: string, durationSec?: number) => void;
  sendVoice: (chatId: string, audioUri: string, duration: number) => Promise<void>;
  markRead: (chatId: string) => void;
  createGroup: (title: string, members?: string[]) => Promise<string>; // returns chatId
  openDirectChat: (friendId: string) => Promise<string>; // returns chatId
  joinByCode: (code: string) => Promise<string | null>; // returns chatId
  reactMessage: (chatId: string, messageId: string, type: ReactionType) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  console.log("🔥 CHAT PROVIDER STARTING!");
  
  const { token, isAuthenticated } = useAuth();
  const { mode, webSocket } = useRuntimeConfig();
  
  console.log("🔥 CHAT PROVIDER STATE:", { 
    hasToken: !!token, 
    isAuthenticated, 
    mode, 
    hasWebSocket: !!webSocket 
  });
  
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Throttling state for message sending
  const lastSendTime = useRef<number>(0);
  const sendThrottleMs = 1000; // 1 second between messages
  
  // Local fallback data
  const [localChats, setLocalChats] = useState<Chat[]>([
    { id: "adhd_support", title: "ADHD Support Group", members: ["You", "Ava", "Mia", "Noah"], unread: 1, inviteCode: makeCode() },
    { id: "focus_club", title: "Deep Focus Club", members: ["You", "Zoe", "Liam"], unread: 0, inviteCode: makeCode() },
  ]);
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>({
    adhd_support: [
      { id: uid(), chatId: "adhd_support", author: "Ava", type: "text", text: "Welcome! Share what's working for you today.", ts: Date.now() - 3600000, reactions: { like: 1, heart: 0, clap: 0, star: 0 } },
      { id: uid(), chatId: "adhd_support", author: "me", type: "text", text: "Pomodoro + short walks are helping.", ts: Date.now() - 1800000, reactions: { like: 0, heart: 1, clap: 0, star: 0 } },
    ],
    focus_club: [
      { id: uid(), chatId: "focus_club", author: "Zoe", type: "text", text: "Morning focus room starting in 10m.", ts: Date.now() - 7200000, reactions: { like: 0, heart: 0, clap: 0, star: 1 } },
    ],
  });

  // Backend data
  const [backendChats, setBackendChats] = useState<Chat[]>([]);
  const [backendMessages, setBackendMessages] = useState<Record<string, Message[]>>({});

  // Use local or backend data based on mode (no merging to avoid duplicates)
  const chats = mode === "sync" ? backendChats : localChats;
  const messagesByChat = mode === "sync" ? backendMessages : localMessages;
  
  console.log("🔍 CHAT CONTEXT RENDER:", {
    mode,
    isAuthenticated, 
    syncEnabled: mode === "sync",
    totalChats: chats.length,
    backendChatsCount: backendChats.length,
    localChatsCount: localChats.length,
    usingBackend: mode === "sync" ? true : false
  });

  // Persistent storage keys
  const CHATS_STORAGE_KEY = '@adhd_chats';
  const MESSAGES_STORAGE_KEY = '@adhd_messages';
  
  // Load chats and messages from storage
  const loadFromStorage = async () => {
    try {
      const [storedChats, storedMessages] = await Promise.all([
        AsyncStorage.getItem(CHATS_STORAGE_KEY),
        AsyncStorage.getItem(MESSAGES_STORAGE_KEY)
      ]);
      
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        setLocalChats(parsedChats);
        console.log('📱 Loaded chats from storage:', parsedChats.length);
      }
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setLocalMessages(parsedMessages);
        console.log('📱 Loaded messages from storage:', Object.keys(parsedMessages).length, 'chats');
      }
    } catch (error) {
      console.error('❌ Failed to load from storage:', error);
    }
  };
  
  // Save chats and messages to storage
  const saveToStorage = async (chatsToSave: Chat[], messagesToSave: Record<string, Message[]>) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chatsToSave)),
        AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesToSave))
      ]);
      console.log('💾 Saved to storage - chats:', chatsToSave.length, 'messages:', Object.keys(messagesToSave).length);
    } catch (error) {
      console.error('❌ Failed to save to storage:', error);
    }
  };

  // Load persisted data on mount
  useEffect(() => {
    const initializeData = async () => {
      if (!PERSIST_ENABLED) { 
        setHydrated(true); 
        return; 
      }
      
      console.log("🔄 Loading chats/messages on mount...");
      
      // Load from AsyncStorage first (WhatsApp-like persistence)
      await loadFromStorage();
      
      // Then load from file system if available
      try {
        const c = await loadJSON<Chat[] | null>(KEYS.chats, null);
        const m = await loadJSON<Record<string, Message[]> | null>(KEYS.messages, null);
        
        if (c && Array.isArray(c) && c.length > 0) {
          setLocalChats(c);
          console.log("📁 Loaded legacy chats from file:", c.length);
        }
        
        if (m && typeof m === 'object' && Object.keys(m).length > 0) {
          setLocalMessages(m);
          console.log("📁 Loaded legacy messages from file:", Object.keys(m).length, "chats");
        }
      } catch (error) {
        console.error("❌ Failed to load legacy chat data:", error);
      }
      
      setHydrated(true);
    };
    
    initializeData();
  }, []);
  
  // Auto-save to storage when data changes (WhatsApp-like behavior)
  useEffect(() => {
    if (hydrated && (localChats.length > 0 || Object.keys(localMessages).length > 0)) {
      saveToStorage(localChats, localMessages);
    }
  }, [localChats, localMessages, hydrated]);

  // Auto-save backend data to storage for offline access
  useEffect(() => {
    if (hydrated && (backendChats.length > 0 || Object.keys(backendMessages).length > 0)) {
      console.log('💾 Auto-saving backend data to storage...');
      saveToStorage(backendChats, backendMessages);
    }
  }, [backendChats, backendMessages, hydrated]);

  // Persist local data changes
  useEffect(() => {
    if (!PERSIST_ENABLED || !hydrated) return;
    saveJSON(KEYS.chats, localChats);
  }, [localChats, hydrated]);

  useEffect(() => {
    if (!PERSIST_ENABLED || !hydrated) return;
    saveJSON(KEYS.messages, localMessages);
  }, [localMessages, hydrated]);

  // Persist backend data changes
  useEffect(() => {
    if (!PERSIST_ENABLED || !hydrated) return;
    saveJSON(KEYS.chats, backendChats);
  }, [backendChats, hydrated]);

  useEffect(() => {
    if (!PERSIST_ENABLED || !hydrated) return;
    saveJSON(KEYS.messages, backendMessages);
  }, [backendMessages, hydrated]);

  // Convert backend chat data to frontend format
  const convertBackendChat = useCallback((backendChat: any): Chat => ({
    id: backendChat._id,
    _id: backendChat._id,
    title: backendChat.title,
    members: backendChat.members || [],
    inviteCode: backendChat.invite_code,
    invite_code: backendChat.invite_code,
    unread: 0 // TODO: Calculate from unread messages
  }), []);

  // Convert backend message data to frontend format
  const convertBackendMessage = useCallback((backendMsg: any): Message => {
    console.log("🔄 convertBackendMessage called with:", backendMsg);
    
    if (!backendMsg) {
      console.error("❌ convertBackendMessage: backendMsg is null or undefined");
      throw new Error("Cannot convert null or undefined message");
    }
    
    // Validate required fields
    if (!backendMsg._id) {
      console.error("❌ convertBackendMessage: Missing _id field:", backendMsg);
      throw new Error("Message missing required _id field");
    }
    
    if (!backendMsg.chat_id) {
      console.error("❌ convertBackendMessage: Missing chat_id field:", backendMsg);
      throw new Error("Message missing required chat_id field");
    }
    
    // Safely parse timestamp
    let timestamp = Date.now(); // fallback to current time
    if (backendMsg.created_at) {
      try {
        timestamp = new Date(backendMsg.created_at).getTime();
        if (isNaN(timestamp)) {
          console.warn("⚠️ convertBackendMessage: Invalid created_at, using current time:", backendMsg.created_at);
          timestamp = Date.now();
        }
      } catch (error) {
        console.warn("⚠️ convertBackendMessage: Error parsing created_at, using current time:", error);
        timestamp = Date.now();
      }
    }
    
    const voiceUrl = backendMsg.voice_url || backendMsg.voiceUrl || backendMsg.voiceURL;
    const durationMs = typeof backendMsg.duration_ms === "number"
      ? backendMsg.duration_ms
      : typeof backendMsg.durationMs === "number"
        ? backendMsg.durationMs
        : typeof backendMsg.duration_sec === "number"
          ? Math.round(backendMsg.duration_sec * 1000)
          : undefined;

    const convertedMessage: Message = {
      id: backendMsg._id,
      _id: backendMsg._id,
      chatId: backendMsg.chat_id,
      author: backendMsg.author_id === token ? "me" : (backendMsg.author_name || "Unknown"),
      author_id: backendMsg.author_id || "unknown",
      author_name: backendMsg.author_name || "Unknown User",
      type: backendMsg.type || "text",
      text: backendMsg.text || backendMsg.content || "",
      ts: timestamp,
      created_at: backendMsg.created_at || new Date().toISOString(),
      reactions: backendMsg.reactions || { like: 0, heart: 0, clap: 0, star: 0 }
    };

    if (voiceUrl) {
      convertedMessage.voiceUrl = voiceUrl;
      convertedMessage.voice_url = voiceUrl;
    }

    if (typeof durationMs === "number") {
      convertedMessage.durationMs = durationMs;
      convertedMessage.duration_ms = durationMs;
      convertedMessage.durationSec = durationMs / 1000;
    }
    
    console.log("✅ convertBackendMessage result:", convertedMessage);
    return convertedMessage;
  }, [token]);

  // Fetch chats from backend
  const fetchChats = useCallback(async () => {
    if (mode !== "sync" || !isAuthenticated) {
      console.log("📱 Chat: Not in sync mode or not authenticated, skipping fetch");
      return;
    }
    
    try {
      console.log("📡 Chat: Starting to fetch chats from backend...");
      setIsLoading(true);
      setError(null);
      
      const backendChatsData = await chatAPI.listChats();
      console.log("📥 Chat: Received backend data:", backendChatsData);
      
      const convertedChats = backendChatsData.map(convertBackendChat);
      setBackendChats(convertedChats);
      
      console.log("✅ Chat: Fetched", convertedChats.length, "chats from backend");
      
    } catch (error: any) {
      console.error("❌ Chat: Failed to fetch chats:", error);
      
      // Handle specific error cases
      if (error?.response?.status === 401) {
        setError("Authentication required. Please sign in in Profile → Sync Mode.");
      } else if (error?.response?.status === 403) {
        setError("Access denied. Please check your permissions.");
      } else if (error?.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (error?.message === "Authentication required") {
        setError("Please sign in to access chats. Go to Profile → Sync Mode.");
      } else {
        setError(`Failed to load chats: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mode, isAuthenticated, convertBackendChat]);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async (chatId: string) => {
    if (mode !== "sync" || !isAuthenticated) {
      console.log("📱 Chat: Not in sync mode or not authenticated, skipping message fetch for", chatId);
      return;
    }

    try {
      console.log("📡 Chat: Fetching messages for chat:", chatId);
      const backendMessagesData = await chatAPI.getMessages(chatId);
      console.log("📥 Chat: Received messages data:", backendMessagesData);
      
      const convertedMessages = backendMessagesData.map(convertBackendMessage);
      
      setBackendMessages(prev => ({
        ...prev,
        [chatId]: convertedMessages
      }));
      
      console.log("✅ Chat: Fetched", convertedMessages.length, "messages for chat", chatId);
      
    } catch (error: any) {
      console.error(`❌ Chat: Failed to fetch messages for chat ${chatId}:`, error);
      
      // Handle specific error cases for messages
      if (error?.response?.status === 401) {
        console.warn("🔐 Chat: Authentication required for messages");
        setError("Please sign in to access messages. Go to Profile → Sync Mode.");
      } else if (error?.response?.status === 403) {
        console.warn("🚫 Chat: Access denied for messages");
        setError("You don't have permission to access this chat.");
      } else if (error?.response?.status === 404) {
        console.warn("❓ Chat: Chat not found");
        setError("This chat may have been deleted or you don't have access to it.");
      } else {
        console.warn("⚠️ Chat: Unknown error fetching messages:", error?.message);
        setError(`Failed to load messages: ${error?.message || 'Unknown error'}`);
      }
    }
  }, [mode, isAuthenticated, convertBackendMessage]);

  // Refresh all data
  const refresh = useCallback(async () => {
    console.log("🔄 ChatContext: Starting refresh...");
    await fetchChats(); // useEffect will handle fetching messages
  }, [fetchChats]);

  // Auto-fetch on mode/auth change
  useEffect(() => {
    console.log("🔄 ChatContext: Mode/auth change detected", { mode, isAuthenticated, hasToken: !!token });
    
    if (mode === "sync" && isAuthenticated && token) {
      console.log("📡 ChatContext: Starting sync mode operations...");
      // Call fetchChats directly to avoid dependency loop
      fetchChats();
    } else {
      console.log("📱 ChatContext: Staying in local mode", { mode, isAuthenticated, hasToken: !!token });
      // Clear any existing backend data in local mode
      setBackendChats([]);
      setBackendMessages({});
      setIsLoading(false);
      setError(null);
    }
  }, [mode, isAuthenticated, token]); // Removed refresh dependency

  // Fetch messages when backendChats change
  useEffect(() => {
    console.log("🔍 ChatContext: useEffect triggered", { 
      backendChatsLength: backendChats.length, 
      mode, 
      isAuthenticated 
    });
    
    if (backendChats.length > 0 && mode === "sync" && isAuthenticated) {
      console.log("📥 ChatContext: Fetching messages for all chats...");
      const fetchAllMessages = async () => {
        for (const chat of backendChats) {
          console.log(`📥 Fetching messages for chat: ${chat.title} (${chat.id})`);
          await fetchMessages(chat.id);
        }
      };
      fetchAllMessages();
    } else {
      console.log("❌ ChatContext: Not fetching messages", { 
        reason: backendChats.length === 0 ? "No chats" : 
                mode !== "sync" ? "Not sync mode" : 
                !isAuthenticated ? "Not authenticated" : "Unknown"
      });
    }
  }, [backendChats, mode, isAuthenticated, fetchMessages]);

  // WebSocket message handling
  useEffect(() => {
    if (!webSocket || mode !== "sync") return;

    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔥 CHAT WEBSOCKET MESSAGE RECEIVED:", data);
        
        if (data.type === "chat:new_message") {
          console.log("📨 PROCESSING WhatsApp-style chat:new_message EVENT:", {
            messageId: data.message?.id || data.message?._id,
            chatId: data.chat_id,
            authorId: data.message?.author_id,
            text: data.message?.text,
            status: data.message?.status,
            fullPayload: data
          });
          
          // Validate WebSocket message (WhatsApp-style validation)
          if (!data.message) {
            console.error("❌ WebSocket message missing message payload:", data);
            return;
          }
          
          if (!data.message.id && !data.message._id) {
            console.error("❌ WebSocket message missing ID fields:", data.message);
            return;
          }
          
          // Use backend normalized message directly (no conversion needed)
          const normalizedMessage = {
            ...data.message,
            id: data.message.id || data.message._id,
            _id: data.message._id || data.message.id
          };
          
          console.log("💬 WhatsApp-style message received:", {
            id: normalizedMessage.id,
            chatId: normalizedMessage.chat_id,
            text: normalizedMessage.text,
            author: normalizedMessage.author_name,
            status: normalizedMessage.status
          });
          
          // Additional ID validation after normalization
          if (!normalizedMessage.id) {
            console.error("❌ Normalized message still missing ID:", normalizedMessage);
            normalizedMessage.id = Math.random().toString(36).slice(2); // Emergency fallback ID
            console.warn("⚠️ Assigned emergency ID to WebSocket message:", normalizedMessage.id);
          }
          
          setBackendMessages(prev => {
            const chatId = normalizedMessage.chat_id;
            const currentMessages = prev[chatId] || [];
            console.log("📝 Current messages for chat before WebSocket update:", chatId, currentMessages.length);
            
            // Check for duplicates using multiple ID fields (WhatsApp-style)
            const isDuplicate = currentMessages.some(msg => 
              (msg.id && normalizedMessage.id && msg.id === normalizedMessage.id) ||
              (msg._id && normalizedMessage._id && msg._id === normalizedMessage._id) ||
              (msg.id && normalizedMessage._id && msg.id === normalizedMessage._id) ||
              (msg._id && normalizedMessage.id && msg._id === normalizedMessage.id)
            );
            
            if (isDuplicate) {
              console.log("⚠️ Duplicate WebSocket message detected, skipping:", normalizedMessage.id);
              return prev;
            }
            
            // Convert to frontend Message format
            const frontendMessage: Message = {
              id: normalizedMessage.id,
              _id: normalizedMessage._id,
              chatId: normalizedMessage.chat_id,
              author: normalizedMessage.author_id === token ? "me" : (normalizedMessage.author_name || "Unknown"),
              author_id: normalizedMessage.author_id || "unknown",
              author_name: normalizedMessage.author_name || "Unknown User",
              type: normalizedMessage.type || "text",
              text: normalizedMessage.text || "",
              ts: new Date(normalizedMessage.created_at || Date.now()).getTime(),
              created_at: normalizedMessage.created_at || new Date().toISOString(),
              status: normalizedMessage.status || "sent",
              reactions: normalizedMessage.reactions || { like: 0, heart: 0, clap: 0, star: 0 }
            };

            if (frontendMessage.type === "voice") {
              const wsVoiceUrl = normalizedMessage.voice_url || normalizedMessage.voiceUrl;
              if (wsVoiceUrl) {
                frontendMessage.voiceUrl = wsVoiceUrl;
                frontendMessage.voice_url = wsVoiceUrl;
              }

              const wsDurationMs = typeof normalizedMessage.duration_ms === "number"
                ? normalizedMessage.duration_ms
                : typeof normalizedMessage.durationMs === "number"
                  ? normalizedMessage.durationMs
                  : undefined;

              if (typeof wsDurationMs === "number") {
                frontendMessage.durationMs = wsDurationMs;
                frontendMessage.duration_ms = wsDurationMs;
                frontendMessage.durationSec = wsDurationMs / 1000;
              }
            }
            
            const updatedMessages = [...currentMessages, frontendMessage];
            console.log("📝 WhatsApp-style WebSocket message added to chat", chatId, ":", updatedMessages.length, "total messages");
            console.log("📝 All messages in chat:", updatedMessages.map(m => ({
              id: m.id, 
              text: m.text?.slice(0, 30) + "...", 
              author: m.author,
              status: m.status
            })));
            
            const newState = {
              ...prev,
              [chatId]: updatedMessages
            };
            
            // Auto-save WebSocket messages to storage for persistence
            if (hydrated) {
              console.log('💾 Auto-saving WebSocket message to storage...');
              saveToStorage(backendChats, newState);
            }
            
            return newState;
          });
          
          console.log("✅ WhatsApp-style WebSocket message processed and added to chat:", normalizedMessage.chat_id);
        } else {
          console.log("🔍 Non-chat WebSocket message received:", {
            type: data.type,
            data: data
          });
        }
        
        if (data.type === "chat:message_reaction") {
          console.log("👍 Processing message reaction:", data);
          setBackendMessages(prev => ({
            ...prev,
            [data.chat_id]: (prev[data.chat_id] || []).map(msg => 
              msg.id === data.message_id 
                ? { ...msg, reactions: data.updated_reactions || msg.reactions }
                : msg
            )
          }));
          
          // Also update local messages if in local mode or fallback
          setLocalMessages(prev => ({
            ...prev,
            [data.chat_id]: (prev[data.chat_id] || []).map(msg => 
              msg.id === data.message_id 
                ? { ...msg, reactions: data.updated_reactions || msg.reactions }
                : msg
            )
          }));
        }
        
      } catch (error) {
        console.error("❌ Chat: WebSocket message parsing error:", error);
      }
    };

    console.log("🔌 Setting up WebSocket message listener for chat messages");
    webSocket.addEventListener('message', handleWebSocketMessage);
    
    return () => {
      console.log("🔌 Cleaning up WebSocket message listener");
      webSocket.removeEventListener('message', handleWebSocketMessage);
    };
  }, [webSocket, mode, convertBackendMessage, backendMessages]);

  const value = useMemo<ChatContextType>(() => ({
    chats,
    messagesByChat,
    isLoading,
    error,
    refresh,
    
    sendText: async (chatId: string, text: string) => {
      console.log("🚀 SEND TEXT CALLED (WhatsApp-style):", { chatId, text, mode, isAuthenticated });
      
      // Throttling check to prevent rate limit errors
      const currentTime = Date.now();
      const timeSinceLastSend = currentTime - lastSendTime.current;
      
      if (timeSinceLastSend < sendThrottleMs) {
        const waitTime = sendThrottleMs - timeSinceLastSend;
        console.warn(`⏱️ Message throttled. Please wait ${waitTime}ms before sending another message.`);
        throw new Error(`Please wait ${Math.ceil(waitTime / 1000)} seconds before sending another message.`);
      }
      
      // Input validation
      if (!chatId || !text.trim()) {
        console.error("❌ Invalid parameters for sendText:", { chatId, text });
        throw new Error("Chat ID and message text are required");
      }
      
      // Update last send time
      lastSendTime.current = currentTime;
      
      const trimmedText = text.trim();
      
      if (mode === "sync" && token) {
        try {
          console.log("📤 Sending message to WhatsApp-style backend API...");
          
          // Call backend - expect normalized response
          const normalizedMessage = await chatAPI.sendMessage(chatId, trimmedText, "text");
          console.log("✅ Backend normalized response received:", normalizedMessage);
          
          // Validate backend response (WhatsApp-style validation)
          if (!normalizedMessage || typeof normalizedMessage !== 'object') {
            console.error("❌ Invalid backend response:", normalizedMessage);
            throw new Error("Invalid response from backend");
          }
          
          if (!normalizedMessage.id && !normalizedMessage._id) {
            console.error("❌ Backend response missing ID:", normalizedMessage);
            throw new Error("Backend response missing message ID");
          }
          
          // Ensure message has consistent ID structure
          const messageWithId = {
            ...normalizedMessage,
            id: normalizedMessage.id || normalizedMessage._id,
            _id: normalizedMessage._id || normalizedMessage.id
          };
          
          console.log("🔄 Message processed with consistent IDs:", {
            id: messageWithId.id,
            _id: messageWithId._id,
            text: messageWithId.text,
            status: messageWithId.status
          });
          
          // Add to local state immediately (WhatsApp-style optimistic update)
          setBackendMessages(prev => {
            if (!prev || typeof prev !== 'object') {
              console.warn("⚠️ Invalid previous messages state, initializing...");
              prev = {};
            }
            
            const currentMessages = prev[chatId] || [];
            
            // Check for duplicates using both ID fields
            const isDuplicate = currentMessages.some(msg => 
              msg.id === messageWithId.id || 
              msg._id === messageWithId._id ||
              (msg.id && messageWithId.id && msg.id === messageWithId.id)
            );
            
            if (isDuplicate) {
              console.log("⚠️ Duplicate message detected, skipping:", messageWithId.id);
              return prev;
            }
            
            const updatedMessages = [...currentMessages, messageWithId];
            console.log("📝 WhatsApp-style message added. Chat:", chatId, "Count:", updatedMessages.length);
            
            return {
              ...prev,
              [chatId]: updatedMessages
            };
          });
          
          console.log("✅ WhatsApp-style message sent and processed:", trimmedText);
          
        } catch (error) {
          console.error("❌ Failed to send WhatsApp-style message:", error);
          console.error("❌ Error details:", {
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            chatId,
            text: trimmedText,
            mode,
            isAuthenticated
          });
          throw new Error(`Failed to send message: ${error?.message || 'Unknown error'}`);
        }
      } else {
        console.log("📱 Local mode - creating WhatsApp-style local message");
        try {
          // Local mode - create message with WhatsApp-style structure
          const localMessage: Message = { 
            id: uid(), 
            _id: uid(), // Backup ID for compatibility
            chatId, 
            author: "me", 
            type: "text", 
            text: trimmedText, 
            ts: Date.now(), 
            status: "sent", // WhatsApp-style status
            reactions: { like: 0, heart: 0, clap: 0, star: 0 },
            created_at: new Date().toISOString(),
            server_timestamp: new Date().toISOString()
          };
          
          setLocalMessages(prev => {
            if (!prev || typeof prev !== 'object') {
              console.warn("⚠️ Invalid previous local messages state, initializing...");
              prev = {};
            }
            
            const currentMessages = prev[chatId] || [];
            const updatedMessages = [...currentMessages, localMessage];
            
            console.log("📝 WhatsApp-style local message added:", {
              id: localMessage.id,
              text: localMessage.text,
              status: localMessage.status
            });
            
            return { 
              ...prev, 
              [chatId]: updatedMessages 
            };
          });
          
          console.log("✅ WhatsApp-style local message added successfully");
        } catch (error) {
          console.error("❌ Failed to add WhatsApp-style local message:", error);
          throw new Error(`Failed to add local message: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    
    sendVoiceMock: (chatId: string, durationSec = 3) => {
      const msg: Message = {
        id: uid(),
        chatId,
        author: "me",
        type: "voice",
        durationSec,
        durationMs: durationSec * 1000,
        duration_ms: durationSec * 1000,
        ts: Date.now(),
        reactions: { like: 0, heart: 0, clap: 0, star: 0 }
      };
      
      if (mode === "sync") {
        setBackendMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), msg] }));
      } else {
        setLocalMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), msg] }));
      }
    },

    sendVoice: async (chatId: string, audioUri: string, duration: number) => {
      if (mode === "sync" && token) {
        try {
          console.log("🎙️ Sending voice message:", { chatId, duration });
          
          // Read the audio file and convert to base64
          const response = await fetch(audioUri);
          const audioBlob = await response.blob();
          
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix (data:audio/m4a;base64,)
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(audioBlob);
          
          const audioBase64 = await base64Promise;
          
          const voiceMessageData = {
            chat_id: chatId,
            audio_data: audioBase64,
            duration_ms: Math.round(duration * 1000),
            filename: 'recording.m4a'
          };

          const normalizedMessage = await chatAPI.sendVoiceMessage(chatId, voiceMessageData);
          console.log("✅ Voice message sent:", normalizedMessage);

          const convertedMessage = convertBackendMessage(normalizedMessage);

          setBackendMessages(prev => {
            const currentMessages = prev[chatId] || [];

            const alreadyExists = currentMessages.some(msg =>
              (msg.id && convertedMessage.id && msg.id === convertedMessage.id) ||
              (msg._id && convertedMessage._id && msg._id === convertedMessage._id)
            );

            if (alreadyExists) {
              console.log("⚠️ Voice message already exists in state, skipping add");
              return prev;
            }

            return {
              ...prev,
              [chatId]: [...currentMessages, convertedMessage]
            };
          });

        } catch (error) {
          console.error("❌ Failed to send voice message:", error);
          throw error;
        }
      } else {
        // Local mode - just add mock voice message
        const msg: Message = {
          id: uid(),
          chatId,
          author: "me",
          type: "voice",
          durationSec: duration,
          durationMs: duration * 1000,
          duration_ms: duration * 1000,
          voiceUrl: audioUri,
          voice_url: audioUri,
          ts: Date.now(),
          reactions: { like: 0, heart: 0, clap: 0, star: 0 }
        };
        
        setLocalMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), msg] }));
      }
    },
    
    markRead: (chatId: string) => {
      if (mode === "sync") {
        setBackendChats(prev => prev.map(c => (c.id === chatId ? { ...c, unread: 0 } : c)));
      } else {
        setLocalChats(prev => prev.map(c => (c.id === chatId ? { ...c, unread: 0 } : c)));
      }
    },
    
    createGroup: async (title: string, members: string[] = []) => {
      if (mode === "sync" && token) {
        try {
          console.log("📡 Creating group chat:", title);
          const newChat = await chatAPI.createGroupChat(title);
          console.log("✅ Backend returned chat:", newChat);
          
          const convertedChat = convertBackendChat(newChat);
          console.log("🔄 Converted chat:", convertedChat);
          
          setBackendChats(prev => [convertedChat, ...prev]);
          setBackendMessages(prev => ({ ...prev, [convertedChat.id]: [] }));
          
          console.log("✅ Chat: Created new GROUP chat:", title, "ID:", convertedChat.id);
          return convertedChat.id;
        } catch (error) {
          console.error("❌ Chat: Failed to create group chat:", error);
          throw error;
        }
      } else {
        // Local mode
        const id = uid();
        const code = makeCode();
        const newChat = { id, title, members: ["You", ...members], unread: 0, inviteCode: code };
        
        setLocalChats(prev => [newChat, ...prev]);
        setLocalMessages(prev => ({ ...prev, [id]: [] }));
        
        return id;
      }
    },

    // NEW: Open direct chat with friend
    openDirectChat: async (friendId: string) => {
      console.log("💬 openDirectChat called with friendId:", friendId);
      
      if (mode === "sync" && token) {
        try {
          console.log("📡 Making API call to open direct chat...");
          const chat = await chatAPI.openDirectChat(friendId);
          console.log("✅ Backend returned chat:", chat);
          
          const convertedChat = convertBackendChat(chat);
          console.log("🔄 Converted chat:", convertedChat);
          
          // Add or update chat in list
          setBackendChats(prev => {
            const existing = prev.find(c => c.id === convertedChat.id);
            if (existing) {
              console.log("📝 Chat already exists, keeping existing");
              return prev; // Already exists
            }
            console.log("➕ Adding new chat to list");
            return [convertedChat, ...prev];
          });
          
          // Initialize empty messages for this chat
          setBackendMessages(prev => ({
            ...prev,
            [convertedChat.id]: []
          }));
          
          // Fetch messages for the chat
          console.log("📥 Fetching messages for chat...");
          await fetchMessages(convertedChat.id);
          
          console.log("✅ Chat: Opened direct chat successfully:", convertedChat.id);
          return convertedChat.id;
        } catch (error) {
          console.error("❌ Chat: Backend failed, falling back to local mode:", error);
          // FALLBACK TO LOCAL MODE
        }
      }
      
      // Local mode or fallback
      console.log("📱 Local mode - creating local direct chat");
      const id = `direct_${friendId}`;
      const newChat = { id, title: "Direct Chat", members: ["You", "Friend"], unread: 0, inviteCode: "" };
      
      setLocalChats(prev => {
        const existing = prev.find(c => c.id === id);
        if (existing) {
          console.log("📝 Local chat already exists");
          return prev;
        }
        console.log("➕ Adding new local chat");
        return [newChat, ...prev];
      });
      setLocalMessages(prev => ({ ...prev, [id]: [] }));
      
      console.log("✅ Local chat created:", id);
      return id;
    },
    
    joinByCode: async (code: string) => {
      if (mode === "sync" && token) {
        try {
          console.log("🔑 Attempting to join GROUP chat with code:", code);
          const joinedChat = await chatAPI.joinGroupChat(code);
          const convertedChat = convertBackendChat(joinedChat);
          
          // Update or add chat to list
          setBackendChats(prev => {
            const existing = prev.find(c => c.id === convertedChat.id);
            if (existing) {
              return prev.map(c => c.id === convertedChat.id ? convertedChat : c);
            }
            return [convertedChat, ...prev];
          });
          
          // Fetch messages for the joined chat
          await fetchMessages(convertedChat.id);
          
          console.log("✅ Chat: Successfully joined GROUP chat:", convertedChat.title, "ID:", convertedChat.id);
          return convertedChat.id;
        } catch (error: any) {
          console.error("❌ Chat: Failed to join GROUP chat with code:", code, "Error:", error);
          
          // Handle specific error types
          if (error.response?.status === 404) {
            console.log("❌ Invalid invite code");
            return null; // Invalid code
          } else if (error.response?.status === 403) {
            throw new Error("Bu grup chat'e katılma yetkiniz yok.");
          } else if (error.response?.status === 401) {
            throw new Error("Giriş yapmalısınız. Profile → Sync Mode'u açın.");
          } else {
            // Network or server error
            throw new Error(error.response?.data?.detail || error.message || "Bağlantı hatası. Tekrar deneyin.");
          }
        }
      } else {
        // Local mode
        const found = localChats.find(c => c.inviteCode.toUpperCase() === code.toUpperCase());
        if (!found) return null;
        if (!found.members.includes("You")) {
          setLocalChats(prev => prev.map(c => (c.id === found.id ? { ...c, members: [...c.members, "You"] } : c)));
        }
        return found.id;
      }
    },
    
    reactMessage: async (chatId: string, messageId: string, type: ReactionType) => {
      if (mode === "sync" && token) {
        try {
          await chatAPI.reactToMessage(chatId, messageId, type);
          console.log("✅ Chat: Added reaction:", type);
        } catch (error) {
          console.error("❌ Chat: Failed to react to message:", error);
        }
      } else {
        // Local mode
        setLocalMessages(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || []).map(m => 
            m.id === messageId 
              ? { ...m, reactions: { ...(m.reactions || {}), [type]: ((m.reactions?.[type] || 0) + 1) as number } }
              : m
          ),
        }));
      }
    },
  }), [
    chats, 
    backendMessages,
    localMessages,
    mode, 
    isAuthenticated, 
    token, 
    isLoading, 
    error, 
    convertBackendChat, 
    convertBackendMessage, 
    fetchMessages, 
    refresh
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}