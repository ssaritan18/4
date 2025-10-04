#!/bin/bash

echo "🐳 Starting React app in container-optimized mode..."

# Set environment variables for polling
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=1000
export EXPO_USE_POLLING=true
export WDS_SOCKET_PORT=0
export FAST_REFRESH=true

# Kill any existing processes
pkill -f "expo\|metro\|node.*3000" 2>/dev/null || true

# Clean cache to avoid issues
echo "🧹 Cleaning cache..."
rm -rf .expo node_modules/.cache .metro-cache

# Check available memory and adjust accordingly
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
echo "💾 Available memory: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 1000 ]; then
    echo "⚠️  Low memory detected, using minimal configuration"
    export NODE_OPTIONS="--max-old-space-size=512"
    export EXPO_MAX_WORKERS=1
else
    export NODE_OPTIONS="--max-old-space-size=1024"
    export EXPO_MAX_WORKERS=2
fi

# Start with specific container-optimized flags
echo "🚀 Starting Expo development server..."
npx expo start \
    --web \
    --port 3000 \
    --host 0.0.0.0 \
    --non-interactive \
    --max-workers 1 \
    --clear \
    --no-dev-client

echo "✅ Server should be available at http://localhost:3000"