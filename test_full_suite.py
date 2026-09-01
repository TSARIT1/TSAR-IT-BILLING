import requests
import json
import time
import sys

sys.stdout.reconfigure(encoding="utf-8")
BASE = "https://billing.tsaritservices.com"
TIMESTAMP = int(time.time())

results = []

def record(test_name, success, details=""):
    status = "PASS" if success else "FAIL"
    print(f"[{status}] {test_name}: {details}")
    results.append({"name": test_name, "status": status, "details": details})

print("==================================================")
print(" STARTING TSAR IT BILLING FULL TEST SUITE")
print(" Base URL:", BASE)
print("==================================================")

# --- 1. AUTHENTICATION & PROFILE ---
user_email = f"smoketest_{TIMESTAMP}@tsaritservices.com"
user_phone = f"91{TIMESTAMP % 10000000000:010d}"
user_password = "SmokeTestPassword@2026"

print("\n--- 1. Authentication & Profile ---")
# Register
r_reg = requests.post(f"{BASE}/api/auth/register", json={
    "email": user_email,
    "mobileNo": user_phone,
    "ownerName": "Smoke Test Owner",
    "businessName": "Smoke Test Tech Ltd",
    "password": user_password
}, timeout=10)
reg_ok = r_reg.status_code == 200
user_id = r_reg.json().get("id") if reg_ok else None
record("User Registration", reg_ok, f"Status: {r_reg.status_code}, User ID: {user_id}")

# Login
r_login = requests.post(f"{BASE}/api/auth/login", json={
    "username": user_email,
    "password": user_password
}, timeout=10)
login_ok = r_login.status_code == 200
token = r_login.json().get("token") if login_ok else None
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
record("User Login & JWT", login_ok and bool(token), f"Token length: {len(token) if token else 0}")

# Profile Get
r_prof = requests.get(f"{BASE}/api/auth/profile/{user_id}", headers=headers, timeout=10)
prof_ok = r_prof.status_code == 200 and r_prof.json().get("businessName") == "Smoke Test Tech Ltd"
record("Fetch Profile", prof_ok, f"Business: {r_prof.json().get('businessName') if r_prof.status_code==200 else 'N/A'}")

# Profile Update
r_prof_up = requests.put(f"{BASE}/api/auth/profile/{user_id}", json={
    "businessName": "Smoke Test Tech Enterprises",
    "ownerName": "Lead Architect"
}, headers=headers, timeout=10)
record("Update Profile", r_prof_up.status_code == 200, f"Updated Name: {r_prof_up.json().get('businessName') if r_prof_up.status_code==200 else 'N/A'}")

# Forgot Password OTP
r_fp = requests.post(f"{BASE}/api/auth/forgot-password", json={"identifier": user_email}, timeout=10)
fp_ok = r_fp.status_code == 200
otp = r_fp.json().get("otp") if fp_ok else None
record("Forgot Password & WhatsApp OTP", fp_ok and bool(otp), f"OTP: {otp}")

# Reset Password with OTP
new_password = "UpdatedPassword@2026"
r_rp = requests.post(f"{BASE}/api/auth/reset-password", json={
    "identifier": user_email,
    "otp": otp,
    "newPassword": new_password
}, timeout=10)
record("Reset Password with OTP", r_rp.status_code == 200, f"Message: {r_rp.json().get('message') if r_rp.status_code==200 else 'N/A'}")

# Re-login with new password
r_relogin = requests.post(f"{BASE}/api/auth/login", json={
    "username": user_email,
    "password": new_password
}, timeout=10)
if r_relogin.status_code == 200:
    token = r_relogin.json().get("token")
    headers["Authorization"] = f"Bearer {token}"
record("Re-login with New Password", r_relogin.status_code == 200)

