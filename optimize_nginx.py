import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

conf = """server {
    server_name billing.tsaritservices.com;

    root /var/www/billing/frontend/build;
    index index.html index.htm;

    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # WhatsApp Business Hub API & OTP
    location /api/whatsapp/ {
        proxy_pass http://127.0.0.1:9050/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8088/api/;
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
    }

    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate /etc/letsencrypt/live/billing.tsaritservices.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/billing.tsaritservices.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = billing.tsaritservices.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    listen [::]:80;
    server_name billing.tsaritservices.com;
    return 404;
}
"""

sftp = ssh.open_sftp()
with sftp.file("/etc/nginx/sites-available/billing.tsaritservices.com", "w") as f:
    f.write(conf)
sftp.close()

sin, sout, serr = ssh.exec_command("nginx -t && systemctl reload nginx")
print("OUT:", sout.read().decode())
print("ERR:", serr.read().decode())
ssh.close()
print("Optimized Nginx deployed.")
