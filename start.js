#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Nextt - Plex-Powered Recommendation Dashboard');
console.log('================================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project directory.');
  process.exit(1);
}

// Function to run commands
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Function to check if a port is in use
function isPortInUse(port) {
  try {
    execSync(`netstat -an | grep :${port} | grep LISTEN`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      console.error('❌ Error: Node.js 18 or higher is required. Current version:', nodeVersion);
      console.log('Please upgrade Node.js from https://nodejs.org/');
      process.exit(1);
    }
    
    console.log(`✅ Node.js version: ${nodeVersion}`);

    // Check if dependencies are installed
    if (!fs.existsSync('node_modules')) {
      console.log('\n📦 Installing dependencies...');
      await runCommand('npm', ['install']);
      console.log('✅ Dependencies installed successfully');
    } else {
      console.log('✅ Dependencies already installed');
    }

    // Check if ports are available
    const backendPort = 3001;
    const frontendPort = 5173;

    if (isPortInUse(backendPort)) {
      console.warn(`⚠️  Warning: Port ${backendPort} is already in use. The backend server may not start properly.`);
    }

    if (isPortInUse(frontendPort)) {
      console.warn(`⚠️  Warning: Port ${frontendPort} is already in use. The frontend server may not start properly.`);
    }

    console.log('\n🎯 Starting Nextt...');
    console.log('📊 Backend will run on: http://localhost:3001');
    console.log('🌐 Frontend will run on: http://localhost:5173');
    console.log('\n⏳ Starting servers...\n');

    // Start both servers using the existing npm script
    await runCommand('npm', ['run', 'dev:full']);

  } catch (error) {
    console.error('\n❌ Error starting Nextt:', error.message);
    
    if (error.message.includes('EADDRINUSE')) {
      console.log('\n💡 Solution: Try stopping other services using ports 3001 or 5173');
      console.log('   Or modify the ports in the configuration files.');
    }
    
    if (error.message.includes('ENOENT')) {
      console.log('\n💡 Solution: Make sure you have Node.js and npm installed correctly.');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Nextt...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down Nextt...');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 