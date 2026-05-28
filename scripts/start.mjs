#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process';

const port = String(process.env.PORT || 6937);
const host = process.env.HOST || '0.0.0.0';

/**
 * PRO-ACTIVE PORT CLEARANCE
 * As a senior dev, we ensure the environment is ready before binding.
 * This fixes the EADDRINUSE error common in aaPanel's Node manager.
 */
function clearPort(targetPort) {
  try {
    console.log(`[PRE-FLIGHT] Checking port ${targetPort}...`);
    // Find PID using the port (works on Linux/macOS)
    const pid = execSync(`lsof -t -i:${targetPort}`).toString().trim();
    if (pid) {
      console.log(`[PRE-FLIGHT] Port ${targetPort} is occupied by PID ${pid}. Clearing...`);
      execSync(`kill -9 ${pid}`);
      // Brief pause to allow OS to release the socket
      execSync('sleep 1');
    }
  } catch (e) {
    // execSync throws if no process is found, which is what we want (port is free)
    console.log(`[PRE-FLIGHT] Port ${targetPort} is clear.`);
  }
}

clearPort(port);

console.log(`[LAUNCH] Starting Next.js on ${host}:${port}...`);
const child = spawn(process.platform === 'win32' ? 'next.cmd' : 'next', ['start', '-p', port, '-H', host], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    HOST: host,
    NODE_ENV: 'production'
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
