import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useRuntimeConfig } from '../../src/context/RuntimeConfigContext';
import { ProfilePictureUpload } from '../../src/components/ProfilePictureUpload';
import { API_BASE_URL } from '../../src/lib/api';
type ProfileData = {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  birth_date?: string;
  profile_image?: string;
};

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { mode } = useRuntimeConfig();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    location: '',
    website: '',
    birth_date: '',
    profile_image: null,
  });

  // IMMEDIATE LOAD ON MOUNT
  React.useLayoutEffect(() => {
    console.log('🚨 LAYOUT EFFECT - IMMEDIATE LOAD!');
    const immediateLoad = async () => {
      console.log('📂 IMMEDIATE localStorage check...');
      try {
        const userKey = user?.id || user?.email || 'default';
        const savedProfile = localStorage.getItem(`profile_data_${userKey}`);
        console.log('📂 Immediate localStorage data:', savedProfile);
        
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          console.log('📂 Immediate parsed profile:', parsedProfile);
          setProfileData({
            name: parsedProfile.name || '',
            bio: parsedProfile.bio || '',
            location: parsedProfile.location || '',
            website: parsedProfile.website || '',
            birth_date: parsedProfile.birth_date || '',
          });
          console.log('✅ IMMEDIATE LOAD SUCCESS!');
        }
      } catch (error) {
        console.error('❌ Immediate load error:', error);
      }
    };
    immediateLoad();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered for loadProfileData');
    console.log('🔍 Current state:', { mode, isAuthenticated, userExists: !!user, hasToken: !!user?.token });
    
    // FORCE LOAD - Her component mount'ta çalıştır
    console.log('🚀 FORCING loadProfileData...');
    loadProfileData();
  }, []); // Empty dependency - sadece component mount'ta çalış

  const loadProfileData = async () => {
    console.log('🔄 loadProfileData called:', { mode, isAuthenticated, hasToken: !!user?.token });
    
    // HER DURUMDA localStorage'dan yükle önce
    console.log('📱 FORCED OFFLINE MODE: Always loading from localStorage first...');
    await loadFromLocalStorage();
    
    // Eğer sync mode ve token varsa, backend'den de dene (optional)
    if (mode === 'sync' && isAuthenticated && user?.token) {
      console.log('🌐 SYNC MODE: Also trying backend...');
      try {
        const response = await fetch(`${API_BASE_URL}/profile/settings`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          const loadedData = {
            name: profile.name || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
            birth_date: profile.birth_date || '',
            profile_image: profile.profile_image || '',
          };
          setProfileData(loadedData);
          
          // Also save to localStorage for UI consistency
          const userKey = user?.id || user?.email || 'default';
          localStorage.setItem(`profile_data_${userKey}`, JSON.stringify(loadedData));
          console.log('✅ Profile loaded from backend and saved to localStorage!');
        }
      } catch (error) {
        console.log('❌ Backend failed, keeping localStorage data:', error);
      }
    }
  };

  // Separate function for localStorage loading
  const loadFromLocalStorage = async () => {
    console.log('📂 LOADING FROM localStorage...');
    try {
      const userKey = user?.id || user?.email || 'default';
      const savedProfile = localStorage.getItem(`profile_data_${userKey}`);
      console.log('📂 localStorage data:', savedProfile);
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('📂 Parsed profile from localStorage:', {
          name: parsedProfile.name,
          bio: parsedProfile.bio,
          location: parsedProfile.location,
          website: parsedProfile.website,
          birth_date: parsedProfile.birth_date,
          profile_image: parsedProfile.profile_image ? 'IMAGE_DATA_LOADED' : 'NO_IMAGE_DATA'
        });
        
        const loadedData = {
          name: parsedProfile.name || user?.name || 'Your Name',
          bio: parsedProfile.bio || 'Tell us about yourself...',
          location: parsedProfile.location || '',
          website: parsedProfile.website || '',
          birth_date: parsedProfile.birth_date || '',
          profile_image: parsedProfile.profile_image || null,
        };
        
        console.log('🔄 Setting profile data to:', {
          ...loadedData,
          profile_image: loadedData.profile_image ? 'IMAGE_WILL_BE_SET' : 'NO_IMAGE_TO_SET',
          profileImageUrl: loadedData.profile_image ? loadedData.profile_image.substring(0, 50) + '...' : 'NO_IMAGE'
        });
        
        setProfileData(loadedData);
        console.log('✅ Profile data loaded from localStorage!');
      } else {
        console.log('❌ No saved profile found in localStorage');
        // Kayıtlı data yok, default değerler
        setProfileData({
          name: user?.name || 'Your Name',
          bio: 'Tell us about yourself...',
          location: '',
          website: '',
          birth_date: '',
          profile_image: null,
        });
      }
    } catch (error) {
      console.error('❌ localStorage read error:', error);
      setProfileData({
        name: user?.name || 'Your Name',
        bio: 'Tell us about yourself...',
        location: '',
        website: '',
        birth_date: '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      console.log('🚀 SAVE BUTTON CLICKED!');
      
      // Check if user is authenticated
      console.log('🔍 Profile Edit token check:', { 
        hasUser: !!user, 
        hasToken: !!user?.token, 
        token: user?.token?.substring(0, 20) + '...',
        userKeys: user ? Object.keys(user) : 'no user',
        fullUser: user
      });
      if (user?.token) {
        console.log('🌐 API MODE: Saving to backend...');
        
        // Create save data
        const dataToSave = {
          name: profileData.name || 'Your Name',
          bio: profileData.bio || 'Tell us about yourself...',
          location: profileData.location || '',
          website: profileData.website || '',
          birth_date: profileData.birth_date || '',
        };
        
        console.log('📊 Data to save:', {
          name: dataToSave.name,
          bio: dataToSave.bio
        });
        
        // Save to backend via API
        const response = await fetch(`${API_BASE_URL}/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ API save successful:', result);
          
          // Also save to localStorage for UI consistency
          const userKey = user?.id || user?.email || 'default';
          const dataToSave = {
            name: profileData.name || 'Your Name',
            bio: profileData.bio || 'Tell us about yourself...',
            location: profileData.location || '',
            website: profileData.website || '',
            birth_date: profileData.birth_date || '',
            profile_image: profileData.profile_image || null,
          };
          localStorage.setItem(`profile_data_${userKey}`, JSON.stringify(dataToSave));
          console.log('💾 Also saved to localStorage for UI consistency');
          
          Alert.alert('Success', 'Profile saved successfully!', [
            { text: 'OK', onPress: () => {
              console.log('📱 Alert OK pressed, navigating back...');
              router.back();
            }}
          ]);
        } else {
          throw new Error(`API save failed: ${response.status}`);
        }
      } else {
        console.log('💾 LOCAL MODE: Saving to localStorage...');
        
        // Create save data
        const dataToSave = {
          name: profileData.name || 'Your Name',
          bio: profileData.bio || 'Tell us about yourself...',
          location: profileData.location || '',
          website: profileData.website || '',
          birth_date: profileData.birth_date || '',
          profile_image: profileData.profile_image || null,
        };
        
        console.log('📊 Data to save:', {
          name: dataToSave.name,
          profile_image: dataToSave.profile_image ? 'IMAGE_DATA_READY' : 'NO_IMAGE'
        });
        
        // Save to localStorage
        const jsonString = JSON.stringify(dataToSave);
        const userKey = user?.id || user?.email || 'default';
        localStorage.setItem(`profile_data_${userKey}`, jsonString);
        console.log('✅ localStorage.setItem completed!');
        
        // Verify save
        const verification = localStorage.getItem(`profile_data_${userKey}`);
        console.log('🔍 Immediate verification:', verification ? 'DATA_FOUND' : 'NO_DATA');
        
        // Success message
        console.log('🎉 About to show success alert...');
        Alert.alert('Success', 'Profile saved successfully!', [
          { text: 'OK', onPress: () => {
            console.log('📱 Alert OK pressed, navigating back...');
            router.back();
          }}
        ]);
      }
      
    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
      Alert.alert('Error', 'Save failed: ' + String(error));
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
          {/* Glow Header */}
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.glowHeader}
          >
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>✨ Edit Profile</Text>
            
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                style={styles.profileCard}
              >
                <Text style={styles.sectionTitle}>📸 Profile Picture</Text>
                <ProfilePictureUpload
                  currentImageUrl={profileData.profile_image}
                  onUploadComplete={(imageUrl) => {
                    console.log('🖼️ PROFILE EDIT: onUploadComplete received imageUrl:', imageUrl?.substring(0, 50) + '...');
                    setProfileData(prev => ({ ...prev, profile_image: imageUrl }));
                  }}
                />
              </LinearGradient>
            </View>

            {/* Personal Info Section */}
            <View style={styles.section}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
                style={styles.sectionCard}
              >
                <Text style={styles.sectionTitle}>👤 Personal Information</Text>
                
                {/* Name */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Display Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.glowInput}
                      placeholder="Enter your display name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.name}
                      onChangeText={(value) => updateField('name', value)}
                      maxLength={50}
                    />
                  </View>
                </View>

                {/* Bio */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Bio</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.glowInput, styles.bioInput]}
                      placeholder="Tell us about yourself, your interests, or your ADHD journey..."
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.bio}
                      onChangeText={(value) => updateField('bio', value)}
                      multiline
                      maxLength={300}
                      textAlignVertical="top"
                    />
                  </View>
                  <Text style={styles.characterCount}>
                    {profileData.bio?.length || 0}/300
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Contact Info Section */}
            <View style={styles.section}>
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
                style={styles.sectionCard}
              >
                <Text style={styles.sectionTitle}>🌍 Contact & Location</Text>
                
                {/* Location */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="location-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.glowInput, styles.inputWithIcon]}
                      placeholder="City, Country"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.location}
                      onChangeText={(value) => updateField('location', value)}
                      maxLength={50}
                    />
                  </View>
                </View>

                {/* Website */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Website</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="link-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.glowInput, styles.inputWithIcon]}
                      placeholder="https://your-website.com"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.website}
                      onChangeText={(value) => updateField('website', value)}
                      keyboardType="url"
                      autoCapitalize="none"
                      maxLength={100}
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Privacy Section */}
            <View style={styles.section}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)']}
                style={styles.sectionCard}
              >
                <Text style={styles.sectionTitle}>🔒 Privacy Settings</Text>
                
                {/* Birth Date */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Birth Date (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="calendar-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.glowInput, styles.inputWithIcon]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.birth_date}
                      onChangeText={(value) => updateField('birth_date', value)}
                      maxLength={10}
                    />
                  </View>
                  <Text style={styles.helpText}>
                    🔐 Your age won't be shown publicly. Used for personalized content.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Footer */}
            <View style={styles.footerSection}>
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                style={styles.footerCard}
              >
                <Ionicons name="people-outline" size={24} color="#8B5CF6" />
                <Text style={styles.footerText}>
                  Your profile information helps connect you with like-minded community members and provides personalized ADHD resources.
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Glow Header
  glowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Profile Section
  profileSection: {
    marginBottom: 24,
  },
  profileCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
  },
  
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  
  // Field Styles
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  glowInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  helpText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  
  // Footer
  footerSection: {
    marginBottom: 24,
  },
  footerCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
  },
  footerText: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
  },
  bottomPadding: {
    height: 40,
  },
  
  // Loading State
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 16,
  },
});
