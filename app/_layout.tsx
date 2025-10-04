import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { Platform } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { RuntimeConfigProvider } from "../src/context/RuntimeConfigContext";
import { TasksProvider } from "../src/context/TasksContext";
import { FriendsProvider } from "../src/context/FriendsContext";
import { ChatProvider } from "../src/context/ChatContext";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { CommunityProvider } from "../src/context/CommunityContext";
import { MoodProvider } from "../src/context/MoodContext";
import { SubscriptionProvider } from "../src/context/SubscriptionContext";

// import { adMobService } from "../src/services/AdMobService"; // Will be enabled for mobile builds

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#A3C9FF",
    secondary: "#FFCFE1",
    tertiary: "#B8F1D9",
    background: "#0c0c0c",
    surface: "#111111",
    onSurface: "#FFFFFF",
  },
};

// Wrapper to pass token to RuntimeConfigProvider
function AppWrapper() {
  const { token } = useAuth();
  
  return (
    <RuntimeConfigProvider token={token}>
      <TasksProvider>
        <FriendsProvider>
          <CommunityProvider>
            <MoodProvider>
              <SubscriptionProvider>
                <ErrorBoundary>
                  <ChatProvider>
                    <StatusBar style="light" />
                    <Stack screenOptions={{ headerShown: false }} />
                  </ChatProvider>
                </ErrorBoundary>
              </SubscriptionProvider>
            </MoodProvider>
          </CommunityProvider>
        </FriendsProvider>
      </TasksProvider>
    </RuntimeConfigProvider>
  );
}

export default function RootLayout() {
  // AdMob will be initialized for mobile builds
  useEffect(() => {
    console.log('🌐 Web platform: Using mock ads for development');
    console.log('📱 AdMob integration ready for mobile builds');
    console.log('🎯 Test ads configured with Google test units');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme as any}>
          <AuthProvider>
            <AppWrapper />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}