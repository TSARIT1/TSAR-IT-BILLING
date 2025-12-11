import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./dashboard.css";
import "./createPaymentIn.css";
import { FiArrowLeft, FiSettings } from "react-icons/fi";

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
          <div className="payment-header">
            <div className="left">
              <FiArrowLeft
                className="back-icon"
                onClick={() => navigate("/payment-in")}
              />
              <h2>Record Payment In</h2>
            </div>
            <div className="right">
              <button className="settings-btn">
                <FiSettings /> Settings
              </button>
              <button className="cancel-btn" onClick={() => navigate("/payment-in")}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>

          <div className="payment-body">
            <div className="payment-left">
              <div className="form-group">
                <label>Party Name</label>
                <input
                  type="text"
                  placeholder="Enter Party Name"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Current Balance</label>
                <input type="text" value="₹ 1m" readOnly />
              </div>
              <div className="form-group">
                <label>Enter Payment Amount</label>
                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="payment-right">
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
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
                  <label>Payment Received In</label>
                  <select
                    value={receivedIn}
                    onChange={(e) => setReceivedIn(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Bank Account</option>
                    <option>Wallet</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment In Number</label>
                  <input type="text" value={`PAY-${paymentNo}`} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Enter notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePaymentIn;
