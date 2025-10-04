const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 1;

// Use polling instead of file watchers to avoid ENOSPC errors
config.watchFolders = [];
config.resolver = {
  ...config.resolver,
  useWatchman: false,
};

// Configure transformer for better compatibility
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config;
