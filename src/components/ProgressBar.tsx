import React from "react";
import { View, StyleSheet } from "react-native";

export function ProgressBar({ progress, color = "#7C9EFF", height = 12 }: { progress: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height }]}> 
      <View style={[styles.fill, { width: `${(pct * 100).toFixed(0)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", backgroundColor: "#222", borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%" },
});