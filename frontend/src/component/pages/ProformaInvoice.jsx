import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsFileEarmarkText,
  BsCashStack,
  BsCalendar3,
  BsPeopleFill,
  BsPlus,
  BsInboxFill,
  BsDownload,
  BsCheckCircleFill,
  BsXCircleFill,
  BsFilter
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../proformaInvoice.css";

function ProformaInvoice() {
  const [proformas, setProformas] = useState([]);
  const [dayFilter, setDayFilter] = useState("365");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("proformas")) || [];
    setProformas(stored);
  }, []);

  const filtered = proformas.filter((p) => {
    if (statusFilter === "All") return true;
    return p.status === statusFilter;
  });

  // Calculate statistics
  const totalProformas = proformas.length;
  const totalAmount = proformas.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const openProformas = proformas.filter(p => p.status === "Open").length;
  const closedProformas = proformas.filter(p => p.status === "Closed").length;

  // Export to CSV
  const handleExportReport = () => {
    if (proformas.length === 0) {
      alert("No proforma invoices to export");
      return;
    }

    const headers = ["Date", "Proforma Invoice Number", "Party Name", "Due In", "Amount", "Status"];
    const csvData = proformas.map(p => [
      p.date,
      p.number,
      p.party,
      p.due,
      p.total,
      p.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proforma_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="proforma-page-header">
            <div className="proforma-header-content">
              <div className="proforma-title-section">
                <h2 className="proforma-page-title">
                  <BsFileEarmarkText className="proforma-title-icon" /> Proforma Invoice
                </h2>
                <p className="proforma-page-subtitle">Manage proforma invoices and quotations</p>
              </div>
              <div className="proforma-header-actions">
                <button className="proforma-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <Link to="/create-proforma-invoice">
                  <button className="proforma-create-btn">
                    <BsPlus /> Create Proforma Invoice
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="proforma-summary-row">
            <div className="proforma-summary-card total-proformas">
              <div className="proforma-card-icon-wrapper total-proformas-icon">
                <BsFileEarmarkText className="proforma-card-icon" />
              </div>
              <div className="proforma-card-content">
                <h4>Total Proformas</h4>
                <p>{totalProformas}</p>
              </div>
            </div>

            <div className="proforma-summary-card total-amount">
              <div className="proforma-card-icon-wrapper total-amount-icon">
                <BsCashStack className="proforma-card-icon" />
              </div>
              <div className="proforma-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="proforma-summary-card open-proformas">
              <div className="proforma-card-icon-wrapper open-proformas-icon">
                <BsXCircleFill className="proforma-card-icon" />
              </div>
              <div className="proforma-card-content">
                <h4>Open</h4>
                <p>{openProformas}</p>
              </div>
            </div>

            <div className="proforma-summary-card closed-proformas">
              <div className="proforma-card-icon-wrapper closed-proformas-icon">
                <BsCheckCircleFill className="proforma-card-icon" />
              </div>
              <div className="proforma-card-content">
                <h4>Closed</h4>
                <p>{closedProformas}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="proforma-filters-container">
            <div className="proforma-filters-left">
              <div className="proforma-filter-group">
                <BsCalendar3 className="proforma-filter-icon" />
                <select
                  className="proforma-filter-select"
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <option value="365">Last 365 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="7">Last 7 Days</option>
                </select>
              </div>

              <div className="proforma-filter-group">
                <BsFilter className="proforma-filter-icon" />
                <select
                  className="proforma-status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">Show All</option>
                  <option value="Open">Show Open Invoices</option>
                  <option value="Closed">Show Closed Invoices</option>
                </select>
              </div>
            </div>
          </div>

          {/* Proforma Invoice Table */}
          <div className="proforma-table-container">
            {filtered.length === 0 ? (
              <div className="proforma-empty-state">
                <BsInboxFill className="proforma-empty-icon" />
                <h3>No Proforma Invoices Found</h3>
                <p>
                  {statusFilter !== "All"
                    ? `No ${statusFilter.toLowerCase()} proforma invoices matching the filter`
                    : "Start creating proforma invoices"}
                </p>
                <Link to="/create-proforma-invoice">
                  <button className="proforma-empty-add-btn">
                    <BsPlus /> Create Your First Proforma Invoice
                  </button>
                </Link>
              </div>
            ) : (
              <table className="proforma-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Proforma Invoice Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th>Due In</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td className="proforma-number-cell">{p.number}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {p.party}
                      </td>
                      <td>{p.due}</td>
                      <td className="amount-cell">₹ {p.total}</td>
                      <td>
                        <span className={`proforma-status-badge ${p.status === "Closed" ? "closed" : "open"}`}>
                          {p.status === "Closed" ? <BsCheckCircleFill /> : <BsXCircleFill />}
                          {p.status}
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

export default ProformaInvoice;
