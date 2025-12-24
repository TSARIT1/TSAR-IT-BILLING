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
  BsCheck
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../salesInvoice.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createInvoice, getInvoices, deleteInvoice, updateInvoice, updateInvoiceItem, deleteInvoiceItem, getInvoiceItems, getAllProducts } from "../../services/api";

function CreateSalesInvoice() {
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
        taxRate: 0,
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
      alert("Please enter Customer Name");
      return;
    }

    const invoiceData = {
      userId: userId,
      customerName: party,
      mobileNo: mobile || "-",
      city: city || "-",
      invoiceDate: invoiceDate,
      totalItems: items.length,
      totalAmount: total,
      items: items.map(i => ({
        itemNo: i.itemNo,
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
        // Update existing invoice
        await updateInvoice(editingInvoiceId, invoiceData);
        alert("Invoice updated successfully!");
        setEditingInvoiceId(null);
      } else {
        // Create new invoice
        await createInvoice(invoiceData);
        alert("Invoice saved successfully!");
      }

      // Clear form
      setParty("");
      setMobile("");
      setCity("");
      setItems([]);

      if (showHistory) fetchInvoices();
    } catch (err) {
      console.error(err);
      alert(editingInvoiceId ? "Error updating invoice." : "Error saving invoice.");
    }
  };

  const fetchInvoices = async () => {
    const userId = localStorage.getItem("userId");
    try {
      console.log("Fetching invoices for userId:", userId);
      const data = await getInvoices(userId);
      console.log("Invoice history response:", data);
      // Ensure data is always an array, even if API returns null/undefined
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      // Set to empty array on error to prevent null reference errors
      setInvoices([]);
    }
  };

  const handleViewHistory = () => {
    if (!showHistory) {
      console.log("Opening invoice history...");
      fetchInvoices();
    }
    setShowHistory(!showHistory);
  };

  const handleEdit = async (invoice) => {
    setEditingInvoiceId(invoice.invoiceId);
    setParty(invoice.customerName);
    setMobile(invoice.mobileNo);
    setCity(invoice.city);
    setInvoiceDate(invoice.invoiceDate);
    try {
      // Fetch items from invoice_items table
      const itemsData = await getInvoiceItems(invoice.invoiceId);

      // Map backend DTO → frontend state
      const mappedItems = itemsData.map(item => ({
        itemId: item.itemId,
        itemNo: item.itemNo,
        itemName: item.itemName,
        qty: item.qty,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        totalLineAmount: item.totalLineAmount
      }));

      setItems(mappedItems);
    } catch (err) {
      console.error("Error fetching invoice items:", err);
      alert("Failed to load invoice items");
      setItems([]);
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (invoiceId) => {
    const confirmed = window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.");

    if (confirmed) {
      try {
        await deleteInvoice(invoiceId);
        alert("Invoice deleted successfully!");
        fetchInvoices();
      } catch (err) {
        console.error(err);
        alert("Error deleting invoice.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
    setParty("");
    setMobile("");
    setCity("");
    setItems([]);
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
    if (!item.id) {
      alert("This is a new item. Please save the entire invoice to add new items.");
      return;
    }

    try {
      await updateInvoiceItem(editingInvoiceId, item.id, {
        itemNo: item.itemNo,
        itemName: item.itemName,
        qty: item.qty,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        totalLineAmount: item.totalLineAmount
      });

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
        await deleteInvoiceItem(editingInvoiceId, item.itemId);
        alert(`${itemName} is deleted successfully!`);

        // Clear the row content instead of removing it
        const updated = [...items];
        updated[index] = {
          itemNo: index + 1,
          productId: "",
          godownId: "",
          itemName: "",
          qty: 1,
          price: 0,
          discount: 0,
          tax: 0,
          totalLineAmount: 0
        };
        setItems(updated);

        // Refresh invoice history to get updated totals
        if (showHistory) {
          fetchInvoices();
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting item: " + (err.message || "Unknown error"));
      }
    } else {
      // For new items (not saved to backend), just clear the row
      alert(`${itemName} is deleted successfully!`);
      const updated = [...items];
      updated[index] = {
        itemNo: index + 1,
        productId: "",
        godownId: "",
        itemName: "",
        qty: 1,
        price: 0,
        discount: 0,
        tax: 0,
        totalLineAmount: 0
      };
      setItems(updated);
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
                  {editingInvoiceId ? 'Edit Sales Invoice' : 'Create Sales Invoice'}
                </h2>
                <p className="invoice-page-subtitle">
                  {editingInvoiceId ? 'Update invoice details' : 'Generate professional invoices for your customers'}
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
                <h3><BsListUl /> Invoice History</h3>
              </div>
              <div className="invoice-history-table-wrapper">
                <table className="invoice-history-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th><BsPersonFill /> Customer</th>
                      <th><BsTelephoneFill /> Mobile</th>
                      <th><BsGeoAltFill /> City</th>
                      <th><BsCalendar3 /> Date</th>
                      <th>Total Items</th>
                      <th><BsCashStack /> Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-history">
                          <BsListUl className="empty-history-icon" />
                          <p>No invoices found</p>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.invoiceId} className={editingInvoiceId === inv.invoiceId ? 'editing-row' : ''}>
                          <td>#{inv.invoiceId.substring(0, 8)}</td>
                          <td>{inv.customerName}</td>
                          <td>{inv.mobileNo}</td>
                          <td>{inv.city}</td>
                          <td>{inv.invoiceDate}</td>
                          <td>{inv.totalItems}</td>
                          <td className="amount-cell">₹{inv.totalAmount}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={() => handleEdit(inv)}
                                title="Edit Invoice"
                              >
                                <BsPencilSquare /> Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(inv.invoiceId)}
                                title="Delete Invoice"
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
          )}

          {/* Invoice Form */}
          <div className="invoice-form-container">

            {/* Bill To Section */}
            <div className="invoice-form-section">
              <div className="section-header-invoice">
                <h4><BsPersonFill /> Bill To</h4>
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
                    <BsPersonFill className="label-icon-invoice" /> Customer Name *
                  </label>
                  <div className="invoice-input-wrapper">
                    <BsPersonFill className="invoice-field-icon" />
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={party}
                      onChange={(e) => setParty(e.target.value)}
                      className="invoice-input icon-padded-invoice"
                      required
                    />
                  </div>
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
                      onChange={(e) => setMobile(e.target.value)}
                      className="invoice-input icon-padded-invoice"
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
                  <li>Goods once sold will not be taken back or exchanged</li>
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
              <Link to="/dashboard">
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

export default CreateSalesInvoice;
