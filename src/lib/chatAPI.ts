import { api, setAuthToken as setApiAuthToken } from './api';
import { getAuthToken } from '../utils/authTokenHelper';

async function ensureAuth() {
  const token = await getAuthToken();
  if (token) {
    setApiAuthToken(token);
  }
  return token;
}

export async function listChats() {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.get('/api/chats');
  return response.data?.chats || [];
}

export async function getMessages(chatId: string) {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.get(`/api/chats/${chatId}/messages`);
  return response.data?.messages || [];
}

export async function sendMessage(chatId: string, text: string, type: string = 'text') {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.post(`/api/chats/${chatId}/messages`, { text, type });
  return response.data;
}

export async function createGroupChat(title: string) {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.post('/api/chats/group', { title });
  return response.data;
}

export async function openDirectChat(friendId: string) {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.post(`/api/chats/direct/${friendId}`);
  return response.data;
}

export async function joinGroupChat(code: string) {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.post('/api/chats/join', { code });
  return response.data;
}

export async function reactToMessage(chatId: string, messageId: string, reactionType: string) {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.post(`/api/chats/${chatId}/messages/${messageId}/react`, { type: reactionType });
  return response.data;
}


type VoiceMessagePayload = {
  audio_data: string;
  duration_ms: number;
  filename?: string;
  chat_id?: string;
};

export async function sendVoiceMessage(chatId: string, voicePayload: VoiceMessagePayload) {
  const token = await ensureAuth();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await api.post(`/api/chats/${chatId}/voice`, {
    chat_id: chatId,
    ...voicePayload,
  });
  return response.data;
}

export const chatAPI = {
  listChats,
  getMessages,
  sendMessage,
  createGroupChat,
  openDirectChat,
  joinGroupChat,
  reactToMessage,
  sendVoiceMessage,
};
