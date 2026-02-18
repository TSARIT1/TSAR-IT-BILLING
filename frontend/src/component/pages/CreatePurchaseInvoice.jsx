import React, { useState, useEffect } from "react";
import {
  BsFileEarmarkText,
  BsPersonFill,
  BsTelephoneFill,
  BsGeoAltFill,
  BsCalendar3,
  BsPlus,
  BsTrash,
  BsClock,
  BsListUl,
  BsCashStack,
  BsPercent,
  BsArrowLeft,
  BsSave,
  BsEyeFill,
  BsEyeSlashFill,
  BsPencilSquare,
  BsXCircle,
  BsCheck,
  BsSearch,
  BsPersonPlus
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../salesInvoice.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAllProducts, searchCustomers, getCustomerByPhone, createInvoice, getInvoices, updateInvoice, deleteInvoice, updateInvoiceItem, deleteInvoiceItem } from "../../services/api";

function CreatePurchaseInvoice() {
  const [party, setParty] = useState("");
  const [mobile, setMobile] = useState("");
  const [items, setItems] = useState([]);
  const [city, setCity] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerm, setPaymentTerm] = useState(30);
  const [showHistory, setShowHistory] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const userId = localStorage.getItem("userId");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, received, notReceived
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Debug: Checking userId in localStorage...");
    if (!userId) {
      console.warn("No userId found in localStorage!");
      alert("User not logged in! Please login again.");
      navigate("/login");
    } else {
      console.log("userId found:", userId);
    }

    // Load available products from backend
    fetchProductsFromBackend();
  }, []);

  // Fetch products from backend
  const fetchProductsFromBackend = async () => {
    try {
      console.log("Fetching products from backend...");
      const products = await getAllProducts();
      console.log("Products fetched from backend:", products);
      setAvailableProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to localStorage if backend fails
      const storedProducts = JSON.parse(localStorage.getItem("items")) || [];
      setAvailableProducts(storedProducts);
      alert("Could not fetch products from server. Using local data.");
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemNo: items.length + 1,
        productId: "",
        godownId: "",
        itemName: "",
        qty: 1,
        price: 0,
        discount: 0,
        tax: 0,
        totalLineAmount: 0
      }
    ]);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    // If changing item name and it's a product selection
    if (field === "itemName") {
      const selectedProduct = availableProducts.find(p => p.productName === value || p.name === value);

      if (selectedProduct) {
        // Autofill ALL fields from the selected product including ID, Godown ID, etc.
        updated[index].productId = selectedProduct.productId || selectedProduct.id || ""; // Product ID from backend
        updated[index].godownId = selectedProduct.godownId || ""; // Godown ID from backend
        updated[index].itemName = selectedProduct.productName || selectedProduct.name;
        updated[index].qty = 1; // Default quantity
        updated[index].price = selectedProduct.sellingPrice || selectedProduct.price || 0;
        updated[index].discount = selectedProduct.discount || 0; // Discount from backend
        updated[index].tax = selectedProduct.taxRate || 0; // Tax rate from backend

        // Calculate total
        const qty = 1;
        const price = selectedProduct.sellingPrice || selectedProduct.price || 0;
        const discount = selectedProduct.discount || 0;
        const tax = selectedProduct.taxRate || 0;
        const subtotal = qty * price;
        const total = subtotal - (subtotal * discount) / 100 + (subtotal * tax) / 100;
        updated[index].totalLineAmount = total;

        console.log("Autofilled product details:", {
          productId: updated[index].productId,
          godownId: updated[index].godownId,
          itemName: updated[index].itemName,
          price: updated[index].price,
          discount: updated[index].discount,
          tax: updated[index].tax
        });
      } else {
        // Manual entry
        updated[index].productId = null;
        updated[index].godownId = null;
        updated[index][field] = value;
      }
    } else {
      // Update other fields normally
      updated[index][field] = value;

      // Recalculate total
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].price) || 0;
      const discount = parseFloat(updated[index].discount) || 0;
      const tax = parseFloat(updated[index].tax) || 0;

      const subtotal = qty * price;
      const total = subtotal - (subtotal * discount) / 100 + (subtotal * tax) / 100;
      updated[index].totalLineAmount = total;
    }

    setItems(updated);
  };

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.price, 0);
  const totalDiscount = items.reduce((acc, i) => acc + (i.qty * i.price * i.discount) / 100, 0);
  const taxTotal = items.reduce((acc, i) => acc + (i.qty * i.price * i.tax) / 100, 0);
  const total = subtotal - totalDiscount + taxTotal;

  const handleSave = async () => {
    if (!party.trim()) {
      alert("Please enter Supplier Name");
      return;
    }
    if (!selectedCustomerId) {
      alert("Please select a supplier from the list");
      return;
    }
    const invalidItems = items.filter(i => !i.productId);
    if (invalidItems.length > 0) {
      alert("Please select a product for all items before saving.");
      return;
    }

    const invoiceData = {
      userId: userId,
      customerName: party,  // Backend uses customerName field
      customerId: selectedCustomerId,  // Backend uses customerId field
      mobileNo: mobile || "-",
      city: city || "-",
      invoiceDate: invoiceDate,
      totalItems: items.length,
      totalAmount: total,
      items: items.map(i => ({
        itemNo: i.itemNo,
        productId: i.productId,  // Direct field, not nested
        godownId: i.godownId,    // Direct field, not nested
        itemName: i.itemName,
        qty: i.qty,
        price: i.price,
        discount: i.discount,
        tax: i.tax,
        totalLineAmount: i.totalLineAmount
      }))
    };

    try {
      if (editingInvoiceId) {
        // Update existing invoice via backend
        await updateInvoice(editingInvoiceId, invoiceData);
        alert("Purchase Invoice updated successfully!");
        setEditingInvoiceId(null);
      } else {
        // Create new invoice via backend
        await createInvoice(invoiceData);
        alert("Purchase Invoice saved successfully!");
      }

      // Clear form
      setParty("");
      setMobile("");
      setCity("");
      setItems([]);
      setSelectedCustomerId(null);

      if (showHistory) fetchInvoices();
    } catch (err) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong";

      alert(backendMessage);
      console.log("Backend response:", err.response?.data);
    }
  };

  const fetchInvoices = async () => {
    const userId = localStorage.getItem("userId");
    try {
      console.log("Fetching purchase invoices for userId:", userId);
      // Fetch from backend
      const data = await getInvoices(userId);
      console.log("All invoices from backend:", data);
      console.log("Number of invoices found:", data ? data.length : 0);

      // Filter to only show valid purchase invoices
      // Handle null/undefined as false for boolean fields
      const validPurchaseInvoices = Array.isArray(data)
        ? data.filter(inv => {
          const totalItems = inv.totalItems || 0;
          const isSaled = inv.isSaled === true; // null/undefined/false all become false
          const isDeleted = inv.isDeleted === true; // null/undefined/false all become false

          return totalItems > 0 && !isSaled && !isDeleted;
        })
        : [];

      console.log("Filtered purchase invoices:", validPurchaseInvoices);
      console.log("Number of valid purchase invoices:", validPurchaseInvoices.length);
      setInvoices(validPurchaseInvoices);
    } catch (err) {
      console.error("Error fetching purchase invoices:", err);
      setInvoices([]);
    }
  };

  const handleViewHistory = () => {
    console.log("View History button clicked. Current showHistory state:", showHistory);
    if (!showHistory) {
      console.log("Opening purchase invoice history...");
      fetchInvoices();
    } else {
      console.log("Closing purchase invoice history...");
    }
    setShowHistory(!showHistory);
  };

  const handleEdit = async (invoice) => {
    // Prevent editing purchased invoices
    if (invoice.isPurchased) {
      alert("Cannot edit a purchased invoice. This invoice has already been confirmed as purchased.");
      return;
    }

    setEditingInvoiceId(invoice.invoiceId);
    setParty(invoice.customerName); // Backend uses customerName
    setMobile(invoice.mobileNo);
    setCity(invoice.city);
    setInvoiceDate(invoice.invoiceDate);
    setSelectedCustomerId(invoice.customerId); // Backend uses customerId

    // Map items
    const mappedItems = invoice.items.map(item => ({
      itemId: item.itemId,
      itemNo: item.itemNo,
      productId: item.productId,
      godownId: item.godownId,
      itemName: item.itemName,
      qty: item.qty,
      price: item.price,
      discount: item.discount,
      tax: item.tax,
      totalLineAmount: item.totalLineAmount
    }));

    setItems(mappedItems);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (invoiceId) => {
    // Find the invoice to check if it's purchased
    const invoice = invoices.find(inv => inv.invoiceId === invoiceId);

    if (invoice && invoice.isPurchased) {
      alert("Cannot delete a purchased invoice. This invoice has already been confirmed as purchased.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.");

    if (confirmed) {
      try {
        // Delete from backend
        await deleteInvoice(invoiceId);
        alert("Purchase Invoice deleted successfully!");
        fetchInvoices();
      } catch (err) {
        console.error(err);
        alert("Error deleting invoice: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
    setParty("");
    setMobile("");
    setCity("");
    setItems([]);
    setSelectedCustomerId(null);
    setInvoiceDate(new Date().toISOString().slice(0, 10));
  };

  // Save individual item
  const handleSaveItem = async (index) => {
    const item = items[index];

    // Validate item
    if (!item.itemName || !item.qty || !item.price) {
      alert("Please fill in all required fields (Item Name, Quantity, Price)");
      return;
    }

    // For new invoices (not editing), just show confirmation
    if (!editingInvoiceId) {
      alert(`${item.itemName} is added successfully!`);
      return;
    }

    // For editing existing invoices
    if (!item.itemId) {
      alert("This is a new item. Please save the entire invoice to add new items.");
      return;
    }

    try {
      // Update via backend API
      await updateInvoiceItem(editingInvoiceId, item.itemId, item);

      // Show custom alert with item name
      alert(`${item.itemName} is added successfully!`);

      // Refresh invoice history to get updated totals
      if (showHistory) {
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
      alert("Error saving item: " + (err.message || "Unknown error"));
    }
  };

  const handleSelectCustomer = (customer) => {
    const name =
      customer.customerName ||
      customer.name ||
      "";

    const phone =
      customer.mobileNo ||
      customer.phone ||
      "";

    const cityValue =
      customer.city ||
      "";

    const id =
      customer.customerId ||
      customer.id ||
      null;

    setParty(name);
    setMobile(phone);
    setCity(cityValue);
    setSelectedCustomerId(id);

    setCustomerSuggestions([]);
    setShowCustomerDropdown(false);
    setCustomerQuery("");
  };

  const handleCustomerInputChange = async (e) => {
    const value = e.target.value;
    setParty(value);
    setCustomerQuery(value);
    setSelectedCustomerId(null);

    if (value.trim().length === 0) {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
      setIsSearching(false);
      return;
    }
    // Show dropdown immediately when typing
    setShowCustomerDropdown(true);
    setIsSearching(true);

    try {
      const results = await searchCustomers(value);
      // Filter to only show suppliers (customerType = 'Supplier' or 'Both')
      const supplierResults = Array.isArray(results)
        ? results.filter(customer =>
          customer.customerType === 'Supplier' ||
          customer.customerType === 'Both'
        )
        : [];
      setCustomerSuggestions(supplierResults);
      setIsSearching(false);
    } catch (error) {
      console.error("Error searching customers:", error);
      setCustomerSuggestions([]);
      setIsSearching(false);
    }
  }

  const handleMobileChange = async (e) => {
    const value = e.target.value;
    setMobile(value);

    if (value.trim().length >= 10) {
      try {
        const customer = await getCustomerByPhone(value);
        if (customer) {
          // Check if customer is a supplier
          if (customer.customerType === 'Supplier' || customer.customerType === 'Both') {
            setParty(customer.customerName);
            setCity(customer.city || "");
            setSelectedCustomerId(customer.customerId);
          } else {
            // Customer is not a supplier
            alert("This customer is not a supplier. Please select a supplier for purchase invoices.");
            setMobile("");
          }
        }
        else {
          // Customer not found
          const confirmAdd = window.confirm("Supplier not found. Would you like to add a new supplier?");
          if (confirmAdd) {
            handleAddNewParty();
          }
        }

      } catch (err) {
        console.error("Error fetching customer by phone:", err);
        // Show popup for customer not found
        const confirmAdd = window.confirm("Supplier not found. Would you like to add a new supplier?");
        if (confirmAdd) {
          handleAddNewParty();
        }
      }
    }
  };

  const handleAddNewParty = () => {
    // Store current form data before navigation
    sessionStorage.setItem('pendingPurchaseInvoiceData', JSON.stringify({
      items,
      invoiceDate,
      customerQuery: party
    }));
    navigate("/edit-party");
  };

  // Delete individual item
  const handleDeleteItem = async (index) => {
    const item = items[index];
    const itemName = item.itemName || "this item";

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Do you want to delete "${itemName}"?`
    );

    if (!confirmed) {
      return; // User cancelled
    }

    // If editing an existing invoice and item has an ID
    if (editingInvoiceId && item.itemId) {
      try {
        // Delete via backend API
        await deleteInvoiceItem(editingInvoiceId, item.itemId);

        alert(`${itemName} is deleted successfully!`);

        // Remove the row completely from the array
        const updated = items.filter((_, i) => i !== index);

        // Renumber the remaining items
        const renumbered = updated.map((item, idx) => ({
          ...item,
          itemNo: idx + 1
        }));

        setItems(renumbered);

        // Refresh invoice history to get updated totals
        if (showHistory) {
          fetchInvoices();
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting item: " + (err.message || "Unknown error"));
      }
    } else {
      // For new items (not saved to backend), just remove the row
      alert(`${itemName} is deleted successfully!`);

      // Remove the row completely from the array
      const updated = items.filter((_, i) => i !== index);

      // Renumber the remaining items
      const renumbered = updated.map((item, idx) => ({
        ...item,
        itemNo: idx + 1
      }));

      setItems(renumbered);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="invoice-page-header">
            <div className="invoice-header-content">
              <div className="invoice-title-section">
                <h2 className="invoice-page-title">
                  <BsFileEarmarkText className="invoice-title-icon" />
                  {editingInvoiceId ? 'Edit Purchase Invoice' : 'Create Purchase Invoice'}
                </h2>
                <p className="invoice-page-subtitle">
                  {editingInvoiceId ? 'Update invoice details' : 'Generate professional purchase invoices for your suppliers'}
                </p>
              </div>
              <div className="invoice-header-actions">
                {editingInvoiceId && (
                  <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                    <BsXCircle /> Cancel Edit
                  </button>
                )}
                <button
                  className={`history-toggle-btn ${showHistory ? 'active' : ''}`}
                  onClick={handleViewHistory}
                >
                  {showHistory ? <><BsEyeSlashFill /> Hide History</> : <><BsEyeFill /> View History</>}
                </button>
              </div>
            </div>
          </div>

          {/* Invoice History Section */}
          {showHistory && (
            <div className="invoice-history-container">
              <div className="invoice-history-header">
                <h3><BsListUl /> Purchase Invoice History</h3>
                <div className="invoice-filter-section">
                  <label htmlFor="statusFilter" className="filter-label">
                    Filter by Status:
                  </label>
                  <select
                    id="statusFilter"
                    className="status-filter-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Invoices</option>
                    <option value="received">Received</option>
                    <option value="notReceived">Not Received</option>
                  </select>
                </div>
              </div>
              <div className="invoice-history-table-wrapper">
                <table className="invoice-history-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th><BsPersonFill /> Supplier</th>
                      <th><BsTelephoneFill /> Mobile</th>
                      <th><BsGeoAltFill /> City</th>
                      <th><BsCalendar3 /> Date</th>
                      <th>Total Items</th>
                      <th><BsCashStack /> Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Filter invoices based on selected status
                      const filteredInvoices = invoices.filter(inv => {
                        // Skip null/undefined invoices or invoices without required fields
                        // Backend returns 'customerName', not 'supplierName'
                        if (!inv || !inv.invoiceId || !inv.customerName) return false;

                        // Handle null/undefined isPurchased values - treat as false (not received)
                        const isReceived = inv.isPurchased === true;

                        if (statusFilter === "received") return isReceived;
                        if (statusFilter === "notReceived") return !isReceived;
                        return true; // "all" shows everything
                      });

                      // Show appropriate empty message based on filter
                      if (filteredInvoices.length === 0) {
                        let emptyMessage = "No purchase invoices found";
                        if (statusFilter === "received") emptyMessage = "No received invoices found";
                        if (statusFilter === "notReceived") emptyMessage = "No pending invoices found";

                        return (
                          <tr>
                            <td colSpan="9" className="empty-history">
                              <BsListUl className="empty-history-icon" />
                              <p>{emptyMessage}</p>
                            </td>
                          </tr>
                        );
                      }

                      // Render filtered invoices
                      return filteredInvoices.map((inv) => (
                        <tr key={inv.invoiceId || Math.random()} className={`${editingInvoiceId === inv.invoiceId ? 'editing-row' : ''} ${inv.isPurchased ? 'sold-row' : ''}`}>
                          <td>#{inv.invoiceId ? inv.invoiceId.substring(0, 8) : 'N/A'}</td>
                          <td>{inv.customerName || 'N/A'}</td>
                          <td>{inv.mobileNo || 'N/A'}</td>
                          <td>{inv.city || 'N/A'}</td>
                          <td>{inv.invoiceDate || 'N/A'}</td>
                          <td>{inv.totalItems || 0}</td>
                          <td className="amount-cell">₹{inv.totalAmount || 0}</td>
                          <td>
                            {inv.isPurchased ? (
                              <span className="status-badge sold">Received</span>
                            ) : (
                              <span className="status-badge not-sold">Not Received</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={() => handleEdit(inv)}
                                title={inv.isPurchased ? "Cannot edit purchased invoice" : "Edit Invoice"}
                                disabled={inv.isPurchased}
                              >
                                <BsPencilSquare /> Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(inv.invoiceId)}
                                title={inv.isPurchased ? "Cannot delete purchased invoice" : "Delete Invoice"}
                                disabled={inv.isPurchased}
                              >
                                <BsTrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoice Form */}
          <div className="invoice-form-container">

            {/* Bill From Section */}
            <div className="invoice-form-section">
              <div className="section-header-invoice">
                <h4><BsPersonFill /> Bill From (Supplier)</h4>
              </div>

              <div className="invoice-form-grid">
                <div className="invoice-form-field">
                  <label className="invoice-label">
                    <BsCalendar3 className="label-icon-invoice" /> Invoice Date
                  </label>
                  <div className="invoice-input-wrapper">
                    <BsCalendar3 className="invoice-field-icon" />
                    <input
                      type="date"
                      value={invoiceDate}
                      className="invoice-input icon-padded-invoice readonly-input"
                      readOnly
                    />
                  </div>
                </div>

                <div className="invoice-form-field">
                  <label className="invoice-label">
                    <BsPersonFill className="label-icon-invoice" /> Supplier Name *
                  </label>
                  <div className="invoice-input-wrapper">
                    <BsSearch className="invoice-field-icon" />
                    <input
                      type="text"
                      placeholder="Search by name, phone or ID"
                      value={party}
                      onChange={handleCustomerInputChange}
                      className="invoice-input icon-padded-invoice"
                      required
                    />
                  </div>

                  {/* Customer suggestions dropdown */}
                  {showCustomerDropdown && (
                    <div className="customer-suggestions-dropdown">
                      {isSearching ? (
                        <div className="customer-suggestion-item searching-state">
                          <BsSearch /> Searching...
                        </div>
                      ) : customerSuggestions.length > 0 ? (
                        <>
                          {customerSuggestions.map((cust) => (
                            <div
                              key={cust.customerId}
                              className="customer-suggestion-item"
                              onClick={() => handleSelectCustomer(cust)}
                            >
                              <div className="customer-info">
                                <BsPersonFill className="customer-icon" />
                                <div>
                                  <div className="customer-name">{cust.customerName || cust.name}</div>
                                  <div className="customer-details">
                                    {cust.mobileNo && <span><BsTelephoneFill /> {cust.mobileNo || cust.phone}</span>}
                                    {cust.city && <span><BsGeoAltFill /> {cust.city}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="customer-suggestion-item no-results">
                          <div className="no-results-content">
                            <p>No supplier found</p>
                            <button
                              className="add-new-party-btn"
                              onClick={handleAddNewParty}
                            >
                              <BsPersonPlus /> Add New Supplier
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="invoice-form-field">
                  <label className="invoice-label">
                    <BsTelephoneFill className="label-icon-invoice" /> Mobile Number
                  </label>
                  <div className="invoice-input-wrapper">
                    <BsTelephoneFill className="invoice-field-icon" />
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={handleMobileChange}
                      className="invoice-input icon-padded-invoice"
                      readOnly
                    />
                  </div>
                </div>

                <div className="invoice-form-field">
                  <label className="invoice-label">
                    <BsGeoAltFill className="label-icon-invoice" /> City
                  </label>
                  <div className="invoice-input-wrapper">
                    <BsGeoAltFill className="invoice-field-icon" />
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="invoice-input icon-padded-invoice"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="invoice-form-section">
              <div className="section-header-invoice">
                <h4><BsListUl /> Items / Services</h4>
                <button className="add-item-btn-header" onClick={addItem}>
                  <BsPlus /> Add Item
                </button>
              </div>

              <div className="invoice-table-wrapper">
                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>No</th>
                      <th>Item Name</th>
                      <th style={{ width: '80px' }}>Qty</th>
                      <th style={{ width: '100px' }}>Price (₹)</th>
                      <th style={{ width: '100px' }}><BsPercent /> Disc</th>
                      <th style={{ width: '100px' }}><BsPercent /> Tax</th>
                      <th style={{ width: '120px' }}>Amount (₹)</th>
                      <th style={{ width: '140px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-items">
                          <BsListUl className="empty-items-icon" />
                          <p>No items added yet</p>
                          <button className="empty-add-btn-invoice" onClick={addItem}>
                            <BsPlus /> Add Your First Item
                          </button>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index}>
                          <td className="item-no">{index + 1}</td>
                          <td>
                            <select
                              value={item.itemName}
                              onChange={(e) => updateItem(index, "itemName", e.target.value)}
                              className="table-input table-select"
                            >
                              <option value="">Select product</option>
                              {availableProducts.map((product) => (
                                <option
                                  key={product.productId || product.id}
                                  value={product.productName || product.name}
                                >
                                  {product.productName || product.name} - ₹{product.sellingPrice || product.price || 0}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItem(index, "qty", e.target.value)}
                              className="table-input"
                              min="1"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(index, "price", e.target.value)}
                              className="table-input"
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(index, "discount", e.target.value)}
                              className="table-input"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.tax}
                              onChange={(e) => updateItem(index, "tax", e.target.value)}
                              className="table-input"
                              min="0"
                            />
                          </td>
                          <td className="amount-cell">
                            ₹{(
                              item.qty * item.price -
                              (item.qty * item.price * item.discount) / 100 +
                              (item.qty * item.price * item.tax) / 100
                            ).toFixed(2)}
                          </td>
                          <td>
                            <div className="item-action-buttons">
                              <button
                                className="btn btn-sm save-item-btn"
                                onClick={() => handleSaveItem(index)}
                                title="Save item changes"
                              >
                                <BsCheck /> Save
                              </button>
                              <button
                                className="btn btn-sm delete-item-btn-new"
                                onClick={() => handleDeleteItem(index)}
                                title="Delete item"
                              >
                                <BsTrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms and Totals Row */}
            <div className="invoice-bottom-section">
              {/* Terms */}
              <div className="invoice-terms">
                <h4>Terms and Conditions</h4>
                <ul>
                  <li>Goods once purchased will not be returned or exchanged</li>
                  <li>
                    All disputes are subject to <strong>{city ? city.toUpperCase() : "____________"}</strong> jurisdiction only
                  </li>
                </ul>
              </div>

              {/* Totals */}
              <div className="invoice-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row discount-row">
                  <span>Discount:</span>
                  <span>- ₹{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="total-row tax-row">
                  <span>Tax:</span>
                  <span>+ ₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="invoice-actions">
              <Link to="/purchase-invoices">
                <button className="invoice-back-btn">
                  <BsArrowLeft /> Go Back
                </button>
              </Link>
              <button className="invoice-save-btn" onClick={handleSave}>
                <BsSave /> {editingInvoiceId ? 'Update Invoice' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePurchaseInvoice;
