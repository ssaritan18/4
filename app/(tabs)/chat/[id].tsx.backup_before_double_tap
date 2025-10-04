import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, router } from "expo-router";
import { useChat } from "../../../src/context/ChatContext";
import { useRuntimeConfig } from "../../../src/context/RuntimeConfigContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../../../src/components/ProfileAvatar";

import * as ImagePicker from 'expo-image-picker';

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, messagesByChat, sendText, markRead, reactMessage } = useChat();
  const { mode } = useRuntimeConfig();
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState("");
  const [isUploadingMedia, setIsUploadingMedia] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [messageReactions, setMessageReactions] = React.useState<Record<string, boolean>>({}); // Track heart reactions
  const [lastTap, setLastTap] = React.useState<{messageId: string, time: number} | null>(null); // Double-tap detection
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

  const send = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !id) return;

    try {
      setText("");
      setShowEmojiPicker(false); // Close emoji picker when sending
      await sendText(id, trimmedText);
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const insertEmoji = (emoji: string) => {
    setText(prevText => prevText + emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleMediaUpload = async () => {
    try {
      setIsUploadingMedia(true);
      let pickerResult;

      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target.result;
              console.log('File selected for upload:', file.name, file.type);
              Alert.alert("Upload Ready", `Selected: ${file.name}\nSize: ${(file.size/1024/1024).toFixed(2)}MB\n\nNote: This is a demo - actual upload functionality coming soon!`);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      pickerResult = await ImagePicker.launchImageLibraryAsync(options);

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        console.log('Selected media asset:', asset);

        Alert.alert("Upload Ready", `Selected: ${asset.type}\nSize: ${asset.fileSize ? (asset.fileSize/1024/1024).toFixed(2) + 'MB' : 'Unknown'}\n\nNote: This is a demo - actual upload functionality coming soon!`);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert("Error", "Failed to select media. Please try again.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      await reactMessage(messageId, reaction);
    } catch (error) {
      console.error("Failed to react to message:", error);
    }
  };

  const renderReactionBar = (message: any) => {
    const reactions = message.reactions || {};
    return (
      <View style={styles.reactionBar}>
        {['👍', '❤️', '👏', '⭐'].map((emoji, index) => {
          const reactionKeys = ['like', 'heart', 'clap', 'star'];
          const reactionKey = reactionKeys[index];
          const count = reactions[reactionKey] || 0;
          
          return (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionBtn}
              onPress={() => handleReaction(message.id, reactionKey)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              {count > 0 && <Text style={styles.reactionCount}>{count}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderMessageItem = ({ item }: { item: any }) => {
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
      durationSec: item.durationSec ?? item.duration_sec ?? 0,
      status: item.status ?? "sent" // WhatsApp-like status
    };

    const isOwn = normalizedMessage.author_id === 'current_user_id';
    const timestamp = new Date(normalizedMessage.ts).toLocaleTimeString();
    
    // WhatsApp-like read receipt icons
    const getStatusIcon = () => {
      if (!isOwn) return null; // Only show ticks for own messages
      
      switch (normalizedMessage.status) {
        case "sending":
          return <Ionicons name="time-outline" size={12} color="#9CA3AF" />;
        case "sent":
          return <Ionicons name="checkmark" size={12} color="#9CA3AF" />; // Single tick
        case "delivered":
          return (
            <View style={styles.doubleTick}>
              <Ionicons name="checkmark" size={12} color="#9CA3AF" />
              <Ionicons name="checkmark" size={12} color="#9CA3AF" style={styles.secondTick} />
            </View>
          ); // Double tick gray
        case "read":
          return (
            <View style={styles.doubleTick}>
              <Ionicons name="checkmark" size={12} color="#3B82F6" />
              <Ionicons name="checkmark" size={12} color="#3B82F6" style={styles.secondTick} />
            </View>
          ); // Double tick blue
        default:
          return null;
      }
    };

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <LinearGradient
          colors={isOwn ? ['rgba(139, 92, 246, 0.2)', 'rgba(168, 85, 247, 0.2)'] : ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.8)']}
          style={[styles.messageGradient, isOwn ? styles.ownMessageGradient : styles.otherMessageGradient]}
        >
          {!isOwn && (
            <View style={styles.messageHeader}>
              <Text style={styles.authorName}>{normalizedMessage.author_name}</Text>
              <Text style={styles.messageTime}>{timestamp}</Text>
            </View>
          )}
          
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {normalizedMessage.text}
          </Text>
          
          {isOwn && (
            <View style={styles.ownMessageTimeContainer}>
              <Text style={styles.ownMessageTime}>{timestamp}</Text>
              {getStatusIcon()}
            </View>
          )}
        </LinearGradient>
        
        {renderReactionBar(normalizedMessage)}
      </View>
    );
  };

  if (!chat) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f172a']}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 107, 107, 0.2)']}
            style={styles.errorCard}
          >
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>Chat not found</Text>
            <Text style={styles.errorDescription}>The chat you're looking for doesn't exist or has been deleted.</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat/')}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.backBtn}>
                <Text style={styles.backBtnText}>Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.contentContainer, { paddingTop: insets.top + 10 }]}>
          {/* Glow Header */}
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatHeader}
          >
            <TouchableOpacity onPress={() => router.replace('/(tabs)/chat/')} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.chatTitle} numberOfLines={1}>{chat.title || 'Chat'}</Text>
              <Text style={styles.chatSubtitle}>
                {msgs.length} messages • {chat.type === 'GROUP' ? 'Group' : 'Direct'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn}>
                <Ionicons name="information-circle" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Messages List */}
          <FlashList
            data={msgs}
            keyExtractor={(m) => {
              const safeKey = m.id ?? m._id ?? Math.random().toString(36).slice(2);
              return safeKey.toString();
            }}
            estimatedItemSize={80}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
            renderItem={renderMessageItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyMessagesContainer}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                  style={styles.emptyMessagesCard}
                >
                  <Text style={styles.emptyMessagesIcon}>💬✨</Text>
                  <Text style={styles.emptyMessagesTitle}>Start the conversation!</Text>
                  <Text style={styles.emptyMessagesDescription}>Be the first to send a message in this chat.</Text>
                </LinearGradient>
              </View>
            }
          />

          {/* Message Input */}
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={styles.inputContainer}
          >
            <TouchableOpacity 
              onPress={handleMediaUpload} 
              style={styles.mediaBtn}
              disabled={isUploadingMedia}
            >
              <LinearGradient colors={['#F97316', '#FBBF24']} style={styles.mediaBtnGradient}>
                <Ionicons name={isUploadingMedia ? "hourglass" : "camera"} size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#B9B9B9"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
            />

            {/* Emoji Button */}
            <TouchableOpacity 
              onPress={toggleEmojiPicker}
              style={styles.emojiBtn}
            >
              <LinearGradient colors={showEmojiPicker ? ['#8B5CF6', '#A855F7'] : ['#6B7280', '#9CA3AF']} style={styles.emojiBtnGradient}>
                <Ionicons name="happy" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={send} 
              style={styles.sendBtn}
              disabled={!text.trim()}
            >
              <LinearGradient 
                colors={text.trim() ? ['#8B5CF6', '#EC4899'] : ['#666', '#555']} 
                style={styles.sendBtnGradient}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        {/* Emoji Picker Panel */}
        {showEmojiPicker && (
          <View style={styles.emojiPickerContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>😊 Choose an emoji</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.emojiGrid}>
              {[
                '😊', '😂', '😍', '🥰', '😘', '😉', '😇', '🙂',
                '😎', '🤔', '😴', '😋', '😜', '🤪', '😁', '😆',
                '👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '💪',
                '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
                '🔥', '⭐', '✨', '💫', '🌟', '🎉', '🎊', '🎈',
                '🌈', '☀️', '🌙', '⚡', '💯', '✅', '❌', '❓'
              ].map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => insertEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  chatTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chatSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 8,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageGradient: {
    padding: 12,
    borderRadius: 16,
    minWidth: 60,
  },
  ownMessageGradient: {
    borderBottomRightRadius: 4,
  },
  otherMessageGradient: {
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#E5E7EB',
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  ownMessageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  doubleTick: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  secondTick: {
    marginLeft: -8, // Overlap the ticks slightly
  },
  reactionBar: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  mediaBtn: {
    marginRight: 12,
  },
  mediaBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendBtn: {
    
  },
  sendBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtn: {
    marginRight: 12,
  },
  emojiBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMessagesCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  emptyMessagesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyMessagesTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessagesDescription: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    maxHeight: 300,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  emojiPickerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  emojiText: {
    fontSize: 20,
  },
});