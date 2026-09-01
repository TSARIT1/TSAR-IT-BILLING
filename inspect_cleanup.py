import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

def query(sql):
    cmd = f"mysql -u root -p'Tsarit@12345' billing_db -e \"{sql}\""
    sin, sout, serr = ssh.exec_command(cmd)
    return sout.read().decode("utf-8", errors="ignore").strip()

print("=== USERS TABLE ===")
print(query("SELECT user_id, user_name, email, mobile_no, business_name FROM users;"))

print("\n=== CUSTOMERS TABLE ===")
print(query("SELECT id, name, phone, email, business_id FROM customers;"))

print("\n=== PRODUCTS TABLE ===")
print(query("SELECT id, product_code, product_name, total_stock, selling_price FROM products;"))

print("\n=== INVOICES TABLE ===")
print(query("SELECT invoice_id, total_amount, invoice_date, user_id FROM invoices;"))

ssh.close()
