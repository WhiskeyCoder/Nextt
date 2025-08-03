#!/bin/bash

echo "🚀 Starting Nextt in Docker container..."

# Start the backend server (which will also serve the frontend)
echo "📊 Starting backend server..."
node server/index.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
  if node -e "
    const http = require('http');
    const req = http.request('http://localhost:3001/api/health', {method: 'GET'}, (res) => {
      if (res.statusCode === 200) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    });
    req.on('error', () => process.exit(1));
    req.setTimeout(2000, () => process.exit(1));
    req.end();
  " > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  echo "⏳ Waiting for backend... (attempt $i/30)"
  sleep 2
done

echo "🎉 Nextt is running!"
echo "📊 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3001"

# Keep the script running
wait 
