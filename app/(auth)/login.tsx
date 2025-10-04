import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Alert, Switch } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "../../src/context/AuthContext";
// Google Sign-In only for mobile platforms - Web'de tamamen devre dışı
let GoogleSigninButton: any = null;
if (Platform.OS !== 'web') {
  try {
    const GoogleSignIn = require('@react-native-google-signin/google-signin');
    GoogleSigninButton = GoogleSignIn.GoogleSigninButton;
  } catch (error) {
    console.log('Google Sign-In not available on this platform');
  }
} else {
  // Web'de Google Sign-In tamamen devre dışı
  GoogleSigninButton = () => null;
}
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_EMAIL_KEY = "@adhd_app_remembered_email";

export default function Login() {
  const { signIn, login, loginWithGoogle, resetCredentials } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validEmail = useMemo(() => emailRegex.test(email.trim()), [email]);

  // Load saved email on component mount
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Failed to load saved email:", error);
      }
    };
    loadSavedEmail();
  }, []);

  const submit = async () => {
    if (!validEmail) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Save email if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      // Use login() method which handles token storage
      await login(email.trim(), password.trim());
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Please check your credentials and try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push({ pathname: '/(auth)/forgot-password', params: { email } });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Google Sign-In error:', error);
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCredentials = async () => {
    try {
      await resetCredentials();
      Alert.alert("Success", "Credentials reset successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to reset credentials");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#8B5CF6', '#A855F7']}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.glowTitle}>Welcome back</Text>
        <Text style={styles.glowSubtitle}>Sign in to your account</Text>

        <View style={styles.glowInputBox}>
          <Text style={styles.glowLabel}>Email</Text>
          <TextInput 
            style={styles.glowInput} 
            placeholder="jane@example.com" 
            placeholderTextColor="#B9B9B9" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            autoCorrect={false} 
            value={email} 
            onChangeText={setEmail} 
            returnKeyType="next" 
          />
        </View>

        <View style={styles.glowInputBox}>
          <Text style={styles.glowLabel}>Name</Text>
          <TextInput 
            style={styles.glowInput} 
            placeholder="Your display name" 
            placeholderTextColor="#B9B9B9" 
            value={name} 
            onChangeText={setName} 
            returnKeyType="next" 
          />
        </View>

        <View style={styles.glowInputBox}>
          <Text style={styles.glowLabel}>PIN/Password</Text>
          <TextInput 
            style={styles.glowInput} 
            placeholder="••••" 
            placeholderTextColor="#B9B9B9" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
            returnKeyType="done" 
            onSubmitEditing={submit} 
          />
        </View>

        <View style={styles.glowRememberRow}>
          <Text style={styles.glowRememberText}>Remember email</Text>
          <Switch 
            value={rememberMe} 
            onValueChange={setRememberMe}
            trackColor={{false: '#333', true: '#8B5CF6'}}
            thumbColor={rememberMe ? '#EC4899' : '#B9B9B9'}
          />
        </View>

        <TouchableOpacity onPress={submit} disabled={!validEmail || isLoading}>
          <LinearGradient 
            colors={(!validEmail || isLoading) ? ['#666', '#555'] : ['#8B5CF6', '#A855F7']} 
            style={styles.glowBtn}
          >
            <Text style={styles.glowBtnText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.glowLinkBtn} onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.glowLinkText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Divider - Only show on mobile */}
        {Platform.OS !== 'web' && (
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        {/* Google Sign-In Button - Only show on mobile */}
        {Platform.OS !== 'web' && (
          <View style={styles.googleSignInContainer}>
            <GoogleSigninButton
              style={styles.googleSignInButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            />
          </View>
        )}

        <TouchableOpacity style={styles.glowBackBtn} onPress={() => router.back()}>
          <Text style={styles.glowBackText}>Back to Welcome</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.glowResetBtn} onPress={handleResetCredentials}>
          <Ionicons name="refresh" size={16} color="#F97316" />
          <Text style={styles.glowResetText}>Reset Credentials</Text>
        </TouchableOpacity>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 24 
  },
  glowTitle: { 
    color: "#fff", 
    fontSize: 28, 
    fontWeight: "900", 
    marginBottom: 8,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  glowSubtitle: { 
    color: "#E5E7EB", 
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  glowInputBox: { 
    width: "100%", 
    maxWidth: 360, 
    marginBottom: 16 
  },
  glowLabel: { 
    color: "#E5E7EB", 
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  glowInput: { 
    backgroundColor: "rgba(255, 255, 255, 0.1)", 
    color: "#fff", 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    borderWidth: 1, 
    borderColor: "rgba(139, 92, 246, 0.3)",
    fontSize: 16,
  },
  glowRememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 360,
    marginBottom: 24,
  },
  glowRememberText: {
    color: '#E5E7EB',
    fontSize: 16,
  },
  glowBtn: { 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 16, 
    minWidth: 260, 
    alignItems: "center", 
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  glowBtnText: { 
    color: "#fff", 
    fontWeight: "800",
    fontSize: 16,
  },
  glowLinkBtn: {
    marginTop: 16,
    padding: 8,
  },
  glowLinkText: {
    color: '#EC4899',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  glowBackBtn: { 
    backgroundColor: "transparent", 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 16, 
    minWidth: 260, 
    alignItems: "center", 
    marginTop: 16, 
    borderWidth: 2, 
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  glowBackText: { 
    color: "#E5E7EB", 
    fontWeight: "600",
    fontSize: 16,
  },
  glowResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  glowResetText: {
    color: '#F97316',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  googleSignInContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  googleSignInButton: {
    width: 260,
    height: 48,
  },
});