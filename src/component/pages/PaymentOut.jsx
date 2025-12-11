import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiSearch } from "react-icons/fi";
import "../payment.css";

function PaymentOut() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("paymentOut")) || [];
    setPayments(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content payment-out-page" style={{marginTop:"3%"}}>
          <div className="payment-top-row">
            <h2>Payment Out</h2>

            <button
              className="create-paymentout-btn"
              onClick={() => navigate("/create-payment-out")}
            >
              Create Payment Out
            </button>
          </div>

          {/* FILTERS */}
          <div className="payment-filter-row">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input placeholder="Search" />
            </div>

            <select className="filter-select">
              <option>Last 365 Days</option>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="payment-table-box">
            {payments.length === 0 ? (
              <div className="no-paymentout">
                <p>No Transactions Matching the current filter</p>
              </div>
            ) : (
              <table className="paymentout-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Payment Number</th>
                    <th>Party Name</th>
                    <th>Amount</th>
                    <th>Mode</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td>{`PO-${p.number}`}</td>
                      <td>{p.party.name}</td>
                      <td>₹ {p.amount}</td>
                      <td>{p.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentOut;
