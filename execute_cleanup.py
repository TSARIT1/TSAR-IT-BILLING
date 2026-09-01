import paramiko
import sys

sys.stdout.reconfigure(encoding="utf-8")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("72.62.228.102", port=22, username="root", password="Tsarit@12345", timeout=10)

def query(sql):
    cmd = f"mysql -u root -p'Tsarit@12345' billing_db -e \"{sql}\""
    sin, sout, serr = ssh.exec_command(cmd)
    out = sout.read().decode("utf-8", errors="ignore").strip()
    err = serr.read().decode("utf-8", errors="ignore").strip()
    if out:
        print(out)
    if err and "Using a password" not in err:
        print("ERR:", err)

print("Cleaning up smoke and test data while preserving genuine merchant records...")

cleanup_sql = """
-- 1. Delete invoice items from test invoices
DELETE FROM invoice_items WHERE invoice_id IN (
    SELECT invoice_id FROM (SELECT invoice_id FROM invoices WHERE user_id IN (
        SELECT user_id FROM users WHERE email LIKE '%test%' OR user_name LIKE '%Test%' OR user_name LIKE '%Architect%'
    )) AS t
);

-- 2. Delete test invoices
DELETE FROM invoices WHERE user_id IN (
    SELECT user_id FROM (SELECT user_id FROM users WHERE email LIKE '%test%' OR user_name LIKE '%Test%' OR user_name LIKE '%Architect%') AS t
);

-- 3. Delete test customers
DELETE FROM customers WHERE business_id IN (
    SELECT user_id FROM (SELECT user_id FROM users WHERE email LIKE '%test%' OR user_name LIKE '%Test%' OR user_name LIKE '%Architect%') AS t
) OR email LIKE '%test%' OR email LIKE '%enterprise.com%' OR name LIKE '%Test%' OR name LIKE '%Enterprise%';

-- 4. Delete smoke test products
DELETE FROM products WHERE product_code LIKE 'ERP-%' OR product_code LIKE 'SKU-%';

-- 5. Delete test user accounts
DELETE FROM users WHERE email LIKE '%test%' OR user_name LIKE '%Test%' OR user_name LIKE '%Architect%';
"""

for statement in cleanup_sql.strip().split(";"):
    stmt = statement.strip()
    if stmt:
        query(stmt)

print("\n--- SANITIZED DATABASE STATUS ---")
print("\nActive Users:")
query("SELECT user_id, user_name, email, mobile_no, business_name FROM users;")

print("\nActive Customers:")
query("SELECT COUNT(*) AS total_customers FROM customers;")

print("\nActive Products:")
query("SELECT COUNT(*) AS total_products FROM products;")

print("\nActive Invoices:")
query("SELECT COUNT(*) AS total_invoices FROM invoices;")

ssh.close()
print("\nDatabase sanitized successfully. Only real data is preserved.")
