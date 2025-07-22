#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Nextt - Plex-Powered Recommendation Dashboard');
console.log('================================================\n');

console.log('🎯 Starting Nextt...');
console.log('📊 Backend will run on: http://localhost:3001');
console.log('🌐 Frontend will run on: http://localhost:5173');
console.log('\n⏳ Starting servers...\n');

// Start both servers using npm
const child = spawn('npm', ['run', 'dev:full'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Servers exited with code ${code}`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('\n❌ Error starting servers:', error.message);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Nextt...');
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down Nextt...');
  child.kill('SIGTERM');
  process.exit(0);
}); 