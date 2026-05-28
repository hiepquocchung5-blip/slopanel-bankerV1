#!/usr/bin/env node

import { execFileSync, spawn } from 'node:child_process';

const preferredPort = Number(process.env.PORT || 6936);
const host = process.env.HOST || '127.0.0.1';
const portScanLimit = Number(process.env.START_PORT_SCAN_LIMIT || 25);

function isPortFree(port) {
  try {
    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.trim().length === 0;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 1) {
      return true;
    }
    return false;
  }
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + portScanLimit; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(`No free port found in range ${startPort}-${startPort + portScanLimit - 1}`);
}

const port = await findAvailablePort(preferredPort);

if (port !== preferredPort) {
  console.log(`[start] Port ${preferredPort} is busy, using ${port} instead.`);
}

const child = spawn(process.platform === 'win32' ? 'next.cmd' : 'next', ['start', '-p', String(port)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
    HOST: host,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
