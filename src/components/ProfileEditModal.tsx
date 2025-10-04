import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { MediaPickerBottomSheet, MediaItem } from './MediaPickerBottomSheet';
import { API_BASE_URL } from '../lib/api';
interface ProfileEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentUser: any;
  onProfileUpdated: (updatedUser: any) => void;
}

interface ProfileData {
  name: string;
  bio: string;
  interests: string;
  location: string;
  age: string;
  profilePicture: string | null;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isVisible,
  onClose,
  currentUser,
  onProfileUpdated
}) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    interests: '',
    location: '',
    age: '',
    profilePicture: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isVisible && currentUser) {
      setProfileData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        interests: Array.isArray(currentUser.interests) ? currentUser.interests.join(', ') : '',
        location: currentUser.location || '',
        age: currentUser.age ? currentUser.age.toString() : '',
        profilePicture: currentUser.profile_picture || null
      });
      setSelectedImage(currentUser.profile_picture || null);
    }
  }, [isVisible, currentUser]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelected = (mediaItems: MediaItem[]) => {
    if (mediaItems.length > 0) {
      const selectedMedia = mediaItems[0];
      setSelectedImage(selectedMedia.uri);
    }
  };

  const validateForm = (): boolean => {
    if (!profileData.name.trim()) {
      Alert.alert('Hata', 'İsim alanı boş bırakılamaz.');
      return false;
    }
    if (profileData.age && (isNaN(Number(profileData.age)) || Number(profileData.age) < 13 || Number(profileData.age) > 120)) {
      Alert.alert('Hata', 'Geçerli bir yaş giriniz (13-120 arası).');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;
    if (!user?.user_id) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('bio', profileData.bio);
      formData.append('interests', profileData.interests);
      formData.append('location', profileData.location);
      
      if (profileData.age) {
        formData.append('age', profileData.age);
      }

      // Add profile picture if selected
      if (selectedImage && selectedImage !== profileData.profilePicture) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        
        // Create file object
        const file = {
          uri: selectedImage,
          type: 'image/jpeg',
          name: `profile_${user.user_id}_${Date.now()}.jpg`,
        } as any;
        
        formData.append('profile_picture', file);
      }

      // Send request to backend
       const response = await fetch(`${API_BASE_URL}/users/${user.user_id}/profile`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert('Başarılı!', 'Profil bilgileriniz güncellendi.', [
          { 
            text: 'Tamam', 
            onPress: () => {
              onProfileUpdated(result.user);
              onClose();
            }
          }
        ]);
      } else {
        throw new Error(result.message || 'Profil güncellenemedi');
      }

    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Hata', `Profil güncellenirken hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        interests: Array.isArray(currentUser.interests) ? currentUser.interests.join(', ') : '',
        location: currentUser.location || '',
        age: currentUser.age ? currentUser.age.toString() : '',
        profilePicture: currentUser.profile_picture || null
      });
      setSelectedImage(currentUser.profile_picture || null);
    }
  };

  return (
    <>
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profili Düzenle</Text>
            <TouchableOpacity onPress={resetForm} style={styles.headerButton}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <TouchableOpacity 
                style={styles.profilePictureContainer}
                onPress={() => setIsMediaPickerVisible(true)}
              >
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.profilePicture} />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Ionicons name="person" size={40} color="#666" />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.profilePictureText}>Profil fotoğrafını değiştirmek için dokunun</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>İsim *</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Adınızı giriniz"
                  placeholderTextColor="#666"
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={profileData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  placeholder="Kendiniz hakkında kısa bir açıklama..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={styles.characterCount}>{profileData.bio.length}/200</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>İlgi Alanları</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileData.interests}
                  onChangeText={(text) => handleInputChange('interests', text)}
                  placeholder="Müzik, spor, okuma... (virgülle ayırınız)"
                  placeholderTextColor="#666"
                  maxLength={100}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Konum</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileData.location}
                  onChangeText={(text) => handleInputChange('location', text)}
                  placeholder="İstanbul, Ankara..."
                  placeholderTextColor="#666"
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Yaş</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileData.age}
                  onChangeText={(text) => handleInputChange('age', text)}
                  placeholder="25"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={saveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MediaPickerBottomSheet
        isVisible={isMediaPickerVisible}
        onClose={() => setIsMediaPickerVisible(false)}
        onMediaSelected={handleImageSelected}
        allowMultiple={false}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0c0c0c',
  },
  profilePictureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  formSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default ProfileEditModal;
