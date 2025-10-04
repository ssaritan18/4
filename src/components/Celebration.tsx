import React from "react";
import { Text, StyleSheet, Dimensions, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export function Celebration({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  React.useEffect(() => {
    if (!visible) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const timeout = setTimeout(() => {
      onDone();
    }, 1200);

    return () => {
      clearTimeout(timeout);
    };
  }, [visible, onDone]);

  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.card}>
        <Ionicons name="trophy" size={48} color="#FFE3A3" />
        <Text style={styles.title}>Great job!</Text>
        <Text style={styles.meta}>Task completed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: width * 0.7,
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 8 },
  meta: { color: "#bdbdbd", marginTop: 4 },
});