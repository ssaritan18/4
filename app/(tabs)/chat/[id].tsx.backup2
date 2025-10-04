import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, router } from "expo-router";
import { useChat } from "../../../src/context/ChatContext";
import { useRuntimeConfig } from "../../../src/context/RuntimeConfigContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../../../src/components/ProfileAvatar";
import VoiceRecorder from "../../../src/components/VoiceRecorder";
import VoicePlayer from "../../../src/components/VoicePlayer";
import * as ImagePicker from 'expo-image-picker';

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, messagesByChat, sendText, sendVoice, sendVoiceMock, markRead, reactMessage } = useChat();
  const { mode } = useRuntimeConfig();
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState("");
  const [isRecordingVoice, setIsRecordingVoice] = React.useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = React.useState(false);
  const chat = chats.find((c) => c.id === id);
  const msgs = messagesByChat[id || ""] || [];
  
  console.log("🔍 CHAT DETAIL RENDER:", {
    chatId: id,
    chatFound: !!chat,
    chatTitle: chat?.title,
    messagesCount: msgs.length,
    allMessages: msgs,
    messagesByChat: messagesByChat
  });

  React.useEffect(() => { 
    if (id) markRead(id); 
  }, [id, markRead]);

  const onSend = async () => { 
    console.log("🔥 SEND BUTTON CLICKED! Text:", text, "Chat ID:", id);
    
    if (!id || !text.trim()) {
      console.log("❌ Cannot send - missing ID or text");
      return;
    }
    
    try {
      console.log("🚀 Calling sendText function...");
      await sendText(id, text.trim()); 
      console.log("✅ sendText completed successfully");
      setText(""); 
      console.log("✅ Text input cleared");
    } catch (error) {
      console.error("❌ Send error:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const onVoice = () => { 
    if (!id) return; 
    setIsRecordingVoice(true);
  };

  // Handle voice recording completion
  const handleVoiceComplete = async (audioBase64: string, duration: number) => {
    if (!id) return;
    
    try {
      console.log("🎙️ Voice recording completed:", { duration });
      setIsRecordingVoice(false);
      
      if (mode === "sync") {
        // For sync mode, create a data URI from base64
        const audioUri = `data:audio/m4a;base64,${audioBase64}`;
        await sendVoice(id, audioUri, duration);
      } else {
        // For local mode, use mock
        sendVoiceMock(id, duration);
      }
      
      Alert.alert("Success! 🎉", "Voice message sent successfully!");
    } catch (error) {
      console.error("❌ Failed to send voice message:", error);
      setIsRecordingVoice(false);
      Alert.alert("Error", "Failed to send voice message. Please try again.");
    }
  };

  // Handle voice recording cancellation
  const handleVoiceCancel = () => {
    setIsRecordingVoice(false);
  };

  const handleMediaUpload = async () => {
    Alert.alert(
      'Send Media',
      'Choose your media source',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Gallery', onPress: handlePickImage },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'We need camera permissions to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7, // Good balance between quality and size
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await sendMedia(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'We need gallery permissions to select images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow images and videos
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await sendMedia(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select media. Please try again.');
    }
  };

  const sendMedia = async (asset: any) => {
    if (!id || !asset.base64) return;
    
    setIsUploadingMedia(true);
    try {
      // For now, we'll send the media as a mock text message
      // In a real implementation, you'd upload to your backend first
      const mediaType = asset.type?.includes('video') ? 'video' : 'image';
      const mediaMessage = `📎 [${mediaType.toUpperCase()}] ${asset.fileName || 'media'} (${Math.round(asset.fileSize / 1024)}KB)`;
      
      if (mode === "sync") {
        // TODO: Implement actual media API call to backend
        await sendText(mediaMessage);
        Alert.alert('Media Sent', `${mediaType} has been shared in the chat!`);
      } else {
        // Local mode
        await sendText(mediaMessage);
        Alert.alert('Media Sent (Local)', `${mediaType} added to local chat!`);
      }
    } catch (error) {
      console.error("Failed to send media:", error);
      Alert.alert('Error', 'Failed to send media. Please try again.');
    } finally {
      setIsUploadingMedia(false);
    }
  };
  const handleReaction = async (msgId: string, reactionType: string) => {
    if (!id) return;
    try {
      await reactMessage(id, msgId, reactionType as any);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const ReactBar = ({ msgId, counts }: { msgId: string; counts?: Record<string, number> }) => (
    <View style={styles.reactRow}>
      <TouchableOpacity onPress={() => handleReaction(msgId, 'like')} style={styles.reactBtn}>
        <Ionicons name="thumbs-up" size={16} color="#B8F1D9" />
        <Text style={styles.reactCount}>{counts?.like || 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReaction(msgId, 'heart')} style={styles.reactBtn}>
        <Ionicons name="heart" size={16} color="#FF7CA3" />
        <Text style={styles.reactCount}>{counts?.heart || 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReaction(msgId, 'clap')} style={styles.reactBtn}>
        <Ionicons name="hand-right" size={16} color="#7C9EFF" />
        <Text style={styles.reactCount}>{counts?.clap || 0}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReaction(msgId, 'star')} style={styles.reactBtn}>
        <Ionicons name="star" size={16} color="#FFE3A3" />
        <Text style={styles.reactCount}>{counts?.star || 0}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Fixed Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.header} numberOfLines={1}>{chat?.title || 'Chat'}</Text>
            <Text style={styles.modeIndicator}>
              Mode: {mode} | Messages: {msgs.length}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Messages List */}
        <FlashList
          data={msgs}
          keyExtractor={(m) => {
            // Safe key extraction to prevent crash
            const safeKey = m.id ?? m._id ?? Math.random().toString(36).slice(2);
            return safeKey.toString();
          }}
          estimatedItemSize={80}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          renderItem={({ item }) => {
            // Normalize message properties to prevent undefined access
            const normalizedMessage = {
              id: item.id ?? item._id ?? Math.random().toString(36).slice(2),
              text: item.text ?? item.content ?? "",
              author: item.author ?? "Unknown",
              author_id: item.author_id ?? item.sender ?? "unknown",
              author_name: item.author_name ?? item.author ?? "Unknown User",
              type: item.type ?? "text",
              ts: item.ts ?? Date.now(),
              reactions: item.reactions ?? { like: 0, heart: 0, clap: 0, star: 0 },
              voice_url: item.voice_url ?? null,
              durationSec: item.durationSec ?? item.duration_sec ?? 0
            };
            
            return (
              <View style={{ marginBottom: 10 }}>
                <View style={[
                  styles.messageContainer, 
                  normalizedMessage.author === 'me' ? styles.myMessageContainer : styles.theirMessageContainer
                ]}>
                  {normalizedMessage.author !== 'me' && (
                    <ProfileAvatar
                      userId={normalizedMessage.author_id}
                      userName={normalizedMessage.author_name || normalizedMessage.author}
                      size="small"
                      onPress={() => Alert.alert(
                        "Profile", 
                        `View ${normalizedMessage.author_name || normalizedMessage.author}'s profile`
                      )}
                    />
                  )}
                  <View style={[styles.bubble, normalizedMessage.author === 'me' ? styles.mine : styles.theirs]}>
                    {normalizedMessage.author !== 'me' && (
                      <Text style={styles.authorText}>{normalizedMessage.author_name || normalizedMessage.author}</Text>
                    )}
                    {normalizedMessage.type === 'text' ? (
                      <Text style={styles.bubbleText}>{normalizedMessage.text}</Text>
                    ) : normalizedMessage.type === 'voice' ? (
                      <VoicePlayer
                        voiceUrl={normalizedMessage.voice_url || 'placeholder'}
                        duration={normalizedMessage.durationSec || 0}
                        isFromMe={normalizedMessage.author === 'me'}
                        author={normalizedMessage.author_name || normalizedMessage.author}
                      />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="mic" size={16} color={normalizedMessage.author === 'me' ? "#000" : "#fff"} />
                        <Text style={{ 
                          color: normalizedMessage.author === 'me' ? "#000" : "#fff", 
                          fontWeight: '700', 
                          marginLeft: 8
                        }}>
                          Voice message ({normalizedMessage.durationSec || 3}s)
                        </Text>
                      </View>
                    )}
                    <Text style={styles.timeText}>
                      {new Date(normalizedMessage.ts).toLocaleTimeString()}
                    </Text>
                  </View>
                  {normalizedMessage.author === 'me' && <View style={styles.avatarSpacer} />}
                </View>
                <ReactBar msgId={normalizedMessage.id} counts={normalizedMessage.reactions} />
              </View>
            );
          }}

          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#444" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          )}
        />

        {/* Message Composer */}
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {!isRecordingVoice ? (
            <>
              <TouchableOpacity 
                onPress={handleMediaUpload}
                style={styles.mediaButton}
                disabled={isUploadingMedia}
              >
                {isUploadingMedia ? (
                  <Text style={styles.uploadingText}>...</Text>
                ) : (
                  <Ionicons name="attach" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
              <VoiceRecorder
                onVoiceRecorded={handleVoiceComplete}
                onCancel={handleVoiceCancel}
                onRecordingStart={() => setIsRecordingVoice(true)}
                onRecordingEnd={() => setIsRecordingVoice(false)}
                style={styles.voiceRecorder}
              />
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#777"
                value={text}
                onChangeText={setText}
                multiline
                maxLength={500}
                onSubmitEditing={onSend}
                blurOnSubmit={false}
                returnKeyType="send"
              />
              <TouchableOpacity 
                onPress={onSend} 
                style={[styles.sendBtn, { opacity: text.trim() ? 1 : 0.5 }]} 
                disabled={!text.trim()}
              >
                <Ionicons name="send" size={18} color="#000" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.recordingMode}>
              <VoiceRecorder
                onVoiceRecorded={handleVoiceComplete}
                onCancel={handleVoiceCancel}
                onRecordingStart={() => setIsRecordingVoice(true)}
                onRecordingEnd={() => setIsRecordingVoice(false)}
                style={styles.voiceRecorderActive}
              />
            </View>
          )}
        </View>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0c0c0c' 
  },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: { 
    padding: 8, 
    marginRight: 8,
    borderRadius: 20,
  },
  headerTitleContainer: { 
    flex: 1, 
    alignItems: 'center' 
  },
  header: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700',
    textAlign: 'center' 
  },
  modeIndicator: { 
    color: '#A3C9FF', 
    fontSize: 11, 
    textAlign: 'center',
    marginTop: 2
  },
  headerSpacer: { 
    width: 40 
  },
  // Enhanced message container styles with profile pictures
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarSpacer: {
    width: 32, // Same as small avatar size
  },
  bubble: { 
    maxWidth: '75%', 
    padding: 12, 
    borderRadius: 16, 
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mine: { 
    backgroundColor: '#B8F1D9', 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirs: { 
    backgroundColor: '#FFCFE1', 
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { 
    color: '#000', 
    fontSize: 15,
    lineHeight: 20,
  },
  authorText: { 
    color: '#333', 
    fontSize: 11, 
    fontWeight: '600', 
    marginBottom: 2,
    opacity: 0.8
  },
  timeText: { 
    color: '#666', 
    fontSize: 10, 
    marginTop: 4,
    textAlign: 'right'
  },
  composer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 16, 
    paddingTop: 12,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  input: { 
    flex: 1, 
    backgroundColor: '#1a1a1a', 
    color: '#fff', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: '#333', 
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: { 
    backgroundColor: '#A3C9FF', 
    padding: 12, 
    borderRadius: 20,
    elevation: 2,
  },
  micBtn: { 
    backgroundColor: '#FFE3A3', 
    padding: 12, 
    borderRadius: 20,
  },
  reactRow: { 
    flexDirection: 'row', 
    gap: 12, 
    paddingHorizontal: 8, 
    marginTop: 4,
    marginLeft: 50, // Offset for avatar space
  },
  reactBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  reactCount: { 
    color: '#bdbdbd', 
    fontSize: 11,
    fontWeight: '600'
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60,
    paddingHorizontal: 40 
  },
  emptyText: { 
    color: '#777', 
    fontSize: 18, 
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 16 
  },
  emptySubtext: { 
    color: '#555', 
    fontSize: 14, 
    textAlign: 'center',
    marginTop: 4
  },
  voiceRecorder: {
    backgroundColor: "#FFE3A3",
    padding: 12,
    borderRadius: 20,
  },
  voiceRecorderActive: {
    backgroundColor: "#FF7CA3",
    padding: 12,
    borderRadius: 20,
    flex: 1,
  },
  mediaButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  uploadingText: {
    color: "#4A90E2",
    fontSize: 12,
    fontWeight: "600",
  },
  recordingMode: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});