#!/bin/bash
# ==============================================================================
# SLOPANEL PORT & SSL REPAIR SCRIPT (aaPanel)
# ==============================================================================

echo ">>> Starting Professional Repair for slopanel-banker..."

# 1. Clear Port 6936
echo "[1/4] Clearing port 6936..."
PID=$(lsof -t -i:6936)
if [ -n "$PID" ]; then
    echo "Found process $PID on port 6936. Killing it..."
    kill -9 $PID
    sleep 2
else
    echo "Port 6936 is already free."
fi

# 2. Fix potential Nginx hanging
echo "[2/4] Checking for hanging Nginx processes..."
if pgrep nginx > /dev/null; then
    echo "Nginx is running. Testing configuration..."
    nginx -t && echo "Nginx config is OK." || echo "WARNING: Nginx config has errors!"
fi

# 3. Clean Next.js Cache
echo "[3/4] Cleaning build cache..."
cd "$(dirname "$0")"
rm -rf .next

# 4. Rebuild and Start
echo "[4/4] Rebuilding application..."
npm run build

echo "--------------------------------------------------"
echo "FIX COMPLETE: You can now start the project in aaPanel."
echo "If you still get EADDRINUSE, run: 'lsof -ti:6936 | xargs kill -9'"
echo "--------------------------------------------------"
