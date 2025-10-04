import React from "react";
import { ExpoRoot } from "expo-router";
process.env.EXPO_ROUTER_APP_ROOT = "./frontend/app";
export default function App() {
  const ctx = require.context("./frontend/app");
  return <ExpoRoot context={ctx} />;
}
