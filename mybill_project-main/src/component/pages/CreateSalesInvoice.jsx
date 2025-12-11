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
  BsEyeSlashFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../salesInvoice.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createInvoice, getInvoices } from "../../services/api";

function CreateSalesInvoice() {
  const [party, setParty] = useState("");
  const [mobile, setMobile] = useState("");
  const [items, setItems] = useState([]);
  const [city, setCity] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerm, setPaymentTerm] = useState(30);
  const [showHistory, setShowHistory] = useState(false);
  const [invoices, setInvoices] = useState([]);
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
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        itemNo: items.length + 1,
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
    updated[index][field] = value;

    const qty = parseFloat(updated[index].qty) || 0;
    const price = parseFloat(updated[index].price) || 0;
    const discount = parseFloat(updated[index].discount) || 0;
    const tax = parseFloat(updated[index].tax) || 0;

    const subtotal = qty * price;
    const total = subtotal - (subtotal * discount) / 100 + (subtotal * tax) / 100;
    updated[index].totalLineAmount = total;

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
      const response = await createInvoice(invoiceData);
      alert("Invoice saved successfully!");
      setParty("");
      setMobile("");
      setCity("");
      setItems([]);
      if (showHistory) fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Error saving invoice.");
    }
  };

  const fetchInvoices = async () => {
    const userId = localStorage.getItem("userId");
    try {
      console.log("Fetching invoices for userId:", userId);
      const data = await getInvoices(userId);
      console.log("Invoice history response:", data);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewHistory = () => {
    if (!showHistory) {
      console.log("Opening invoice history...");
      fetchInvoices();
    }
    setShowHistory(!showHistory);
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
                  <BsFileEarmarkText className="invoice-title-icon" /> Create Sales Invoice
                </h2>
                <p className="invoice-page-subtitle">Generate professional invoices for your customers</p>
              </div>
              <div className="invoice-header-actions">
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
                      <th>Items</th>
                      <th><BsCashStack /> Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-history">
                          <BsListUl className="empty-history-icon" />
                          <p>No invoices found</p>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.invoiceId}>
                          <td>#{inv.invoiceId}</td>
                          <td>{inv.customerName}</td>
                          <td>{inv.mobileNo}</td>
                          <td>{inv.city}</td>
                          <td>{inv.invoiceDate}</td>
                          <td>{inv.totalItems}</td>
                          <td className="amount-cell">₹{inv.totalAmount}</td>
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
                      <th style={{ width: '60px' }}>Action</th>
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
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => updateItem(index, "itemName", e.target.value)}
                              placeholder="Item name"
                              className="table-input"
                            />
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
                            <button
                              className="delete-item-btn"
                              onClick={() => removeItem(index)}
                              title="Remove item"
                            >
                              <BsTrash />
                            </button>
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
                <BsSave /> Save Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateSalesInvoice;
