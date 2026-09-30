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
  BsDownload,
  BsTrash,
} from "react-icons/bs";
import PortalLayout from "../PortalLayout";
import "../dashboard.css";
import "../paymentIn.css";
import { getPayments, deletePayment } from "../../services/api";

function PaymentIn() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setError("");
      const data = await getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(typeof err === "string" ? err : "Could not load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Calculate statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleDelete = async (payment) => {
    if (!window.confirm(`Delete receipt ${payment.paymentNo}? This cannot be undone.`)) return;
    setDeletingId(payment.id);
    try {
      await deletePayment(payment.id);
      await load();
    } catch (err) {
      alert(typeof err === "string" ? err : "Could not delete the receipt");
    } finally {
      setDeletingId(null);
    }
  };

  // Export to CSV
  const handleExportReport = () => {
    if (payments.length === 0) {
      alert("No payments to export");
      return;
    }

    const headers = ["Date", "Payment No", "Party Name", "Amount", "Mode", "Received In", "Notes"];
    const csvData = payments.map((p) => [
      p.paymentDate || "",
      p.paymentNo || "",
      (p.customerName || "-").replace(/,/g, " "),
      p.amount ?? "",
      p.paymentMode || "",
      p.receivedIn || "-",
      (p.notes || "").replace(/,/g, " ").replace(/\n/g, " "),
    ]);

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment_in_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <PortalLayout title="Payment In (Customer Receipts)">
      <div className="payment-in-page-container animate-fade-in">
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
              <p>₹ {fmt(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        <div className="payment-in-table-container">
          {loading ? (
            <div className="payment-in-empty-state">
              <BsInboxFill className="payment-in-empty-icon" />
              <h3>Loading payments…</h3>
            </div>
          ) : error ? (
            <div className="payment-in-empty-state">
              <BsInboxFill className="payment-in-empty-icon" />
              <h3>Could not load payments</h3>
              <p>{error}</p>
              <button className="payment-in-empty-add-btn" onClick={load}>
                Try Again
              </button>
            </div>
          ) : payments.length === 0 ? (
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
                  <th>
                    <BsCalendar3 /> Date
                  </th>
                  <th>Payment No</th>
                  <th>
                    <BsPeopleFill /> Party Name
                  </th>
                  <th>
                    <BsCashStack /> Amount
                  </th>
                  <th>
                    <BsCreditCard /> Mode
                  </th>
                  <th>Received In</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.paymentDate}</td>
                    <td className="payment-number-cell">{p.paymentNo}</td>
                    <td className="party-name-cell">
                      <BsPeopleFill className="party-icon" /> {p.customerName || "Walk-in"}
                    </td>
                    <td className="amount-cell">₹ {fmt(p.amount)}</td>
                    <td>
                      <span className="payment-mode-badge">{p.paymentMode}</span>
                    </td>
                    <td>{p.receivedIn || "-"}</td>
                    <td>
                      <button
                        className="payment-in-delete-btn"
                        title="Delete receipt"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        style={{
                          background: "none",
                          border: "none",
                          color: deletingId === p.id ? "#b7a48c" : "#b23a48",
                          cursor: deletingId === p.id ? "wait" : "pointer",
                          fontSize: 16,
                          padding: 4,
                        }}
                      >
                        <BsTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

export default PaymentIn;
