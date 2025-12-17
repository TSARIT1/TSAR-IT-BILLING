import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsCashCoin,
  BsCashStack,
  BsCalendar3,
  BsCreditCard,
  BsPeopleFill,
  BsPlus,
  BsInboxFill,
  BsDownload
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../paymentOut.css";

function PaymentOut() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("paymentOut")) || [];
    setPayments(stored);
  }, []);

  // Calculate statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Export to CSV
  const handleExportReport = () => {
    if (payments.length === 0) {
      alert("No payment out records to export");
      return;
    }

    const headers = ["Date", "Payment Number", "Party Name", "Amount", "Mode"];
    const csvData = payments.map(p => [
      p.date,
      `PO-${p.number}`,
      p.party.name,
      p.amount,
      p.mode
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment_out_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="payment-out-page-header">
            <div className="payment-out-header-content">
              <div className="payment-out-title-section">
                <h2 className="payment-out-page-title">
                  <BsCashCoin className="payment-out-title-icon" /> Payment Out
                </h2>
                <p className="payment-out-page-subtitle">Track outgoing payments to suppliers</p>
              </div>
              <div className="payment-out-header-actions">
                <button className="payment-out-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="payment-out-create-btn"
                  onClick={() => navigate("/create-payment-out")}
                >
                  <BsPlus /> Create Payment Out
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="payment-out-summary-row">
            <div className="payment-out-summary-card total-payments">
              <div className="payment-out-card-icon-wrapper total-payments-icon">
                <BsCashCoin className="payment-out-card-icon" />
              </div>
              <div className="payment-out-card-content">
                <h4>Total Payments</h4>
                <p>{totalPayments}</p>
              </div>
            </div>

            <div className="payment-out-summary-card total-amount">
              <div className="payment-out-card-icon-wrapper total-amount-icon">
                <BsCashStack className="payment-out-card-icon" />
              </div>
              <div className="payment-out-card-content">
                <h4>Total Amount Paid</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Out Table */}
          <div className="payment-out-table-container">
            {payments.length === 0 ? (
              <div className="payment-out-empty-state">
                <BsInboxFill className="payment-out-empty-icon" />
                <h3>No Payment Out Records Found</h3>
                <p>Start tracking outgoing payments to suppliers</p>
                <button
                  className="payment-out-empty-add-btn"
                  onClick={() => navigate("/create-payment-out")}
                >
                  <BsPlus /> Create Your First Payment Out
                </button>
              </div>
            ) : (
              <table className="payment-out-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Payment Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th><BsCashStack /> Amount</th>
                    <th><BsCreditCard /> Mode</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td className="payment-number-cell">{`PO-${p.number}`}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {p.party.name}
                      </td>
                      <td className="amount-cell">₹ {p.amount}</td>
                      <td>
                        <span className="payment-out-mode-badge">
                          <BsCreditCard /> {p.mode}
                        </span>
                      </td>
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