# --- 2. CUSTOMERS / PARTIES CRUD ---
print("\n--- 2. Customer & Party Management ---")
cust_payload = {
    "name": f"Enterprise Client {TIMESTAMP}",
    "phone": f"91{abs(TIMESTAMP * 7) % 10000000000:010d}",
    "email": f"client_{TIMESTAMP}@enterprise.com",
    "gstin": "36AAACT1234A1Z5",
    "customerType": "B2B",
    "status": "ACTIVE",
    "streetAddress": "Cyber Towers, Madhapur",
    "city": "Hyderabad",
    "state": "Telangana",
    "country": "India",
    "zipCode": "500081",
    "businessId": user_id
}
r_cust = requests.post(f"{BASE}/api/customers/create", json=cust_payload, headers=headers, timeout=10)
cust_id = r_cust.json().get("id") if r_cust.status_code in [200, 201] else None
record("Create Customer", r_cust.status_code in [200, 201] and bool(cust_id), f"Customer ID: {cust_id}")

# Get all customers
r_custs = requests.get(f"{BASE}/api/customers/getAll", headers=headers, timeout=10)
record("List Customers", r_custs.status_code == 200, f"Count: {len(r_custs.json()) if r_custs.status_code==200 else 0}")

# --- 3. PRODUCTS & INVENTORY CRUD ---
print("\n--- 3. Products & Inventory Management ---")
sku = f"SKU-{TIMESTAMP}"
prod_payload = {
    "productName": f"Enterprise Cloud Suite {TIMESTAMP}",
    "productCode": sku,
    "hsnSacCode": "998313",
    "sellingPrice": 12500.0,
    "purchasePrice": 7500.0,
    "stockQuantity": 85,
    "minStockLevel": 10,
    "taxRate": 18.0,
    "discount": 5.0,
    "userBusinessId": None,
    "godownId": None
}
r_prod = requests.post(f"{BASE}/api/products/createProduct", json=prod_payload, headers=headers, timeout=10)
prod_id = r_prod.json().get("productId") if r_prod.status_code == 200 else None
record("Create Product", r_prod.status_code == 200 and bool(prod_id), f"Product ID: {prod_id}, SKU: {sku}")

# Stock summary
r_stock = requests.get(f"{BASE}/api/products/stock-summary", headers=headers, timeout=10)
record("Fetch Stock Summary", r_stock.status_code == 200, f"Items in summary: {len(r_stock.json()) if r_stock.status_code==200 else 0}")

# --- 4. SALES INVOICING & WHATSAPP SHARING ---
print("\n--- 4. Sales Invoicing & WhatsApp Sharing ---")
inv_payload = {
    "userId": user_id,
    "customerId": cust_id,
    "city": "Hyderabad",
    "mobileNo": cust_payload["phone"],
    "invoiceDate": "2026-09-01",
    "totalItems": 1,
    "totalAmount": 12500.0,
    "items": [
        {
            "productId": prod_id,
            "itemNo": 1,
            "itemName": prod_payload["productName"],
            "qty": 1,
            "price": 12500.0,
            "discount": 5.0,
            "tax": 18.0,
            "totalLineAmount": 12500.0
        }
    ]
}
r_inv = requests.post(f"{BASE}/api/invoices/create", json=inv_payload, headers=headers, timeout=10)
inv_id = r_inv.json().get("invoiceId") if r_inv.status_code == 200 else None
record("Create Sales Invoice", r_inv.status_code == 200 and bool(inv_id), f"Invoice ID: {inv_id}, Total: ₹12,500")

# List invoices for user
r_inv_list = requests.get(f"{BASE}/api/invoices/list/{user_id}", headers=headers, timeout=10)
record("List Invoices for Merchant", r_inv_list.status_code == 200, f"Invoices Count: {len(r_inv_list.json()) if r_inv_list.status_code==200 else 0}")

# WhatsApp billing share
r_wa_inv = requests.post(f"{BASE}/api/notifications/whatsapp/invoice/{inv_id}", json={"phone": cust_payload["phone"]}, timeout=10)
wa_link = r_wa_inv.json().get("whatsappUrl") if r_wa_inv.status_code == 200 else None
record("Generate WhatsApp Invoice Link", r_wa_inv.status_code == 200 and bool(wa_link), f"WhatsApp URL: {wa_link[:60]}...")

# --- 5. DOUBLE-ENTRY ACCOUNTING & REPORTS ---
print("\n--- 5. Double-Entry Accounting & Financial Reports ---")
r_tb = requests.get(f"{BASE}/api/accounting/trial-balance?tenantId={user_id}", headers=headers, timeout=10)
record("Trial Balance Report", r_tb.status_code == 200, f"Total Debit: {r_tb.json().get('totalDebit', 0)}")

