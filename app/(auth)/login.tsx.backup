import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Alert, Switch } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_EMAIL_KEY = "@adhd_app_remembered_email";

export default function Login() {
  const { signIn, login, resetCredentials } = useAuth();
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
      Alert.alert("Geçersiz Email", "Lütfen geçerli bir email girin (örn: test@example.com)");
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
      
      if (password.trim().length > 0) {
        await login(email, password);
      } else {
        await signIn({ name, email });
      }
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Giriş Hatası", "Email/şifre kontrol edin ve tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  const submitMockGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn({ name: name || "Google User", email });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Giriş Hatası", "Google girişinde sorun oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async () => {
    await resetCredentials();
    Alert.alert("Sıfırlandı", "Tüm veriler sıfırlandı");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ADHDers Social Club</Text>
          <Text style={styles.subtitle}>Hoş geldiniz! Giriş yapın veya yeni hesap oluşturun</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: validEmail ? '#B8F1D9' : '#333' }]}
            placeholder="Email adresinizi girin"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Text style={styles.label}>İsim (İsteğe Bağlı)</Text>
          <TextInput
            style={styles.input}
            placeholder="Adınızı girin"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          <Text style={styles.label}>Şifre (Varsa)</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi girin"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {/* Remember Me */}
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: '#333', true: '#B8F1D9' }}
              thumbColor={rememberMe ? '#000' : '#666'}
            />
            <Text style={styles.rememberText}>Email adresimi hatırla</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, { opacity: validEmail && !isLoading ? 1 : 0.5 }]} 
            onPress={submit}
            disabled={!validEmail || isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitText}>Giriş yapılıyor...</Text>
            ) : (
              <Text style={styles.submitText}>
                {password ? 'Giriş Yap' : 'Hızlı Giriş'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Alternative Actions */}
          <View style={styles.alternativeActions}>
            <TouchableOpacity 
              style={[styles.altBtn, { backgroundColor: '#FFE3A3' }]} 
              onPress={submitMockGoogle}
              disabled={!validEmail || isLoading}
            >
              <Ionicons name="logo-google" size={16} color="#000" />
              <Text style={styles.altBtnText}>Google ile Giriş</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.altBtn, { backgroundColor: '#FFCFE1' }]} 
              onPress={reset}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={16} color="#000" />
              <Text style={styles.altBtnText}>Verileri Sıfırla</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.linkText}>Hesabınız yok mu? Kaydolun</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-pin")}>
              <Text style={styles.linkText}>Şifremi Unuttum</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0c0c0c',
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '800', 
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    color: '#A3C9FF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  form: {
    paddingHorizontal: 24,
  },
  label: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8, 
    marginTop: 16 
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 15,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  rememberText: {
    color: '#A3C9FF',
    fontSize: 14,
    marginLeft: 12,
  },
  submitBtn: { 
    backgroundColor: '#B8F1D9', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
  },
  submitText: { 
    color: '#000', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  alternativeActions: {
    marginTop: 16,
    gap: 12,
  },
  altBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  altBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  navigation: {
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  linkText: {
    color: '#A3C9FF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});