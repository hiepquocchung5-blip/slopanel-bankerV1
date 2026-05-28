#!/bin/bash
# ==============================================================================
# SLOPANEL BANKER DEPLOYMENT SCRIPT
# ==============================================================================
# This script ensures the Next.js app is properly built before starting.

echo ">>> Starting Banker Portal Deployment..."

echo "[0/3] Stopping PM2 and cleaning up port 6936..."
# Stop PM2 first so it doesn't try to restart while we are building
if command -v pm2 &> /dev/null; then
    pm2 stop slopanel-banker 2>/dev/null || true
fi

# Kill any process using port 6936 to prevent EADDRINUSE error
lsof -ti:6936 | xargs kill -9 2>/dev/null || true

echo "[1/3] Installing dependencies..."
npm install

echo "[2/3] Building production assets..."
npm run build

echo "[3/3] Restarting PM2 process..."
# Check if pm2 is installed and running the app
if command -v pm2 &> /dev/null; then
    pm2 start npm --name "slopanel-banker" -- run start || pm2 restart slopanel-banker
    echo "SUCCESS: Banker Portal is now running via PM2."
else
    echo "WARNING: PM2 not found. Starting normally (this will block the terminal)..."
    npm run start
fi
