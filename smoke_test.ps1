try {
    # 1. Health / Auth ping
    $health = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/roles" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "AUTH_ROLES_RESPONSE:" ($health | ConvertTo-Json -Compress)
} catch {
    Write-Host "AUTH_ROLES_ERR:" $_.Exception.Message
}

try {
    # 2. Registration / Tenant test
    $testEmail = "smoke_" + (Get-Random) + "@tsarit.test"
    $regBody = @{
        businessName = "TSAR Automated QA Ltd"
        ownerName = "QA Tester"
        email = $testEmail
        phone = "9876543210"
        password = "Password@123"
        businessType = "RETAIL"
    } | ConvertTo-Json
    
    $regRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $regBody -ContentType "application/json" -TimeoutSec 5
    Write-Host "REG_STATUS: SUCCESS"
    $token = $regRes.token
    $userId = $regRes.userId
    Write-Host "USER_ID:" $userId
    
    # 3. Create Party / Customer
    $custBody = @{
        name = "Alpha Enterprises"
        phone = "9123456780"
        email = "alpha@client.com"
        gstin = "36ABCDE1234F1Z5"
        billingAddress = "Plot 42, Hitech City, Hyderabad"
    } | ConvertTo-Json
    
    $custHeaders = @{ Authorization = "Bearer $token" }
    $custRes = Invoke-RestMethod -Uri "http://localhost:8081/api/customers?userId=$userId" -Method Post -Body $custBody -ContentType "application/json" -Headers $custHeaders -TimeoutSec 5
    Write-Host "CREATE_CUSTOMER: SUCCESS, ID:" $custRes.id
    
    # 4. Create Product / Inventory Item
    $prodBody = @{
        name = "Wireless Barcode Scanner"
        sku = "WBS-100"
        hsn = "8471"
        price = 3500.00
        purchasePrice = 2800.00
        taxRate = 18.0
        stock = 25
        category = "Hardware"
    } | ConvertTo-Json
    
    $prodRes = Invoke-RestMethod -Uri "http://localhost:8081/api/products?userId=$userId" -Method Post -Body $prodBody -ContentType "application/json" -Headers $custHeaders -TimeoutSec 5
    Write-Host "CREATE_PRODUCT: SUCCESS, ID:" $prodRes.id
    
    # 5. Create Invoice / Bill
    $invBody = @{
        invoiceNumber = "INV-" + (Get-Random)
        invoiceDate = "2026-08-31"
        customerId = $custRes.id
        customerName = "Alpha Enterprises"
        totalAmount = 4130.00
        taxAmount = 630.00
        status = "PAID"
        items = @(
            @{
                productId = $prodRes.id
                productName = "Wireless Barcode Scanner"
                quantity = 1
                price = 3500.00
                taxRate = 18.0
                total = 4130.00
            }
        )
    } | ConvertTo-Json -Depth 5
    
    $invRes = Invoke-RestMethod -Uri "http://localhost:8081/api/invoices?userId=$userId" -Method Post -Body $invBody -ContentType "application/json" -Headers $custHeaders -TimeoutSec 5
    Write-Host "CREATE_INVOICE: SUCCESS, ID:" $invRes.id
    
    # 6. Read back Invoices (Multi-tenant check)
    $allInvoices = Invoke-RestMethod -Uri "http://localhost:8081/api/invoices?userId=$userId" -Method Get -Headers $custHeaders -TimeoutSec 5
    Write-Host "FETCH_INVOICES_COUNT:" $allInvoices.Count
    
} catch {
    Write-Host "SMOKE_TEST_ERROR:" $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host "DETAILS:" $_.ErrorDetails.Message
    }
}
