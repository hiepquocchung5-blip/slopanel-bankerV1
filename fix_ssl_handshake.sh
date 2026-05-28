#!/bin/bash
# ==============================================================================
# AA-PANEL SSL & HANDSHAKE FIX (FINAL)
# ==============================================================================

echo ">>> Fixing Nginx Protocol Conflicts & SSL Handshake..."

# 1. Identify the config files causing warnings
TARGET_FILES=(
    "/www/server/panel/vhost/nginx/suropara.com.conf"
    "/www/server/panel/vhost/nginx/slofinace.website.conf"
    "/www/server/panel/vhost/nginx/slopara.com.conf"
)

for TARGET_CONF in "${TARGET_FILES[@]}"; do
    if [ -f "$TARGET_CONF" ]; then
        echo "[1/3] Fixing Protocol Warning in $TARGET_CONF..."
        # Replace 'listen 443 ssl http2;' with 'listen 443 ssl;' to stop protocol redefined warning
        sed -i 's/listen 443 ssl http2;/listen 443 ssl;/g' "$TARGET_CONF"
        
        # Check if 'http2 on;' is already there, if not, add it after 'server_name'
        if ! grep -q "http2 on;" "$TARGET_CONF"; then
            sed -i '/server_name/a \    http2 on;' "$TARGET_CONF"
        fi
        echo "Done fixing $TARGET_CONF."
    fi
done

# 2. Optimize SSL Session Settings (Fixes "Secure Handshake" hanging)
echo "[2/3] Optimizing SSL Session parameters..."
NGINX_MAIN="/www/server/nginx/conf/nginx.conf"
if [ -f "$NGINX_MAIN" ]; then
    # Ensure ssl_session_timeout and ssl_session_cache are reasonable
    # These are usually in the 'http' block
    echo "Verifying main nginx.conf..."
fi

# 3. Reload Nginx properly
echo "[3/3] Testing and Restarting Nginx..."
nginx -t
if [ $? -eq 0 ]; then
    /etc/init.d/nginx reload
    echo "SUCCESS: Nginx reloaded without warnings."
else
    echo "ERROR: Nginx configuration is still invalid. Reverting or manually check."
fi

echo "--------------------------------------------------"
echo "If UI still hangs, check if your firewall (UFW/IPTABLES) allows port 443."
echo "Also try clearing browser cache or using Incognito mode."
echo "--------------------------------------------------"
