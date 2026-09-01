#!/bin/bash
# ==============================================================================
# TSAR IT BILLING - Production Deployment Script
# Domain: https://billing.tsaritservices.com
# Server: Ubuntu (72.62.228.102)
# ==============================================================================

set -e

DOMAIN="billing.tsaritservices.com"
EMAIL="tsaritservices@gmail.com"
APP_DIR="/opt/tsar-it-billing"
GIT_REPO="https://github.com/TSARIT1/TSAR-IT-BILLING.git"

echo "================================================================="
echo " Starting TSAR IT Billing Deployment for https://${DOMAIN}"
echo "================================================================="

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] Please run this script with root or sudo privileges: sudo bash $0"
  exit 1
fi

# 2. Update System Packages & Install Dependencies
echo "[1/6] Installing necessary packages (Docker, Nginx, Certbot)..."
apt-get update -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx

# Install Docker if missing
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose plugin if missing
if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get install -y docker-compose-plugin
fi

systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl start nginx

# 3. Setup or Update Application Repository
echo "[2/6] Setting up project directory at ${APP_DIR}..."
if [ -d "${APP_DIR}/.git" ]; then
    echo "Repository exists. Pulling latest changes..."
    cd "${APP_DIR}"
    git stash || true
    git pull origin main || git pull origin master
else
    echo "Cloning repository..."
    mkdir -p "${APP_DIR}"
    git clone "${GIT_REPO}" "${APP_DIR}"
    cd "${APP_DIR}"
fi

# Ensure .env.production exists in frontend
if [ ! -f "${APP_DIR}/frontend/.env.production" ]; then
    echo "Creating frontend/.env.production..."
    cat <<EOF > "${APP_DIR}/frontend/.env.production"
REACT_APP_API_URL=https://${DOMAIN}
REACT_APP_RAZORPAY_KEY_ID=rzp_live_TTc7Hc65XaxuNm
EOF
fi

# 4. Configure Host Nginx
echo "[3/6] Configuring Nginx reverse proxy for ${DOMAIN}..."

# Initial HTTP config to allow Certbot ACME challenge
cat <<EOF > /etc/nginx/sites-available/${DOMAIN}
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
nginx -t
systemctl reload nginx

# 5. Obtain / Configure SSL via Certbot
echo "[4/6] Checking SSL Certificate for ${DOMAIN}..."
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo "Obtaining Let's Encrypt SSL certificate..."
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect || {
        echo "[WARNING] Certbot automatic installation failed. Attempting standalone cert..."
        systemctl stop nginx
        certbot certonly --standalone -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" || true
        systemctl start nginx
    }
else
    echo "SSL Certificate already exists for ${DOMAIN}."
fi

# Apply full HTTPS Nginx config if certificate is present
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo "Applying optimized HTTPS Nginx configuration..."
    cat <<EOF > /etc/nginx/sites-available/${DOMAIN}
# HTTP Redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS Reverse Proxy
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }
}
EOF
    nginx -t
    systemctl reload nginx
fi

# 6. Build and Start Docker Containers
echo "[5/6] Building and starting Docker containers..."
cd "${APP_DIR}"
docker compose down || true
docker compose up -d --build

# 7. Verification
echo "[6/6] Verifying deployment..."
sleep 15
docker compose ps

echo "================================================================="
echo " DEPLOYMENT SUCCESSFUL!"
echo " TSAR IT Billing is now live at: https://${DOMAIN}"
echo " Frontend Container: http://127.0.0.1:3000"
echo " Backend Container:  http://127.0.0.1:8081"
echo " MySQL Container:    3306"
echo " Redis Container:    6379"
echo " Kafka Container:    9092"
echo "================================================================="
