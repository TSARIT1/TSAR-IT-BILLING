import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsFileEarmarkText,
  BsCashStack,
  BsCalendar3,
  BsPeopleFill,
  BsTelephoneFill,
  BsPlus,
  BsInboxFill,
  BsDownload,
  BsCheckCircleFill,
  BsXCircleFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../purchaseInvoice.css";

function PurchaseInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    setInvoices(stored);
  }, []);

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.finalTotal) || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === "Paid").length;
  const unpaidInvoices = invoices.filter(inv => inv.status === "Unpaid" || inv.status === "Pending").length;

  // Export to CSV
  const handleExportReport = () => {
    if (invoices.length === 0) {
      alert("No purchase invoices to export");
      return;
    }

    const headers = ["Date", "Invoice No", "Party", "Mobile", "Total", "Status"];
    const csvData = invoices.map(inv => [
      inv.date,
      `PI-${inv.number}`,
      inv.partyName,
      inv.partyMobile,
      inv.finalTotal,
      inv.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="purchase-invoice-page-header">
            <div className="purchase-invoice-header-content">
              <div className="purchase-invoice-title-section">
                <h2 className="purchase-invoice-page-title">
                  <BsFileEarmarkText className="purchase-invoice-title-icon" /> Purchase Invoices
                </h2>
                <p className="purchase-invoice-page-subtitle">Track and manage purchase invoices</p>
              </div>
              <div className="purchase-invoice-header-actions">
                <button className="purchase-invoice-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="purchase-invoice-create-btn"
                  onClick={() => navigate("/create-purchase-invoice")}
                >
                  <BsPlus /> Create Purchase Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="purchase-invoice-summary-row">
            <div className="purchase-invoice-summary-card total-invoices">
              <div className="purchase-invoice-card-icon-wrapper total-invoices-icon">
                <BsFileEarmarkText className="purchase-invoice-card-icon" />
              </div>
              <div className="purchase-invoice-card-content">
                <h4>Total Purchases</h4>
                <p>{totalInvoices}</p>
              </div>
            </div>

            <div className="purchase-invoice-summary-card total-amount">
              <div className="purchase-invoice-card-icon-wrapper total-amount-icon">
                <BsCashStack className="purchase-invoice-card-icon" />
              </div>
              <div className="purchase-invoice-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="purchase-invoice-summary-card paid-invoices">
              <div className="purchase-invoice-card-icon-wrapper paid-invoices-icon">
                <BsCheckCircleFill className="purchase-invoice-card-icon" />
              </div>
              <div className="purchase-invoice-card-content">
                <h4>Paid</h4>
                <p>{paidInvoices}</p>
              </div>
            </div>

            <div className="purchase-invoice-summary-card unpaid-invoices">
              <div className="purchase-invoice-card-icon-wrapper unpaid-invoices-icon">
                <BsXCircleFill className="purchase-invoice-card-icon" />
              </div>
              <div className="purchase-invoice-card-content">
                <h4>Unpaid</h4>
                <p>{unpaidInvoices}</p>
              </div>
            </div>
          </div>

          {/* Purchase Invoice Table */}
          <div className="purchase-invoice-table-container">
            {invoices.length === 0 ? (
              <div className="purchase-invoice-empty-state">
                <BsInboxFill className="purchase-invoice-empty-icon" />
                <h3>No Purchase Invoices Found</h3>
                <p>Start tracking your purchase invoices</p>
                <button
                  className="purchase-invoice-empty-add-btn"
                  onClick={() => navigate("/create-purchase-invoice")}
                >
                  <BsPlus /> Create Your First Purchase Invoice
                </button>
              </div>
            ) : (
              <table className="purchase-invoice-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Invoice No</th>
                    <th><BsPeopleFill /> Party</th>
                    <th><BsTelephoneFill /> Mobile</th>
                    <th><BsCashStack /> Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i}>
                      <td>{inv.date}</td>
                      <td className="invoice-number-cell">PI-{inv.number}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {inv.partyName}
                      </td>
                      <td>{inv.partyMobile}</td>
                      <td className="amount-cell">₹ {inv.finalTotal}</td>
                      <td>
                        <span className={`purchase-invoice-status-badge ${inv.status === "Paid" ? "paid" : "unpaid"}`}>
                          {inv.status === "Paid" ? <BsCheckCircleFill /> : <BsXCircleFill />}
                          {inv.status}
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

export default PurchaseInvoices;
