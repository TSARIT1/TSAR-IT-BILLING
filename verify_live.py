import requests
import json

BASE_URL = "https://billing.tsaritservices.com"

print("1. Testing Web App Landing Page...")
r1 = requests.get(BASE_URL, timeout=10)
print(f"Status: {r1.status_code}, Title found: {'TSAR' in r1.text or 'React' in r1.text or 'Bill' in r1.text or 'script' in r1.text}")

print("\n2. Testing /login Route...")
r2 = requests.get(f"{BASE_URL}/login", timeout=10)
print(f"Status: {r2.status_code}")

print("\n3. Testing AI Assistant API...")
try:
    r3 = requests.post(f"{BASE_URL}/api/ai-assistant/query", 
                       json={"query": "What is the sales revenue?", "userId": "test"}, 
                       headers={"Content-Type": "application/json"}, 
                       timeout=10)
    print(f"Status: {r3.status_code}, Response: {r3.text}")
except Exception as e:
    print(f"AI API Error: {e}")

print("\n4. Testing Forgot Password API...")
try:
    r4 = requests.post(f"{BASE_URL}/api/auth/forgot-password", 
                       json={"identifier": "nonexistent@test.com"}, 
                       headers={"Content-Type": "application/json"}, 
                       timeout=10)
    print(f"Status: {r4.status_code}, Response: {r4.text}")
except Exception as e:
    print(f"Forgot Password API Error: {e}")

print("\n5. Testing Notification Campaign Stats API...")
try:
    r5 = requests.get(f"{BASE_URL}/api/notifications/campaign/stats", timeout=10)
    print(f"Status: {r5.status_code}, Response: {r5.text}")
except Exception as e:
    print(f"Campaign Stats API Error: {e}")
