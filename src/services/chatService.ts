import { Alert } from "react-native";
import { router } from "expo-router";
import { api, setAuthToken } from "../lib/api";
import { getAuthToken } from "../utils/authTokenHelper";

type UploadableFile = {
  uri?: string;
  name?: string;
  type?: string;
  size?: number;
  [key: string]: any;
};

const promptLogin = (title: string, message: string) => {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Login", onPress: () => router.push("/(auth)/login") },
  ]);
};

const extractErrorMessage = (error: any, fallback: string) => {
  if (error?.response) {
    const data = error.response.data;
    if (data) {
      if (typeof data === "string") {
        return data;
      }
      return data.detail || data.message || fallback;
    }
    return `Request failed: ${error.response.status}`;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

async function ensureAuthenticated(title: string, message: string): Promise<string | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      promptLogin(title, message);
      return null;
    }

    setAuthToken(token);
    return token;
  } catch (error) {
    console.error("❌ Failed to resolve auth token:", error);
    Alert.alert("Authentication Error", "Unable to verify your session. Please try again.");
    return null;
  }
}

const normalizeFileForUpload = (file: UploadableFile) => {
  if (file && typeof file === "object" && "uri" in file && file.uri) {
    return {
      uri: file.uri,
      name: file.name || `upload_${Date.now()}`,
      type: file.type || "application/octet-stream",
    } as any;
  }

  return file as any;
};

export const uploadImage = async (chatId: string, file: UploadableFile) => {
  const token = await ensureAuthenticated(
    "Authentication Required",
    "Please login to upload media.",
  );

  if (!token) {
    console.error("❌ No auth token available, cannot upload");
    return null;
  }

  if (!file) {
    console.error("❌ No file provided for upload");
    Alert.alert("Upload Error", "No media selected for upload.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", normalizeFileForUpload(file));

  try {
    console.log("📤 Uploading file to:", `/api/chats/${chatId}/upload`);
    console.log("📤 File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      chatId
    });
    
    const response = await api.post(`/api/chats/${chatId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Upload successful:", response.data);
    console.log("🔍 Full response:", response);
    return response.data;
  } catch (error: any) {
    console.error("💥 Upload error:", error);

    if (error?.response?.status === 401) {
      promptLogin("Session Expired", "Please login again.");
      return null;
    }

    Alert.alert("Upload Error", extractErrorMessage(error, "Upload failed. Please try again."));
    return null;
  }
};

export const sendMessage = async (chatId: string, text: string) => {
  const token = await ensureAuthenticated(
    "Authentication Required",
    "Please login to send messages.",
  );

  if (!token) {
    console.error("❌ No token available, cannot send message");
    return false;
  }

  try {
    await api.post(`/api/chats/${chatId}/messages`, { text });
    console.log("✅ Message sent successfully");
    return true;
  } catch (error: any) {
    console.error("💥 Message send error:", error);

    if (error?.response?.status === 401) {
      promptLogin("Session Expired", "Please login again.");
      return false;
    }

    Alert.alert("Message Error", extractErrorMessage(error, "Failed to send message. Please try again."));
    return false;
  }
};