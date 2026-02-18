import React, { useEffect, useState } from "react";
import {
  BsFileEarmarkText,
  BsCashStack,
  BsCheckCircleFill,
  BsXCircleFill,
  BsSearch,
  BsFilter,
  BsCalendar3,
  BsDownload,
  BsPlus,
  BsPeopleFill,
  BsInboxFill,
  BsCurrencyDollar,
  BsPersonFill,
  BsTelephoneFill,
  BsCurrencyRupee,
  BsEye,
  BsX,
  BsHash,
  BsClock,
  BsBox,
  BsToggleOn,
  BsGear,
  BsPrinter,
  BsFileEarmarkPdf,
  BsFileEarmarkSpreadsheet
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../salesInvoicesList.css";
import { Link } from "react-router-dom";
import { getSales, markSaleAsPaid, getSaleItems, downloadSalesSlip } from "../../services/api";

function SalesInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("none");

  const [advancedFilter, setAdvancedFilter] = useState("none");
  const [amountValue, setAmountValue] = useState("");
  const [dateValue, setDateValue] = useState("");

  // Date filter states
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Selection states for marking as paid
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Modal states for viewing items
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Reports dropdown state
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const data = await getSales();
      // Map backend response to frontend expected format
      const mappedData = Array.isArray(data) ? data.map(sale => ({
        createdAt: sale.date,           // LocalDateTime from backend
        totalAmount: sale.amount,       // Double from backend
        invoiceId: sale.saleId,         // Using saleId as invoiceId for display
        saleItemId: sale.saleItemId,    // Sale Item ID from backend
        totalItems: sale.totalItems || 0, // Total number of items from backend
        customerName: sale.customerName,
        customerPhone: sale.phone,      // Map phone to customerPhone
        customerId: sale.customerId,
        status: sale.isPaid ? "Paid" : "Unpaid",  // Map isPaid to status from backend
        tax: sale.tax || 0,             // Tax from backend
        discount: sale.discount || 0     // Discount from backend
      })) : [];
      setInvoices(mappedData);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setInvoices([]);
    }
  };

  // Date helper functions
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  };

  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
  };

  const isDateInRange = (date, startDate, endDate) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return checkDate >= start && checkDate <= end;
  };

  const totalSales = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const paid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const unpaid = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  // Handle checkbox selection
  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([]);
      setSelectAll(false);
    } else {
      const allUnpaidIds = filteredInvoices.filter(inv => inv.status !== "Paid").map(inv => inv.invoiceId);
      setSelectedInvoices(allUnpaidIds);
      setSelectAll(true);
    }
  };

  // Handle Add Paid button click - Toggle selection mode
  const handleAddPaidClick = () => {
    setIsSelectionMode(true);
  };

  // Handle Cancel selection
  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedInvoices([]);
    setSelectAll(false);
  };

  // Handle Confirm Paid - Mark selected as paid
  const handleConfirmPaid = async () => {
    if (selectedInvoices.length === 0) {
      alert("Please select at least one invoice to mark as paid");
      return;
    }

    try {
      // Call backend API for each selected invoice
      const promises = selectedInvoices.map(invoiceId =>
        markSaleAsPaid(invoiceId)
      );

      await Promise.all(promises);

      // Refresh data from backend after successful update
      await fetchSales();

      // Exit selection mode and clear selection
      setIsSelectionMode(false);
      setSelectedInvoices([]);
      setSelectAll(false);

      alert(`${selectedInvoices.length} invoice(s) marked as Paid successfully!`);
    } catch (error) {
      console.error("Error marking sales as paid:", error);
      alert("Failed to mark sales as paid. Please try again.");
    }
  };

  // Handle View Items - Open modal and fetch sale items from backend
  const handleViewItems = async (invoice) => {
    setSelectedSale(invoice);
    setShowItemsModal(true);
    setLoadingItems(true);
    setSaleItems([]);

    try {
      // Fetch sale items from backend using the saleId (invoiceId)
      const items = await getSaleItems(invoice.invoiceId);
      setSaleItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching sale items:", error);
      setSaleItems([]);
      // Optional: Show error message to user
      alert("Failed to load sale items. Please try again.");
    } finally {
      setLoadingItems(false);
    }
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setShowItemsModal(false);
    setSelectedSale(null);
    setSaleItems([]);
    setLoadingItems(false);
  };

  // Handle Print PDF
  const handlePrintPDF = () => {
    if (!selectedSale || !saleItems || saleItems.length === 0) {
      alert("No sale items to print");
      return;
    }

    try {
      const businessData = JSON.parse(localStorage.getItem("businessData") || "{}");
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Calculate totals
      let subtotal = 0;
      let totalTaxAmount = 0;
      let totalDiscountAmount = 0;

      saleItems.forEach(item => {
        const itemBaseAmount = (item.quantity || 0) * (item.price || item.unitPrice || 0);
        const taxPercent = item.tax || 0;
        const discountPercent = item.discount || 0;

        const taxAmount = (itemBaseAmount * taxPercent) / 100;
        const discountAmount = (itemBaseAmount * discountPercent) / 100;

        subtotal += itemBaseAmount;
        totalTaxAmount += taxAmount;
        totalDiscountAmount += discountAmount;
      });

      const grandTotal = subtotal + totalTaxAmount - totalDiscountAmount;

      // Open print window
      const printWindow = window.open('', '', 'width=800,height=600');

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sale Invoice - ${selectedSale.customerName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #333;
              font-size: 24px;
              margin-bottom: 5px;
            }
            .business-info {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 5px;
            }
            .invoice-details div {
              font-size: 13px;
            }
            .invoice-details strong {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #007bff;
              color: white;
              font-weight: bold;
              text-align: center;
            }
            td {
              text-align: center;
            }
            .totals {
              margin-top: 20px;
              float: right;
              width: 300px;
            }
            .totals table {
              margin: 0;
            }
            .totals td {
              border: none;
              padding: 5px 10px;
            }
            .totals .grand-total {
              font-weight: bold;
              font-size: 14px;
              background: #007bff;
              color: white;
              border-top: 2px solid #333;
            }
            .footer {
              clear: both;
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #666;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
            }
            .signature-box {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 50px;
              padding-top: 5px;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALES INVOICE</h1>
            <div class="business-info">
              ${businessData.businessName ? `<strong>${businessData.businessName}</strong><br>` : ''}
              ${businessData.address ? `${businessData.address}, ` : ''}${businessData.city || ''} ${businessData.state || ''} - ${businessData.pincode || ''}<br>
              ${businessData.phoneNo ? `Phone: ${businessData.phoneNo} | ` : ''}${businessData.email ? `Email: ${businessData.email}` : ''}<br>
              ${businessData.gstNo ? `GSTIN: ${businessData.gstNo}` : ''}
            </div>
          </div>

          <div class="invoice-details">
            <div>
              <strong>Invoice ID:</strong> ${selectedSale.invoiceId}<br>
              <strong>Customer:</strong> ${selectedSale.customerName}<br>
              <strong>Phone:</strong> ${selectedSale.customerPhone || '-'}
            </div>
            <div style="text-align: right;">
              <strong>Date:</strong> ${currentDate}<br>
              <strong>Total Items:</strong> ${selectedSale.totalItems || 0}<br>
              <strong>Status:</strong> ${selectedSale.status || 'SOLD'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Tax %</th>
                <th>Discount %</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
      `;

      saleItems.forEach((item, index) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.price || item.unitPrice || 0;
        const taxPercent = item.tax || 0;
        const discountPercent = item.discount || 0;
        const totalPrice = item.totalPrice || 0;

        htmlContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.productName || 'N/A'}</td>
            <td>${quantity}</td>
            <td>₹${unitPrice.toFixed(2)}</td>
            <td>${taxPercent.toFixed(2)}%</td>
            <td>${discountPercent.toFixed(2)}%</td>
            <td>₹${totalPrice.toFixed(2)}</td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td style="text-align: right;">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #28a745;"><strong>Tax (+):</strong></td>
                <td style="text-align: right; color: #28a745;">₹${totalTaxAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #dc3545;"><strong>Discount (-):</strong></td>
                <td style="text-align: right; color: #dc3545;">₹${totalDiscountAmount.toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td><strong>Grand Total:</strong></td>
                <td style="text-align: right;"><strong>₹${grandTotal.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              ${businessData.signature ? `<img src="${businessData.signature}" alt="Signature" class="signature-image" />` : ''}
              <div class="signature-line">Authorized Signature</div>
              <p style="margin-top: 5px; font-size: 14px; color: #666;">${businessData.businessName || "Business Name"}</p>
            </div>
            <div class="signature-box">
              <div class="signature-line">Date</div>
              <p style="margin-top: 5px; font-size: 14px; color: #666;">${currentDate}</p>
            </div>
          </div>
      `;

      htmlContent += `
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
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report");
    }
  };

  // Handle Download Sales Slip
  const handleDownloadSlip = async () => {
    if (!selectedSale || !saleItems || saleItems.length === 0) {
      alert("No sale items to download");
      return;
    }

    try {
      // Get business ID from localStorage
      const userBusinessId = localStorage.getItem("userBusinessId");

      if (!userBusinessId) {
        alert("Business ID not found. Please log in again.");
        return;
      }

      console.log("Downloading sales slip for invoice:", selectedSale.invoiceId);

      // Call API to download sales slip
      const blob = await downloadSalesSlip(selectedSale.invoiceId, userBusinessId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-slip-${selectedSale.invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Sales slip downloaded successfully");
      alert("Sales slip downloaded successfully!");
    } catch (error) {
      console.error("Error downloading sales slip:", error);
      alert("Failed to download sales slip: " + (error.message || "Unknown error"));
    }
  };

  // Filtered & Sorted Data
  const filteredInvoices = invoices
    .filter((i) => {
      // SEARCH FILTER
      const matchesSearch =
        i.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        i.invoiceId?.toLowerCase().includes(search.toLowerCase());

      if (advancedFilter === "none") return matchesSearch;

      // STATUS FILTER
      if (advancedFilter === "status") {
        const matchesStatus =
          statusFilter === "All" ? true : i.status === statusFilter;
        return matchesSearch && matchesStatus;
      }

      // AMOUNT FILTER
      if (advancedFilter === "amount") {
        if (!amountValue) return matchesSearch;
        return matchesSearch && i.totalAmount === Number(amountValue);
      }

      // DATE FILTER
      if (advancedFilter === "date") {
        if (dateFilterType === "all") return matchesSearch;

        if (!i.createdAt) return false;
        const saleDate = new Date(i.createdAt);

        if (dateFilterType === "today") {
          return matchesSearch && isSameDay(saleDate, getToday());
        }

        if (dateFilterType === "yesterday") {
          return matchesSearch && isSameDay(saleDate, getYesterday());
        }

        if (dateFilterType === "custom") {
          if (!customStartDate || !customEndDate) return matchesSearch;
          return matchesSearch && isDateInRange(saleDate, customStartDate, customEndDate);
        }

        return matchesSearch;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "amount") return (b.totalAmount || 0) - (a.totalAmount || 0);
      return 0;
    });

  // Download PDF Report
  const handleDownloadPDF = async () => {
    try {
      const businessData = JSON.parse(localStorage.getItem("businessData") || "{}");

      if (invoices.length === 0) {
        alert("No sales invoices to export");
        return;
      }

      // Get current date
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Create print window
      const printWindow = window.open('', '_blank');

      // Build HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Invoices Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .logo { max-width: 150px; max-height: 80px; margin-bottom: 10px; }
            .business-info { margin-bottom: 20px; }
            .business-info h2 { margin: 5px 0; }
            .business-info p { margin: 3px 0; font-size: 14px; color: #666; }
            .report-title { font-size: 24px; font-weight: bold; color: #007bff; margin: 10px 0; }
            .report-date { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; }
            th { background-color: #007bff; color: white; font-weight: bold; }
            .customer-section { margin-top: 30px; page-break-inside: avoid; }
            .customer-header { background-color: #f8f9fa; padding: 10px; margin: 15px 0; border-left: 4px solid #007bff; }
            .signature-section { margin-top: 60px; padding-top: 30px; border-top: 2px solid #dee2e6; page-break-inside: avoid; }
            .signature-container { display: flex; justify-content: space-between; margin-top: 40px; }
            .signature-box { width: 45%; text-align: center; }
            .signature-line { border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; font-weight: 600; }
            .signature-image { max-width: 150px; max-height: 60px; margin-bottom: 10px; }
            @media print {
              body { padding: 10px; }
              .customer-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-info">
              ${businessData.logo ? `<img src="${businessData.logo}" alt="Logo" class="logo" />` : ''}
              <h2>${businessData.businessName || "Business Name"}</h2>
              <p>Phone: ${businessData.phoneNo || "-"} | Email: ${businessData.email || "-"}</p>
              <p>GSTIN: ${businessData.gstNo || "Not Registered"}</p>
              ${businessData.address ? `<p>Address: ${[businessData.address, businessData.city, businessData.state, businessData.pincode].filter(x => x).join(", ")}</p>` : ''}
            </div>
            <div class="report-title">SALES INVOICES REPORT</div>
            <div class="report-date">Report Date: ${currentDate}</div>
          </div>
      `;

      // Group invoices by customer
      const customerGroups = {};
      invoices.forEach(inv => {
        const customerKey = inv.customerId || inv.customerName;
        if (!customerGroups[customerKey]) {
          customerGroups[customerKey] = {
            customerName: inv.customerName,
            customerPhone: inv.customerPhone,
            invoices: []
          };
        }
        customerGroups[customerKey].invoices.push(inv);
      });

      // Add customer-wise sections
      for (const [customerId, group] of Object.entries(customerGroups)) {
        const totalAmount = group.invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        htmlContent += `
          <div class="customer-section">
            <div class="customer-header">
              <h3>Customer: ${group.customerName}</h3>
              <p>Phone: ${group.customerPhone || "-"} | Total Invoices: ${group.invoices.length} | Total Amount: ₹${totalAmount.toFixed(2)}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice ID</th>
                  <th>Total Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
        `;

        group.invoices.forEach(inv => {
          const saleDate = inv.createdAt ? new Date(inv.createdAt) : null;
          const dateStr = saleDate ? `${String(saleDate.getDate()).padStart(2, '0')}/${String(saleDate.getMonth() + 1).padStart(2, '0')}/${saleDate.getFullYear()}` : '-';

          htmlContent += `
            <tr>
              <td>${dateStr}</td>
              <td>${inv.invoiceId}</td>
              <td>${inv.totalItems || 0}</td>
              <td>₹${(inv.totalAmount || 0).toFixed(2)}</td>
              <td>${inv.status || "SOLD"}</td>
            </tr>
          `;
        });

        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
      }

      // Add signature section
      htmlContent += `
        <div class="signature-section">
          <div class="signature-container">
            <div class="signature-box">
              ${businessData.signature ? `<img src="${businessData.signature}" alt="Signature" class="signature-image" />` : ''}
              <div class="signature-line">Authorized Signature</div>
              <p style="margin-top: 5px; font-size: 14px; color: #666;">${businessData.businessName || "Business Name"}</p>
            </div>
            <div class="signature-box">
              <div class="signature-line">Date</div>
              <p style="margin-top: 5px; font-size: 14px; color: #666;">${currentDate}</p>
            </div>
          </div>
        </div>
      `;

      htmlContent += `
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
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF report");
    }
  };

  // Download CSV Report
  const handleDownloadCSV = async () => {
    try {
      const businessData = JSON.parse(localStorage.getItem("businessData") || "{}");

      if (invoices.length === 0) {
        alert("No sales invoices to export");
        return;
      }

      // Get current date
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Build CSV content with professional header
      let csvContent = "";

      // Business Details Section
      if (businessData.businessName) {
        csvContent += "BUSINESS DETAILS\n";
        csvContent += `Business Name:,${businessData.businessName || ""}\n`;
        csvContent += `Phone:,${businessData.phoneNo || ""}\n`;
        csvContent += `Email:,${businessData.email || ""}\n`;
        csvContent += `GSTIN:,${businessData.gstNo || "Not Registered"}\n`;

        // Format address
        const addressParts = [
          businessData.address,
          businessData.city,
          businessData.state,
          businessData.pincode
        ].filter(part => part);
        const address = addressParts.join(", ");
        csvContent += `Address:,"${address}"\n`;
        csvContent += "\n";
      }

      // Report Title and Date
      csvContent += "SALES INVOICES REPORT\n";
      csvContent += "\n";
      csvContent += `Report Date:,${currentDate}\n`;
      csvContent += "\n";

      // Summary Section
      const totalSalesAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter(inv => inv.status === "Paid").length;
      const unpaidInvoices = invoices.filter(inv => inv.status === "Unpaid").length;

      csvContent += "SUMMARY\n";
      csvContent += `Total Invoices:,${totalInvoices}\n`;
      csvContent += `Total Sales Amount (Rs):,${totalSalesAmount.toFixed(2)}\n`;
      csvContent += `Paid Invoices:,${paidInvoices}\n`;
      csvContent += `Unpaid Invoices:,${unpaidInvoices}\n`;
      csvContent += "\n";
      csvContent += "\n";

      // Group invoices by customer
      const customerGroups = {};
      invoices.forEach(inv => {
        const customerKey = inv.customerId || inv.customerName;
        if (!customerGroups[customerKey]) {
          customerGroups[customerKey] = {
            customerName: inv.customerName,
            customerPhone: inv.customerPhone,
            invoices: []
          };
        }
        customerGroups[customerKey].invoices.push(inv);
      });

      // Customer-wise Sales Details
      for (const [customerId, group] of Object.entries(customerGroups)) {
        const totalAmount = group.invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        csvContent += "=".repeat(80) + "\n";
        csvContent += `CUSTOMER: ${group.customerName}\n`;
        csvContent += "=".repeat(80) + "\n";
        csvContent += `Phone:,${group.customerPhone || "-"}\n`;
        csvContent += `Total Invoices:,${group.invoices.length}\n`;
        csvContent += `Total Amount (Rs):,${totalAmount.toFixed(2)}\n`;
        csvContent += "\n";

        // Process each invoice for this customer
        for (const inv of group.invoices) {
          const saleDate = inv.createdAt ? new Date(inv.createdAt) : null;
          const dateStr = saleDate ? `${String(saleDate.getDate()).padStart(2, '0')}/${String(saleDate.getMonth() + 1).padStart(2, '0')}/${saleDate.getFullYear()}` : '-';
          const timeStr = saleDate ? saleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';

          // Invoice header
          csvContent += `-`.repeat(80) + "\n";
          csvContent += `Invoice ID: ${inv.invoiceId}\n`;
          csvContent += `Date: ${dateStr} | Time: ${timeStr} | Status: ${inv.status || "SOLD"}\n`;
          csvContent += `-`.repeat(80) + "\n";

          // Fetch sale items for this invoice
          try {
            const items = await getSaleItems(inv.invoiceId);

            if (items && items.length > 0) {
              // Sale items table header
              csvContent += "Sr No,Product Name,Quantity,Unit Price (Rs),Tax %,Tax Amount (Rs),Discount %,Discount Amount (Rs),Subtotal (Rs),Total Amount (Rs)\n";

              let invoiceSubtotal = 0;
              let invoiceTotalTax = 0;
              let invoiceTotalDiscount = 0;

              // Sale items rows
              items.forEach((item, index) => {
                const quantity = item.quantity || 0;
                const unitPrice = item.price || item.unitPrice || 0;
                const taxPercent = item.tax || 0;
                const discountPercent = item.discount || 0;

                // Calculate amounts
                const itemBaseAmount = quantity * unitPrice;
                const taxAmount = (itemBaseAmount * taxPercent) / 100;
                const discountAmount = (itemBaseAmount * discountPercent) / 100;
                const subtotal = itemBaseAmount;
                const totalAmount = itemBaseAmount + taxAmount - discountAmount;

                invoiceSubtotal += subtotal;
                invoiceTotalTax += taxAmount;
                invoiceTotalDiscount += discountAmount;

                csvContent += `${index + 1},`;
                csvContent += `"${item.productName || 'N/A'}",`;
                csvContent += `${quantity},`;
                csvContent += `${unitPrice.toFixed(2)},`;
                csvContent += `${taxPercent.toFixed(2)},`;
                csvContent += `${taxAmount.toFixed(2)},`;
                csvContent += `${discountPercent.toFixed(2)},`;
                csvContent += `${discountAmount.toFixed(2)},`;
                csvContent += `${subtotal.toFixed(2)},`;
                csvContent += `${totalAmount.toFixed(2)}\n`;
              });

              // Invoice totals
              const invoiceGrandTotal = invoiceSubtotal + invoiceTotalTax - invoiceTotalDiscount;
              csvContent += "\n";
              csvContent += `,,,,,,,,Subtotal:,${invoiceSubtotal.toFixed(2)}\n`;
              csvContent += `,,,,,,,,Total Tax (+):,${invoiceTotalTax.toFixed(2)}\n`;
              csvContent += `,,,,,,,,Total Discount (-):,${invoiceTotalDiscount.toFixed(2)}\n`;
              csvContent += `,,,,,,,,Grand Total:,${invoiceGrandTotal.toFixed(2)}\n`;
            } else {
              csvContent += "No items found for this invoice\n";
            }
          } catch (error) {
            console.error(`Error fetching items for invoice ${inv.invoiceId}:`, error);
            csvContent += "Error loading items for this invoice\n";
          }

          csvContent += "\n";
        }
        csvContent += "\n";
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sales_Invoices_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      console.log("CSV downloaded successfully");
      alert("CSV report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Failed to download CSV report: " + (error.message || "Unknown error"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="sales-invoices-page-header">
            <div className="sales-invoices-header-content">
              <div className="sales-invoices-title-section">
                <h2 className="sales-invoices-page-title">
                  <BsFileEarmarkText className="sales-invoices-title-icon" /> Sales Invoices
                </h2>
                <p className="sales-invoices-page-subtitle">View and manage all sales invoices</p>
              </div>
              <div className="sales-invoices-header-actions">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    className="sales-invoices-report-btn"
                    onClick={() => setShowReportsDropdown(!showReportsDropdown)}
                    title="Reports"
                  >
                    <BsFileEarmarkPdf /> Reports
                  </button>
                  {showReportsDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '5px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '180px'
                    }}>
                      <button
                        onClick={() => {
                          handleDownloadPDF();
                          setShowReportsDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <BsFileEarmarkPdf style={{ color: '#e8961b' }} /> Download as PDF
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadCSV();
                          setShowReportsDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <BsFileEarmarkSpreadsheet style={{ color: '#1d6f42' }} /> Download as CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="sales-invoices-summary-row">
            <div className="sales-invoices-summary-card total-sales">
              <div className="sales-invoices-card-icon-wrapper total-sales-icon">
                <BsCashStack className="sales-invoices-card-icon" />
              </div>
              <div className="sales-invoices-card-content">
                <h4>Total Sales</h4>
                <p>₹ {totalSales.toFixed(2)}</p>
              </div>
            </div>

            <div className="sales-invoices-summary-card paid-sales">
              <div className="sales-invoices-card-icon-wrapper paid-sales-icon">
                <BsCheckCircleFill className="sales-invoices-card-icon" />
              </div>
              <div className="sales-invoices-card-content">
                <h4>Paid</h4>
                <p>₹ {paid.toFixed(2)}</p>
              </div>
            </div>

            <div className="sales-invoices-summary-card unpaid-sales">
              <div className="sales-invoices-card-icon-wrapper unpaid-sales-icon">
                <BsXCircleFill className="sales-invoices-card-icon" />
              </div>
              <div className="sales-invoices-card-content">
                <h4>Unpaid</h4>
                <p>₹ {unpaid.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Filters + Buttons */}
          <div className="sales-invoices-filters-container">
            <div className="sales-invoices-filters-left">
              <div className="sales-invoices-search-box">
                <BsSearch className="sales-invoices-search-icon" />
                <input
                  type="text"
                  placeholder="Search by party or invoice number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sales-invoices-search-input"
                />
              </div>

              <div className="sales-invoices-filter-group">
                <BsFilter className="sales-invoices-filter-icon" />
                <select
                  value={advancedFilter}
                  onChange={(e) => {
                    setAdvancedFilter(e.target.value);
                    setAmountValue("");
                    setDateValue("");
                  }}
                  className="sales-invoices-filter-select"
                >
                  <option value="none">Select Filter</option>
                  <option value="status">By Status</option>
                  <option value="amount">By Amount</option>
                  <option value="date">By Date</option>
                </select>
              </div>

              {advancedFilter === "status" && (
                <div className="sales-invoices-status-filter">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="sales-invoices-status-select"
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              )}

              {advancedFilter === "amount" && (
                <div className="sales-invoices-amount-filter">
                  <BsCurrencyRupee className="sales-invoices-amount-icon" />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                    className="sales-invoices-amount-input"
                  />
                </div>
              )}

              {advancedFilter === "date" && (
                <>
                  <div className="sales-invoices-date-filter">
                    <BsCalendar3 className="sales-invoices-date-icon" />
                    <select
                      value={dateFilterType}
                      onChange={(e) => {
                        setDateFilterType(e.target.value);
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                      className="sales-invoices-filter-select"
                      style={{ minWidth: '150px' }}
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {dateFilterType === "custom" && (
                    <>
                      <div className="sales-invoices-date-filter">
                        <input
                          type="date"
                          placeholder="Start Date"
                          value={customStartDate}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="sales-invoices-date-input"
                        />
                      </div>
                      <div className="sales-invoices-date-filter">
                        <input
                          type="date"
                          placeholder="End Date"
                          value={customEndDate}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="sales-invoices-date-input"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="sales-invoices-filters-right">
              {isSelectionMode ? (
                <>
                  <button
                    className="sales-invoices-create-btn"
                    style={{
                      marginRight: '10px',
                      backgroundColor: '#dc3545'
                    }}
                    onClick={handleCancelSelection}
                  >
                    <BsXCircleFill /> Cancel
                  </button>
                  <button
                    className="sales-invoices-create-btn"
                    style={{
                      marginRight: '10px',
                      backgroundColor: selectedInvoices.length > 0 ? '#28a745' : '#6c757d',
                      cursor: selectedInvoices.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                    onClick={handleConfirmPaid}
                    disabled={selectedInvoices.length === 0}
                  >
                    <BsCheckCircleFill /> Confirm Paid ({selectedInvoices.length})
                  </button>
                </>
              ) : (
                <button
                  className="sales-invoices-create-btn"
                  style={{ marginRight: '10px', backgroundColor: '#28a745' }}
                  onClick={handleAddPaidClick}
                >
                  <BsCheckCircleFill /> Add Paid
                </button>
              )}
              <Link to="/create-invoice">
                <button className="sales-invoices-create-btn">
                  <BsPlus /> Create Invoice
                </button>
              </Link>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="sales-invoices-table-container">
            <table className="sales-invoices-table">
              <thead>
                <tr>
                  {isSelectionMode && <th></th>}
                  <th><BsHash /> Sr No</th>
                  <th><BsCalendar3 /> Date</th>
                  <th><BsClock /> Time</th>

                  <th><BsPeopleFill /> Customer Name</th>
                  <th><BsTelephoneFill /> Mobile</th>
                  <th><BsCashStack /> Amount</th>
                  <th><BsBox /> Total Items</th>
                  <th><BsToggleOn /> Status</th>

                  <th><BsGear /> Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={isSelectionMode ? "10" : "9"} className="sales-invoices-empty-state">
                      <BsInboxFill className="sales-invoices-empty-icon" />
                      <h3>No Sold Invoices Found</h3>
                      <p>
                        {search || advancedFilter !== "none"
                          ? "No sold invoices matching the current filter"
                          : "No invoices have been confirmed as sales yet"}
                      </p>
                      {!search && advancedFilter === "none" && (
                        <Link to="/create-invoice">
                          <button className="sales-invoices-empty-add-btn">
                            <BsPlus /> Create Invoice
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, i) => {
                    const saleDate = inv.createdAt ? new Date(inv.createdAt) : null;
                    const isSelected = selectedInvoices.includes(inv.invoiceId);
                    const isUnpaid = inv.status !== "Paid";

                    return (
                      <tr
                        key={i}
                        style={{
                          backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                          cursor: isSelectionMode && isUnpaid ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (isSelectionMode && isUnpaid) {
                            handleSelectInvoice(inv.invoiceId);
                          }
                        }}
                      >
                        {isSelectionMode && (
                          <td onClick={(e) => e.stopPropagation()}>
                            {isUnpaid ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectInvoice(inv.invoiceId)}
                                style={{ cursor: 'pointer' }}
                              />
                            ) : (
                              <span style={{ color: '#6c757d' }}>-</span>
                            )}
                          </td>
                        )}
                        <td style={{ textAlign: 'center' }}>{i + 1}</td>
                        <td>{saleDate ? `${String(saleDate.getDate()).padStart(2, '0')}/${String(saleDate.getMonth() + 1).padStart(2, '0')}/${saleDate.getFullYear()}` : '-'}</td>
                        <td>{saleDate ? saleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</td>
                        <td className="customer-name-cell">
                          <BsPersonFill className="customer-icon" /> {inv.customerName}
                        </td>
                        <td>
                          <BsTelephoneFill className="customer-icon" /> {inv.customerPhone || "-"}
                        </td>
                        <td className="amount-cell" style={{ textAlign: 'center' }}>₹ {inv.totalAmount?.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>{inv.totalItems || 0}</td>
                        <td>
                          <span className={`sales-invoices-status-badge ${inv.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                            {inv.status === 'Paid' ? <BsCheckCircleFill /> : <BsXCircleFill />}
                            {inv.status || "SOLD"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewItems(inv);
                            }}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <BsEye /> View Items
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Items Modal */}
      {showItemsModal && selectedSale && (
        <div
          className="modal"
          style={{
            display: 'block',
            position: 'fixed',
            zIndex: 1050,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'auto',
            backgroundColor: 'rgba(0,0,0,0.4)'
          }}
          onClick={handleCloseModal}
        >
          <div
            className="modal-dialog modal-lg"
            style={{ marginTop: '50px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <h5 className="modal-title" style={{ fontWeight: 'bold', color: '#333' }}>
                  <BsFileEarmarkText style={{ marginRight: '10px' }} />
                  Sale Items - {selectedSale.customerName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  style={{ cursor: 'pointer' }}
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div><strong>Sale ID:</strong> #{selectedSale.invoiceId}</div>
                    <div><strong>Customer:</strong> {selectedSale.customerName}</div>
                    <div><strong>Phone:</strong> {selectedSale.customerPhone || '-'}</div>
                    <div><strong>Date:</strong> {selectedSale.createdAt ? (() => {
                      const date = new Date(selectedSale.createdAt);
                      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    })() : '-'}</div>
                    <div><strong>Total Items:</strong> {selectedSale.totalItems || 0}</div>
                    {selectedSale.tax > 0 && (
                      <div><strong>Tax:</strong> <span style={{ color: '#28a745' }}>₹{selectedSale.tax?.toFixed(2)}</span></div>
                    )}
                    {selectedSale.discount > 0 && (
                      <div><strong>Discount:</strong> <span style={{ color: '#dc3545' }}>₹{selectedSale.discount?.toFixed(2)}</span></div>
                    )}
                    <div><strong>Total Amount:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>₹{selectedSale.totalAmount?.toFixed(2)}</span></div>
                  </div>
                </div>

                <h6 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Items Details:</h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
                      <tr>
                        <th style={{ textAlign: 'center' }}>Sr No</th>
                        <th style={{ textAlign: 'center' }}>Sale Item ID</th>
                        <th style={{ textAlign: 'center' }}>Product Name</th>
                        <th style={{ textAlign: 'center' }}>Quantity</th>
                        <th style={{ textAlign: 'center' }}>Unit Price</th>
                        <th style={{ textAlign: 'center' }}>Tax</th>
                        <th style={{ textAlign: 'center' }}>Discount</th>
                        <th style={{ textAlign: 'center' }}>Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingItems ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p style={{ marginTop: '10px', color: '#666' }}>Loading sale items...</p>
                          </td>
                        </tr>
                      ) : saleItems.length > 0 ? (
                        saleItems.map((item, index) => (
                          <tr key={item.saleItemId || index}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ textAlign: 'center' }}>{item.saleItemId || '-'}</td>
                            <td style={{ textAlign: 'center' }}>{item.productName || 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity || 0}</td>
                            <td style={{ textAlign: 'center' }}>₹{(item.price || item.unitPrice)?.toFixed(2) || '0.00'}</td>
                            <td style={{ textAlign: 'center', color: '#28a745' }}>{(item.tax || 0).toFixed(2)}%</td>
                            <td style={{ textAlign: 'center', color: '#dc3545' }}>{(item.discount || 0).toFixed(2)}%</td>
                            <td style={{ textAlign: 'center' }}>₹{item.totalPrice?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            <BsInboxFill style={{ fontSize: '2rem', marginBottom: '10px' }} />
                            <p>No items found</p>
                          </td>
                        </tr>
                      )}
                      {!loadingItems && saleItems.length > 0 && (() => {
                        // Calculate subtotal (sum of quantity * price for all items)
                        const subtotal = saleItems.reduce((sum, item) => {
                          const itemBaseAmount = (item.quantity || 0) * (item.price || item.unitPrice || 0);
                          return sum + itemBaseAmount;
                        }, 0);

                        // Calculate average tax percentage (weighted by item base amounts)
                        let totalTaxAmount = 0;
                        let totalDiscountAmount = 0;

                        saleItems.forEach(item => {
                          const itemBaseAmount = (item.quantity || 0) * (item.price || item.unitPrice || 0);
                          const taxPercent = item.tax || 0;
                          const discountPercent = item.discount || 0;

                          // Calculate tax and discount in rupees for this item
                          totalTaxAmount += (itemBaseAmount * taxPercent) / 100;
                          totalDiscountAmount += (itemBaseAmount * discountPercent) / 100;
                        });

                        // Calculate grand total: subtotal + tax - discount
                        const grandTotal = subtotal + totalTaxAmount - totalDiscountAmount;

                        return (
                          <>
                            {/* Subtotal Row */}
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <td colSpan="7" style={{ textAlign: 'right', fontWeight: '500' }}>Subtotal:</td>
                              <td style={{ fontWeight: '500' }}>
                                ₹{subtotal.toFixed(2)}
                              </td>
                            </tr>

                            {/* Tax Row - Calculated from percentages */}
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <td colSpan="7" style={{ textAlign: 'right', fontWeight: '500', color: '#28a745' }}>
                                Tax (+):
                              </td>
                              <td style={{ fontWeight: '500', color: '#28a745' }}>
                                ₹{totalTaxAmount.toFixed(2)}
                              </td>
                            </tr>

                            {/* Discount Row - Calculated from percentages */}
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <td colSpan="7" style={{ textAlign: 'right', fontWeight: '500', color: '#dc3545' }}>
                                Discount (-):
                              </td>
                              <td style={{ fontWeight: '500', color: '#dc3545' }}>
                                ₹{totalDiscountAmount.toFixed(2)}
                              </td>
                            </tr>

                            {/* Grand Total Row */}
                            <tr style={{ backgroundColor: '#007bff', color: 'white', fontWeight: 'bold' }}>
                              <td colSpan="7" style={{ textAlign: 'right', padding: '10px' }}>Grand Total:</td>
                              <td style={{ padding: '10px' }}>₹{grandTotal.toFixed(2)}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleDownloadSlip}
                  disabled={loadingItems || saleItems.length === 0}
                  style={{ marginRight: '10px' }}
                >
                  <BsDownload /> Download Slip
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePrintPDF}
                  disabled={loadingItems || saleItems.length === 0}
                >
                  <BsPrinter /> Print / PDF
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  <BsX /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SalesInvoices;
