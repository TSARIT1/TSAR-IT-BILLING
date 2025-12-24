import React, { useState, useEffect } from "react";
import {
  BsFileEarmarkText,
  BsCashStack,
  BsCheckCircleFill,
  BsXCircleFill,
  BsCalendar3,
  BsFilter,
  BsDownload,
  BsPlus,
  BsPeopleFill,
  BsInboxFill,
  BsClipboardCheck
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../quotationEstimate.css";
import { Link } from "react-router-dom";

function QuotationEstimate() {
  const [filterDays, setFilterDays] = useState("365");
  const [statusFilter, setStatusFilter] = useState("Open");
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("quotations")) || [];
    setQuotations(stored);
  }, []);

  const filteredQuotations = quotations.filter((q) => {
    if (statusFilter === "All") return true;
    return q.status === statusFilter;
  });

  // Calculate statistics
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce((sum, q) => sum + (q.amount || 0), 0);
  const openQuotations = quotations.filter(q => q.status === "Open").length;
  const closedQuotations = quotations.filter(q => q.status === "Closed").length;

  // Export to CSV
  const handleExportReport = () => {
    if (quotations.length === 0) {
      alert("No quotations to export");
      return;
    }

    const headers = ["Date", "Quotation Number", "Party Name", "Due In", "Amount", "Status"];
    const csvData = quotations.map(q => [
      q.date,
      q.number,
      q.party,
      q.due,
      q.amount,
      q.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quotations_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="quotation-page-header">
            <div className="quotation-header-content">
              <div className="quotation-title-section">
                <h2 className="quotation-page-title">
                  <BsFileEarmarkText className="quotation-title-icon" /> Quotation / Estimate
                </h2>
                <p className="quotation-page-subtitle">Manage quotations and estimates</p>
              </div>
              <div className="quotation-header-actions">
                <button className="quotation-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="quotation-summary-row">
            <div className="quotation-summary-card total-quotations">
              <div className="quotation-card-icon-wrapper total-quotations-icon">
                <BsFileEarmarkText className="quotation-card-icon" />
              </div>
              <div className="quotation-card-content">
                <h4>Total Quotations</h4>
                <p>{totalQuotations}</p>
              </div>
            </div>

            <div className="quotation-summary-card total-value">
              <div className="quotation-card-icon-wrapper total-value-icon">
                <BsCashStack className="quotation-card-icon" />
              </div>
              <div className="quotation-card-content">
                <h4>Total Value</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="quotation-summary-card open-quotations">
              <div className="quotation-card-icon-wrapper open-quotations-icon">
                <BsClipboardCheck className="quotation-card-icon" />
              </div>
              <div className="quotation-card-content">
                <h4>Open</h4>
                <p>{openQuotations}</p>
              </div>
            </div>

            <div className="quotation-summary-card closed-quotations">
              <div className="quotation-card-icon-wrapper closed-quotations-icon">
                <BsCheckCircleFill className="quotation-card-icon" />
              </div>
              <div className="quotation-card-content">
                <h4>Closed</h4>
                <p>{closedQuotations}</p>
              </div>
            </div>
          </div>

          {/* Filters + Button */}
          <div className="quotation-filters-container">
            <div className="quotation-filters-left">
              <div className="quotation-filter-group">
                <BsCalendar3 className="quotation-filter-icon" />
                <select
                  value={filterDays}
                  onChange={(e) => setFilterDays(e.target.value)}
                  className="quotation-filter-select"
                >
                  <option value="365">Last 365 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="7">Last 7 Days</option>
                </select>
              </div>

              <div className="quotation-filter-group">
                <BsFilter className="quotation-filter-icon" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="quotation-status-select"
                >
                  <option value="Open">Show Open Quotations</option>
                  <option value="Closed">Show Closed Quotations</option>
                  <option value="All">Show All</option>
                </select>
              </div>
            </div>

            <div className="quotation-filters-right">
              <Link to="/create-quotation">
                <button className="quotation-create-btn">
                  <BsPlus /> Create Quotation
                </button>
              </Link>
            </div>
          </div>

          {/* Quotation Table */}
          <div className="quotation-table-container">
            <table className="quotation-table">
              <thead>
                <tr>
                  <th><BsCalendar3 /> Date</th>
                  <th><BsFileEarmarkText /> Quotation Number</th>
                  <th><BsPeopleFill /> Party Name</th>
                  <th>Due In</th>
                  <th><BsCashStack /> Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="quotation-empty-state">
                      <BsInboxFill className="quotation-empty-icon" />
                      <h3>No Quotations Found</h3>
                      <p>
                        {statusFilter !== "All"
                          ? `No ${statusFilter.toLowerCase()} quotations matching the current filter`
                          : "Create your first quotation to get started"}
                      </p>
                      {statusFilter === "All" && (
                        <Link to="/create-quotation">
                          <button className="quotation-empty-add-btn">
                            <BsPlus /> Create Your First Quotation
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((q, i) => (
                    <tr key={i}>
                      <td>{q.date}</td>
                      <td className="quotation-number-cell">{q.number}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {q.party}
                      </td>
                      <td>{q.due}</td>
                      <td className="amount-cell">₹ {q.amount}</td>
                      <td>
                        <span className={`quotation-status-badge ${q.status === "Open" ? "open" : "closed"}`}>
                          {q.status === "Open" ? <BsClipboardCheck /> : <BsCheckCircleFill />}
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuotationEstimate;
