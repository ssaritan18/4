import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { KEYS } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function makeBackup(): Promise<string> {
  const payload: Record<string, any> = {};
  for (const key of Object.values(KEYS)) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) payload[key] = JSON.parse(raw);
  }
  const json = JSON.stringify(payload, null, 2);
  const uri = `${FileSystem.cacheDirectory}adhders-backup.json`;
  await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Share ADHDers Backup" });
  }
  return uri;
}

export async function restoreBackup(): Promise<boolean> {
  const res = await DocumentPicker.getDocumentAsync({ type: "application/json" });
  if (res.canceled || !res.assets?.[0]?.uri) return false;
  const content = await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
  const data = JSON.parse(content);
  if (!data || typeof data !== "object") return false;
  const entries = Object.entries(data) as [string, any][];
  for (const [key, value] of entries) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }
  return true;
}

export async function resetAll(): Promise<void> {
  const keys = Object.values(KEYS);
  await AsyncStorage.multiRemove(keys);
}