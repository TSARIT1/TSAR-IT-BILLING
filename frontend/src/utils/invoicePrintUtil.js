/**
 * Enterprise Indian GST Invoice Print & Export Utility
 * Supports:
 * - A4 (Standard GST Tax Invoice with SAC/HSN, CGST/SGST/IGST breakdown)
 * - A5 (Half-Sheet Compact Counter GST Invoice)
 * - 80mm Thermal Slip (Supermarket / Restaurant standard roll)
 * - 58mm Thermal Slip (Pocket / Mini Bluetooth Thermal roll)
 * - Word (.doc) Export
 * - Excel / CSV (.csv) Export
 */

export const printEnterpriseInvoice = ({
  invoice,
  items = [],
  business = {},
  printSize = "A4", // "A4", "A5", "80mm", "58mm"
}) => {
  const companyLogo = business.logo || localStorage.getItem("companyLogo") || "";
  const signature = business.signature || "";
  const businessName = business.businessName || "TSAR IT Enterprise Solutions";
  const gstNo = business.gstNo || business.gstin || "36AAAAA0000A1Z5";
  const panNo = business.panNumber || "AAAAA0000A";
  const address = business.address || "H.No 12-4/A, Main Commercial Hub, Madhapur";
  const city = business.city || "Hyderabad";
  const state = business.state || "Telangana";
  const pincode = business.pincode || "500081";
  const phone = business.phoneNo || business.companyPhone || "+91 98765 43210";
  const email = business.email || business.companyEmail || "billing@tsarit.com";

  // Invoice variables
  const invoiceId = invoice.invoiceId || invoice.id || "INV-" + Date.now().toString().slice(-6);
  const invoiceDate = invoice.date || invoice.createdAt ? new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const customerName = invoice.customerName || invoice.party || "Walk-In Customer";
  const customerPhone = invoice.customerPhone || invoice.mobile || "-";
  const customerGstin = invoice.customerGstin || "URP (Unregistered)";
  const customerAddress = invoice.customerAddress || invoice.city || "Local Market";
  const placeOfSupply = invoice.placeOfSupply || state;
  const isInterState = placeOfSupply && placeOfSupply.toLowerCase() !== state.toLowerCase();

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
    const taxPct = Number(it.tax || 18);

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
      hsn: it.hsnCode || it.hsn || "8471",
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
      body { width: 54mm; font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 2px; color: #000; }
      .thermal-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
      .thermal-title { font-size: 14px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; font-size: 10px; }
      th { border-bottom: 1px dashed #000; text-align: left; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .thermal-totals { border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; font-size: 11px; }
      .logo-img { max-width: 48mm; max-height: 25mm; display: block; margin: 0 auto 4px auto; }
    `;
  } else if (printSize === "80mm") {
    cssRules = `
      @page { size: 80mm auto; margin: 3mm; }
      body { width: 74mm; font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 4px; color: #000; }
      .thermal-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
      .thermal-title { font-size: 16px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { border-bottom: 1px dashed #000; text-align: left; padding: 2px 0; }
      td { padding: 2px 0; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .thermal-totals { border-top: 1px dashed #000; margin-top: 6px; padding-top: 6px; font-size: 12px; }
      .logo-img { max-width: 60mm; max-height: 30mm; display: block; margin: 0 auto 6px auto; }
    `;
  } else if (printSize === "A5") {
    cssRules = `
      @page { size: A5 landscape; margin: 8mm; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; margin: 0; padding: 8px; color: #1e293b; }
      .tax-invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
      .logo-img { max-height: 50px; max-width: 140px; margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
      th, td { border: 1px solid #cbd5e1; padding: 4px 6px; }
      th { background-color: #f1f5f9; font-weight: 700; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .totals-box { width: 45%; margin-left: auto; margin-top: 8px; border-collapse: collapse; }
    `;
  } else {
    // Default A4 Standard
    cssRules = `
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #0f172a; margin: 0; padding: 10px; }
      .invoice-container { border: 2px solid #0284c7; border-radius: 4px; padding: 16px; }
      .tax-invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 12px; }
      .logo-img { max-height: 70px; max-width: 180px; object-fit: contain; margin-bottom: 6px; }
      .bill-title-banner { background: #0284c7; color: #fff; text-align: center; font-weight: 800; font-size: 14px; letter-spacing: 1.5px; padding: 4px; margin: 10px 0; }
      .party-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #cbd5e1; border-radius: 4px; margin-bottom: 12px; }
      .party-col { padding: 10px; }
      .party-col:first-child { border-right: 1px solid #cbd5e1; }
      table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
      table.items-table th { background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; padding: 8px 6px; font-size: 11px; text-transform: uppercase; }
      table.items-table td { border: 1px solid #cbd5e1; padding: 6px; font-size: 11.5px; }
      .totals-container { display: flex; justify-content: space-between; margin-top: 8px; }
      .bank-details-box { border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 12px; width: 48%; }
      .summary-table { width: 48%; border-collapse: collapse; }
      .summary-table td { padding: 4px 8px; border: 1px solid #cbd5e1; }
      .grand-total-row td { background: #0284c7; color: #fff; font-weight: 800; font-size: 13px; }
      .signature-row { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; }
      .signature-box { text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 4px; font-weight: 600; font-size: 11px; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .badge-gst { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    `;
  }

  // HTML Body Builder
  let bodyHtml = "";
  if (printSize === "58mm" || printSize === "80mm") {
    bodyHtml = `
      <div class="thermal-header">
        ${companyLogo ? `<img src="${companyLogo}" class="logo-img" alt="Logo" />` : ""}
        <div class="thermal-title">${businessName}</div>
        <div>GSTIN: ${gstNo}</div>
        <div>${address}, ${city}</div>
        <div>Ph: ${phone}</div>
      </div>
      <div><strong>BILL NO:</strong> ${invoiceId}</div>
      <div><strong>DATE:</strong> ${invoiceDate}</div>
      <div><strong>CLIENT:</strong> ${customerName} (${customerPhone})</div>
      <div style="border-bottom:1px dashed #000; margin:4px 0;"></div>
      <table>
        <thead>
          <tr>
            <th>ITEM</th>
            <th class="text-center">QTY</th>
            <th class="text-right">PRICE</th>
            <th class="text-right">AMT</th>
          </tr>
        </thead>
        <tbody>
          ${processedItems.map(it => `
            <tr>
              <td>${it.name}</td>
              <td class="text-center">${it.qty}</td>
              <td class="text-right">${it.rate.toFixed(2)}</td>
              <td class="text-right">${it.taxable.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="thermal-totals">
        <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
        ${totalDiscount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Discount:</span><span>-₹${totalDiscount.toFixed(2)}</span></div>` : ""}
        <div style="display:flex; justify-content:space-between;"><span>GST Tax:</span><span>₹${totalTax.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:${printSize === '80mm' ? '14px' : '12px'}; border-top:1px dashed #000; padding-top:4px; margin-top:2px;">
          <span>NET TOTAL:</span>
          <span>₹${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <div style="text-align:center; margin-top:10px; border-top:1px dashed #000; padding-top:6px;">
        <div>Thank You! Visit Again</div>
        <div style="font-size:9px;">GST Verified Invoicing</div>
      </div>
    `;
  } else {
    // A4 / A5 Full GST Invoicing Format
    bodyHtml = `
      <div class="invoice-container">
        <div class="tax-invoice-header">
          <div>
            ${companyLogo ? `<img src="${companyLogo}" class="logo-img" alt="Logo" />` : ""}
            <h2 style="margin:0; font-size:18px; color:#0284c7; font-weight:800;">${businessName}</h2>
            <div style="color:#475569; margin-top:4px;">
              ${address}, ${city}, ${state} - ${pincode}<br/>
              <strong>Phone:</strong> ${phone} | <strong>Email:</strong> ${email}<br/>
              <span class="badge-gst">GSTIN: ${gstNo}</span> | <strong>PAN:</strong> ${panNo}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px; font-weight:900; color:#0f172a;">TAX INVOICE</div>
            <div style="font-size:11px; color:#64748b;">(Original for Recipient)</div>
            <div style="margin-top:8px; font-size:12px;">
              <strong>Invoice No:</strong> <span style="color:#0284c7; font-weight:700;">${invoiceId}</span><br/>
              <strong>Date:</strong> ${invoiceDate}<br/>
              <strong>Place of Supply:</strong> ${placeOfSupply} (${isInterState ? "Inter-State / IGST" : "Intra-State / CGST+SGST"})
            </div>
          </div>
        </div>

        <div class="party-grid">
          <div class="party-col">
            <strong style="color:#0284c7; text-transform:uppercase; font-size:11px;">Billed To (Customer):</strong>
            <div style="font-size:13px; font-weight:700; margin-top:2px;">${customerName}</div>
            <div style="color:#475569;">
              ${customerAddress}<br/>
              <strong>Phone:</strong> ${customerPhone}<br/>
              <strong>GSTIN:</strong> ${customerGstin}
            </div>
          </div>
          <div class="party-col">
            <strong style="color:#0284c7; text-transform:uppercase; font-size:11px;">Shipping / Dispatch Details:</strong>
            <div style="color:#475569; margin-top:4px;">
              <strong>Dispatch From:</strong> Main Godown Hub<br/>
              <strong>Transportation Mode:</strong> Roadways / Courier<br/>
              <strong>Vehicle No:</strong> ${invoice.vehicleNo || "N/A"} | <strong>E-Way Bill:</strong> ${invoice.ewayBillNo || "Not Required (< ₹50k)"}
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
            <strong style="color:#0284c7;">Bank & Statutory Terms:</strong>
            <div style="font-size:11px; margin-top:4px; color:#475569;">
              Bank: HDFC Bank Ltd | A/C: 50200012345678<br/>
              IFSC: HDFC0001234 | Branch: Madhapur Hitec City<br/>
              UPI ID: ${phone.replace(/[^0-9]/g, '')}@upi
            </div>
            <div style="margin-top:6px; font-size:10px; color:#64748b;">
              <strong>Terms:</strong> Goods once sold cannot be returned. Subject to ${city} jurisdiction. Interest @ 18% p.a. charged after due date.
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
export const exportInvoiceToWord = (invoice, items = [], business = {}) => {
  const businessName = business.businessName || "TSAR IT Enterprise";
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
