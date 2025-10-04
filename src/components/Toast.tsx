import React from "react";
import { Text, StyleSheet, View } from "react-native";

export function Toast({ visible, text }: { visible: boolean; text: string }) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 100, left: 24, right: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 12, alignItems: 'center' },
  text: { color: '#000', fontWeight: '800' },
});