r_pnl = requests.get(f"{BASE}/api/accounting/profit-loss?tenantId={user_id}", headers=headers, timeout=10)
record("Profit & Loss Statement", r_pnl.status_code == 200, f"Net Profit/Loss available: True")

r_bs = requests.get(f"{BASE}/api/accounting/balance-sheet?tenantId={user_id}", headers=headers, timeout=10)
record("Balance Sheet", r_bs.status_code == 200, f"Total Assets: {r_bs.json().get('totalAssets', 0)}")

r_coa = requests.get(f"{BASE}/api/accounting/chart-of-accounts?tenantId={user_id}", headers=headers, timeout=10)
record("Chart of Accounts", r_coa.status_code == 200, f"Total Accounts: {len(r_coa.json()) if r_coa.status_code==200 else 0}")

r_db = requests.get(f"{BASE}/api/accounting/day-book?tenantId={user_id}", headers=headers, timeout=10)
record("Day Book Journal Entries", r_db.status_code == 200, f"Entries Count: {len(r_db.json()) if r_db.status_code==200 else 0}")

# --- 6. RAKI AI BUSINESS COPILOT ---
print("\n--- 6. RAKI AI Business Copilot ---")
r_ai_rev = requests.post(f"{BASE}/api/ai-assistant/query", json={
    "query": "What is my total sales revenue and receivables?",
    "userId": user_id
}, timeout=15)
record("RAKI AI Revenue & Receivables Insight", r_ai_rev.status_code == 200, f"Answer: {r_ai_rev.json().get('answer') if r_ai_rev.status_code==200 else 'N/A'}")

r_ai_stock = requests.post(f"{BASE}/api/ai-assistant/query", json={
    "query": "What products are low on stock and need reorder?",
    "userId": user_id
}, timeout=15)
record("RAKI AI Stock Alert Insight", r_ai_stock.status_code == 200, f"Answer: {r_ai_stock.json().get('answer') if r_ai_stock.status_code==200 else 'N/A'}")

r_ai_gst = requests.post(f"{BASE}/api/ai-assistant/query", json={
    "query": "What is my net GST liability?",
    "userId": user_id
}, timeout=15)
record("RAKI AI GST Liability Insight", r_ai_gst.status_code == 200, f"Answer: {r_ai_gst.json().get('answer') if r_ai_gst.status_code==200 else 'N/A'}")

# --- 7. NOTIFICATIONS & CAMPAIGN DISPATCH ---
print("\n--- 7. Notifications & Campaign Engine ---")
r_camp = requests.post(f"{BASE}/api/notifications/campaign/send", json={
    "title": "Smoke Test Promotional Launch",
    "category": "Festive Discount",
    "message": "Enjoy 20% off on all enterprise software licenses!",
    "audience": "All Active Customers",
    "businessId": user_id
}, headers=headers, timeout=10)
record("Dispatch Promotional Campaign", r_camp.status_code == 200, f"Delivered: {r_camp.json().get('message') if r_camp.status_code==200 else 'N/A'}")

r_stats = requests.get(f"{BASE}/api/notifications/campaign/stats", timeout=10)
record("Campaign Analytics & History", r_stats.status_code == 200, f"Total Campaigns: {r_stats.json().get('totalCampaigns') if r_stats.status_code==200 else 0}")

# --- SUMMARY ---
print("\n==================================================")
print(" TEST SUITE SUMMARY")
print("==================================================")
passed = sum(1 for r in results if r["status"] == "PASS")
failed = sum(1 for r in results if r["status"] == "FAIL")
print(f"TOTAL: {len(results)} | PASSED: {passed} | FAILED: {failed}")

# Output test identifiers for subsequent cleanup
cleanup_info = {
    "testUserId": user_id,
    "testEmail": user_email,
    "testPhone": user_phone,
    "testCustomerId": cust_id,
    "testProductId": prod_id,
    "testInvoiceId": inv_id
}
with open("test_cleanup_info.json", "w") as f:
    json.dump(cleanup_info, f, indent=2)

print("\nCleanup metadata saved to test_cleanup_info.json.")
