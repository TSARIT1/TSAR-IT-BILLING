import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import "./createPaymentIn.css";
import { FiArrowLeft, FiSettings, FiSave, FiX } from "react-icons/fi";

function CreatePaymentIn() {
  const navigate = useNavigate();

  const [paymentNo, setPaymentNo] = useState(1);
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [receivedIn, setReceivedIn] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("payments")) || [];
    setPaymentNo(stored.length + 1);
  }, []);

  const handleSave = () => {
    if (!party || !amount) {
      alert("Please enter Party Name and Amount!");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("payments")) || [];
    const newPayment = {
      id: Date.now(),
      paymentNo,
      party,
      amount,
      paymentDate,
      paymentMode,
      receivedIn,
      notes,
    };
    stored.push(newPayment);
    localStorage.setItem("payments", JSON.stringify(stored));
    alert("Payment Saved Successfully!");
    navigate("/payment-in");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content create-payment" style={{ marginTop: "2%" }}>
          {/* Enhanced Header with Icons */}
          <div className="payment-header">
            <div className="left">
              <FiArrowLeft
                className="back-icon"
                onClick={() => navigate("/payment-in")}
              />
              <div className="header-text">
                <h2>
                  <i className="bi bi-cash-coin"></i> Record Payment In
                </h2>
                <p className="header-subtitle">Track incoming payments from customers</p>
              </div>
            </div>
            <div className="right">
              <button className="settings-btn">
                <FiSettings /> Settings
              </button>
              <button className="cancel-btn" onClick={() => navigate("/payment-in")}>
                <FiX /> Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                <FiSave /> Save
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="payment-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="card-content">
                <h4>Payment No.</h4>
                <p>PAY-{paymentNo}</p>
              </div>
            </div>
            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="card-content">
                <h4>Payment Date</h4>
                <p>{new Date(paymentDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-credit-card"></i>
              </div>
              <div className="card-content">
                <h4>Payment Mode</h4>
                <p>{paymentMode}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-body">
            {/* Left Section - Party & Amount Details */}
            <div className="payment-left">
              <div className="section-header">
                <i className="bi bi-person-circle"></i>
                <h3>Party Details</h3>
              </div>

              <div className="form-group">
                <label>
                  <i className="bi bi-building"></i> Party Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter Party Name"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  className="input-with-icon"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="bi bi-wallet2"></i> Current Balance
                </label>
                <input
                  type="text"
                  value="₹ 1,00,000"
                  readOnly
                  className="balance-input"
                />
              </div>

              <div className="form-group amount-group">
                <label>
                  <i className="bi bi-currency-rupee"></i> Enter Payment Amount *
                </label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="amount-input"
                  />
                </div>
                {amount && (
                  <div className="amount-display">
                    <i className="bi bi-check-circle-fill"></i>
                    Amount: ₹ {parseFloat(amount).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Payment Details */}
            <div className="payment-right">
              <div className="section-header">
                <i className="bi bi-credit-card-2-front"></i>
                <h3>Payment Information</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="bi bi-calendar3"></i> Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="bi bi-credit-card"></i> Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="select-with-icon"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="bi bi-bank"></i> Payment Received In
                  </label>
                  <select
                    value={receivedIn}
                    onChange={(e) => setReceivedIn(e.target.value)}
                  >
                    <option value="">Select Account</option>
                    <option>Bank Account</option>
                    <option>Wallet</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <i className="bi bi-hash"></i> Payment In Number
                  </label>
                  <input
                    type="text"
                    value={`PAY-${paymentNo}`}
                    readOnly
                    className="payment-number-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="bi bi-journal-text"></i> Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any additional notes or remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              {/* Payment Mode Icons */}
              <div className="payment-mode-icons">
                <div className={`mode-icon ${paymentMode === 'Cash' ? 'active' : ''}`}>
                  <i className="bi bi-cash-stack"></i>
                  <span>Cash</span>
                </div>
                <div className={`mode-icon ${paymentMode === 'UPI' ? 'active' : ''}`}>
                  <i className="bi bi-phone"></i>
                  <span>UPI</span>
                </div>
                <div className={`mode-icon ${paymentMode === 'Bank Transfer' ? 'active' : ''}`}>
                  <i className="bi bi-bank2"></i>
                  <span>Bank</span>
                </div>
                <div className={`mode-icon ${paymentMode === 'Cheque' ? 'active' : ''}`}>
                  <i className="bi bi-file-earmark-text"></i>
                  <span>Cheque</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePaymentIn;
