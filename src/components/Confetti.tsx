import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const COLORS = ["#A3C9FF", "#FFCFE1", "#B8F1D9", "#FFE3A3", "#FFB3BA"];

function Piece({ idx }: { idx: number }) {
  const x = (idx / 16) * width;

  return (
    <View
      style={[
        styles.piece,
        { left: x, backgroundColor: COLORS[idx % COLORS.length] },
      ]}
    />
  );
}

export function Confetti({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: 16 }, (_, i) => (
        <Piece key={i} idx={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  piece: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});