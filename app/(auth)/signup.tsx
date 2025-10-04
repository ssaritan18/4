import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Alert, Linking } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "../../src/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { register } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (params?.email && typeof params.email === 'string') setEmail(params.email);
  }, [params?.email]);

  const valid = useMemo(() => 
    emailRegex.test(email.trim()) && 
    name.trim().length >= 2 && 
    password.trim().length >= 4 &&
    acceptedTerms, 
  [email, name, password, acceptedTerms]);

  const submit = async () => {
    if (!valid) {
      if (!acceptedTerms) {
        Alert.alert("Terms Required", "Please accept the Terms of Service and Privacy Policy to continue.");
        return;
      }
      Alert.alert("Invalid Input", "Please fill all fields:\n• Valid email\n• Name (min 2 chars)\n• PIN/Password (min 4 chars)\n• Accept Terms & Privacy Policy");
      return;
    }
    await register(name.trim(), email.trim(), password.trim());
    router.replace("/(tabs)");
  };

  const openPrivacyPolicy = async () => {
    try {
      const url = 'https://www.termsfeed.com/live/ff0b3892-d10c-4a4a-b614-4a9b608105bd';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: Navigate to in-app privacy policy
        router.push('/privacy-policy');
      }
    } catch (error) {
      console.error('Error opening Privacy Policy:', error);
      Alert.alert('Error', 'Could not open Privacy Policy. Please try again.');
    }
  };

  const openTermsOfService = async () => {
    try {
      const url = 'https://termify.io/terms-and-conditions/CxQOmpYFyR';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        router.push('/privacy-policy');
      }
    } catch (error) {
      console.error('Error opening Terms of Service:', error);
      Alert.alert('Error', 'Could not open Terms of Service. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#8B5CF6', '#A855F7']}
        style={styles.container}
      >
        <Text style={styles.glowTitle}>Create your account</Text>
        <Text style={styles.glowSubtitle}>Join ADHDers Social Club and connect with the community.</Text>

        <View style={styles.glowInputBox}>
          <Text style={styles.glowLabel}>Name</Text>
          <TextInput style={styles.glowInput} placeholder="Jane" placeholderTextColor="#B9B9B9" value={name} onChangeText={setName} returnKeyType="next" />
        </View>
        <View style={styles.glowInputBox}>
          <Text style={styles.glowLabel}>Email</Text>
          <TextInput style={styles.glowInput} placeholder="jane@example.com" placeholderTextColor="#B9B9B9" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} returnKeyType="next" />
        </View>
        <View style={styles.glowInputBox}>
          <Text style={styles.glowLabel}>PIN/Password</Text>
          <TextInput style={styles.glowInput} placeholder="••••" placeholderTextColor="#B9B9B9" secureTextEntry value={password} onChangeText={setPassword} returnKeyType="done" onSubmitEditing={submit} />
        </View>

        {/* Terms and Privacy Policy Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.termsTextContainer}>
            <Text style={styles.termsText}>I agree to the </Text>
            <TouchableOpacity onPress={openTermsOfService}>
              <Text style={styles.termsLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> and </Text>
            <TouchableOpacity onPress={openPrivacyPolicy}>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={submit} disabled={!valid}>
          <LinearGradient colors={!valid ? ['#666', '#555'] : ['#EC4899', '#F97316']} style={styles.glowBtn}>
            <Text style={styles.glowBtnText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.glowBackBtn} onPress={() => router.back()}>
          <Text style={styles.glowBackText}>Back to Welcome</Text>
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
    paddingHorizontal: 20,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
    maxWidth: 360,
    width: '100%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    color: '#FFFFFF',  // Pure white for better contrast
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',  // Slightly bolder for readability
  },
  termsLink: {
    color: '#FFD700',  // Gold color for better visibility on purple
    fontSize: 14,
    fontWeight: '700',  // Bold for emphasis
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
  glowBtn: { 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 16, 
    minWidth: 260, 
    alignItems: "center", 
    marginTop: 24,
    shadowColor: '#EC4899',
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
});