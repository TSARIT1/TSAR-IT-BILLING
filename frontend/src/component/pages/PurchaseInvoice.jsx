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
  BsPrinter
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../salesInvoicesList.css";
import { Link } from "react-router-dom";
import { getInvoices, confirmPurchase, getInvoiceItems, downloadPurchaseSlip } from "../../services/api";

function PurchaseInvoices() {
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
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    const userId = localStorage.getItem("userId");
    try {
      // Fetch from backend
      const data = await getInvoices(userId);
      console.log("All invoices from backend:", data);
      console.log("Number of invoices found:", data ? data.length : 0);

      // Filter to only show valid purchase invoices
      // Handle null/undefined as false for boolean fields
      const validPurchaseInvoices = Array.isArray(data)
        ? data.filter(inv => {
          const totalItems = inv.totalItems || 0;
          const isSaled = inv.isSaled === true;
          const isDeleted = inv.isDeleted === true;

          return totalItems > 0 && !isSaled && !isDeleted;
        })
        : [];

      console.log("Filtered purchase invoices:", validPurchaseInvoices);

      // Map to expected format
      const mappedData = validPurchaseInvoices.map(purchase => ({
        createdAt: purchase.invoiceDate || purchase.date,
        totalAmount: purchase.totalAmount || 0,
        invoiceId: purchase.invoiceId,
        totalItems: purchase.totalItems || 0,
        supplierName: purchase.customerName, // Backend uses customerName field
        supplierPhone: purchase.mobileNo,
        supplierId: purchase.customerId, // Backend uses customerId field
        isPurchased: purchase.isPurchased || false, // Backend field for confirmed purchases
        isPaid: purchase.isPaid || false,
        items: purchase.items || []
      }));

      setInvoices(mappedData);
    } catch (error) {
      console.error("Error fetching purchases:", error);
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

  const totalPurchases = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const paid = invoices
    .filter((i) => i.isPaid === true)
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const unpaid = invoices
    .filter((i) => i.isPaid !== true)
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
      const allUnpurchasedIds = filteredInvoices.filter(inv => !inv.isPurchased).map(inv => inv.invoiceId);
      setSelectedInvoices(allUnpurchasedIds);
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

  // Handle Confirm Purchase - Confirm selected purchases (updates stock)
  const handleConfirmPurchase = async () => {
    if (selectedInvoices.length === 0) {
      alert("Please select at least one invoice to confirm purchase");
      return;
    }

    // Filter to only allow unpurchased invoices
    const unpurchasedInvoices = selectedInvoices.filter(id => {
      const invoice = invoices.find(inv => inv.invoiceId === id);
      return invoice && !invoice.isPurchased;
    });

    if (unpurchasedInvoices.length === 0) {
      alert("All selected invoices have already been confirmed as purchased");
      return;
    }

    try {
      // Call backend API for each selected invoice
      const promises = unpurchasedInvoices.map(invoiceId =>
        confirmPurchase(invoiceId)
      );

      await Promise.all(promises);

      // Refresh data from backend after successful update
      await fetchPurchases();

      // Exit selection mode and clear selection
      setIsSelectionMode(false);
      setSelectedInvoices([]);
      setSelectAll(false);

      alert(`${unpurchasedInvoices.length} purchase(s) confirmed successfully! Stock has been updated.`);
    } catch (error) {
      console.error("Error confirming purchases:", error);
      alert("Failed to confirm purchases. Please try again.");
    }
  };

  // Handle View Items - Open modal and fetch purchase items from backend
  const handleViewItems = async (invoice) => {
    setSelectedPurchase(invoice);
    setShowItemsModal(true);
    setLoadingItems(true);
    setPurchaseItems([]);

    try {
      // Fetch purchase items from backend using the invoiceId
      const items = await getInvoiceItems(invoice.invoiceId);
      setPurchaseItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching purchase items:", error);
      setPurchaseItems([]);
      // Optional: Show error message to user
      alert("Failed to load purchase items. Please try again.");
    } finally {
      setLoadingItems(false);
    }
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setShowItemsModal(false);
    setSelectedPurchase(null);
    setPurchaseItems([]);
    setLoadingItems(false);
  };

  // Handle Print PDF
  const handlePrintPDF = () => {
    if (!selectedPurchase || purchaseItems.length === 0) {
      alert("No items to print");
      return;
    }

    // Calculate totals
    const subtotal = purchaseItems.reduce((sum, item) => {
      const itemBaseAmount = Number(item.qty || 0) * Number(item.price || 0);
      return sum + itemBaseAmount;
    }, 0);

    let totalTaxAmount = 0;
    let totalDiscountAmount = 0;

    purchaseItems.forEach(item => {
      const itemBaseAmount = Number(item.qty || 0) * Number(item.price || 0);
      const taxPercent = Number(item.tax || 0);
      const discountPercent = Number(item.discount || 0);

      totalTaxAmount += (itemBaseAmount * taxPercent) / 100;
      totalDiscountAmount += (itemBaseAmount * discountPercent) / 100;
    });

    const grandTotal = subtotal + totalTaxAmount - totalDiscountAmount;

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Invoice - ${selectedPurchase.invoiceId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; color: #007bff; margin-bottom: 20px; }
            .info-section { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #dee2e6; padding: 10px; text-align: center; }
            th { background-color: #007bff; color: white; font-weight: bold; }
            .summary-row { background-color: #f8f9fa; font-weight: 500; }
            .total-row { background-color: #007bff; color: white; font-weight: bold; }
            .tax-color { color: #28a745; }
            .discount-color { color: #dc3545; }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h2>Purchase Invoice</h2>
          
          <div class="info-section">
            <div class="info-grid">
              <div><strong>Purchase ID:</strong> #${selectedPurchase.invoiceId}</div>
              <div><strong>Supplier:</strong> ${selectedPurchase.supplierName}</div>
              <div><strong>Phone:</strong> ${selectedPurchase.supplierPhone || '-'}</div>
              <div><strong>Date:</strong> ${selectedPurchase.createdAt ? (() => {
        const date = new Date(selectedPurchase.createdAt);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      })() : '-'}</div>
              <div><strong>Total Items:</strong> ${selectedPurchase.totalItems || 0}</div>
            </div>
          </div>

          <h3>Items Details</h3>
          <table>
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseItems.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.itemName || 'N/A'}</td>
                  <td>${Number(item.qty || 0)}</td>
                  <td>₹${Number(item.price || 0).toFixed(2)}</td>
                  <td class="tax-color">${Number(item.tax || 0).toFixed(2)}%</td>
                  <td class="discount-color">${Number(item.discount || 0).toFixed(2)}%</td>
                  <td>₹${Number(item.totalLineAmount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="summary-row">
                <td colspan="6" style="text-align: right;"><strong>Subtotal:</strong></td>
                <td><strong>₹${subtotal.toFixed(2)}</strong></td>
              </tr>
              <tr class="summary-row">
                <td colspan="6" style="text-align: right;" class="tax-color"><strong>Tax (+):</strong></td>
                <td class="tax-color"><strong>₹${totalTaxAmount.toFixed(2)}</strong></td>
              </tr>
              <tr class="summary-row">
                <td colspan="6" style="text-align: right;" class="discount-color"><strong>Discount (-):</strong></td>
                <td class="discount-color"><strong>₹${totalDiscountAmount.toFixed(2)}</strong></td>
              </tr>
              <tr class="total-row">
                <td colspan="6" style="text-align: right;"><strong>Grand Total:</strong></td>
                <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
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

  // Handle Download Slip - Download invoice as PDF file from backend
  const handleDownloadSlip = async () => {
    if (!selectedPurchase || purchaseItems.length === 0) {
      alert("No items to download");
      return;
    }

    try {
      // Get business ID from localStorage
      const userBusinessId = localStorage.getItem("userBusinessId");

      if (!userBusinessId) {
        alert("Business ID not found. Please log in again.");
        return;
      }

      console.log("Downloading purchase slip for invoice:", selectedPurchase.invoiceId);

      console.log("Business ID from localStorage:", userBusinessId);
      console.log("Type of businessId:", typeof userBusinessId);
      // Call API to download purchase slip (backend generates PDF with business logo, details, etc.)
      const blob = await downloadPurchaseSlip(selectedPurchase.invoiceId, userBusinessId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `purchase-slip-${selectedPurchase.invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Purchase slip downloaded successfully");
      alert("Purchase slip downloaded successfully!");
    } catch (error) {
      console.error("Error downloading purchase slip:", error);
      alert("Failed to download purchase slip: " + (error.message || "Unknown error"));
    }
  };

  // Filtered & Sorted Data
  const filteredInvoices = invoices
    .filter((i) => {
      // SEARCH FILTER
      const matchesSearch =
        i.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
        i.invoiceId?.toLowerCase().includes(search.toLowerCase());

      if (advancedFilter === "none") return matchesSearch;

      // STATUS FILTER
      if (advancedFilter === "status") {
        const matchesStatus =
          statusFilter === "All" ? true : (statusFilter === "Paid" ? i.isPaid : !i.isPaid);
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
        const purchaseDate = new Date(i.createdAt);

        if (dateFilterType === "today") {
          return matchesSearch && isSameDay(purchaseDate, getToday());
        }

        if (dateFilterType === "yesterday") {
          return matchesSearch && isSameDay(purchaseDate, getYesterday());
        }

        if (dateFilterType === "custom") {
          if (!customStartDate || !customEndDate) return matchesSearch;
          return matchesSearch && isDateInRange(purchaseDate, customStartDate, customEndDate);
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

  // Export to CSV
  const handleExportReport = () => {
    if (invoices.length === 0) {
      alert("No purchase invoices to export");
      return;
    }

    const headers = ["Date", "Invoice ID", "Supplier Name", "Phone", "Amount", "Status"];
    const csvData = invoices.map(inv => [
      inv.createdAt ? inv.createdAt.split('T')[0] : '-',
      inv.invoiceId,
      inv.supplierName,
      inv.supplierPhone || "-",
      inv.totalAmount,
      inv.isPaid ? "Paid" : "Unpaid"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                  <BsFileEarmarkText className="sales-invoices-title-icon" /> Purchase Invoices
                </h2>
                <p className="sales-invoices-page-subtitle">View and manage all purchase invoices</p>
              </div>
              <div className="sales-invoices-header-actions">
                <button className="sales-invoices-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
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
                <h4>Total Purchases</h4>
                <p>₹ {totalPurchases.toFixed(2)}</p>
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
                  placeholder="Search by supplier or invoice number..."
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
                    onClick={handleConfirmPurchase}
                    disabled={selectedInvoices.length === 0}
                  >
                    <BsCheckCircleFill /> Confirm Purchase ({selectedInvoices.length})
                  </button>
                </>
              ) : (
                <button
                  className="sales-invoices-create-btn"
                  style={{ marginRight: '10px', backgroundColor: '#28a745' }}
                  onClick={handleAddPaidClick}
                >
                  <BsCheckCircleFill /> Confirm Purchase
                </button>
              )}
              <Link to="/create-purchase-invoice">
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

                  <th><BsPeopleFill /> Supplier Name</th>
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
                      <h3>No Purchase Invoices Found</h3>
                      <p>
                        {search || advancedFilter !== "none"
                          ? "No purchase invoices matching the current filter"
                          : "No purchase invoices have been created yet"}
                      </p>
                      {!search && advancedFilter === "none" && (
                        <Link to="/create-purchase-invoice">
                          <button className="sales-invoices-empty-add-btn">
                            <BsPlus /> Create Invoice
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, i) => {
                    const purchaseDate = inv.createdAt ? new Date(inv.createdAt) : null;
                    const isSelected = selectedInvoices.includes(inv.invoiceId);
                    const isUnpurchased = !inv.isPurchased;

                    return (
                      <tr
                        key={i}
                        style={{
                          backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                          cursor: isSelectionMode && isUnpurchased ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (isSelectionMode && isUnpurchased) {
                            handleSelectInvoice(inv.invoiceId);
                          }
                        }}
                      >
                        {isSelectionMode && (
                          <td onClick={(e) => e.stopPropagation()}>
                            {isUnpurchased ? (
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
                        <td>{purchaseDate ? `${String(purchaseDate.getDate()).padStart(2, '0')}/${String(purchaseDate.getMonth() + 1).padStart(2, '0')}/${purchaseDate.getFullYear()}` : '-'}</td>
                        <td>{purchaseDate ? purchaseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}</td>
                        <td className="customer-name-cell">
                          <BsPersonFill className="customer-icon" /> {inv.supplierName}
                        </td>
                        <td>
                          <BsTelephoneFill className="customer-icon" /> {inv.supplierPhone || "-"}
                        </td>
                        <td className="amount-cell" style={{ textAlign: 'center' }}>₹ {inv.totalAmount?.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>{inv.totalItems || 0}</td>
                        <td>
                          <span className={`sales-invoices-status-badge ${inv.isPurchased ? 'paid' : 'unpaid'}`}>
                            {inv.isPurchased ? <BsCheckCircleFill /> : <BsXCircleFill />}
                            {inv.isPurchased ? "Purchased" : "Not Purchased"}
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
      {showItemsModal && selectedPurchase && (
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
                  Purchase Items - {selectedPurchase.supplierName}
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
                    <div><strong>Purchase ID:</strong> #{selectedPurchase.invoiceId}</div>
                    <div><strong>Supplier:</strong> {selectedPurchase.supplierName}</div>
                    <div><strong>Phone:</strong> {selectedPurchase.supplierPhone || '-'}</div>
                    <div><strong>Date:</strong> {selectedPurchase.createdAt ? (() => {
                      const date = new Date(selectedPurchase.createdAt);
                      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    })() : '-'}</div>
                    <div><strong>Total Items:</strong> {selectedPurchase.totalItems || 0}</div>
                    <div><strong>Total Amount:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>₹{selectedPurchase.totalAmount?.toFixed(2) || '0.00'}</span></div>
                  </div>
                </div>

                <h6 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Items Details:</h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
                      <tr>
                        <th style={{ textAlign: 'center' }}>Sr No</th>
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
                          <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p style={{ marginTop: '10px', color: '#666' }}>Loading purchase items...</p>
                          </td>
                        </tr>
                      ) : purchaseItems.length > 0 ? (
                        purchaseItems.map((item, index) => (
                          <tr key={index}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ textAlign: 'center' }}>{item.itemName || 'N/A'}</td>
                            <td style={{ textAlign: 'center' }}>{Number(item.qty || 0)}</td>
                            <td style={{ textAlign: 'center' }}>₹{Number(item.price || 0).toFixed(2)}</td>
                            <td style={{ textAlign: 'center', color: '#28a745' }}>{Number(item.tax || 0).toFixed(2)}%</td>
                            <td style={{ textAlign: 'center', color: '#dc3545' }}>{Number(item.discount || 0).toFixed(2)}%</td>
                            <td style={{ textAlign: 'center' }}>₹{Number(item.totalLineAmount || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            <BsInboxFill style={{ fontSize: '2rem', marginBottom: '10px' }} />
                            <p>No items found</p>
                          </td>
                        </tr>
                      )}
                      {!loadingItems && purchaseItems.length > 0 && (() => {
                        // Calculate subtotal (sum of quantity * price for all items)
                        const subtotal = purchaseItems.reduce((sum, item) => {
                          const itemBaseAmount = Number(item.qty || 0) * Number(item.price || 0);
                          return sum + itemBaseAmount;
                        }, 0);

                        // Calculate total tax and discount amounts
                        let totalTaxAmount = 0;
                        let totalDiscountAmount = 0;

                        purchaseItems.forEach(item => {
                          const itemBaseAmount = Number(item.qty || 0) * Number(item.price || 0);
                          const taxPercent = Number(item.tax || 0);
                          const discountPercent = Number(item.discount || 0);

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
                              <td colSpan="6" style={{ textAlign: 'right', fontWeight: '500' }}>Subtotal:</td>
                              <td style={{ fontWeight: '500' }}>
                                ₹{subtotal.toFixed(2)}
                              </td>
                            </tr>

                            {/* Tax Row - Calculated from percentages */}
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <td colSpan="6" style={{ textAlign: 'right', fontWeight: '500', color: '#28a745' }}>
                                Tax (+):
                              </td>
                              <td style={{ fontWeight: '500', color: '#28a745' }}>
                                ₹{totalTaxAmount.toFixed(2)}
                              </td>
                            </tr>

                            {/* Discount Row - Calculated from percentages */}
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                              <td colSpan="6" style={{ textAlign: 'right', fontWeight: '500', color: '#dc3545' }}>
                                Discount (-):
                              </td>
                              <td style={{ fontWeight: '500', color: '#dc3545' }}>
                                ₹{totalDiscountAmount.toFixed(2)}
                              </td>
                            </tr>

                            {/* Grand Total Row */}
                            <tr style={{ backgroundColor: '#007bff', color: 'white', fontWeight: 'bold' }}>
                              <td colSpan="6" style={{ textAlign: 'right', padding: '10px' }}>Grand Total:</td>
                              <td style={{ padding: '10px' }}>₹{grandTotal.toFixed(2)}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '2px solid #dee2e6' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  style={{ marginRight: '10px' }}
                >
                  <BsX /> Close
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleDownloadSlip}
                  disabled={purchaseItems.length === 0}
                  style={{ marginRight: '10px' }}
                >
                  <BsDownload /> Download Slip
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePrintPDF}
                  disabled={purchaseItems.length === 0}
                >
                  <BsPrinter /> Print PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PurchaseInvoices;
