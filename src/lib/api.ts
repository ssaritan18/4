import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
function trimSlash(url: string) {
  return url.trim().replace(/\/+$/, "");
}
function resolveBaseUrl() {
  const fromEnv = (process.env.EXPO_PUBLIC_BACKEND_URL as string)
               || (process.env.EXPO_PUBLIC_API_URL as string)
               || (Constants.expoConfig?.extra as any)?.backendUrl;
  if (fromEnv) return trimSlash(fromEnv);
  if (__DEV__) {
    const local = Platform.OS === "android"
      ? "http://10.0.2.2:8000"
      : "http://localhost:8000";
    return local;
  }
  const message = "API base URL is not configured."
    + " Set EXPO_PUBLIC_BACKEND_URL or EXPO_PUBLIC_API_URL.";
  console.error(message);
  throw new Error(message);
}

const BACKEND_BASE_URL = resolveBaseUrl();
export function getBackendBaseUrl() {
  return BACKEND_BASE_URL;
}

export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;
console.log("🔗 API Base URL:", API_BASE_URL);
// 3) axios instance
export const api = axios.create({
  baseURL: BACKEND_BASE_URL, 
  timeout: 30000,
  headers: { 
    "Content-Type": "application/json"
  },
});
// 4) setAuthToken fonksiyonu — AuthContext’in burayı çağırıyor
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("🔑 setAuthToken: token set");
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("🔑 setAuthToken: token cleared");
  }
}
