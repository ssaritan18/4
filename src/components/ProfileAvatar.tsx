import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

type ProfileAvatarProps = {
  userId?: string;
  userName: string;
  profileImage?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
};

export function ProfileAvatar({ 
  userId,
  userName, 
  profileImage, 
  size = 'medium',
  onPress,
  showOnlineStatus = false,
  isOnline = false
}: ProfileAvatarProps) {
  const sizes = {
    small: { container: 32, text: 12 },
    medium: { container: 40, text: 14 },
    large: { container: 56, text: 18 }
  };
  
  const currentSize = sizes[size];
  
  // Generate initials from user name
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '?';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return '?';
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  // Generate a consistent color based on user ID or name
  const getAvatarColor = (identifier: string) => {
    const colors = [
      '#FF6B35', // Orange
      '#4A90E2', // Blue  
      '#00C851', // Green
      '#6C5CE7', // Purple
      '#FF3547', // Red
      '#FFD700', // Gold
      '#FF7CA3', // Pink
      '#7C9EFF', // Light Blue
      '#B8F1D9', // Light Green
      '#FFE3A3', // Light Yellow
    ];
    
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const avatarColor = getAvatarColor(userId || userName);
  
  const AvatarContent = () => (
    <View 
      style={[
        styles.container,
        {
          width: currentSize.container,
          height: currentSize.container,
          borderRadius: currentSize.container / 2,
          backgroundColor: profileImage ? 'transparent' : avatarColor,
        }
      ]}
    >
      {profileImage ? (
        <Image
          source={{ uri: profileImage }}
          style={[
            styles.image,
            {
              width: currentSize.container,
              height: currentSize.container,
              borderRadius: currentSize.container / 2,
            }
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text 
          style={[
            styles.initials,
            {
              fontSize: currentSize.text,
            }
          ]}
        >
          {getInitials(userName)}
        </Text>
      )}
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <View 
          style={[
            styles.onlineIndicator,
            {
              width: currentSize.container * 0.25,
              height: currentSize.container * 0.25,
              borderRadius: (currentSize.container * 0.25) / 2,
              backgroundColor: isOnline ? '#00C851' : '#666',
              bottom: 0,
              right: 0,
            }
          ]}
        />
      )}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }
  
  return <AvatarContent />;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  image: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0c0c0c',
  },
});