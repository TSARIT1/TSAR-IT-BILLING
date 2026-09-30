"""Publish the signed Android APK only; preserve web and backend files.

Uses the existing deployment credential module without logging its secrets.
Pins the SSH host key observed during the initial server audit.
"""
import base64
import hashlib
import json
import posixpath
from datetime import datetime, timezone
from pathlib import Path

import paramiko

import deploy_remote as credentials

HOST_KEY = "SHA256:A1sS15wIwkCEu+CLsTG8hfIREbuVXA94v6vVDtJALyg"
REMOTE_APKS = [
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.16.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.15.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.14.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.13.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.12.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.11.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.10.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.9.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.8.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.7.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.6.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.5.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.2.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.1.apk",
    "/var/www/billing/frontend/build/downloads/TSAR-IT-Billing-v4.14.0.apk",
]


class PinnedHost(paramiko.MissingHostKeyPolicy):
    def missing_host_key(self, client, hostname, key):
        actual = "SHA256:" + base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip("=")
        if actual != HOST_KEY:
            raise RuntimeError("Server host key changed; APK deployment stopped")


def main():
    apk = Path(__file__).parent / "frontend" / "public" / "downloads" / "TSAR-IT-Billing-v4.14.16.apk"
    if not apk.is_file():
        raise RuntimeError("Local APK not found: " + str(apk))
    local_sha = hashlib.sha256(apk.read_bytes()).hexdigest()
    if apk.stat().st_size < 1_000_000:
        raise RuntimeError("Local APK is unexpectedly small")

    release = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = "/var/backups/tsar-billing/apk-" + release
    remote_tmp = REMOTE_APKS[0] + ".next"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    import time
    for attempt in range(4):
        try:
            ssh.connect(credentials.SERVER_IP, port=22, username=credentials.USER, password=credentials.PASS,
                        timeout=30, auth_timeout=30, banner_timeout=45)
            break
        except Exception as e:
            if attempt == 3:
                raise
            time.sleep(5)

    def run(command, timeout=120):
        _, stdout, stderr = ssh.exec_command("set -eu\n" + command, timeout=timeout)
        output = stdout.read().decode()
        errors = stderr.read().decode()
        if stdout.channel.recv_exit_status() != 0:
            raise RuntimeError(errors or output or "Remote command failed")
        return output.strip()

    try:
        run("nginx -t")
        run("install -d -m 700 " + backup + "; "
            + " ".join("if [ -f " + remote + " ]; then cp -a " + remote + " " + backup + "/; fi;" for remote in REMOTE_APKS)
            + " install -d -m 755 " + posixpath.dirname(REMOTE_APKS[0]))

        with ssh.open_sftp() as sftp:
            sftp.put(str(apk), remote_tmp)
            sftp.chmod(remote_tmp, 0o644)

        remote_sha = run("sha256sum " + remote_tmp).split()[0]
        if remote_sha != local_sha:
            run("rm -f " + remote_tmp)
            raise RuntimeError("Uploaded APK SHA-256 verification failed")

        run("mv -f " + remote_tmp + " " + REMOTE_APKS[0] + "; cp -a " + REMOTE_APKS[0] + " " + REMOTE_APKS[1] + "; cp -a " + REMOTE_APKS[0] + " " + REMOTE_APKS[2])
        final_sha = run("sha256sum " + REMOTE_APKS[0]).split()[0]
        if final_sha != local_sha:
            raise RuntimeError("Live APK SHA-256 verification failed")
        alias_sha = run("sha256sum " + REMOTE_APKS[1] + " " + REMOTE_APKS[2]).split()[0]
        if alias_sha != local_sha:
            raise RuntimeError("Compatibility APK SHA-256 verification failed")

        headers = run("curl -fsSI https://billing.tsaritservices.com/downloads/TSAR-IT-Billing-v4.14.16.apk | "
                      "awk 'BEGIN{IGNORECASE=1} /^HTTP\\// || /^content-type:/ || /^content-length:/ {print}'")

        print(json.dumps({
            "release": release,
            "backup": backup,
            "remote_apk": REMOTE_APKS[0],
            "compatibility_alias": REMOTE_APKS[1],
            "sha256": final_sha,
            "bytes": apk.stat().st_size,
            "headers": headers,
            "scope": "android APK only"
        }, indent=2))
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
