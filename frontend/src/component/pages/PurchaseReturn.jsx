import React, { useEffect, useState } from "react";
import {
  BsArrowReturnLeft,
  BsCashStack,
  BsCalendar3,
  BsFileEarmarkText,
  BsPeopleFill,
  BsPlus,
  BsInboxFill,
  BsDownload,
  BsEyeFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsBox,
  BsClockHistory,
  BsX,
  BsInfoCircleFill,
  BsExclamationCircleFill,
  BsPrinterFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../purchaseReturn.css";
import { useNavigate } from "react-router-dom";
import { getInvoices, getInvoiceItems, createPurchaseReturn, getPurchaseReturns, markReturnsAsReceived, downloadPurchaseInvoicesPdf, downloadPurchaseReturnsPdf, getBusinessSettings, getPrintData, getInvoicePrintData, downloadPurchaseInvoicePdf } from "../../services/api";

function PurchaseReturn() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedReturns, setSelectedReturns] = useState([]);
  const [showSelectionMode, setShowSelectionMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, received, notReceived
  const [invoiceReturnFilter, setInvoiceReturnFilter] = useState("all"); // all, addedToReturn, notAddedToReturn
  const [dueDate, setDueDate] = useState("");
  const [showViewItemsModal, setShowViewItemsModal] = useState(false);
  const [viewInvoiceItems, setViewInvoiceItems] = useState([]);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [loadingViewItems, setLoadingViewItems] = useState(false);

  // Add to Return mode states
  const [isViewReturnMode, setIsViewReturnMode] = useState(false);
  const [selectedViewReturnItems, setSelectedViewReturnItems] = useState([]);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Date range modal state
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Overdue filter state
  const [overdueFilter, setOverdueFilter] = useState("all"); // "all", "overdue", "not_overdue"

  // Search term state
  const [searchTerm, setSearchTerm] = useState("");

  // Date range filters for Purchase Invoices table
  const [invoiceStartDate, setInvoiceStartDate] = useState("");
  const [invoiceEndDate, setInvoiceEndDate] = useState("");

  // Date range filters for Purchase Returns table
  const [returnStartDate, setReturnStartDate] = useState("");
  const [returnEndDate, setReturnEndDate] = useState("");

  // Toggle states for showing date filters
  const [showInvoiceDateFilter, setShowInvoiceDateFilter] = useState(false);
  const [showReturnDateFilter, setShowReturnDateFilter] = useState(false);

  // Return items modal state (for viewing items in a return)
  const [showReturnItemsModal, setShowReturnItemsModal] = useState(false);
  const [selectedReturnItems, setSelectedReturnItems] = useState(null);

  // Item selection state for marking as received
  const [isItemSelectionMode, setIsItemSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  // Print functionality states
  const [businessData, setBusinessData] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [loadingPrintData, setLoadingPrintData] = useState(false);
  const [loadingInvoicePrintData, setLoadingInvoicePrintData] = useState(false);

  const userId = localStorage.getItem("userId");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.purchase-return-header-actions')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  useEffect(() => {
    // Fetch purchase returns from backend
    fetchPurchaseReturns();

    // Fetch purchase invoices
    fetchPurchaseInvoices();
  }, []);

  // Re-fetch invoices when returns change to update return status
  useEffect(() => {
    if (returns.length > 0) {
      // Just refresh the invoices from backend to get updated flags
      fetchPurchaseInvoices();
    }
  }, [returns]);

  // Fetch purchase returns from backend
  const fetchPurchaseReturns = async () => {
    try {
      const data = await getPurchaseReturns();
      setReturns(data);
    } catch (error) {
      console.error("Error fetching purchase returns:", error);
    }
  };

  // Fetch purchase invoices from backend
  const fetchPurchaseInvoices = async () => {
    if (!userId) {
      console.error("No userId found");
      return;
    }

    setLoadingInvoices(true);
    try {
      const data = await getInvoices(userId);
      console.log("Fetched invoices:", data);

      // Filter to show only purchased invoices (show ALL, including those added to returns)
      const purchasedInvoices = Array.isArray(data)
        ? data.filter(inv => {
          const isPurchased = inv.isPurchased === true;
          const isDeleted = inv.isDeleted === true;
          const totalItems = inv.totalItems || 0;

          // Show all purchased, not deleted invoices with items
          // DO NOT filter out invoices that have been added to returns
          return isPurchased && !isDeleted && totalItems > 0;
        })
        : [];

      console.log("Filtered purchased invoices:", purchasedInvoices);

      // Use backend flags directly - no need to calculate
      const mappedInvoices = purchasedInvoices.map(inv => {
        console.log(`Invoice ${inv.invoiceId?.substring(0, 8)}: isPartiallyReturned=${inv.isPartiallyReturned}, isFullyReturned=${inv.isFullyReturned}`);

        // Determine return status from backend flags
        let returnStatus = "none";
        if (inv.isFullyReturned === true) {
          returnStatus = "full";
        } else if (inv.isPartiallyReturned === true) {
          returnStatus = "partial";
        }

        console.log(`  -> Mapped returnStatus: ${returnStatus}`);

        return {
          ...inv,
          returnStatus: returnStatus, // "none", "partial", or "full"
          // Keep these for compatibility
          isPurchasedReturn: inv.isPartiallyReturned || inv.isFullyReturned,
          returnedItemsCount: 0 // Not needed anymore, backend tracks this
        };
      });

      console.log("Mapped invoices with return status from backend:", mappedInvoices);
      setPurchaseInvoices(mappedInvoices);
    } catch (error) {
      console.error("Error fetching purchase invoices:", error);
      setPurchaseInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Handle Add to Return button click
  const handleAddToReturn = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowItemsModal(true);
    setLoadingItems(true);
    setInvoiceItems([]);
    setSelectedItems([]);
    setDueDate(""); // Reset due date

    try {
      const items = await getInvoiceItems(invoice.invoiceId);
      console.log("Fetched invoice items:", items);
      setInvoiceItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      setInvoiceItems([]);
      alert("Failed to load invoice items. Please try again.");
    } finally {
      setLoadingItems(false);
    }
  };

  // Handle View Items button click
  const handleViewItems = async (invoice) => {
    setViewingInvoice(invoice);
    setShowViewItemsModal(true);
    setLoadingViewItems(true);
    setViewInvoiceItems([]);

    try {
      const items = await getInvoiceItems(invoice.invoiceId);
      setViewInvoiceItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      setViewInvoiceItems([]);
      alert("Failed to load invoice items.");
    } finally {
      setLoadingViewItems(false);
    }
  };

  // Handle Add to Return button click
  const handleAddToReturnClick = () => {
    setIsViewReturnMode(true);
    setSelectedViewReturnItems([]);
  };

  // Handle Cancel Return mode
  const handleCancelReturnMode = () => {
    setIsViewReturnMode(false);
    setSelectedViewReturnItems([]);
  };

  // Handle View Item Selection for Return
  const handleViewItemSelect = (item) => {
    console.log("🔵 SELECTING ITEM FOR RETURN:", item.itemName);
    console.log("  - Item ID:", item.id);
    console.log("  - Quantity:", item.qty);

    setSelectedViewReturnItems(prev => {
      const isSelected = prev.find(i => i.id === item.id);
      if (isSelected) {
        console.log("  ❌ DESELECTING item");
        return prev.filter(i => i.id !== item.id);
      } else {
        console.log("  ✅ ADDING item to selection");
        console.log("  - Initial due date:", '');
        const newItem = {
          ...item,
          returnQty: item.qty, // Default to full quantity
          returnReason: '',
          dueDate: '' // Add due date for each item
        };
        console.log("  - Item object created:", newItem);
        return [...prev, newItem];
      }
    });
  };

  // Handle Return Quantity Change
  const handleReturnQtyChange = (itemId, newQty) => {
    setSelectedViewReturnItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, returnQty: Math.min(Math.max(0, Number(newQty)), item.qty) } : item
      )
    );
  };

  // Handle Individual Return Reason Change
  const handleIndividualReasonChange = (itemId, reason) => {
    setSelectedViewReturnItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, returnReason: reason } : item
      )
    );
  };

  // Handle Individual Due Date Change
  const handleIndividualDueDateChange = (itemId, dueDate) => {
    console.log("📅 DUE DATE CHANGED:");
    console.log("  - Item ID:", itemId);
    console.log("  - New Due Date:", dueDate);
    console.log("  - Due Date Type:", typeof dueDate);
    console.log("  - Due Date Length:", dueDate?.length);

    setSelectedViewReturnItems(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          console.log("  ✅ Updating item:", item.itemName);
          console.log("  - Old due date:", item.dueDate);
          console.log("  - New due date:", dueDate);
          return { ...item, dueDate: dueDate };
        }
        return item;
      });

      console.log("  📋 All selected items after update:");
      updated.forEach((item, idx) => {
        console.log(`    ${idx + 1}. ${item.itemName} - Due Date: ${item.dueDate}`);
      });

      return updated;
    });
  };

  // Handle Confirm Return from View Items Modal
  const handleConfirmViewReturn = async () => {
    console.log("\n🚀 ========== CONFIRM RETURN CLICKED ==========");
    console.log("📋 Selected items count:", selectedViewReturnItems.length);
    console.log("\n📦 SELECTED ITEMS DETAILS:");
    selectedViewReturnItems.forEach((item, idx) => {
      console.log(`\n  Item ${idx + 1}:`);
      console.log(`    - Name: ${item.itemName}`);
      console.log(`    - ID: ${item.id}`);
      console.log(`    - Return Qty: ${item.returnQty}`);
      console.log(`    - Due Date: "${item.dueDate}"`);
      console.log(`    - Due Date Type: ${typeof item.dueDate}`);
      console.log(`    - Due Date is Empty: ${!item.dueDate}`);
      console.log(`    - Return Reason: ${item.returnReason}`);
    });

    // Check if invoice already has a return
    if (viewingInvoice?.isPurchasedReturn) {
      alert("This invoice has already been added to a purchase return. Please refresh the page to see updated data.");
      return;
    }

    if (selectedViewReturnItems.length === 0) {
      alert("Please select at least one item to return");
      return;
    }

    // Validate return quantities
    const invalidQty = selectedViewReturnItems.find(item => !item.returnQty || item.returnQty <= 0);
    if (invalidQty) {
      alert("Please enter valid return quantities for all selected items");
      return;
    }

    // Validate due dates (must be provided for each item)
    const itemsWithoutDueDate = selectedViewReturnItems.filter(item => !item.dueDate || item.dueDate.trim() === '');
    if (itemsWithoutDueDate.length > 0) {
      console.error("❌ VALIDATION FAILED: Items missing due dates");
      itemsWithoutDueDate.forEach(item => {
        console.error(`  - ${item.itemName}: due date is "${item.dueDate}"`);
      });
      alert(`Please select a due date for all items. ${itemsWithoutDueDate.length} item(s) missing due date.`);
      return;
    }

    // Validate return reasons (must be provided for each item)
    const itemsWithoutReason = selectedViewReturnItems.filter(item => !item.returnReason || item.returnReason.trim() === '');
    if (itemsWithoutReason.length > 0) {
      alert(`Please provide a return reason for all selected items. ${itemsWithoutReason.length} item(s) missing reason.`);
      return;
    }

    console.log("\n✅ All validations passed. Preparing data for backend...");

    // Prepare data for backend
    const returnData = {
      invoiceId: viewingInvoice.invoiceId,
      dueDate: null, // No global due date
      items: selectedViewReturnItems.map(item => {
        const baseAmount = Number(item.returnQty) * Number(item.price || 0);
        const discountAmount = (baseAmount * Number(item.discount || 0)) / 100;
        const taxableAmount = baseAmount - discountAmount;
        const taxAmount = (taxableAmount * Number(item.tax || 0)) / 100;
        const itemTotal = taxableAmount + taxAmount;

        const itemData = {
          itemId: item.id,
          itemName: item.itemName,
          quantityReturned: Number(item.returnQty),
          price: Number(item.price || 0),
          tax: Number(item.tax || 0),
          discount: Number(item.discount || 0),
          totalAmount: Number(itemTotal.toFixed(2)),
          returnReason: item.returnReason,
          dueDate: item.dueDate || null // Item-specific due date
        };

        console.log(`\n  📤 Mapped item for API:`, itemData);
        console.log(`    - Due Date value: "${itemData.dueDate}"`);
        console.log(`    - Due Date is null: ${itemData.dueDate === null}`);

        return itemData;
      })
    };

    console.log("=== PURCHASE RETURN DATA BEING SENT ===");
    console.log("Invoice ID:", returnData.invoiceId);
    console.log("Number of items:", returnData.items.length);
    console.log("Items with due dates:");
    returnData.items.forEach((item, index) => {
      console.log(`  Item ${index + 1}: ${item.itemName}`);
      console.log(`    - Due Date: ${item.dueDate}`);
      console.log(`    - Return Reason: ${item.returnReason}`);
      console.log(`    - Quantity: ${item.quantityReturned}`);
    });
    console.log("Full payload:", JSON.stringify(returnData, null, 2));

    try {
      await createPurchaseReturn(returnData);

      console.log("✅ Purchase return created successfully!");
      console.log("🔄 Refreshing purchase returns and invoices...");

      // Refresh data
      await fetchPurchaseReturns();
      await fetchPurchaseInvoices();

      console.log("✅ Data refreshed. Check invoice status above.");

      // Close modal and reset
      setShowViewItemsModal(false);
      setIsViewReturnMode(false);
      setSelectedViewReturnItems([]);
      setViewingInvoice(null);
      setViewInvoiceItems([]);

      alert("Purchase return created successfully!");
    } catch (error) {
      console.error("Error creating purchase return:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error occurred";
      alert(`Failed to create purchase return: ${errorMessage}`);
    }
  };

  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, { ...item, returnReason: '' }];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === invoiceItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(invoiceItems.map(item => ({ ...item, returnReason: '' })));
    }
  };

  // Handle reason change
  const handleReasonChange = (itemId, reason) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, returnReason: reason } : item
      )
    );
  };

  // Handle confirm selection
  const handleConfirmSelection = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to return");
      return;
    }

    // Validate that all selected items have a reason
    const itemsWithoutReason = selectedItems.filter(item => !item.returnReason || item.returnReason.trim() === '');
    if (itemsWithoutReason.length > 0) {
      alert(`Please provide a return reason for all selected items. ${itemsWithoutReason.length} item(s) missing reason.`);
      return;
    }

    console.log("=== PURCHASE RETURN DEBUG ===");
    console.log("Selected Invoice:", selectedInvoice);
    console.log("Selected Items:", selectedItems);

    // Prepare data for backend - matching CreatePurchaseReturnDto structure
    const returnData = {
      invoiceId: selectedInvoice.invoiceId,
      dueDate: dueDate || null, // Use selected due date or null
      items: selectedItems.map(item => {
        // Calculate item total amount
        const baseAmount = Number(item.qty || 0) * Number(item.price || 0);
        const discountAmount = (baseAmount * Number(item.discount || 0)) / 100;
        const taxableAmount = baseAmount - discountAmount;
        const taxAmount = (taxableAmount * Number(item.tax || 0)) / 100;
        const itemTotal = taxableAmount + taxAmount;

        return {
          itemId: item.id,
          itemName: item.itemName,
          quantityReturned: Number(item.qty || 0), // Changed from 'quantity' to 'quantityReturned'
          price: Number(item.price || 0),
          tax: Number(item.tax || 0),
          discount: Number(item.discount || 0),
          totalAmount: Number(itemTotal.toFixed(2)),
          returnReason: item.returnReason
        };
      })
    };

    console.log("=== OLD MODAL: PURCHASE RETURN DATA BEING SENT ===");
    console.log("Invoice ID:", returnData.invoiceId);
    console.log("Global Due Date:", returnData.dueDate);
    console.log("Number of items:", returnData.items.length);
    console.log("Items:");
    returnData.items.forEach((item, index) => {
      console.log(`  Item ${index + 1}: ${item.itemName}`);
      console.log(`    - Return Reason: ${item.returnReason}`);
      console.log(`    - Quantity: ${item.quantityReturned}`);
    });
    console.log("Full payload:", JSON.stringify(returnData, null, 2));

    try {
      console.log("Calling createPurchaseReturn API...");
      // Call backend API to create purchase return
      const response = await createPurchaseReturn(returnData);
      console.log("API Response:", response);

      // Refresh purchase returns list
      await fetchPurchaseReturns();

      // Refresh purchase invoices to update isPurchasedReturn status
      await fetchPurchaseInvoices();

      // Close modal and reset
      setShowItemsModal(false);
      setSelectedInvoice(null);
      setInvoiceItems([]);
      setSelectedItems([]);
      setDueDate("");

      alert(`Purchase return created successfully!`);
    } catch (error) {
      console.error("=== ERROR CREATING PURCHASE RETURN ===");
      console.error("Error object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      console.error("Error data:", error.response?.data);

      const errorMessage = error.response?.data?.error || error.message || "Unknown error occurred";
      alert(`Failed to create purchase return: ${errorMessage}`);
    }
  };


  // Calculate statistics
  const totalReturnInvoices = returns.length;
  const totalReturnItems = returns.reduce((sum, r) => {
    const itemsCount = r.totalItems || 0;
    return sum + itemsCount;
  }, 0);
  const totalReturnAmount = returns.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const totalOverdueInvoices = returns.filter(r => r.status === "NOT_RECEIVED").length;

  // Format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter returns based on search and overdue filter
  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purchaseNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Apply overdue filter
    if (overdueFilter === "all") {
      // Continue to date filter
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < today && r.status !== "RECEIVED";

      if (overdueFilter === "overdue" && !isOverdue) return false;
      if (overdueFilter === "not_overdue" && isOverdue) return false;
    }

    // Apply date range filter
    if (returnStartDate || returnEndDate) {
      const returnDate = new Date(r.returnDate);
      if (returnStartDate && new Date(returnStartDate) > returnDate) return false;
      if (returnEndDate && new Date(returnEndDate) < returnDate) return false;
    }

    return true;
  });
  // Handle return selection
  const handleSelectReturn = (returnId) => {
    setSelectedReturns(prev => {
      if (prev.includes(returnId)) {
        return prev.filter(id => id !== returnId);
      } else {
        return [...prev, returnId];
      }
    });
  };

  // Handle mark as received
  const handleMarkAsReceived = async () => {
    if (selectedReturns.length === 0) {
      alert("Please select at least one return to mark as received");
      return;
    }

    const confirmMessage = `Are you sure you want to mark ${selectedReturns.length} return(s) as received?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Call backend API to mark returns as received
      await markReturnsAsReceived(selectedReturns);

      // Refresh purchase returns list
      await fetchPurchaseReturns();

      setSelectedReturns([]);
      setShowSelectionMode(false);

      alert(`${selectedReturns.length} return(s) marked as received successfully!`);
    } catch (error) {
      console.error("Error marking returns as received:", error);
      alert("Failed to mark returns as received. Please try again.");
    }
  };

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setShowSelectionMode(!showSelectionMode);
    setSelectedReturns([]);
  };

  // Download Purchase Invoices PDF - Show date range modal
  const handleDownloadPurchaseInvoicesPdf = () => {
    const businessId = localStorage.getItem("businessId");
    console.log("=== Download Purchase Invoices PDF ===");
    console.log("Business ID:", businessId);

    if (!businessId) {
      alert("Business ID not found. Please set up your business first.");
      return;
    }

    // Show date range modal
    setShowDateRangeModal(true);
    setShowExportDropdown(false);
  };

  // Confirm and download with date range
  const handleConfirmDateRange = async () => {
    const businessId = localStorage.getItem("businessId");

    // Validate dates
    if (!startDate || !endDate) {
      alert("Please select both start date and end date");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before or equal to end date");
      return;
    }

    try {
      console.log("Calling downloadPurchaseInvoicesPdf API with date range...");
      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);

      const pdfBlob = await downloadPurchaseInvoicesPdf(businessId, startDate, endDate);
      console.log("PDF Blob received:", pdfBlob);
      console.log("Blob size:", pdfBlob.size);
      console.log("Blob type:", pdfBlob.type);

      if (!pdfBlob || pdfBlob.size === 0) {
        console.error("Received empty PDF blob");
        alert("Failed to generate PDF. The server returned an empty file.");
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase_invoices_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Close modal and reset
      setShowDateRangeModal(false);
      setStartDate("");
      setEndDate("");
      console.log("PDF download triggered successfully");
      alert("Purchase Invoices PDF downloaded successfully!");
    } catch (error) {
      console.error("=== Error downloading purchase invoices PDF ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      alert("Failed to download purchase invoices PDF. Please check the console for details.");
    }
  };

  // Download Purchase Returns PDF
  const handleDownloadPurchaseReturnsPdf = async () => {
    const businessId = localStorage.getItem("businessId");
    console.log("=== Download Purchase Returns PDF ===");
    console.log("Business ID:", businessId);

    if (!businessId) {
      alert("Business ID not found. Please set up your business first.");
      return;
    }

    if (returns.length === 0) {
      alert("No purchase returns to export");
      return;
    }

    try {
      console.log("Calling downloadPurchaseReturnsPdf API...");
      const pdfBlob = await downloadPurchaseReturnsPdf(businessId);
      console.log("PDF Blob received:", pdfBlob);
      console.log("Blob size:", pdfBlob.size);
      console.log("Blob type:", pdfBlob.type);

      if (!pdfBlob || pdfBlob.size === 0) {
        console.error("Received empty PDF blob");
        alert("Failed to generate PDF. The server returned an empty file.");
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase_returns_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setShowExportDropdown(false);
      console.log("PDF download triggered successfully");
      alert("Purchase Returns PDF downloaded successfully!");
    } catch (error) {
      console.error("=== Error downloading purchase returns PDF ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      alert("Failed to download purchase returns PDF. Please check the console for details.");
    }
  };

  // Handle Print Return with Database Data
  const handlePrintReturn = async () => {
    console.log("\n🖨️ ========== PRINT RETURN INITIATED ==========");
    console.log("📋 Selected Return Items:", selectedReturnItems);

    setLoadingPrintData(true);

    try {
      // 1. Get IDs
      console.log("\n📦 Step 1: Gathering IDs...");
      const businessId = localStorage.getItem("businessId");
      const returnId = selectedReturnItems?.id;
      console.log("  - Business ID:", businessId);
      console.log("  - Return ID:", returnId);

      if (!businessId || !returnId) {
        throw new Error("Missing required IDs");
      }

      // 2. Fetch Print Data
      console.log("\n📡 Step 2: Fetching Print Data...");
      const printData = await getPrintData(returnId, businessId);

      // 3. Log Business Details
      console.log("\n🏢 Step 3: Business Details:");
      console.log("  ┌─ Name:", printData.business.businessName);
      console.log("  ├─ Address:", printData.business.address);
      console.log("  ├─ City:", printData.business.city);
      console.log("  ├─ State:", printData.business.state);
      console.log("  ├─ Pincode:", printData.business.pincode);
      console.log("  ├─ Phone:", printData.business.phoneNo);
      console.log("  ├─ Email:", printData.business.email);
      console.log("  ├─ GSTIN:", printData.business.gstNo);
      console.log("  ├─ Logo:", printData.business.logo ? "Available" : "N/A");
      console.log("  └─ Signature:", printData.business.signature ? "Available" : "N/A");

      // 4. Log Supplier Details
      console.log("\n👤 Step 4: Supplier Details:");
      console.log("  ┌─ ID:", printData.supplier.customerId);
      console.log("  ├─ Name:", printData.supplier.name);
      console.log("  ├─ Mobile:", printData.supplier.mobileNo);
      console.log("  ├─ City:", printData.supplier.city);
      console.log("  └─ Address:", printData.supplier.address);

      setBusinessData(printData.business);
      setSupplierData(printData.supplier);

      // 5. Prepare Return Information
      console.log("\n📝 Step 5: Preparing Return Information...");
      console.log("  - Return ID:", selectedReturnItems?.id || "N/A");
      console.log("  - Return Date:", selectedReturnItems?.returnDate || "N/A");
      console.log("  - Status:", selectedReturnItems?.status || "N/A");
      console.log("  - Total Items:", selectedReturnItems?.totalItems || 0);
      console.log("  - Total Amount:", selectedReturnItems?.totalAmount || 0);

      // 6. Prepare Items Data
      console.log("\n📦 Step 6: Preparing Items Data...");
      const items = selectedReturnItems?.items || [];
      console.log("  - Number of Items:", items.length);

      items.forEach((item, index) => {
        console.log(`\n  Item ${index + 1}:`);
        console.log(`    - Name: ${item.itemName || "N/A"}`);
        console.log(`    - Quantity Returned: ${item.quantityReturned || 0}`);
        console.log(`    - Original Quantity: ${item.originalQuantity || 0}`);
        console.log(`    - Price: ₹${item.price || 0}`);
        console.log(`    - Tax: ${item.tax || 0}%`);
        console.log(`    - Discount: ${item.discount || 0}%`);
        console.log(`    - Total Amount: ₹${item.totalAmount || 0}`);
        console.log(`    - Due Date: ${item.dueDate || "N/A"}`);
        console.log(`    - Return Reason: ${item.returnReason || "N/A"}`);
      });

      // 7. Get Current Date and Time
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = currentDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      console.log("\n📅 Step 7: Current Date & Time:");
      console.log("  - Date:", formattedDate);
      console.log("  - Time:", formattedTime);

      // 8. All data ready - trigger print
      console.log("\n✅ Step 8: All Data Prepared Successfully!");
      console.log("🖨️ Triggering Print Dialog...");

      setLoadingPrintData(false);

      // Small delay to ensure state is updated
      setTimeout(() => {
        window.print();
      }, 100);

    } catch (error) {
      console.error("\n❌ ========== ERROR FETCHING PRINT DATA ==========");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      setLoadingPrintData(false);
      alert(`Failed to fetch print data: ${error.message}\n\nPlease check the console for details.`);
    }
  };

  // Handle Print Purchase Invoice with Database Data
  const handlePrintPurchaseInvoice = async () => {
    console.log("\n🖨️ ========== PRINT PURCHASE INVOICE INITIATED ==========");
    console.log("📋 Viewing Invoice:", viewingInvoice);

    setLoadingInvoicePrintData(true);

    try {
      // 1. Get IDs
      console.log("\n📦 Step 1: Gathering IDs...");
      const businessId = localStorage.getItem("businessId");
      const invoiceId = viewingInvoice?.invoiceId;
      console.log("  - Business ID:", businessId);
      console.log("  - Invoice ID:", invoiceId);

      if (!businessId || !invoiceId) {
        throw new Error("Missing required IDs");
      }

      // 2. Download PDF from backend
      console.log("\n📡 Step 2: Downloading PDF from backend...");
      const pdfBlob = await downloadPurchaseInvoicePdf(invoiceId, businessId);

      // 3. Create download link
      console.log("\n💾 Step 3: Creating download link...");
      const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `purchase-invoice-${invoiceId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("\n✅ PDF downloaded successfully!");
      setLoadingInvoicePrintData(false);

    } catch (error) {
      console.error("\n❌ ========== ERROR DOWNLOADING PDF ==========");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      setLoadingInvoicePrintData(false);
      alert(`Failed to download PDF: ${error.message}\n\nPlease check the console for details.`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="purchase-return-page-header">
            <div className="purchase-return-header-content">
              <div className="purchase-return-title-section">
                <h2 className="purchase-return-page-title">
                  <BsArrowReturnLeft className="purchase-return-title-icon" /> Purchase Return
                </h2>
                <p className="purchase-return-page-subtitle">Manage purchase returns to suppliers</p>
              </div>
              <div className="purchase-return-header-actions">
                <div style={{ position: 'relative' }}>
                  <button
                    className="purchase-return-report-btn"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                  >
                    <BsDownload /> Export Report
                  </button>
                  {showExportDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '5px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '250px'
                    }}>
                      <button
                        onClick={handleDownloadPurchaseInvoicesPdf}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <BsDownload /> Download Purchase Invoices PDF
                      </button>
                      <button
                        onClick={handleDownloadPurchaseReturnsPdf}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          background: 'white',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <BsDownload /> Download Purchase Return Invoices PDF
                      </button>
                    </div>
                  )}
                </div>
                {/*  <button
                  className="purchase-return-create-btn"
                  onClick={() => navigate("/create-purchase-return")}
                >
                  <BsPlus /> Create Purchase Return
                </button>
                */}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="purchase-return-summary-row">
            <div className="purchase-return-summary-card total-returns">
              <div className="purchase-return-card-icon-wrapper total-returns-icon">
                <BsFileEarmarkText className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Total Return Purchase Invoices</h4>
                <p>{totalReturnInvoices}</p>
              </div>
            </div>

            <div className="purchase-return-summary-card total-items">
              <div className="purchase-return-card-icon-wrapper total-items-icon">
                <BsBox className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Total Return Invoice Items</h4>
                <p>{totalReturnItems}</p>
              </div>
            </div>

            <div className="purchase-return-summary-card total-amount">
              <div className="purchase-return-card-icon-wrapper total-amount-icon">
                <BsCashStack className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Total Return Amount</h4>
                <p>₹ {totalReturnAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="purchase-return-summary-card overdue-invoices">
              <div className="purchase-return-card-icon-wrapper overdue-invoices-icon">
                <BsClockHistory className="purchase-return-card-icon" />
              </div>
              <div className="purchase-return-card-content">
                <h4>Total Overdue Invoices</h4>
                <p>{totalOverdueInvoices}</p>
              </div>
            </div>
          </div>

          {/* Purchase Invoices Section */}
          <div className="purchase-return-table-container" style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                <BsFileEarmarkText /> Purchase Invoices
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="invoiceReturnFilter" style={{ fontWeight: 'bold', color: '#333' }}>
                  Filter by Return Status:
                </label>
                <select
                  id="invoiceReturnFilter"
                  value={invoiceReturnFilter}
                  onChange={(e) => {
                    setInvoiceReturnFilter(e.target.value);
                    // Show date filter when "byDate" is selected
                    if (e.target.value === "byDate") {
                      setShowInvoiceDateFilter(true);
                    } else {
                      setShowInvoiceDateFilter(false);
                      setInvoiceStartDate("");
                      setInvoiceEndDate("");
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Invoices</option>
                  <option value="notReturned">Not Returned</option>
                  <option value="partiallyReturned">Partially Returned</option>
                  <option value="fullyReturned">Fully Returned</option>
                  <option value="byDate">By Date</option>
                </select>

                {/* Date Range Filters for Purchase Invoices - Only show if "By Date" is selected */}
                {showInvoiceDateFilter && (
                  <>
                    <input
                      type="date"
                      value={invoiceStartDate}
                      onChange={(e) => setInvoiceStartDate(e.target.value)}
                      min={`${new Date().getFullYear()}-01-01`}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="Start Date"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer"
                      }}
                    />
                    <input
                      type="date"
                      value={invoiceEndDate}
                      onChange={(e) => setInvoiceEndDate(e.target.value)}
                      min={`${new Date().getFullYear()}-01-01`}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="End Date"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer"
                      }}
                    />
                    {(invoiceStartDate || invoiceEndDate) && (
                      <button
                        onClick={() => {
                          setInvoiceStartDate("");
                          setInvoiceEndDate("");
                        }}
                        style={{
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: "#f44336",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        Clear Dates
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {loadingInvoices ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading purchase invoices...</p>
              </div>
            ) : purchaseInvoices.length === 0 ? (
              <div className="purchase-return-empty-state">
                <BsInboxFill className="purchase-return-empty-icon" />
                <h3>No Purchase Invoices Found</h3>
                <p>No purchased invoices available to create returns</p>
              </div>
            ) : (
              <table className="purchase-return-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Supplier Name</th>
                    <th>Total Items</th>
                    <th>Total Quantity</th>
                    <th>Return Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Filter invoices based on return status
                    const filteredInvoices = purchaseInvoices.filter(inv => {
                      const returnStatus = inv.returnStatus || "none";

                      // Filter by invoice return status
                      if (invoiceReturnFilter === "notReturned" && returnStatus !== "none") return false;
                      if (invoiceReturnFilter === "partiallyReturned" && returnStatus !== "partial") return false;
                      if (invoiceReturnFilter === "fullyReturned" && returnStatus !== "full") return false;

                      // Filter by date range
                      if (invoiceStartDate || invoiceEndDate) {
                        const invoiceDate = new Date(inv.invoiceDate);
                        if (invoiceStartDate && new Date(invoiceStartDate) > invoiceDate) return false;
                        if (invoiceEndDate && new Date(invoiceEndDate) < invoiceDate) return false;
                      }

                      return true; // "all" shows everything
                    });

                    if (filteredInvoices.length === 0) {
                      let emptyMessage = "No invoices found";
                      if (invoiceReturnFilter === "notReturned") emptyMessage = "No unreturned invoices found";
                      if (invoiceReturnFilter === "partiallyReturned") emptyMessage = "No partially returned invoices found";
                      if (invoiceReturnFilter === "fullyReturned") emptyMessage = "No fully returned invoices found";

                      return (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                            <BsInboxFill style={{ fontSize: '3rem', color: '#ccc' }} />
                            <p>{emptyMessage}</p>
                          </td>
                        </tr>
                      );
                    }

                    return filteredInvoices.map((inv) => {
                      const returnStatus = inv.returnStatus || "none";

                      // Determine badge class and text based on return status
                      let statusClass = "";
                      let statusIcon = null;
                      let statusText = "";

                      if (returnStatus === "full") {
                        statusClass = "closed"; // Green
                        statusIcon = <BsCheckCircleFill />;
                        statusText = "Fully Returned";
                      } else if (returnStatus === "partial") {
                        statusClass = "pending"; // Yellow/Orange
                        statusIcon = <BsExclamationCircleFill />;
                        statusText = "Partially Returned";
                      } else {
                        statusClass = "open"; // Red
                        statusIcon = <BsXCircleFill />;
                        statusText = "Not Returned";
                      }

                      return (
                        <tr key={inv.invoiceId}>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{filteredInvoices.indexOf(inv) + 1}</td>
                          <td style={{ textAlign: 'center' }}>{inv.invoiceId ? inv.invoiceId.substring(0, 8) : 'N/A'}</td>
                          <td style={{ textAlign: 'center' }}>{formatDate(inv.invoiceDate)}</td>
                          <td className="party-name-cell" style={{ textAlign: 'center' }}>
                            <BsPeopleFill className="party-icon" /> {inv.customerName || 'N/A'}
                          </td>
                          <td style={{ textAlign: 'center' }}>{inv.totalItems || 0}</td>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                            {inv.totalQuantity || 0}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`purchase-return-status-badge ${statusClass}`}>
                              {statusIcon}
                              {statusText}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleViewItems(inv)}
                              title="View items in this invoice"
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                            >
                              <BsEyeFill /> View Items
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            )}
          </div>

          {/* Purchase Return Table */}
          <div className="purchase-return-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                <BsArrowReturnLeft /> Purchase Returns
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="statusFilter" style={{ fontWeight: 'bold', color: '#333' }}>
                  Filter by Status:
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Returns</option>
                  <option value="received">Received</option>
                  <option value="notReceived">Not Received</option>
                </select>

                {/* Overdue Filter Dropdown */}
                <select
                  value={overdueFilter}
                  onChange={(e) => {
                    setOverdueFilter(e.target.value);
                    // Show date filter when "byDate" is selected
                    if (e.target.value === "byDate") {
                      setShowReturnDateFilter(true);
                    } else {
                      setShowReturnDateFilter(false);
                      setReturnStartDate("");
                      setReturnEndDate("");
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                    cursor: "pointer",
                    minWidth: "150px"
                  }}
                >
                  <option value="all">All Returns</option>
                  <option value="overdue">Overdue Only</option>
                  <option value="not_overdue">Not Overdue</option>
                  <option value="byDate">By Date</option>
                </select>

                {/* Date Range Filters for Purchase Returns - Only show if "By Date" is selected */}
                {showReturnDateFilter && (
                  <>
                    <input
                      type="date"
                      value={returnStartDate}
                      onChange={(e) => setReturnStartDate(e.target.value)}
                      min={`${new Date().getFullYear()}-01-01`}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="Start Date"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer"
                      }}
                    />
                    <input
                      type="date"
                      value={returnEndDate}
                      onChange={(e) => setReturnEndDate(e.target.value)}
                      min={`${new Date().getFullYear()}-01-01`}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="End Date"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer"
                      }}
                    />
                    {(returnStartDate || returnEndDate) && (
                      <button
                        onClick={() => {
                          setReturnStartDate("");
                          setReturnEndDate("");
                        }}
                        style={{
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: "#f44336",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        Clear Dates
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            {returns.length === 0 ? (
              <div className="purchase-return-empty-state">
                <BsInboxFill className="purchase-return-empty-icon" />
                <h3>No Purchase Returns Found</h3>
                <p>Start tracking purchase returns to suppliers</p>
                <button
                  className="purchase-return-empty-add-btn"
                  onClick={() => navigate("/create-purchase-return")}
                >
                  <BsPlus /> Create Your First Purchase Return
                </button>
              </div>
            ) : (
              <table className="purchase-return-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Sr. No.</th>
                    <th style={{ textAlign: 'center' }}>Return No.</th>
                    <th style={{ textAlign: 'center' }}><BsCalendar3 /> Date</th>
                    <th style={{ textAlign: 'center' }}><BsPeopleFill /> Supplier Name</th>
                    <th style={{ textAlign: 'center' }}><BsBox /> Items</th>
                    <th style={{ textAlign: 'center' }}>Total Qty</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {(() => {
                    // Filter returns based on status
                    const filteredReturns = returns.filter(r => {
                      const isReceived = r.status === "RECEIVED";
                      if (statusFilter === "received") return isReceived;
                      if (statusFilter === "notReceived") return !isReceived;
                      return true; // "all" shows everything
                    });

                    if (filteredReturns.length === 0) {
                      let emptyMessage = "No returns found";
                      if (statusFilter === "received") emptyMessage = "No received returns found";
                      if (statusFilter === "notReceived") emptyMessage = "No unreceived returns found";

                      return (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                            <BsInboxFill style={{ fontSize: '3rem', color: '#ccc' }} />
                            <p>{emptyMessage}</p>
                          </td>
                        </tr>
                      );
                    }

                    return filteredReturns.map((r, i) => {
                      const isReceived = r.status === "RECEIVED";
                      const isSelected = selectedReturns.includes(r.id);

                      // Calculate total quantity from items
                      const totalQuantity = r.items && r.items.length > 0
                        ? r.items.reduce((sum, item) => sum + (item.quantityReturned || 0), 0)
                        : 0;

                      // Format received date
                      const formatDateTime = (dateTimeString) => {
                        if (!dateTimeString) return '-';
                        const date = new Date(dateTimeString);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${day}-${month}-${year} ${hours}:${minutes}`;
                      };

                      return (
                        <tr key={i}>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{i + 1}</td>
                          <td style={{ textAlign: 'center' }}>{r.id ? r.id.substring(0, 8) : 'N/A'}</td>
                          <td style={{ textAlign: 'center' }}>{formatDate(r.returnDate)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <BsPeopleFill className="party-icon" /> {r.supplierName || 'N/A'}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              backgroundColor: '#e7f3ff',
                              color: '#667eea',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <BsBox style={{ fontSize: '14px' }} />
                              {r.totalItems || 0} item{r.totalItems !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                            {totalQuantity}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`purchase-return-status-badge ${isReceived ? "closed" : "open"}`}>
                              {isReceived ? <BsCheckCircleFill /> : <BsXCircleFill />}
                              {isReceived ? "Received" : "Not Received"}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedReturnItems(r);
                                setShowReturnItemsModal(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                            >
                              <BsEyeFill /> View Items
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Item Selection Modal */}
      {showItemsModal && (
        <div className="modal-overlay" onClick={() => setShowItemsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3>Select Items to Return - Invoice #{selectedInvoice?.invoiceId?.substring(0, 8)}</h3>
              <button className="modal-close-btn" onClick={() => setShowItemsModal(false)}>
                <BsX />
              </button>
            </div>
            <div className="modal-body">
              {loadingItems ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Loading items...</p>
                </div>
              ) : invoiceItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <BsInboxFill style={{ fontSize: '3rem', color: '#ccc' }} />
                  <p>No items found in this invoice</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === invoiceItems.length}
                        onChange={handleSelectAll}
                        style={{ marginRight: '8px', width: '18px', height: '18px' }}
                      />
                      Select All ({invoiceItems.length} items)
                    </label>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {invoiceItems.map((item) => {
                      const isSelected = !!selectedItems.find(i => i.id === item.id);
                      const selectedItem = selectedItems.find(i => i.id === item.id);

                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            backgroundColor: isSelected ? '#f0f8ff' : '#fff'
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleItemSelect(item)}
                              style={{ marginRight: '12px', marginTop: '4px', width: '18px', height: '18px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                                {item.itemName || 'N/A'}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                                <div><strong>Quantity:</strong> {item.qty || 0}</div>
                                <div><strong>Unit Price:</strong> ₹{Number(item.price || 0).toFixed(2)}</div>
                                <div><strong>Tax:</strong> {Number(item.tax || 0).toFixed(2)}%</div>
                                <div><strong>Discount:</strong> {Number(item.discount || 0).toFixed(2)}%</div>
                                <div><strong>Total:</strong> ₹{Number(item.totalLineAmount || 0).toFixed(2)}</div>
                              </div>
                              {isSelected && (
                                <div style={{ marginTop: '10px' }}>
                                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                                    Return Reason: <span style={{ color: 'red' }}>*</span>
                                  </label>
                                  <textarea
                                    value={selectedItem?.returnReason || ''}
                                    onChange={(e) => handleReasonChange(item.id, e.target.value)}
                                    placeholder="Enter reason for returning this item..."
                                    style={{
                                      width: '100%',
                                      minHeight: '60px',
                                      padding: '8px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      fontSize: '14px',
                                      resize: 'vertical'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Due Date Field */}
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                      Due Date (Optional):
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                      Select a date after today for when the return is due
                    </small>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="purchase-return-report-btn"
                onClick={() => setShowItemsModal(false)}
              >
                Cancel
              </button>
              <button
                className="purchase-return-create-btn"
                onClick={handleConfirmSelection}
                disabled={selectedItems.length === 0}
              >
                <BsCheckCircleFill /> Confirm Selection ({selectedItems.length} items)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Items Modal */}
      {showViewItemsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowViewItemsModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1000px',
              width: '95%',
              maxHeight: '90vh',
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px 30px',
                borderBottom: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <BsFileEarmarkText style={{ fontSize: '28px' }} />
                  Invoice Items
                </h3>
                <p style={{
                  margin: '8px 0 0 0',
                  opacity: 0.9,
                  fontSize: '14px',
                  fontWeight: '400'
                }}>
                  Invoice #{viewingInvoice?.invoiceId?.substring(0, 8)}...
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowViewItemsModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <BsX />
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="modal-body"
              style={{
                padding: '30px',
                overflowY: 'auto',
                flex: 1,
                backgroundColor: '#f8f9fa'
              }}
            >
              {loadingViewItems ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Loading items...</p>
                </div>
              ) : viewInvoiceItems.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <BsInboxFill style={{ fontSize: '4rem', color: '#ddd', marginBottom: '16px' }} />
                  <p style={{ color: '#999', fontSize: '18px', margin: 0 }}>No items found in this invoice</p>
                </div>
              ) : (
                <>
                  {/* Invoice Info Card */}
                  <div style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <BsPeopleFill style={{ color: '#667eea', fontSize: '20px' }} />
                        <div>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Supplier</div>
                          <div style={{ fontWeight: '600', color: '#333' }}>{viewingInvoice?.customerName || 'N/A'}</div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <BsCalendar3 style={{ color: '#667eea', fontSize: '20px' }} />
                        <div>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Invoice Date</div>
                          <div style={{ fontWeight: '600', color: '#333' }}>{formatDate(viewingInvoice?.invoiceDate)}</div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <BsBox style={{ color: '#667eea', fontSize: '20px' }} />
                        <div>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Items</div>
                          <div style={{ fontWeight: '600', color: '#333' }}>{viewingInvoice?.totalItems || 0}</div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <BsCashStack style={{ color: '#667eea', fontSize: '20px' }} />
                        <div>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Amount</div>
                          <div style={{ fontWeight: '600', color: '#667eea', fontSize: '18px' }}>₹{viewingInvoice?.totalAmount || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning if invoice already has a return */}
                  {viewingInvoice?.isPurchasedReturn && (
                    <div style={{
                      marginBottom: '20px',
                      padding: '16px 20px',
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffc107',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)'
                    }}>
                      <BsXCircleFill style={{ fontSize: '24px', color: '#ff6b6b', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#856404', fontSize: '15px', marginBottom: '4px' }}>
                          Return Already Created
                        </div>
                        <div style={{ color: '#856404', fontSize: '13px' }}>
                          This invoice has already been added to a purchase return. You cannot create another return for the same invoice.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items Table */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        minWidth: '800px',
                        borderCollapse: 'collapse',
                        fontSize: '14px',
                        tableLayout: 'auto'
                      }}>
                        <thead>
                          <tr style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            {isViewReturnMode && (
                              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '60px', minWidth: '60px', whiteSpace: 'nowrap' }}>SELECT</th>
                            )}
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '80px', minWidth: '80px', whiteSpace: 'nowrap' }}>SR NO</th>
                            <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', minWidth: '200px' }}>ITEM NAME</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>QTY</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '130px', minWidth: '130px', whiteSpace: 'nowrap' }}>UNIT PRICE</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>TAX</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>DISCOUNT</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px', width: '140px', minWidth: '140px', whiteSpace: 'nowrap' }}>TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewInvoiceItems.map((item, index) => {
                            const isSelected = selectedViewReturnItems.find(i => i.id === item.id);
                            const selectedItem = selectedViewReturnItems.find(i => i.id === item.id);

                            return (
                              <React.Fragment key={item.id || index}>
                                <tr
                                  style={{
                                    borderBottom: isSelected ? 'none' : '1px solid #e9ecef',
                                    transition: 'background-color 0.2s ease',
                                    backgroundColor: isSelected ? '#f0f7ff' : 'transparent'
                                  }}
                                  onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                  onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  {isViewReturnMode && (
                                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                      <input
                                        type="checkbox"
                                        checked={!!isSelected}
                                        onChange={() => handleViewItemSelect(item)}
                                        style={{
                                          width: '18px',
                                          height: '18px',
                                          cursor: 'pointer',
                                          accentColor: '#667eea'
                                        }}
                                      />
                                    </td>
                                  )}
                                  <td style={{ padding: '14px 12px', textAlign: 'center', color: '#6c757d', fontWeight: '500', whiteSpace: 'nowrap' }}>{index + 1}</td>
                                  <td style={{ padding: '14px 12px', fontWeight: '500', color: '#333' }}>{item.itemName || 'N/A'}</td>
                                  <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '600', color: '#333', whiteSpace: 'nowrap' }}>
                                    {item.qty !== null && item.qty !== undefined ? item.qty : 0}
                                  </td>
                                  <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '600', color: '#333', whiteSpace: 'nowrap' }}>
                                    ₹{item.price !== null && item.price !== undefined ? Number(item.price).toFixed(2) : '0.00'}
                                  </td>
                                  <td style={{
                                    padding: '14px 12px',
                                    textAlign: 'center',
                                    color: '#28a745',
                                    fontWeight: '600',
                                    backgroundColor: 'rgba(40, 167, 69, 0.05)',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {Number(item.tax || 0).toFixed(2)}%
                                  </td>
                                  <td style={{
                                    padding: '14px 12px',
                                    textAlign: 'center',
                                    color: '#dc3545',
                                    fontWeight: '600',
                                    backgroundColor: 'rgba(220, 53, 69, 0.05)',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {Number(item.discount || 0).toFixed(2)}%
                                  </td>
                                  <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '600', color: '#667eea', whiteSpace: 'nowrap' }}>₹{Number(item.totalLineAmount || 0).toFixed(2)}</td>
                                </tr>

                                {/* Expandable Return Details Row */}
                                {isSelected && (
                                  <tr style={{ backgroundColor: '#f8f9ff', borderBottom: '2px solid #667eea' }}>
                                    <td colSpan={isViewReturnMode ? 8 : 7} style={{ padding: '20px 30px' }}>
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '20px',
                                        backgroundColor: 'white',
                                        padding: '24px',
                                        borderRadius: '12px',
                                        border: '2px solid #667eea',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                                      }}>
                                        {/* Return Quantity Field */}
                                        <div style={{
                                          background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                                          padding: '16px',
                                          borderRadius: '10px',
                                          border: '1px solid #e0e7ff',
                                          transition: 'all 0.3s ease'
                                        }}>
                                          <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '10px',
                                            fontWeight: '700',
                                            color: '#4c51bf',
                                            fontSize: '14px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                          }}>
                                            <BsBox style={{ fontSize: '16px' }} />
                                            Return Quantity
                                            <span style={{ color: '#dc3545', fontSize: '16px' }}>*</span>
                                          </label>
                                          <div style={{ position: 'relative' }}>
                                            <input
                                              type="number"
                                              min="1"
                                              max={item.qty}
                                              value={selectedItem?.returnQty || ''}
                                              onChange={(e) => handleReturnQtyChange(item.id, e.target.value)}
                                              placeholder={`Max: ${item.qty}`}
                                              style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #cbd5e0',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#2d3748',
                                                backgroundColor: '#ffffff',
                                                transition: 'all 0.3s ease',
                                                outline: 'none',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.borderColor = '#667eea';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                              }}
                                              onBlur={(e) => {
                                                e.target.style.borderColor = '#cbd5e0';
                                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                              }}
                                            />
                                            <div style={{
                                              marginTop: '8px',
                                              fontSize: '12px',
                                              color: '#718096',
                                              fontWeight: '500'
                                            }}>
                                              Available: {item.qty} units
                                            </div>
                                          </div>
                                        </div>

                                        {/* Due Date Field */}
                                        <div style={{
                                          background: 'linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)',
                                          padding: '16px',
                                          borderRadius: '10px',
                                          border: '1px solid #ffecd1',
                                          transition: 'all 0.3s ease'
                                        }}>
                                          <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '10px',
                                            fontWeight: '700',
                                            color: '#d97706',
                                            fontSize: '14px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                          }}>
                                            <BsCalendar3 style={{ fontSize: '16px' }} />
                                            Due Date
                                            <span style={{ color: '#dc3545', fontSize: '16px' }}>*</span>
                                          </label>
                                          <div style={{ position: 'relative' }}>
                                            <input
                                              type="date"
                                              min={new Date().toISOString().split('T')[0]}
                                              value={selectedItem?.dueDate || ''}
                                              onChange={(e) => handleIndividualDueDateChange(item.id, e.target.value)}
                                              required
                                              style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #cbd5e0',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#2d3748',
                                                backgroundColor: '#ffffff',
                                                transition: 'all 0.3s ease',
                                                outline: 'none',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                              }}
                                              onFocus={(e) => {
                                                e.target.style.borderColor = '#f59e0b';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                              }}
                                              onBlur={(e) => {
                                                e.target.style.borderColor = '#cbd5e0';
                                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                              }}
                                            />
                                            <div style={{
                                              marginTop: '8px',
                                              fontSize: '12px',
                                              color: '#718096',
                                              fontWeight: '500'
                                            }}>
                                              Required: Select return due date
                                            </div>
                                          </div>
                                        </div>

                                        {/* Return Reason Field */}
                                        <div style={{
                                          background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)',
                                          padding: '16px',
                                          borderRadius: '10px',
                                          border: '1px solid #d1fae5',
                                          transition: 'all 0.3s ease'
                                        }}>
                                          <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '10px',
                                            fontWeight: '700',
                                            color: '#059669',
                                            fontSize: '14px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                          }}>
                                            <BsFileEarmarkText style={{ fontSize: '16px' }} />
                                            Return Reason
                                            <span style={{ color: '#dc3545', fontSize: '16px' }}>*</span>
                                          </label>
                                          <textarea
                                            value={selectedItem?.returnReason || ''}
                                            onChange={(e) => handleIndividualReasonChange(item.id, e.target.value)}
                                            placeholder="Why are you returning this item?"
                                            rows="3"
                                            style={{
                                              width: '100%',
                                              padding: '12px 16px',
                                              border: '2px solid #cbd5e0',
                                              borderRadius: '8px',
                                              fontSize: '14px',
                                              fontFamily: 'inherit',
                                              color: '#2d3748',
                                              backgroundColor: '#ffffff',
                                              resize: 'vertical',
                                              transition: 'all 0.3s ease',
                                              outline: 'none',
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                              lineHeight: '1.5'
                                            }}
                                            onFocus={(e) => {
                                              e.target.style.borderColor = '#10b981';
                                              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                              e.target.style.borderColor = '#cbd5e0';
                                              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                          {(() => {
                            // Calculate subtotal (sum of quantity * price for all items)
                            const subtotal = viewInvoiceItems.reduce((sum, item) => {
                              const itemBaseAmount = Number(item.qty || 0) * Number(item.price || 0);
                              return sum + itemBaseAmount;
                            }, 0);

                            // Calculate total tax and discount amounts
                            let totalTaxAmount = 0;
                            let totalDiscountAmount = 0;

                            viewInvoiceItems.forEach(item => {
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
                                <tr style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                                  <td colSpan="6" style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', fontSize: '15px', color: '#495057' }}>
                                    Subtotal:
                                  </td>
                                  <td style={{ padding: '14px 12px', fontWeight: '600', textAlign: 'center', fontSize: '15px', color: '#333' }}>
                                    ₹{subtotal.toFixed(2)}
                                  </td>
                                </tr>

                                {/* Tax Row */}
                                <tr style={{ backgroundColor: 'rgba(40, 167, 69, 0.05)' }}>
                                  <td colSpan="6" style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', fontSize: '15px', color: '#28a745' }}>
                                    Tax (+):
                                  </td>
                                  <td style={{ padding: '14px 12px', fontWeight: '600', color: '#28a745', textAlign: 'center', fontSize: '15px' }}>
                                    ₹{totalTaxAmount.toFixed(2)}
                                  </td>
                                </tr>

                                {/* Discount Row */}
                                <tr style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)' }}>
                                  <td colSpan="6" style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', fontSize: '15px', color: '#dc3545' }}>
                                    Discount (-):
                                  </td>
                                  <td style={{ padding: '14px 12px', fontWeight: '600', color: '#dc3545', textAlign: 'center', fontSize: '15px' }}>
                                    ₹{totalDiscountAmount.toFixed(2)}
                                  </td>
                                </tr>

                                {/* Grand Total Row */}
                                <tr style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  borderTop: '2px solid #667eea'
                                }}>
                                  <td colSpan="6" style={{ padding: '18px 12px', textAlign: 'right', fontWeight: '700', fontSize: '16px', letterSpacing: '0.5px' }}>
                                    GRAND TOTAL:
                                  </td>
                                  <td style={{ padding: '18px 12px', textAlign: 'center', fontWeight: '700', fontSize: '18px' }}>
                                    ₹{grandTotal.toFixed(2)}
                                  </td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                padding: '20px 30px',
                borderTop: '1px solid #e9ecef',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <button
                onClick={() => {
                  setShowViewItemsModal(false);
                  setIsViewReturnMode(false);
                  setSelectedViewReturnItems([]);
                }}
                style={{
                  padding: '12px 28px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(108, 117, 125, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.2)';
                }}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                {isViewReturnMode ? (
                  <>
                    <button
                      onClick={handleCancelReturnMode}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#c82333';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc3545';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.2)';
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmViewReturn}
                      disabled={selectedViewReturnItems.length === 0}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: selectedViewReturnItems.length > 0 ? '#28a745' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: selectedViewReturnItems.length > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedViewReturnItems.length > 0 ? '0 2px 8px rgba(40, 167, 69, 0.2)' : 'none',
                        opacity: selectedViewReturnItems.length > 0 ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (selectedViewReturnItems.length > 0) {
                          e.target.style.backgroundColor = '#218838';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedViewReturnItems.length > 0) {
                          e.target.style.backgroundColor = '#28a745';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
                        }
                      }}
                    >
                      Confirm Return ({selectedViewReturnItems.length})
                    </button>
                  </>
                ) : (
                  <>
                    {/* Print Button */}
                    <button
                      onClick={handlePrintPurchaseInvoice}
                      disabled={loadingInvoicePrintData}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: loadingInvoicePrintData ? '#9ca3af' : '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: loadingInvoicePrintData ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: loadingInvoicePrintData ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingInvoicePrintData) {
                          e.target.style.backgroundColor = '#4f46e5';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loadingInvoicePrintData) {
                          e.target.style.backgroundColor = '#6366f1';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.2)';
                        }
                      }}
                    >
                      <BsPrinterFill style={{ fontSize: '16px' }} />
                      {loadingInvoicePrintData ? 'Loading...' : 'Print'}
                    </button>

                    {!viewingInvoice?.isPurchasedReturn && (
                      <button
                        onClick={handleAddToReturnClick}
                        style={{
                          padding: '12px 28px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#5568d3';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#667eea';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.2)';
                        }}
                      >
                        Add to Return
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Add CSS animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(30px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Return Items Modal */}
      {showReturnItemsModal && selectedReturnItems && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '1000px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px 30px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BsBox style={{ fontSize: '28px' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px' }}>
                    Return Items Details
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                    Return ID: {selectedReturnItems.id ? selectedReturnItems.id.substring(0, 8) : 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReturnItemsModal(false);
                  setSelectedReturnItems(null);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: '300',
                  lineHeight: '1'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '30px',
              maxHeight: 'calc(85vh - 180px)',
              overflowY: 'auto',
              backgroundColor: '#f8f9fa'
            }}>
              {selectedReturnItems.items && selectedReturnItems.items.length > 0 ? (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <thead>
                        <tr style={{
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          borderBottom: '2px solid #dee2e6'
                        }}>
                          {isItemSelectionMode && (
                            <th style={{
                              padding: '16px 12px',
                              textAlign: 'center',
                              fontWeight: '700',
                              color: '#495057',
                              fontSize: '13px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              width: '60px'
                            }}>Select</th>
                          )}
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            width: '80px'
                          }}>SR No</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            minWidth: '200px'
                          }}>Item Name</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            width: '140px'
                          }}>Total Quantity</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            width: '180px'
                          }}>Qty Added to Return</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            width: '140px'
                          }}>Due Date</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            width: '140px'
                          }}>Amount</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            width: '160px'
                          }}>Received Date</th>
                          <th style={{
                            padding: '16px 12px',
                            textAlign: 'left',
                            fontWeight: '700',
                            color: '#495057',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            minWidth: '200px'
                          }}>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReturnItems.items.map((item, index) => {
                          // Format due date as dd-mm-yyyy
                          const formatDueDate = (dateString) => {
                            if (!dateString) return '-';
                            const date = new Date(dateString);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${day}-${month}-${year}`;
                          };

                          // Use originalQuantity from backend (the quantity from the purchase invoice)
                          const totalQuantity = item.originalQuantity || 0;
                          const quantityReturned = item.quantityReturned || 0;

                          // Calculate amount: (quantity × price) + tax - discount
                          const baseAmount = quantityReturned * (Number(item.price) || 0);
                          const taxAmount = (baseAmount * (Number(item.tax) || 0)) / 100;
                          const discountAmount = (baseAmount * (Number(item.discount) || 0)) / 100;
                          const itemAmount = baseAmount + taxAmount - discountAmount;

                          return (
                            <tr key={index} style={{
                              borderBottom: '1px solid #e9ecef',
                              transition: 'background-color 0.2s ease'
                            }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {isItemSelectionMode && (
                                <td style={{
                                  padding: '16px 12px',
                                  textAlign: 'center'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItemIds([...selectedItemIds, item.id]);
                                      } else {
                                        setSelectedItemIds(selectedItemIds.filter(id => id !== item.id));
                                      }
                                    }}
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      cursor: 'pointer',
                                      accentColor: '#667eea'
                                    }}
                                  />
                                </td>
                              )}
                              <td style={{
                                padding: '16px 12px',
                                textAlign: 'center',
                                color: '#6c757d',
                                fontWeight: '600',
                                fontSize: '14px'
                              }}>{index + 1}</td>
                              <td style={{
                                padding: '16px 12px',
                                color: '#333',
                                fontWeight: '600',
                                fontSize: '14px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <BsBox style={{ color: '#667eea', fontSize: '16px' }} />
                                  {item.itemName || 'N/A'}
                                </div>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '15px'
                              }}>
                                <span style={{
                                  backgroundColor: '#e7f3ff',
                                  color: '#0066cc',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  display: 'inline-block',
                                  fontWeight: '700'
                                }}>
                                  {totalQuantity}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '15px'
                              }}>
                                <span style={{
                                  backgroundColor: '#fff3cd',
                                  color: '#d97706',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  display: 'inline-block',
                                  fontWeight: '700'
                                }}>
                                  {quantityReturned}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                textAlign: 'center'
                              }}>
                                <span style={{
                                  backgroundColor: '#f0fff4',
                                  color: '#059669',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <BsCalendar3 style={{ fontSize: '12px' }} />
                                  {formatDueDate(item.dueDate)}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '15px'
                              }}>
                                <span style={{
                                  backgroundColor: '#f0f9ff',
                                  color: '#0369a1',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  display: 'inline-block',
                                  fontWeight: '700'
                                }}>
                                  ₹{itemAmount.toFixed(2)}
                                </span>
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                textAlign: 'center'
                              }}>
                                {selectedReturnItems.status === 'RECEIVED' ? (
                                  <span style={{
                                    backgroundColor: '#f0fdf4',
                                    color: '#15803d',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <BsCheckCircleFill style={{ fontSize: '12px' }} />
                                    {(() => {
                                      if (!selectedReturnItems.receivedAt) return 'Received';
                                      const date = new Date(selectedReturnItems.receivedAt);
                                      const day = String(date.getDate()).padStart(2, '0');
                                      const month = String(date.getMonth() + 1).padStart(2, '0');
                                      const year = date.getFullYear();
                                      const hours = String(date.getHours()).padStart(2, '0');
                                      const minutes = String(date.getMinutes()).padStart(2, '0');
                                      return `${day}-${month}-${year} ${hours}:${minutes}`;
                                    })()}
                                  </span>
                                ) : (
                                  <span style={{
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <BsXCircleFill style={{ fontSize: '12px' }} />
                                    Not Received
                                  </span>
                                )}
                              </td>
                              <td style={{
                                padding: '16px 12px',
                                color: '#666',
                                fontSize: '13px',
                                lineHeight: '1.5'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px'
                                }}>
                                  <BsFileEarmarkText style={{ color: '#667eea', fontSize: '14px', marginTop: '2px', flexShrink: 0 }} />
                                  <span>{item.returnReason || '-'}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '2px dashed #dee2e6'
                }}>
                  <BsInboxFill style={{ fontSize: '64px', color: '#dee2e6', marginBottom: '16px' }} />
                  <h4 style={{ color: '#6c757d', margin: '0 0 8px 0', fontSize: '18px' }}>No Items Found</h4>
                  <p style={{ color: '#adb5bd', margin: 0, fontSize: '14px' }}>This return has no items to display</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #e9ecef',
              backgroundColor: 'white',
              borderRadius: '0 0 16px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Left side buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {!isItemSelectionMode ? (
                  <>
                    {/* Mark Received Button */}
                    {selectedReturnItems && selectedReturnItems.status !== 'RECEIVED' && (
                      <button
                        onClick={() => {
                          setIsItemSelectionMode(true);
                          setSelectedItemIds([]);
                        }}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '15px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#059669';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#10b981';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <BsCheckCircleFill style={{ fontSize: '18px' }} />
                        Mark Received
                      </button>
                    )}

                    {/* Print Button */}
                    <button
                      onClick={handlePrintReturn}
                      disabled={loadingPrintData}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: loadingPrintData ? '#9ca3af' : '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loadingPrintData ? 'not-allowed' : 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: loadingPrintData ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingPrintData) {
                          e.target.style.backgroundColor = '#4f46e5';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loadingPrintData) {
                          e.target.style.backgroundColor = '#6366f1';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                        }
                      }}
                    >
                      <BsPrinterFill style={{ fontSize: '18px' }} />
                      {loadingPrintData ? 'Loading...' : 'Print'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Cancel Button */}
                    <button
                      onClick={() => {
                        setIsItemSelectionMode(false);
                        setSelectedItemIds([]);
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#5a6268';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(108, 117, 125, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6c757d';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                      }}
                    >
                      <BsX style={{ fontSize: '20px' }} />
                      Cancel
                    </button>

                    {/* Confirm Received Button */}
                    <button
                      onClick={async () => {
                        if (selectedItemIds.length === 0) {
                          alert('Please select at least one item to mark as received');
                          return;
                        }

                        try {
                          // Call API to mark items as received
                          // For now, we'll use the existing mark as received endpoint for the entire return
                          await markReturnsAsReceived([selectedReturnItems.id]);

                          // Refresh data
                          await fetchPurchaseReturns();

                          // Exit selection mode
                          setIsItemSelectionMode(false);
                          setSelectedItemIds([]);

                          // Close modal
                          setShowReturnItemsModal(false);
                          setSelectedReturnItems(null);

                          alert('Items marked as received successfully!');
                        } catch (error) {
                          console.error('Error marking items as received:', error);
                          alert('Failed to mark items as received');
                        }
                      }}
                      disabled={selectedItemIds.length === 0}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: selectedItemIds.length > 0 ? '#10b981' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: selectedItemIds.length > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedItemIds.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: selectedItemIds.length > 0 ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (selectedItemIds.length > 0) {
                          e.target.style.backgroundColor = '#059669';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedItemIds.length > 0) {
                          e.target.style.backgroundColor = '#10b981';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }
                      }}
                    >
                      <BsCheckCircleFill style={{ fontSize: '18px' }} />
                      Confirm Received ({selectedItemIds.length})
                    </button>
                  </>
                )}
              </div>

              {/* Right side - Close button */}
              <button
                onClick={() => {
                  setShowReturnItemsModal(false);
                  setSelectedReturnItems(null);
                  setIsItemSelectionMode(false);
                  setSelectedItemIds([]);
                }}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5568d3';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                <BsX style={{ fontSize: '20px' }} />
                Close
              </button>
            </div>
          </div>

          {/* Add CSS animations and print styles */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(30px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            /* Print-specific styles */
            @media print {
              /* Hide everything except print content */
              body * {
                visibility: hidden;
              }
              
              /* Show only print content */
              #print-return-items,
              #print-return-items * {
                visibility: visible;
              }
              
              #print-return-items {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
              }
              
              /* Ensure proper table display */
              #print-return-items table {
                border-collapse: collapse;
              }
              
              /* Table page break handling */
              table {
                page-break-inside: auto;
              }
              
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              
              thead {
                display: table-header-group;
              }
            }
            
            /* Hide print content on screen */
            @media screen {
              #print-return-items {
                display: none;
              }
            }
          `}</style>


          {/* Print-only content */}
          <div id="print-return-items">
            <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '210mm', margin: '0 auto', padding: '20px', border: '2px solid #2c3e50', borderRadius: '8px', backgroundColor: '#ffffff' }}>
              {/* Header with Logo, Business Info, and Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingBottom: '12px', borderBottom: '3px solid #2c3e50' }}>
                {/* Left side - Business Logo and Info */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flex: 1 }}>
                  {/* Business Logo */}
                  <div style={{ width: '120px', height: '120px', border: '3px solid #2c3e50', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    {businessData?.logo ? (
                      <img src={`data:image/png;base64,${businessData.logo}`} alt="Logo" style={{ maxWidth: '110px', maxHeight: '110px', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: 'bold', textAlign: 'center' }}>LOGO</span>
                    )}
                  </div>

                  {/* Business Details */}
                  <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '26px', fontWeight: '700', letterSpacing: '0.3px' }}>
                      {businessData?.businessName || 'Business Name'}
                    </h1>
                    <div style={{ fontSize: '11px', color: '#34495e', lineHeight: '1.7' }}>
                      <p style={{ margin: '3px 0' }}><strong style={{ color: '#2c3e50', fontWeight: '600' }}>Phone:</strong> <span style={{ color: '#555' }}>{businessData?.phoneNo || 'N/A'}</span></p>
                      <p style={{ margin: '3px 0' }}><strong style={{ color: '#2c3e50', fontWeight: '600' }}>Email:</strong> <span style={{ color: '#555' }}>{businessData?.email || 'N/A'}</span></p>
                      <p style={{ margin: '3px 0' }}><strong style={{ color: '#2c3e50', fontWeight: '600' }}>GSTIN:</strong> <span style={{ color: '#555' }}>{businessData?.gstNo || 'Not Registered'}</span></p>
                      <p style={{ margin: '3px 0' }}><strong style={{ color: '#2c3e50', fontWeight: '600' }}>Address:</strong> <span style={{ color: '#555' }}>{businessData ? `${businessData.address || ''}, ${businessData.city || ''}, ${businessData.state || ''} - ${businessData.pincode || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ',') : 'N/A'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Right side - Current Date */}
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#2c3e50', fontWeight: '600' }}>
                    <strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <h2 style={{ textAlign: 'center', color: '#2c3e50', margin: '10px 0 15px 0', fontSize: '18px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', borderBottom: '2px solid #2c3e50', paddingBottom: '8px', display: 'inline-block', width: '100%' }}>
                PURCHASE RETURN DOCUMENT
              </h2>

              {/* Return and Supplier Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                {/* Return Information */}
                <div style={{ border: '2px solid #2c3e50', padding: '12px', borderRadius: '8px', backgroundColor: '#f8f9fa', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '14px', borderBottom: '2px solid #2c3e50', paddingBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Return Information
                  </h3>
                  <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Return ID:</strong> <span style={{ color: '#555' }}>{selectedReturnItems?.id ? `#${selectedReturnItems.id.substring(0, 12)}` : 'N/A'}</span>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Return Date:</strong> <span style={{ color: '#555' }}>{selectedReturnItems?.returnDate ? new Date(selectedReturnItems.returnDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Purchase Invoice:</strong> <span style={{ color: '#555' }}>{selectedReturnItems?.purchaseNo || 'N/A'}</span>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Status:</strong> <span style={{ color: '#555' }}>{selectedReturnItems?.status || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Supplier Information */}
                <div style={{ border: '2px solid #2c3e50', padding: '12px', borderRadius: '8px', backgroundColor: '#f8f9fa', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '14px', borderBottom: '2px solid #2c3e50', paddingBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Supplier Information
                  </h3>
                  <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Name:</strong> <span style={{ color: '#555' }}>{supplierData?.name || selectedReturnItems?.supplierName || 'N/A'}</span>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Supplier ID:</strong> <span style={{ color: '#555' }}>{supplierData?.customerId ? `#${String(supplierData.customerId).substring(0, 12)}` : 'N/A'}</span>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', display: 'inline-block' }}>Contact:</strong> <span style={{ color: '#555' }}>{supplierData?.mobileNo || 'N/A'}</span>
                    </p>

                    <p style={{ margin: '4px 0', display: 'flex', alignItems: 'flex-start' }}>
                      <strong style={{ color: '#2c3e50', fontWeight: '600', minWidth: '120px', flexShrink: 0 }}>Address:</strong>
                      <span style={{ color: '#555', flex: 1 }}>{supplierData?.address || 'N/A'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginTop: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Return Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '2px solid #2c3e50' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>SR No</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'left', fontWeight: '700' }}>Item Name</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Total Qty</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Returned Qty</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Unit Price</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Tax %</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Discount %</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Total Amount</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Due Date</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'left', fontWeight: '700' }}>Reason</th>
                      <th style={{ border: '2px solid #2c3e50', padding: '8px 6px', textAlign: 'center', fontWeight: '700' }}>Received Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturnItems?.items && selectedReturnItems.items.map((item, index) => {
                      const baseAmount = (item.quantityReturned || 0) * (Number(item.price) || 0);
                      const taxAmount = (baseAmount * (Number(item.tax) || 0)) / 100;
                      const discountAmount = (baseAmount * (Number(item.discount) || 0)) / 100;
                      const totalAmount = baseAmount + taxAmount - discountAmount;

                      const formatDate = (dateString) => {
                        if (!dateString) return '-';
                        const date = new Date(dateString);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      };

                      const formatDateTime = (dateTimeString) => {
                        if (!dateTimeString) return 'Not Received';
                        const date = new Date(dateTimeString);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${day}-${month}-${year} ${hours}:${minutes}`;
                      };

                      return (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{index + 1}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', fontSize: '10px' }}>{item.itemName || 'N/A'}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{item.originalQuantity || 0}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{item.quantityReturned || 0}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>₹{(Number(item.price) || 0).toFixed(2)}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{item.tax || 0}%</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{item.discount || 0}%</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontWeight: '600', fontSize: '10px' }}>₹{totalAmount.toFixed(2)}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>{formatDate(item.dueDate)}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', fontSize: '10px' }}>{item.returnReason || '-'}</td>
                          <td style={{ border: '2px solid #2c3e50', padding: '6px', textAlign: 'center', fontSize: '10px' }}>
                            {selectedReturnItems.status === 'RECEIVED' ? formatDateTime(selectedReturnItems.receivedAt) : 'Not Received'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer with Signature and Notes */}
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  {/* Left side - Business Signature */}
                  <div style={{ flex: 1 }}>
                    {businessData?.signature ? (
                      <div style={{ marginBottom: '10px' }}>
                        <img
                          src={`data:image/png;base64,${businessData.signature}`}
                          alt="Signature"
                          style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #ddd', padding: '8px', borderRadius: '6px', backgroundColor: '#fff' }}
                        />
                      </div>
                    ) : null}
                    <div style={{ borderTop: '2px solid #2c3e50', paddingTop: '8px', marginTop: businessData?.signature ? '0' : '40px', maxWidth: '200px' }}>
                      <p style={{ margin: '0', fontSize: '11px', fontWeight: '700', color: '#2c3e50' }}>Authorized Signature</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{businessData?.businessName || 'Business Name'}</p>
                    </div>
                  </div>

                  {/* Right side - Notes Section */}
                  <div style={{ flex: 1, border: '2px solid #2c3e50', borderRadius: '8px', padding: '12px', backgroundColor: '#f8f9fa' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '14px', fontWeight: '600', borderBottom: '2px solid #2c3e50', paddingBottom: '6px' }}>Notes</h4>
                    <div style={{ minHeight: '80px', fontSize: '10px', color: '#666', lineHeight: '1.6' }}>
                      <p style={{ margin: '0', fontStyle: 'italic' }}>Additional notes or remarks can be added here...</p>
                    </div>
                  </div>
                </div>

                {/* Print timestamp */}
                <div style={{ textAlign: 'center', fontSize: '9px', color: '#999', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                  <p style={{ margin: '0' }}>Printed: {new Date().toLocaleString('en-GB')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
              Select Date Range for Purchase Invoices
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDateRangeModal(false);
                  setStartDate("");
                  setEndDate("");
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDateRange}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

{/* Date Range Modal - moved outside component for testing */ }
const DateRangeModal = ({ show, startDate, endDate, onStartDateChange, onEndDateChange, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        minWidth: '400px',
        maxWidth: '500px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
          Select Date Range for Purchase Invoices
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={onStartDateChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={onEndDateChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturn;
