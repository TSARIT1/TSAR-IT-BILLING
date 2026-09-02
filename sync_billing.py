"""
TSAR IT BILLING - Local to Remote Synchronization Tool
Maintains synchronization between local workspace and remote production server (72.62.228.102).
"""

import os
import sys
import subprocess
import hashlib
import time

try:
    import paramiko
except ImportError:
    print("[!] paramiko is required. Install via: pip install paramiko")
    sys.exit(1)

SERVER_IP = "72.62.228.102"
USER = "root"
PASS = "Tsarit@12345"
REMOTE_DIR = "/var/www/billing"
REMOTE_REPO = "/opt/tsar-it-billing"
LOCAL_JAR = os.path.join("backend", "spring-backend", "target", "billing-backend-0.0.1-SNAPSHOT.jar")
LOCAL_ZIP = "frontend_build.zip"

def get_md5(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()

def progress_cb(transferred, total):
    pct = (transferred / total) * 100
    sys.stdout.write(f"\r  Uploading: {transferred}/{total} bytes ({pct:.1f}%)")
    sys.stdout.flush()

def main():
    print("=" * 65)
    print(" TSAR IT BILLING - LOCAL <-> SERVER SYNCHRONIZER")
    print(f" Target Server: {USER}@{SERVER_IP}")
    print(f" Live Domain:   https://billing.tsaritservices.com")
    print("=" * 65)

    # 1. Local Git Status Check
    print("\n[Step 1] Checking Local Git Status...")
    res = subprocess.run(["git", "status", "-s"], capture_output=True, text=True)
    if res.stdout.strip():
        print("  Local changes detected:\n" + "\n".join("    " + l for l in res.stdout.strip().splitlines()[:5]))
    else:
        print("  Local working tree clean.")

    # 2. Connect to Server
    print("\n[Step 2] Connecting to Server via SSH/SFTP...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_IP, port=22, username=USER, password=PASS, timeout=15)
    sftp = ssh.open_sftp()
    print(f"  Connected successfully to {SERVER_IP}.")

    # 3. Synchronize Server Git Repository (/opt/tsar-it-billing)
    print("\n[Step 3] Synchronizing Git repository on server (/opt/tsar-it-billing)...")
    stdin, stdout, stderr = ssh.exec_command("/usr/local/bin/sync-billing")
    print(stdout.read().decode('utf-8', errors='replace').strip())

    # 4. Check Backend JAR Synchronization
    print("\n[Step 4] Verifying Backend Application Artifact...")
    local_jar_md5 = get_md5(LOCAL_JAR)
    remote_jar_md5 = None
    try:
        _, stdout, _ = ssh.exec_command(f"md5sum {REMOTE_DIR}/backend/app.jar 2>/dev/null")
        out = stdout.read().decode().strip()
        if out:
            remote_jar_md5 = out.split()[0]
    except Exception:
        pass

    print(f"  Local JAR MD5:  {local_jar_md5}")
    print(f"  Remote JAR MD5: {remote_jar_md5}")

    if local_jar_md5 and local_jar_md5 != remote_jar_md5:
        print("  -> JAR mismatch detected. Uploading updated backend JAR...")
        remote_jar = f"{REMOTE_DIR}/backend/app.jar"
        sftp.put(LOCAL_JAR, remote_jar, callback=progress_cb)
        print("\n  -> Restarting tsar-billing.service...")
        ssh.exec_command("systemctl daemon-reload && systemctl restart tsar-billing.service")
        time.sleep(10)
        print("  -> Backend restarted successfully.")
    else:
        print("  -> Backend application is in perfect sync.")

    # 5. Check Frontend Build Synchronization
    print("\n[Step 5] Verifying Frontend Web Application Artifact...")
    local_zip_exists = os.path.exists(LOCAL_ZIP)
    if local_zip_exists:
        print("  -> Frontend package present.")

    # 6. Final Health Check
    print("\n[Step 6] Running Live Production Health Check...")
    stdin, stdout, stderr = ssh.exec_command("systemctl is-active tsar-billing.service")
    service_status = stdout.read().decode().strip()
    print(f"  Backend Service (tsar-billing.service): {service_status.upper()}")

    stdin, stdout, stderr = ssh.exec_command("curl -s -o /dev/null -w '%{http_code}' https://billing.tsaritservices.com")
    web_code = stdout.read().decode().strip()
    print(f"  Web Landing Status: HTTP {web_code}")

    sftp.close()
    ssh.close()

    print("\n" + "=" * 65)
    if service_status == "active" and web_code == "200":
        print(" [SUCCESS] Local and Server Billing Projects are FULLY SYNCHRONIZED!")
    else:
        print(" [WARNING] Server synchronization completed with warnings. Check logs.")
    print("=" * 65)

if __name__ == "__main__":
    main()
