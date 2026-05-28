#!/usr/bin/env node

import { spawn } from 'node:child_process';

const port = String(process.env.PORT || 6936);
const host = process.env.HOST || '0.0.0.0';

const child = spawn(process.platform === 'win32' ? 'next.cmd' : 'next', ['start', '-p', port], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
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
