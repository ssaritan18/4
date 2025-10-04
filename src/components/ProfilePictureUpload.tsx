import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useRuntimeConfig } from '../context/RuntimeConfigContext';
import { API_BASE_URL } from '../lib/api';
type ProfilePictureUploadProps = {
  currentImageUrl?: string;
  onUploadComplete: (imageUrl: string) => void;
};

export function ProfilePictureUpload({ currentImageUrl, onUploadComplete }: ProfilePictureUploadProps) {
  const { user, isAuthenticated } = useAuth();
  const { mode } = useRuntimeConfig();
  const [uploading, setUploading] = useState(false);
  
  // Debug current image URL
  console.log('📸 ProfilePictureUpload received currentImageUrl:', currentImageUrl ? 'IMAGE_DATA_PRESENT' : 'NO_IMAGE_DATA');

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'We need camera roll permissions to select your profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Compress for faster upload
        base64: true, // We need base64 for backend
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.base64) {
          await uploadImage(asset.base64, asset.fileName || 'profile.jpg');
        } else {
          Alert.alert('Error', 'Failed to process image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImage = async (base64Data: string, fileName: string) => {
    console.log('🔍 ProfilePictureUpload mode check:', { mode, isAuthenticated, hasToken: !!user?.token });
    if (mode === 'sync' && isAuthenticated && user?.token) {
      setUploading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/profile/picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_data: base64Data,
            filename: fileName
          })
        });

        if (response.ok) {
          const data = await response.json();
          onUploadComplete(data.profile_image_url);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          const errorData = await response.json();
          throw new Error(`Upload failed: ${response.status} - ${errorData.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        Alert.alert('Error', `Failed to upload profile picture: ${error.message}`);
      } finally {
        setUploading(false);
      }
    } else {
      // Local mode - create data URL and immediately save
      const mockUrl = `data:image/jpeg;base64,${base64Data}`;
      console.log('💾 LOCAL MODE: Calling onUploadComplete with:', mockUrl.substring(0, 50) + '...');
      onUploadComplete(mockUrl);
      console.log('✅ LOCAL MODE: onUploadComplete called successfully!');
      Alert.alert('Success', 'Profile picture updated (local mode)!');
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'We need camera permissions to take your profile picture.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.base64) {
          await uploadImage(asset.base64, 'camera_photo.jpg');
        } else {
          Alert.alert('Error', 'Failed to process photo. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showUploadOptions = () => {
    if (Platform.OS === 'web') {
      // For web, use direct file input
      pickImageWeb();
    } else {
      // For mobile, show options
      Alert.alert(
        'Update Profile Picture',
        'How would you like to update your profile picture?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImage },
        ]
      );
    }
  };

  const pickImageWeb = () => {
    // Create file input element for web
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          setUploading(true);
          // Convert file to base64
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            await uploadImage(base64, file.name || 'profile.jpg');
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Web image selection error:', error);
          Alert.alert('Error', 'Failed to process image');
          setUploading(false);
        }
      }
    };
    input.click();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={showUploadOptions}
        disabled={uploading}
      >
        {currentImageUrl ? (
          <Image source={{ uri: currentImageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={48} color="#666" />
          </View>
        )}
        
        {/* Upload overlay */}
        <View style={styles.overlay}>
          {uploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="camera" size={20} color="white" />
          )}
        </View>
      </TouchableOpacity>
      
      <Text style={styles.hint}>
        {uploading ? 'Uploading...' : 'Tap to change photo'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#4A90E2',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 47, // Slightly smaller to account for border
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 47,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  hint: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
