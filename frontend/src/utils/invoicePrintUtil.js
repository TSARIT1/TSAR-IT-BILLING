/**
 * Enterprise Multi-Tenant SaaS GST Invoice Print & Export Utility
 * Dynamic Tenant Branding - Uses Logged-in Merchant's Details
 * Supports:
 * - A4 (Standard GST Tax Invoice with SAC/HSN, CGST/SGST/IGST breakdown)
 * - A5 (Half-Sheet Compact Counter GST Invoice)
 * - 80mm Thermal Slip (Supermarket / Restaurant standard roll)
 * - 58mm Thermal Slip (Pocket / Mini Bluetooth Thermal roll)
 * - Word (.doc) Export
 * - Excel / CSV (.csv) Export
 */

export const printEnterpriseInvoice = ({
  invoice = {},
  items = [],
  business = {},
  printSize = "A4", // "A4", "A5", "80mm", "58mm"
}) => {
  // Read tenant details dynamically from parameter or localStorage session
  let storedUser = {};
  let storedBusiness = {};
  let storedBank = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    storedBusiness = JSON.parse(localStorage.getItem("businessData") || "{}");
    storedBank = JSON.parse(localStorage.getItem("bankDetails") || "{}");
  } catch (e) {
    // ignore parse errors
  }

  const companyLogo = business.logo || business.companyLogo || localStorage.getItem("companyLogo") || storedBusiness.logo || "";
  const signature = business.signature || localStorage.getItem("signature") || storedBusiness.signature || "";
  
  const businessName = business.businessName || storedBusiness.businessName || storedUser.businessName || storedUser.ownerName || "Merchant Store";
  const gstNo = business.gstNo || business.gstin || storedBusiness.gstNo || "";
  const panNo = business.panNumber || storedBusiness.panNo || "";
  const address = business.address || storedBusiness.address || "";
  const city = business.city || storedBusiness.city || "";
  const state = business.state || storedBusiness.state || "";
  const pincode = business.pincode || storedBusiness.pincode || "";
  const phone = business.phoneNo || business.companyPhone || storedBusiness.phoneNo || storedUser.mobileNo || "";
  const email = business.email || business.companyEmail || storedBusiness.email || storedUser.email || "";

  const bankName = business.bankName || storedBank.bankName || storedBusiness.bankName || "";
  const accountNumber = business.accountNumber || storedBank.accountNumber || storedBusiness.accountNumber || "";
  const ifscCode = business.ifscCode || storedBank.ifscCode || storedBusiness.ifscCode || "";
  const branchName = business.branchName || storedBank.branchName || storedBusiness.branchName || "";
  const upiId = business.upiId || storedBank.upiId || (phone ? `${phone.replace(/[^0-9]/g, '')}@upi` : "");

  // Invoice variables
  const invoiceId = invoice.invoiceId || invoice.id || "INV-" + Date.now().toString().slice(-6);
  const invoiceDate = invoice.date || invoice.createdAt ? new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const customerName = invoice.customerName || invoice.party || "Walk-In Customer";
  const customerPhone = invoice.customerPhone || invoice.mobile || "-";
  const customerGstin = invoice.customerGstin || (invoice.taxId ? invoice.taxId : "URP (Unregistered)");
  const customerAddress = invoice.customerAddress || invoice.city || "Local Market";
  const placeOfSupply = invoice.placeOfSupply || state || "Local State";
  const isInterState = state && placeOfSupply && placeOfSupply.toLowerCase() !== state.toLowerCase();

  // Calculations
  let subtotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const processedItems = items.map((it, idx) => {
    const qty = Number(it.quantity || it.qty || 1);
    const rate = Number(it.price || it.unitPrice || 0);
    const itemSub = qty * rate;
    const discPct = Number(it.discount || 0);
    const discAmt = (itemSub * discPct) / 100;
    const taxable = itemSub - discAmt;
    const taxPct = Number(it.tax || it.taxRate || 0);

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
      igst = (taxable * taxPct) / 100;
    } else {
      cgst = (taxable * (taxPct / 2)) / 100;
      sgst = (taxable * (taxPct / 2)) / 100;
    }

    subtotal += itemSub;
    totalDiscount += discAmt;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return {
      sr: idx + 1,
      name: it.itemName || it.productName || it.name || "Item " + (idx + 1),
      hsn: it.hsnCode || it.hsn || "-",
      qty,
      unit: it.unit || "PCS",
      rate,
      taxable,
      taxPct,
      cgst,
      sgst,
      igst,
      total: taxable + cgst + sgst + igst
    };
  });

  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = Math.round(subtotal - totalDiscount + totalTax);
  const roundOff = (grandTotal - (subtotal - totalDiscount + totalTax)).toFixed(2);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to print invoices");
    return;
  }

  // Common Style Header
  let cssRules = "";
  if (printSize === "58mm") {
    cssRules = `
      @page { size: 58mm auto; margin: 2mm; }
      body { font-family: 'Courier New', Courier, monospace; font-size: 11px; margin: 0; padding: 2px; color: #000; }
      .thermal-center { text-align: center; }
      .thermal-bold { font-weight: bold; }
      .thermal-divider { border-top: 1px dashed #000; margin: 4px 0; }
      .thermal-table { width: 100%; border-collapse: collapse; }
      .thermal-table th, .thermal-table td { font-size: 10px; padding: 2px 0; text-align: left; }
      .thermal-table .text-right { text-align: right; }
      .thermal-totals { margin-top: 4px; font-size: 11px; }
      .logo-img { max-height: 35px; max-width: 80px; object-fit: contain; margin-bottom: 4px; }
    `;
  } else if (printSize === "80mm") {
    cssRules = `
      @page { size: 80mm auto; margin: 3mm; }
      body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 4px; color: #000; }
      .thermal-center { text-align: center; }
      .thermal-bold { font-weight: bold; }
      .thermal-divider { border-top: 1px dashed #000; margin: 6px 0; }
      .thermal-table { width: 100%; border-collapse: collapse; }
      .thermal-table th, .thermal-table td { font-size: 11px; padding: 3px 0; text-align: left; }
      .thermal-table .text-right { text-align: right; }
      .thermal-totals { margin-top: 6px; font-size: 12px; }
      .logo-img { max-height: 45px; max-width: 100px; object-fit: contain; margin-bottom: 4px; }
    `;
  } else {
    // A4 & A5 Modern Clean Invoicing Styles
    const isA5 = printSize === "A5";
    cssRules = `
      @page { size: ${isA5 ? "A5 landscape" : "A4 portrait"}; margin: ${isA5 ? "8mm" : "12mm"}; }
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: ${isA5 ? "11px" : "12px"}; color: #1e293b; margin: 0; padding: 0; background: #fff; }
      .invoice-container { border: 1px solid #cbd5e1; border-radius: 8px; padding: ${isA5 ? "12px" : "20px"}; }
      .tax-invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
      .logo-img { max-height: ${isA5 ? "40px" : "55px"}; max-width: 160px; object-fit: contain; margin-bottom: 6px; }
      .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 14px; background: #f8fafc; }
      .party-col { font-size: ${isA5 ? "10px" : "11px"}; line-height: 1.4; }
      .items-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
      .items-table th { background: #0f172a; color: #fff; padding: 6px 8px; font-size: 11px; text-transform: uppercase; font-weight: 600; }
      .items-table td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11px; }
      .items-table tr:nth-child(even) { background-color: #f8fafc; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .totals-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
      .bank-details-box { width: 55%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; background: #f8fafc; font-size: 10px; }
      .summary-table { width: 40%; border-collapse: collapse; font-size: 11px; }
      .summary-table td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
      .grand-total-row { background: #0f172a; color: #fff; font-size: 13px; font-weight: 800; }
      .grand-total-row td { padding: 8px 6px; border: none; }
      .signature-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
      .signature-box { text-align: center; font-size: 10px; color: #64748b; width: 200px; }
      .badge-gst { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; }
    `;
  }

  let bodyHtml = "";

  if (printSize === "58mm" || printSize === "80mm") {
    // Thermal Roll Layout
    bodyHtml = `
      <div class="thermal-center">
        ${companyLogo ? `<img src="${companyLogo}" class="logo-img" alt="Logo" /><br/>` : ""}
        <div class="thermal-bold" style="font-size:${printSize === '80mm' ? '15px' : '13px'};">${businessName}</div>
        ${address || city ? `<div>${[address, city, state].filter(Boolean).join(", ")}</div>` : ""}
        ${phone ? `<div>Phone: ${phone}</div>` : ""}
        ${gstNo ? `<div>GSTIN: ${gstNo}</div>` : ""}
      </div>
      <div class="thermal-divider"></div>
      <div><strong>Bill #:</strong> ${invoiceId}</div>
      <div><strong>Date:</strong> ${invoiceDate}</div>
      <div><strong>Customer:</strong> ${customerName}</div>
      ${customerPhone && customerPhone !== "-" ? `<div><strong>Phone:</strong> ${customerPhone}</div>` : ""}
      <div class="thermal-divider"></div>
      <table class="thermal-table">
        <thead>
          <tr>
            <th style="width:50%;">Item</th>
            <th style="width:15%;" class="text-right">Qty</th>
            <th style="width:35%;" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${processedItems.map(it => `
            <tr>
              <td>${it.name}</td>
              <td class="text-right">${it.qty}</td>
              <td class="text-right">₹${it.total.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="thermal-divider"></div>
      <div class="thermal-totals">
        <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
        ${totalDiscount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Discount:</span><span>-₹${totalDiscount.toFixed(2)}</span></div>` : ""}
        ${totalTax > 0 ? `<div style="display:flex; justify-content:space-between;"><span>GST Tax:</span><span>₹${totalTax.toFixed(2)}</span></div>` : ""}
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:${printSize === '80mm' ? '14px' : '12px'}; border-top:1px dashed #000; padding-top:4px; margin-top:2px;">
          <span>NET TOTAL:</span>
          <span>₹${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <div style="text-align:center; margin-top:10px; border-top:1px dashed #000; padding-top:6px;">
        <div>Thank You! Visit Again</div>
        <div style="font-size:9px;">Powered by ${businessName}</div>
      </div>
    `;
  } else {
    // A4 / A5 Full GST Invoicing Format
    const fullAddress = [address, city, state, pincode].filter(Boolean).join(", ");
    
    bodyHtml = `
      <div class="invoice-container">
        <div class="tax-invoice-header">
          <div>
            ${companyLogo ? `<img src="${companyLogo}" class="logo-img" alt="Logo" />` : ""}
            <h2 style="margin:0; font-size:18px; color:#0f172a; font-weight:800;">${businessName}</h2>
            <div style="color:#475569; margin-top:4px; font-size:11px;">
              ${fullAddress ? `${fullAddress}<br/>` : ""}
              ${phone || email ? `<strong>Contact:</strong> ${[phone, email].filter(Boolean).join(" | ")}<br/>` : ""}
              ${gstNo ? `<span class="badge-gst">GSTIN: ${gstNo}</span>` : ""}
              ${panNo ? ` | <strong>PAN:</strong> ${panNo}` : ""}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px; font-weight:900; color:#0f172a;">TAX INVOICE</div>
            <div style="font-size:11px; color:#64748b;">(Original for Recipient)</div>
            <div style="margin-top:8px; font-size:12px;">
              <strong>Invoice No:</strong> <span style="color:#0284c7; font-weight:700;">${invoiceId}</span><br/>
              <strong>Date:</strong> ${invoiceDate}<br/>
              ${placeOfSupply ? `<strong>Place of Supply:</strong> ${placeOfSupply} (${isInterState ? "Inter-State / IGST" : "Intra-State / CGST+SGST"})` : ""}
            </div>
          </div>
        </div>

        <div class="party-grid">
          <div class="party-col">
            <strong style="color:#0284c7; text-transform:uppercase; font-size:11px;">Billed To (Customer):</strong>
            <div style="font-size:13px; font-weight:700; margin-top:2px;">${customerName}</div>
            <div style="color:#475569;">
              ${customerAddress ? `${customerAddress}<br/>` : ""}
              ${customerPhone && customerPhone !== "-" ? `<strong>Phone:</strong> ${customerPhone}<br/>` : ""}
              <strong>GSTIN / Tax ID:</strong> ${customerGstin}
            </div>
          </div>
          <div class="party-col">
            <strong style="color:#0284c7; text-transform:uppercase; font-size:11px;">Dispatch & Logistics:</strong>
            <div style="color:#475569; margin-top:4px;">
              <strong>Dispatch From:</strong> ${city || "Main Business Hub"}<br/>
              <strong>Transportation Mode:</strong> ${invoice.transportMode || "Direct Counter / Delivery"}<br/>
              <strong>Vehicle No:</strong> ${invoice.vehicleNo || "N/A"} | <strong>E-Way Bill:</strong> ${invoice.ewayBillNo || "N/A"}
            </div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width:5%;">#</th>
              <th style="width:35%;">Description of Goods / Services</th>
              <th style="width:10%;">HSN/SAC</th>
              <th style="width:8%;" class="text-center">Qty</th>
              <th style="width:10%;" class="text-right">Rate (₹)</th>
              <th style="width:10%;" class="text-right">Taxable (₹)</th>
              ${isInterState ? `
                <th style="width:11%;" class="text-right">IGST (₹)</th>
              ` : `
                <th style="width:11%;" class="text-right">CGST+SGST (₹)</th>
              `}
              <th style="width:11%;" class="text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${processedItems.map(it => `
              <tr>
                <td class="text-center">${it.sr}</td>
                <td><strong>${it.name}</strong></td>
                <td class="text-center">${it.hsn}</td>
                <td class="text-center">${it.qty} ${it.unit}</td>
                <td class="text-right">${it.rate.toFixed(2)}</td>
                <td class="text-right">${it.taxable.toFixed(2)}</td>
                ${isInterState ? `
                  <td class="text-right">${it.igst.toFixed(2)} <span style="font-size:9px; color:#64748b;">(${it.taxPct}%)</span></td>
                ` : `
                  <td class="text-right">${(it.cgst + it.sgst).toFixed(2)} <span style="font-size:9px; color:#64748b;">(${it.taxPct}%)</span></td>
                `}
                <td class="text-right"><strong>₹${it.total.toFixed(2)}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="bank-details-box">
            <strong style="color:#0284c7;">Bank & Payment Details:</strong>
            <div style="font-size:11px; margin-top:4px; color:#475569;">
              ${bankName ? `<strong>Bank:</strong> ${bankName} | ` : ""}
              ${accountNumber ? `<strong>A/C:</strong> ${accountNumber}<br/>` : ""}
              ${ifscCode ? `<strong>IFSC:</strong> ${ifscCode} | ` : ""}
              ${branchName ? `<strong>Branch:</strong> ${branchName}<br/>` : ""}
              ${upiId ? `<strong>UPI ID:</strong> ${upiId}` : ""}
              ${!bankName && !accountNumber && !upiId ? `Payment Mode: Direct Counter Settlement` : ""}
            </div>
            <div style="margin-top:6px; font-size:10px; color:#64748b;">
              <strong>Terms & Conditions:</strong> Goods once sold are verified. Subject to ${city || 'local'} jurisdiction.
            </div>
          </div>

          <table class="summary-table">
            <tr>
              <td>Taxable Value</td>
              <td class="text-right">₹${(subtotal - totalDiscount).toFixed(2)}</td>
            </tr>
            ${isInterState ? `
              <tr>
                <td>Integrated Tax (IGST)</td>
                <td class="text-right">₹${totalIgst.toFixed(2)}</td>
              </tr>
            ` : `
              <tr>
                <td>Central Tax (CGST)</td>
                <td class="text-right">₹${totalCgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td>State Tax (SGST)</td>
                <td class="text-right">₹${totalSgst.toFixed(2)}</td>
              </tr>
            `}
            <tr>
              <td>Round Off</td>
              <td class="text-right">${roundOff >= 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}</td>
            </tr>
            <tr class="grand-total-row">
              <td><strong>Invoice Grand Total</strong></td>
              <td class="text-right"><strong>₹${grandTotal.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="signature-row">
          <div class="signature-box">
            Receiver's Signature
          </div>
          <div class="signature-box">
            ${signature ? `<img src="${signature}" style="max-height:40px; margin-bottom:4px;" /><br/>` : ""}
            For <strong>${businessName}</strong><br/>
            Authorized Signatory
          </div>
        </div>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${invoiceId} - ${businessName}</title>
        <style>${cssRules}</style>
      </head>
      <body>
        ${bodyHtml}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Export Invoice to Word (.doc) File
 */
export const exportInvoiceToWord = (invoice = {}, items = [], business = {}) => {
  let storedUser = {};
  let storedBusiness = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    storedBusiness = JSON.parse(localStorage.getItem("businessData") || "{}");
  } catch (e) {}

  const businessName = business.businessName || storedBusiness.businessName || storedUser.businessName || "Merchant Store";
  const invoiceId = invoice.invoiceId || invoice.id || "INV-" + Date.now().toString().slice(-6);

  let docContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>Invoice ${invoiceId}</title>
    <style>
      body { font-family: Arial, sans-serif; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #000; padding: 6px; }
      th { background-color: #f2f2f2; }
    </style>
    </head>
    <body>
      <h1>${businessName} - TAX INVOICE</h1>
      <p><strong>Invoice No:</strong> ${invoiceId} | <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
      <p><strong>Customer:</strong> ${invoice.customerName || invoice.party || "Customer"}</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${it.itemName || it.productName || it.name}</td>
              <td>${it.quantity || it.qty || 1}</td>
              <td>₹${Number(it.price || it.unitPrice || 0).toFixed(2)}</td>
              <td>₹${(Number(it.quantity || it.qty || 1) * Number(it.price || it.unitPrice || 0)).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <h3>Total Amount: ₹${Number(invoice.totalAmount || invoice.total || 0).toFixed(2)}</h3>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_${invoiceId}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export Invoices / Sales to Excel / CSV (.csv)
 */
export const exportInvoicesToExcel = (invoices = [], filename = "Sales_Invoices_Report.csv") => {
  if (!invoices.length) {
    alert("No records to export.");
    return;
  }

  let csv = "Invoice ID,Customer Name,Phone,Date,Items Count,Total Amount (INR),Status\n";
  invoices.forEach(inv => {
    const invId = `"${inv.invoiceId || inv.id || ''}"`;
    const cust = `"${inv.customerName || inv.party || 'Walk-In'}"`;
    const phone = `"${inv.customerPhone || inv.mobile || '-'}"`;
    const date = `"${inv.date || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : '')}"`;
    const items = inv.totalItems || (inv.items ? inv.items.length : 1);
    const amount = Number(inv.totalAmount || inv.total || 0).toFixed(2);
    const status = `"${inv.status || 'SOLD'}"`;
    csv += `${invId},${cust},${phone},${date},${items},${amount},${status}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
