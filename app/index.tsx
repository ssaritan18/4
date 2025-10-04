import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Image } from "react-native";
import { router, useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { isAuthed, user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 Index auth state check:", { isAuthed, hasUser: !!user, hasToken: !!token, loading });
    
    // Navigation logic - wait for loading to complete
    if (!loading) {
      if (isAuthed && user) {
        console.log("✅ User authenticated, redirecting to tabs");
        router.replace("/(tabs)");
      } else {
        console.log("❌ User not authenticated, redirecting to welcome");
        router.replace("/(auth)/welcome");
      }
    } else {
      console.log("⏳ Still loading authentication state...");
    }
    
  }, [isAuthed, user, token, loading]); // Added loading to dependencies

  return (
    <View style={styles.container}>
      {/* Loading Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/perfect-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.text}>ADHDers Social Club</Text>
        <Text style={styles.subtext}>
          {isAuthed ? "Welcome back! 👋" : "Loading... 🚀"}
        </Text>
      </View>
      
      <ActivityIndicator 
        color="#A3C9FF" 
        size="large"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#0c0c0c",
    padding: 24
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.9
  },
  text: { 
    color: "#fff", 
    marginTop: 8, 
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center"
  },
  subtext: { 
    color: "#888", 
    marginTop: 4, 
    fontSize: 14, 
    fontStyle: "italic",
    textAlign: "center"
  },
  spinner: {
    marginTop: 20
  }
});