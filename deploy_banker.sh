#!/bin/bash
# ==============================================================================
# SLOPANEL BANKER DEPLOYMENT SCRIPT
# ==============================================================================
# This script ensures the Next.js app is properly built before starting.

echo ">>> Starting Banker Portal Deployment..."

echo "[1/3] Installing dependencies..."
npm install

echo "[2/3] Building production assets (fixes 'Could not find a production build' error)..."
npm run build

echo "[3/3] Restarting PM2 process..."
# Check if pm2 is installed and running the app
if command -v pm2 &> /dev/null; then
    pm2 restart slopanel-banker || pm2 start npm --name "slopanel-banker" -- run start
    echo "SUCCESS: Banker Portal is now running via PM2."
else
    echo "WARNING: PM2 not found. Starting normally (this will block the terminal)..."
    npm run start
fi
