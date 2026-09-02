import os
import sys
import zipfile
import paramiko
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = "72.62.228.102"
USER = "root"
PASS = "Tsarit@12345"
REMOTE_DIR = "/var/www/billing"
BUILD_DIR = r"d:\All in One Bill\frontend\build"
ZIP_PATH = r"d:\All in One Bill\frontend_build.zip"

def progress_cb(transferred, total):
    pct = (transferred / total) * 100
    sys.stdout.write(f"\r  Uploading: {transferred}/{total} bytes ({pct:.1f}%)")
    sys.stdout.flush()

def main():
    print("=" * 60)
    print(" PACKAGING & DEPLOYING FRONTEND TO PRODUCTION")
    print("=" * 60)

    if not os.path.exists(os.path.join(BUILD_DIR, "index.html")):
        print(f"[!] Build index.html not found in {BUILD_DIR}")
        sys.exit(1)

    # 1. Create ZIP
    print(f"\n[1/3] Packaging {BUILD_DIR} into {ZIP_PATH}...")
    file_count = 0
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(BUILD_DIR):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BUILD_DIR)
                z.write(full_path, rel_path)
                file_count += 1
    print(f"  Zipped {file_count} files ({os.path.getsize(ZIP_PATH)} bytes).")

    # 2. Upload to Server
    print(f"\n[2/3] Uploading to {USER}@{SERVER_IP}:{REMOTE_DIR}/frontend/build.zip...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_IP, port=22, username=USER, password=PASS, timeout=15)
    sftp = ssh.open_sftp()

    remote_zip = f"{REMOTE_DIR}/frontend/build.zip"
    sftp.put(ZIP_PATH, remote_zip, callback=progress_cb)
    print("\n  Upload completed successfully.")
    sftp.close()

    # 3. Extract and Reload Nginx
    print(f"\n[3/3] Unzipping and updating Nginx on server...")
    def run_cmd(cmd):
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace').strip()
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if out:
            print(f"  {out}")
        if err and "warning" not in err.lower():
            print(f"  [ERR] {err}")

    run_cmd(f"mkdir -p {REMOTE_DIR}/frontend/build")
    run_cmd(f"unzip -o {remote_zip} -d {REMOTE_DIR}/frontend/build")
    run_cmd(f"rm -f {remote_zip}")
    run_cmd(f"chown -R www-data:www-data {REMOTE_DIR}/frontend")
    run_cmd("nginx -t && systemctl reload nginx")
    run_cmd("sync-billing")

    ssh.close()
    print("\n[SUCCESS] Production frontend deployment and sync completed!")

if __name__ == "__main__":
    main()
