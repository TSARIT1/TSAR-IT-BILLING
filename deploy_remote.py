import paramiko
import os
import time

SERVER_IP = "72.62.228.102"
USER = "root"
PASS = "Tsarit@12345"
REMOTE_DIR = "/var/www/billing"
BACKEND_PORT = 8088

def run_cmd(ssh, cmd, ignore_error=False):
    print(f"\n[RUN] {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(f"[OUT] {out}")
    if err and not ignore_error:
        print(f"[ERR] {err}")
    if exit_status != 0 and not ignore_error:
        raise Exception(f"Command failed with exit code {exit_status}: {cmd}\n{err}")
    return out

def main():
    print("Connecting to server...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_IP, port=22, username=USER, password=PASS, timeout=15)
    print("Connected successfully to", SERVER_IP)

    # 1. Setup MySQL database
    run_cmd(ssh, "mysql -u root -p'Tsarit@12345' -e \"CREATE DATABASE IF NOT EXISTS billing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"")
    print("MySQL database billing_db is ready.")

    # 2. Setup directory structure
    run_cmd(ssh, f"mkdir -p {REMOTE_DIR}/backend {REMOTE_DIR}/frontend")

    # 3. Setup systemd service for backend
    systemd_unit = f"""[Unit]
Description=TSAR IT Billing Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory={REMOTE_DIR}/backend
ExecStart=/usr/bin/java -Dserver.port={BACKEND_PORT} -Dspring.datasource.url=jdbc:mysql://localhost:3306/billing_db?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC -Dspring.datasource.username=root -Dspring.datasource.password=Tsarit@12345 -Dspring.jpa.hibernate.ddl-auto=update -jar {REMOTE_DIR}/backend/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
    sftp = ssh.open_sftp()
    with sftp.file("/etc/systemd/system/tsar-billing.service", "w") as f:
        f.write(systemd_unit)
    print("Created systemd service /etc/systemd/system/tsar-billing.service")

    # 4. Setup host Nginx configuration for billing.tsaritservices.com
    nginx_conf = f"""server {{
    server_name billing.tsaritservices.com;

    root {REMOTE_DIR}/frontend/build;
    index index.html index.htm;

    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # WhatsApp Business Hub API & OTP
    location /api/whatsapp/ {{
        proxy_pass http://127.0.0.1:9050/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location /api/ {{
        proxy_pass http://127.0.0.1:{BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }}

    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate /etc/letsencrypt/live/billing.tsaritservices.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/billing.tsaritservices.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}}

server {{
    if ($host = billing.tsaritservices.com) {{
        return 301 https://$host$request_uri;
    }}
    listen 80;
    listen [::]:80;
    server_name billing.tsaritservices.com;
    return 404;
}}
"""
    with sftp.file("/etc/nginx/sites-available/billing.tsaritservices.com", "w") as f:
        f.write(nginx_conf)
    print("Replaced /etc/nginx/sites-available/billing.tsaritservices.com with live Billing config.")

    # Enable site link
    run_cmd(ssh, "ln -sf /etc/nginx/sites-available/billing.tsaritservices.com /etc/nginx/sites-enabled/billing.tsaritservices.com")
    run_cmd(ssh, "nginx -t")
    run_cmd(ssh, "systemctl reload nginx")
    print("Nginx tested and reloaded successfully.")

    sftp.close()
    ssh.close()
    print("\nInitial server configuration completed!")

if __name__ == "__main__":
    main()
