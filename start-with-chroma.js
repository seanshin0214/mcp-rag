#!/usr/bin/env node

/**
 * MCP-RAG Wrapper Script
 * Automatically starts ChromaDB before starting MCP-RAG server
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

const CHROMA_URL = 'http://localhost:8000';
const MAX_RETRIES = 10;
const RETRY_DELAY = 1000; // 1 second

/**
 * Check if ChromaDB is running
 */
async function isChromaRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${CHROMA_URL}/api/v2/heartbeat`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Wait for ChromaDB to be ready
 */
async function waitForChroma(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    if (await isChromaRunning()) {
      console.error('✅ ChromaDB is ready');
      return true;
    }
    if (i === 0) {
      console.error('⏳ Waiting for ChromaDB to start...');
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }
  return false;
}

/**
 * Start ChromaDB server
 */
function startChromaDB() {
  return new Promise((resolve, reject) => {
    console.error('🚀 Starting ChromaDB server...');

    const chromaProcess = spawn('chroma', ['run', '--host', 'localhost', '--port', '8000'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      windowsHide: true
    });

    chromaProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Listening on')) {
        console.error('✅ ChromaDB server started');
        resolve(chromaProcess);
      }
    });

    chromaProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Ignore OpenTelemetry warning
      if (!output.includes('OpenTelemetry')) {
        console.error(`ChromaDB: ${output.trim()}`);
      }
      if (output.includes('Listening on')) {
        resolve(chromaProcess);
      }
    });

    chromaProcess.on('error', (error) => {
      console.error('❌ Failed to start ChromaDB:', error.message);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => resolve(chromaProcess), 10000);
  });
}

/**
 * Start MCP-RAG server
 */
function startMCPServer() {
  const mcpProcess = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  mcpProcess.on('error', (error) => {
    console.error('❌ MCP-RAG server error:', error.message);
    process.exit(1);
  });

  return mcpProcess;
}

/**
 * Main
 */
async function main() {
  console.error('🎯 MCP-RAG + ChromaDB Auto-Starter');
  console.error('');

  // Check if ChromaDB is already running
  if (await isChromaRunning()) {
    console.error('✅ ChromaDB is already running');
  } else {
    // Start ChromaDB
    const chromaProcess = await startChromaDB();

    // Wait for ChromaDB to be ready
    const isReady = await waitForChroma();
    if (!isReady) {
      console.error('❌ ChromaDB failed to start within timeout');
      console.error('💡 Please start ChromaDB manually:');
      console.error('   chroma run --host localhost --port 8000');
      process.exit(1);
    }

    // Clean up ChromaDB on exit
    process.on('exit', () => {
      if (chromaProcess && !chromaProcess.killed) {
        chromaProcess.kill();
      }
    });

    process.on('SIGINT', () => {
      if (chromaProcess && !chromaProcess.killed) {
        chromaProcess.kill();
      }
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      if (chromaProcess && !chromaProcess.killed) {
        chromaProcess.kill();
      }
      process.exit(0);
    });
  }

  // Start MCP-RAG server
  console.error('');
  const mcpProcess = startMCPServer();

  // Keep process alive
  process.on('SIGINT', () => {
    if (mcpProcess && !mcpProcess.killed) {
      mcpProcess.kill();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    if (mcpProcess && !mcpProcess.killed) {
      mcpProcess.kill();
    }
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
