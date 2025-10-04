import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function WelcomeAuth() {
  const { signIn } = useAuth();

  const handleOfflineContinue = async () => {
    console.log("🔄 Offline continue clicked - signing in offline user");
    try {
      // Sign in with a default offline user
      await signIn({ name: "ADHD User", email: "offline@adhders.app" });
      console.log("✅ Offline sign in successful, redirecting to tabs");
      router.replace("/(tabs)/");
    } catch (error) {
      console.error("❌ Error signing in offline:", error);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#8B5CF6', '#A855F7']}
      style={styles.container}
    >
      {/* Glow Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.glowLogoWrapper}>
          <LinearGradient
            colors={['#F97316', '#EC4899', '#8B5CF6']}
            style={styles.logoBorder}
          >
            <Image 
              source={require("../../assets/images/perfect-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>
        <Text style={styles.glowTitle}>ADHDers Social Club</Text>
        <Text style={styles.glowSubtitle}>The app that helps neurodivergents thrive</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => router.push('/onboarding')}>
          <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.glowBtn}>
            <Text style={styles.glowBtnText}>🧠 Take ADHD Assessment</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <LinearGradient colors={['#EC4899', '#F97316']} style={styles.glowBtn}>
            <Text style={styles.glowBtnText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <LinearGradient colors={['#F97316', '#FBBF24']} style={styles.glowBtn}>
            <Text style={styles.glowBtnText}>Log In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.glowBtnGhost} onPress={handleOfflineContinue}>
          <Text style={styles.glowBtnGhostText}>Continue (offline)</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  glowLogoWrapper: {
    padding: 4,
    borderRadius: 70,
    marginBottom: 20,
  },
  logoBorder: {
    padding: 0,
    borderRadius: 60,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  logo: { 
    width: 120, 
    height: 120,
    borderRadius: 60,
  },
  glowTitle: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '900', 
    marginBottom: 8,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  glowSubtitle: { 
    color: '#E5E7EB', 
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonsContainer: { 
    width: '100%', 
    alignItems: 'center' 
  },
  glowBtn: { 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 16, 
    minWidth: 260, 
    alignItems: 'center', 
    marginTop: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  glowBtnText: { 
    color: '#fff', 
    fontWeight: '800',
    fontSize: 16,
  },
  glowBtnGhost: { 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 16, 
    minWidth: 260, 
    alignItems: 'center', 
    marginTop: 12, 
    borderWidth: 2, 
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  glowBtnGhostText: { 
    color: '#E5E7EB', 
    fontWeight: '700',
    fontSize: 16,
  },
});