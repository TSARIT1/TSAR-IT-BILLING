import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

def cmd(c):
    print(f"\n=== {c} ===")
    sin, sout, serr = ssh.exec_command(c)
    out = sout.read().decode("utf-8", errors="ignore").strip()
    err = serr.read().decode("utf-8", errors="ignore").strip()
    if out:
        print(out)
    if err:
        print("ERR:", err)

cmd("kubectl get nodes")
cmd("kubectl get pods -A")
cmd("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
cmd("systemctl status tsar-billing.service --no-pager")

ssh.close()
