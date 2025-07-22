#!/bin/bash

echo "🚀 Nextt - Plex-Powered Recommendation Dashboard"
echo "================================================"
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project directory."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if ports are available
BACKEND_PORT=3001
FRONTEND_PORT=5173

if netstat -an 2>/dev/null | grep -q ":$BACKEND_PORT.*LISTEN"; then
    echo "⚠️  Warning: Port $BACKEND_PORT is already in use. The backend server may not start properly."
fi

if netstat -an 2>/dev/null | grep -q ":$FRONTEND_PORT.*LISTEN"; then
    echo "⚠️  Warning: Port $FRONTEND_PORT is already in use. The frontend server may not start properly."
fi

echo
echo "🎯 Starting Nextt..."
echo "📊 Backend will run on: http://localhost:$BACKEND_PORT"
echo "🌐 Frontend will run on: http://localhost:$FRONTEND_PORT"
echo
echo "⏳ Starting servers..."
echo

# Start both servers
npm run dev:full 