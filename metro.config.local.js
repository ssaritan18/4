const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Standard configuration for local development
// This works with current Expo SDK and Node versions

module.exports = config;