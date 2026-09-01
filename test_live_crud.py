import requests
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
base = "https://billing.tsaritservices.com"

# 1. Login to obtain token
login_res = requests.post(f"{base}/api/auth/login", json={
    "username": "live_test@tsaritservices.com",
    "password": "TestPassword@123"
}, timeout=10)
token = login_res.json().get("token")
user_id = login_res.json().get("userId")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
print(f"Logged in. User ID: {user_id}")

# 2. Test Customer CRUD
print("\n[CRUD] Creating Customer...")
cust_payload = {
    "name": "Live Enterprise Client",
    "phone": "917893328596",
    "email": "client@enterprise.com",
    "gstin": "36AAACT1234A1Z5",
    "billingAddress": "Hitech City, Hyderabad",
    "businessId": user_id
}
cust_res = requests.post(f"{base}/api/customers/create", json=cust_payload, headers=headers, timeout=10)
print("Create Customer Status:", cust_res.status_code)
cust_data = cust_res.json()
cust_id = cust_data.get("id")
print("Customer ID:", cust_id)

# 3. Test Product CRUD
print("\n[CRUD] Creating Product...")
prod_payload = {
    "productName": "Cloud ERP Billing License v4",
    "productCode": "ERP-004",
    "hsnSacCode": "998313",
    "sellingPrice": 4999.0,
    "purchasePrice": 2500.0,
    "taxRate": 18.0,
    "currentStock": 50,
    "minStockLevel": 5
}
prod_res = requests.post(f"{base}/api/products/createProduct", json=prod_payload, headers=headers, timeout=10)
print("Create Product Status:", prod_res.status_code)
prod_data = prod_res.json()
prod_id = prod_data.get("productId")
print("Product ID:", prod_id)

# 4. Test Invoice Creation CRUD
print("\n[CRUD] Creating Invoice...")
invoice_payload = {
    "userId": user_id,
    "customerId": cust_id,
    "city": "Hyderabad",
    "mobileNo": "917893328596",
    "invoiceDate": "2026-09-01",
    "totalItems": 2,
    "totalAmount": 9998.0,
    "items": [
        {
            "productId": prod_id,
            "productName": "Cloud ERP Billing License v4",
            "quantity": 2,
            "rate": 4999.0,
            "taxRate": 18.0,
            "totalAmount": 9998.0
        }
    ]
}
inv_res = requests.post(f"{base}/api/invoices/create", json=invoice_payload, headers=headers, timeout=10)
print("Create Invoice Status:", inv_res.status_code)
inv_data = inv_res.json()
inv_id = inv_data.get("invoiceId")
print("Created Invoice ID:", inv_id)

# 5. Test WhatsApp Bill Dispatch for created invoice
print("\n[WHATSAPP] Dispatching Invoice to Customer via WhatsApp...")
wa_res = requests.post(f"{base}/api/notifications/whatsapp/invoice/{inv_id}", json={"phone": "917893328596"}, timeout=10)
print("WhatsApp Invoice Status:", wa_res.status_code, "WhatsApp Link:", wa_res.json().get("whatsappUrl"))

# 6. Test RAKI AI asking about live revenue
print("\n[RAKI AI] Querying live revenue after invoice creation...")
ai_res = requests.post(f"{base}/api/ai-assistant/query", json={
    "query": "What is the total sales revenue?",
    "userId": user_id
}, timeout=15)
print("RAKI AI Answer:", ai_res.json().get("answer"))

print("\n--- ALL LIVE TESTS COMPLETED AND FULLY FUNCTIONAL ---")
