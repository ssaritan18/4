import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from "@shopify/flash-list";
import { useChat } from "../../../src/context/ChatContext";
import { useRuntimeConfig } from "../../../src/context/RuntimeConfigContext";
import { useAuth } from "../../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../../../src/components/ProfileAvatar";

export default function ChatList() {
  const { chats, createGroup, joinByCode, refresh, isLoading, error } = useChat();
  const { mode } = useRuntimeConfig();
  const { palette } = useAuth();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = React.useState("");
  const [code, setCode] = React.useState("");

  const openChat = (id: string) => router.push(`/(tabs)/chat/${id}`);

  const create = async () => {
    if (!title.trim()) return;
    try {
      const id = await createGroup(title.trim());
      setTitle("");
      openChat(id);
    } catch (error) {
      console.error("Failed to create chat:", error);
      Alert.alert("Error", "Failed to create chat. Please try again.");
    }
  };

  const join = async () => {
    if (!code.trim()) return;
    try {
      const id = await joinByCode(code.trim());
      setCode("");
      if (id) openChat(id);
      else Alert.alert("Error", "Invalid invite code or chat not found.");
    } catch (error) {
      console.error("Failed to join chat:", error);
      Alert.alert("Error", "Failed to join chat. Please try again.");
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error("Failed to refresh chats:", error);
      Alert.alert("Error", "Failed to refresh chats. Please try again.");
    }
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const isGroup = item.type === 'GROUP';
    const displayName = isGroup ? item.title : item.title || 'Direct Chat';
    const lastMessage = item.lastMessage || 'No messages yet';
    const timestamp = item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString() : '';
    
    return (
      <TouchableOpacity onPress={() => openChat(item.id)} style={styles.chatItem}>
        <LinearGradient
          colors={isGroup ? ['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)'] : ['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
          style={styles.chatItemGradient}
        >
          <View style={styles.chatItemContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatItemIcon}>{isGroup ? '👥' : '💬'}</Text>
              <Text style={styles.chatTitle}>{displayName}</Text>
              {timestamp && <Text style={styles.chatTime}>{timestamp}</Text>}
            </View>
            <Text style={styles.chatLastMessage} numberOfLines={1}>
              {lastMessage}
            </Text>
            {isGroup && item.inviteCode && (
              <View style={styles.inviteCodeContainer}>
                <Text style={styles.inviteCodeLabel}>Invite Code:</Text>
                <Text style={styles.inviteCode}>{item.inviteCode}</Text>
              </View>
            )}
            <View style={styles.chatFooter}>
              <Text style={styles.chatType}>{isGroup ? 'Group Chat' : 'Direct Message'}</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
        style={styles.emptyCard}
      >
        <Text style={styles.emptyIcon}>💬✨</Text>
        <Text style={styles.emptyTitle}>No chats yet!</Text>
        <Text style={styles.emptyDescription}>Create your first group chat or join one with an invite code above.</Text>
      </LinearGradient>
    </View>
  );

  const groupChats = chats.filter(chat => chat.type === 'GROUP');
  const directChats = chats.filter(chat => chat.type === 'DIRECT');

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <View style={[styles.contentContainer, { paddingTop: insets.top + 20 }]}>
        {/* Glow Header */}
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.glowHeader}
        >
          <Text style={styles.glowHeaderTitle}>💬 Chat Hub</Text>
          <Text style={styles.glowHeaderSubtitle}>Connect and chat with ADHDers</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} disabled={isLoading}>
            <Ionicons name="refresh" size={20} color={isLoading ? "rgba(255,255,255,0.5)" : "#fff"} />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Quick Actions Section */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            
            {/* Create Chat Card */}
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
              style={styles.actionCard}
            >
              <Text style={styles.actionCardTitle}>🌟 Create Group Chat</Text>
              <View style={styles.actionRow}>
                <TextInput 
                  style={styles.glowInput} 
                  placeholder="Enter group name..." 
                  placeholderTextColor="#B9B9B9" 
                  value={title} 
                  onChangeText={setTitle}
                  maxLength={50}
                />
                <TouchableOpacity onPress={create} disabled={!title.trim() || isLoading}>
                  <LinearGradient 
                    colors={title.trim() && !isLoading ? ['#8B5CF6', '#A855F7'] : ['#666', '#555']} 
                    style={styles.actionBtn}
                  >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Join Chat Card */}
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
              style={styles.actionCard}
            >
              <Text style={styles.actionCardTitle}>🎯 Join with Code</Text>
              <View style={styles.actionRow}>
                <TextInput 
                  style={styles.glowInput} 
                  placeholder="Enter invite code..." 
                  placeholderTextColor="#B9B9B9" 
                  value={code} 
                  onChangeText={setCode}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <TouchableOpacity onPress={join} disabled={!code.trim() || isLoading}>
                  <LinearGradient 
                    colors={code.trim() && !isLoading ? ['#EC4899', '#F97316'] : ['#666', '#555']} 
                    style={styles.actionBtn}
                  >
                    <Ionicons name="enter" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Error Banner */}
          {error && (
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 107, 107, 0.2)']}
              style={styles.errorBanner}
            >
              <Ionicons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </LinearGradient>
          )}

          {/* Chats List */}
          <View style={styles.chatsSection}>
            <View style={styles.chatsSectionHeader}>
              <Text style={styles.sectionTitle}>💬 Your Chats</Text>
              <Text style={styles.sectionSubtitle}>{chats.length} total • {isLoading ? "Loading..." : "Ready"}</Text>
            </View>

            {chats.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.chatsList}>
                {chats.map(chat => (
                  <View key={chat.id}>
                    {renderChatItem({ item: chat })}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
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
  glowHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    position: 'relative',
  },
  glowHeaderTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glowHeaderSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  refreshBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sectionSubtitle: {
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 4,
  },
  actionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  actionCardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glowInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    fontSize: 16,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  chatsSection: {
    paddingHorizontal: 16,
  },
  chatsSectionHeader: {
    marginBottom: 16,
  },
  chatsList: {
    
  },
  chatItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatItemGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  chatItemContent: {
    
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  chatTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  chatTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  chatLastMessage: {
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 32,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 32,
  },
  chatType: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  inviteCodeLabel: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  inviteCode: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});