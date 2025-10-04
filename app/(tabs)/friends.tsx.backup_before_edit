import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFriends } from "../../src/context/FriendsContext";
import { useChat } from "../../src/context/ChatContext";
import { Ionicons } from "@expo/vector-icons";
import { useRuntimeConfig } from "../../src/context/RuntimeConfigContext";
import { useAuth } from "../../src/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "../../src/components/ProfileAvatar";
import { router } from "expo-router";

export default function FriendsScreen() {
  const { friends, requests, presence, wsConnectionStatus, sendRequest, acceptRequest, rejectRequest, refresh } = useFriends();
  const { syncEnabled } = useRuntimeConfig();
  const { palette } = useAuth();
  const { openDirectChat } = useChat();
  const insets = useSafeAreaInsets();
  const [friendQuery, setFriendQuery] = React.useState("");

  // Safe array access to prevent undefined errors
  const safeFriends = friends || [];
  const safeRequests = requests || [];

  React.useEffect(() => { 
    console.log("🔍 FriendsScreen - State Debug:", {
      friendsLength: safeFriends.length,
      requestsLength: safeRequests.length,
      friendsType: typeof friends,
      requestsType: typeof requests,
      isArray: Array.isArray(friends)
    });
    refresh(); 
  }, [refresh]);

  const addFriend = async () => {
    const email = friendQuery.trim();
    if (!email) return;
    
    console.log("🔍 Starting addFriend function:", { email, safeFriendsLength: safeFriends.length, safeRequestsLength: safeRequests.length });
    
    try {
      console.log("📧 Calling sendRequest...");
      await sendRequest(email);
      setFriendQuery("");
      console.log("✅ sendRequest successful, showing success alert");
      Alert.alert("✅ Request Sent!", `Friend request sent to ${email}`);
    } catch (error) {
      console.error("❌ sendRequest failed:", error);
      Alert.alert("❌ Error", `Failed to send friend request: ${error.message}`);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      Alert.alert("✅ Friend Added!", "You are now friends!");
    } catch (error) {
      Alert.alert("❌ Error", `Failed to accept request: ${error.message}`);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      Alert.alert("Request Rejected", "Friend request has been rejected.");
    } catch (error) {
      Alert.alert("❌ Error", `Failed to reject request: ${error.message}`);
    }
  };

  const startChat = async (friendId: string, friendName: string) => {
    try {
      console.log(`💬 Starting chat with ${friendName} (${friendId})`);
      const chatId = await openDirectChat(friendId);
      console.log(`✅ Chat opened with ID: ${chatId}`);
      
      // Navigate to chat screen
      router.push(`/(tabs)/chat/${chatId}`);
      
      // Optional: Show success feedback
      console.log(`🚀 Navigating to chat: /(tabs)/chat/${chatId}`);
    } catch (error) {
      console.error(`❌ Failed to open chat with ${friendName}:`, error);
      Alert.alert("❌ Error", `Failed to open chat with ${friendName}: ${error.message}`);
    }
  };

  const renderFriendItem = (friend: any) => {
    const isOnline = presence[friend.id]?.status === 'online';
    return (
      <View key={friend.id} style={styles.friendItem}>
        <LinearGradient
          colors={isOnline ? ['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)'] : ['rgba(107, 114, 128, 0.1)', 'rgba(156, 163, 175, 0.1)']}
          style={styles.friendItemGradient}
        >
          <View style={styles.friendItemContent}>
            <View style={styles.friendHeader}>
              <View style={styles.friendInfo}>
                <ProfileAvatar 
                  userId={friend.id} 
                  userName={friend.name || friend.email || 'Friend'} 
                  size="medium" 
                  style={styles.friendAvatar} 
                />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{friend.name || friend.email}</Text>
                  <View style={styles.friendStatus}>
                    <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#6B7280' }]} />
                    <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.friendActions}>
                <TouchableOpacity 
                  onPress={() => startChat(friend.id, friend.name || friend.email)}
                  style={styles.actionBtn}
                >
                  <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.actionBtnGradient}>
                    <Ionicons name="chatbubble" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderRequestItem = (request: any) => {
    return (
      <View key={request.id} style={styles.requestItem}>
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.1)', 'rgba(251, 191, 36, 0.1)']}
          style={styles.requestItemGradient}
        >
          <View style={styles.requestItemContent}>
            <View style={styles.requestHeader}>
              <ProfileAvatar 
                userId={request.from_id} 
                userName={request.from_name || request.from_email || 'User'} 
                size="medium" 
                style={styles.requestAvatar} 
              />
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.from_name || request.from_email}</Text>
                <Text style={styles.requestEmail}>{request.from_email}</Text>
              </View>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity onPress={() => handleAccept(request.id)}>
                <LinearGradient colors={['#10B981', '#34D399']} style={styles.acceptBtn}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReject(request.id)}>
                <LinearGradient colors={['#EF4444', '#F87171']} style={styles.rejectBtn}>
                  <Ionicons name="close" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

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
          <Text style={styles.glowHeaderTitle}>❤️ Friends Hub</Text>
          <Text style={styles.glowHeaderSubtitle}>Connect with your ADHD support network</Text>
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Add Friend Section */}
          <View style={styles.addFriendSection}>
            <Text style={styles.sectionTitle}>➕ Add New Friend</Text>
            
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
              style={styles.addFriendCard}
            >
              <Text style={styles.addFriendTitle}>🌟 Send Friend Request</Text>
              <View style={styles.addFriendRow}>
                <TextInput
                  style={styles.friendInput}
                  placeholder="Enter friend's email..."
                  placeholderTextColor="#B9B9B9"
                  value={friendQuery}
                  onChangeText={setFriendQuery}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={addFriend} disabled={!friendQuery.trim()}>
                  <LinearGradient 
                    colors={friendQuery.trim() ? ['#8B5CF6', '#A855F7'] : ['#666', '#555']} 
                    style={styles.addFriendBtn}
                  >
                    <Ionicons name="person-add" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Connection Status */}
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)']}
              style={styles.statusCard}
            >
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>🔗 Connection Status</Text>
                <View style={[styles.connectionDot, { backgroundColor: wsConnectionStatus === 'connected' ? '#10B981' : '#EF4444' }]} />
              </View>
              <Text style={styles.statusDescription}>
                WebSocket: {wsConnectionStatus} • Sync: {syncEnabled ? 'On' : 'Off'}
              </Text>
            </LinearGradient>
          </View>

          {/* Friend Requests */}
          {safeRequests.length > 0 && (
            <View style={styles.requestsSection}>
              <Text style={styles.sectionTitle}>📥 Friend Requests ({safeRequests.length})</Text>
              {safeRequests.map(renderRequestItem)}
            </View>
          )}

          {/* Friends List */}
          <View style={styles.friendsSection}>
            <View style={styles.friendsSectionHeader}>
              <Text style={styles.sectionTitle}>👥 Your Friends ({safeFriends.length})</Text>
              <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
                <Ionicons name="refresh" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            {safeFriends.length === 0 ? (
              <View style={styles.emptyFriendsContainer}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                  style={styles.emptyFriendsCard}
                >
                  <Text style={styles.emptyFriendsIcon}>👥✨</Text>
                  <Text style={styles.emptyFriendsTitle}>No friends yet!</Text>
                  <Text style={styles.emptyFriendsDescription}>
                    Add friends by sending them a friend request using their email address above.
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {safeFriends.map(renderFriendItem)}
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
  addFriendSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  addFriendCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  addFriendTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  addFriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendInput: {
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
  addFriendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDescription: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  requestsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  requestItem: {
    marginBottom: 12,
  },
  requestItemGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  requestItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  requestEmail: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsSection: {
    paddingHorizontal: 16,
  },
  friendsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  friendsList: {
    
  },
  friendItem: {
    marginBottom: 12,
  },
  friendItemGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  friendItemContent: {
    
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  friendStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: '#E5E7EB',
    fontSize: 12,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    
  },
  actionBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFriendsContainer: {
    paddingVertical: 40,
  },
  emptyFriendsCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  emptyFriendsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyFriendsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyFriendsDescription: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});