import paramiko
import os
import sys

SERVER_IP = "72.62.228.102"
USER = "root"
PASS = "Tsarit@12345"
REMOTE_DIR = "/var/www/billing"

def run_cmd(ssh, cmd):
    print(f"\n[RUN] {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(f"[OUT] {out}")
    if err:
        print(f"[ERR] {err}")
    return exit_status == 0

def progress_cb(transferred, total):
    percent = (transferred / total) * 100
    sys.stdout.write(f"\rUploaded {transferred}/{total} bytes ({percent:.1f}%)")
    sys.stdout.flush()

def main():
    print("Connecting via SSH & SFTP...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_IP, port=22, username=USER, password=PASS, timeout=15)
    sftp = ssh.open_sftp()

    # 1. Upload Backend JAR
    local_jar = r"d:\All in One Bill\backend\spring-backend\target\billing-backend-0.0.1-SNAPSHOT.jar"
    remote_jar = f"{REMOTE_DIR}/backend/app.jar"
    print(f"\nUploading {local_jar} -> {remote_jar}...")
    sftp.put(local_jar, remote_jar, callback=progress_cb)
    print("\nBackend JAR uploaded successfully.")

    # 2. Upload Frontend ZIP
    local_zip = r"d:\All in One Bill\frontend_build.zip"
    remote_zip = f"{REMOTE_DIR}/frontend/build.zip"
    print(f"\nUploading {local_zip} -> {remote_zip}...")
    sftp.put(local_zip, remote_zip, callback=progress_cb)
    print("\nFrontend ZIP uploaded successfully.")

    sftp.close()

    # 3. Unzip frontend
    run_cmd(ssh, "apt-get install -y unzip")
    run_cmd(ssh, f"mkdir -p {REMOTE_DIR}/frontend/build")
    run_cmd(ssh, f"unzip -o {remote_zip} -d {REMOTE_DIR}/frontend/build")
    run_cmd(ssh, f"rm -f {remote_zip}")
    run_cmd(ssh, f"chown -R www-data:www-data {REMOTE_DIR}/frontend")
    print("Frontend assets deployed to /var/www/billing/frontend/build")

    # 4. Start & Enable systemd service
    run_cmd(ssh, "systemctl daemon-reload")
    run_cmd(ssh, "systemctl enable tsar-billing.service")
    run_cmd(ssh, "systemctl restart tsar-billing.service")
    print("Backend service restarted.")

    # 5. Wait a few seconds for backend boot
    import time
    time.sleep(12)
    run_cmd(ssh, "systemctl status tsar-billing.service --no-pager")

    # 6. Test endpoints
    run_cmd(ssh, "curl -IL https://billing.tsaritservices.com")
    run_cmd(ssh, "curl -s http://127.0.0.1:8088/api/auth || echo 'Backend pinged'")

    ssh.close()
    print("\nDeployment completed successfully!")

if __name__ == "__main__":
    main()
