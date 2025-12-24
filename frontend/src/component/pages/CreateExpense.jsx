import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../createExpense.css";
import { FiArrowLeft, FiSettings, FiSave, FiX, FiPlus } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function CreateExpense() {
  const navigate = useNavigate();
  const [expenseWithGST, setExpenseWithGST] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseNumber, setExpenseNumber] = useState(1);
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("");
  const [note, setNote] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  const handleSave = () => {
    // Save logic here
    alert("Expense saved successfully!");
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content create-expense-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="expense-header">
            <div className="header-left">
              <FiArrowLeft
                className="back-icon"
                onClick={() => navigate(-1)}
              />
              <div className="header-text">
                <h2>
                  <i className="bi bi-receipt-cutoff"></i> Create Expense
                </h2>
                <p className="header-subtitle">
                  <i className="bi bi-info-circle"></i> Record and track your business expenses
                </p>
              </div>
            </div>

            <div className="header-right">
              <button className="btn btn-outline-secondary btn-sm">
                <FiSettings /> Settings
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => navigate(-1)}>
                <FiX /> Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                <FiSave /> Save
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="expense-body">

            {/* Two Column Layout */}
            <div className="expense-form-grid">

              {/* Left Column */}
              <div className="form-card">
                <div className="card-header-custom">
                  <i className="bi bi-gear-fill"></i> Expense Configuration
                </div>

                {/* GST Toggle */}
                <div className="form-group gst-toggle-group">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="mb-0">
                      <i className="bi bi-percent"></i> Expense With GST
                    </label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="gstSwitch"
                        checked={expenseWithGST}
                        onChange={(e) => setExpenseWithGST(e.target.checked)}
                      />
                    </div>
                  </div>
                  {expenseWithGST && (
                    <small className="text-success">
                      <i className="bi bi-check-circle-fill"></i> GST will be calculated
                    </small>
                  )}
                </div>

                {/* Expense Category */}
                <div className="form-group">
                  <label>
                    <i className="bi bi-tag-fill"></i> Expense Category *
                  </label>
                  <select
                    className="form-select"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="office">Office Supplies</option>
                    <option value="travel">Travel</option>
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="salary">Salary</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Expense Number */}
                <div className="form-group">
                  <label>
                    <i className="bi bi-hash"></i> Expense Number
                  </label>
                  <input
                    type="text"
                    className="form-control readonly-input"
                    value={expenseNumber}
                    readOnly
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="form-card">
                <div className="card-header-custom">
                  <i className="bi bi-file-text-fill"></i> Expense Details
                </div>

                {/* Original Invoice Number */}
                <div className="form-group">
                  <label>
                    <i className="bi bi-receipt"></i> Original Invoice Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter invoice number"
                    value={originalInvoiceNumber}
                    onChange={(e) => setOriginalInvoiceNumber(e.target.value)}
                  />
                </div>

                {/* Date */}
                <div className="form-group">
                  <label>
                    <i className="bi bi-calendar3"></i> Date *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Payment Mode */}
                <div className="form-group">
                  <label>
                    <i className="bi bi-credit-card"></i> Payment Mode *
                  </label>
                  <select
                    className="form-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>

                {/* Note */}
                <div className="form-group">
                  <label>
                    <i className="bi bi-journal-text"></i> Note
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter Notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                  <small className="text-muted">
                    {note.length}/500 characters
                  </small>
                </div>
              </div>
            </div>

            {/* Add Item Section */}
            <div className="add-item-section">
              <button className="add-item-btn">
                <FiPlus /> Add Item
              </button>
              <p className="text-muted mb-0">
                <i className="bi bi-info-circle"></i> Click to add expense items with details
              </p>
            </div>

            {/* Total Amount Section */}
            <div className="total-amount-card">
              <div className="total-label">
                <i className="bi bi-calculator"></i> Total Expense Amount
              </div>
              <div className="total-value">
                <span className="currency">₹</span>
                <span className="amount">{totalAmount.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CreateExpense;
