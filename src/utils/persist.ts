import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    let raw: string | null = null;
    
    if (Platform.OS === 'web') {
      // Use localStorage for web
      raw = localStorage.getItem(key);
    } else {
      // Use AsyncStorage for mobile
      raw = await AsyncStorage.getItem(key);
    }
    
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    
    if (Platform.OS === 'web') {
      // Use localStorage for web
      localStorage.setItem(key, jsonValue);
      console.log(`💾 Saved to localStorage: ${key}`);
    } else {
      // Use AsyncStorage for mobile
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`💾 Saved to AsyncStorage: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Failed to save ${key}:`, error);
  }
}