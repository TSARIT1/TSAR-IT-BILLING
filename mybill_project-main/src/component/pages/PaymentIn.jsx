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
import "../paymentIn.css";

function PaymentIn() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("payments")) || [];
    setPayments(stored);
  }, []);

  // Calculate statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Export to CSV
  const handleExportReport = () => {
    if (payments.length === 0) {
      alert("No payments to export");
      return;
    }

    const headers = ["Date", "Payment No", "Party Name", "Amount", "Mode", "Received In"];
    const csvData = payments.map(p => [
      p.paymentDate,
      `PAY-${p.paymentNo}`,
      p.party,
      p.amount,
      p.paymentMode,
      p.receivedIn || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment_in_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="payment-in-page-header">
            <div className="payment-in-header-content">
              <div className="payment-in-title-section">
                <h2 className="payment-in-page-title">
                  <BsCashCoin className="payment-in-title-icon" /> Payment In
                </h2>
                <p className="payment-in-page-subtitle">Track incoming payments from customers</p>
              </div>
              <div className="payment-in-header-actions">
                <button className="payment-in-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="payment-in-create-btn"
                  onClick={() => navigate("/create-payment-in")}
                >
                  <BsPlus /> Create Payment In
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="payment-in-summary-row">
            <div className="payment-in-summary-card total-payments">
              <div className="payment-in-card-icon-wrapper total-payments-icon">
                <BsCashCoin className="payment-in-card-icon" />
              </div>
              <div className="payment-in-card-content">
                <h4>Total Payments</h4>
                <p>{totalPayments}</p>
              </div>
            </div>

            <div className="payment-in-summary-card total-amount">
              <div className="payment-in-card-icon-wrapper total-amount-icon">
                <BsCashStack className="payment-in-card-icon" />
              </div>
              <div className="payment-in-card-content">
                <h4>Total Amount Received</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Table */}
          <div className="payment-in-table-container">
            {payments.length === 0 ? (
              <div className="payment-in-empty-state">
                <BsInboxFill className="payment-in-empty-icon" />
                <h3>No Payments Found</h3>
                <p>Start tracking your incoming payments</p>
                <button
                  className="payment-in-empty-add-btn"
                  onClick={() => navigate("/create-payment-in")}
                >
                  <BsPlus /> Create Your First Payment
                </button>
              </div>
            ) : (
              <table className="payment-in-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Payment No</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th><BsCashStack /> Amount</th>
                    <th><BsCreditCard /> Mode</th>
                    <th>Received In</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.paymentDate}</td>
                      <td className="payment-number-cell">{`PAY-${p.paymentNo}`}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {p.party}
                      </td>
                      <td className="amount-cell">₹ {p.amount}</td>
                      <td>
                        <span className="payment-mode-badge">{p.paymentMode}</span>
                      </td>
                      <td>{p.receivedIn || "-"}</td>
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

export default PaymentIn;
