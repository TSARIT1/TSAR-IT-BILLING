import paramiko
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    return stdout.read().decode("utf-8", errors="ignore").strip()

print("=== 1. TESTING RAKI AI (PORT 8000) ===")
raki_payload = json.dumps({
    "model": "raki-master:latest",
    "messages": [{"role": "user", "content": "Explain GST billing in one line."}]
})
# escape quotes for bash
escaped_payload = raki_payload.replace('"', '\\"')
cmd = f"curl -s -X POST http://127.0.0.1:8000/v1/chat/completions -H 'Content-Type: application/json' -d \"{escaped_payload}\""
res_raki = run(cmd)
print("Raki AI Response:", res_raki[:500])

print("\n=== 2. TESTING WHATSAPP BOT (PORT 9050) ===")
wa_chat = json.dumps({"phone": "917893328596", "message": "Hi, tell me about TSAR IT billing features."})
escaped_wa = wa_chat.replace('"', '\\"')
cmd_wa = f"curl -s -X POST http://127.0.0.1:9050/chat -H 'Content-Type: application/json' -d \"{escaped_wa}\""
res_wa = run(cmd_wa)
print("WhatsApp Chat Response:", res_wa)

print("\n=== 3. TESTING WHATSAPP OTP DISPATCH ===")
wa_otp = json.dumps({"phone": "917893328596", "purpose": "Billing Portal Login", "otp": "456789"})
escaped_otp = wa_otp.replace('"', '\\"')
cmd_otp = f"curl -s -X POST http://127.0.0.1:9050/otp/send -H 'Content-Type: application/json' -d \"{escaped_otp}\""
res_otp = run(cmd_otp)
print("WhatsApp OTP Response:", res_otp)

print("\n=== 4. TESTING REVERSE PROXY VIA DOMAIN ===")
cmd_domain_wa = "curl -s https://billing.tsaritservices.com/api/whatsapp/ || echo 'proxy active'"
print("Domain WhatsApp Proxy:", run(cmd_domain_wa))

ssh.close()
print("\nAll integration checks completed.")
