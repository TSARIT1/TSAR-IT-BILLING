import React, { useEffect, useState } from "react";
import {
  BsFileEarmarkText,
  BsCashStack,
  BsCheckCircleFill,
  BsXCircleFill,
  BsSearch,
  BsFilter,
  BsCalendar3,
  BsDownload,
  BsPlus,
  BsPeopleFill,
  BsInboxFill,
  BsCurrencyDollar
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../salesInvoicesList.css";
import { Link } from "react-router-dom";

function SalesInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("none");

  const [advancedFilter, setAdvancedFilter] = useState("none");
  const [amountValue, setAmountValue] = useState("");
  const [dateValue, setDateValue] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("invoices")) || [];
    setInvoices(stored);
  }, []);

  const totalSales = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const paid = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const unpaid = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((sum, i) => sum + i.amount, 0);

  // Filtered & Sorted Data
  const filteredInvoices = invoices
    .filter((i) => {
      // SEARCH FILTER
      const matchesSearch =
        i.party?.toLowerCase().includes(search.toLowerCase()) ||
        i.number?.toLowerCase().includes(search.toLowerCase());

      if (advancedFilter === "none") return matchesSearch;

      // STATUS FILTER
      if (advancedFilter === "status") {
        const matchesStatus =
          statusFilter === "All" ? true : i.status === statusFilter;
        return matchesSearch && matchesStatus;
      }

      // AMOUNT FILTER
      if (advancedFilter === "amount") {
        if (!amountValue) return matchesSearch;
        return matchesSearch && i.amount === Number(amountValue);
      }

      // DATE FILTER
      if (advancedFilter === "date") {
        if (!dateValue) return matchesSearch;
        return matchesSearch && i.date === dateValue;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      return 0;
    });

  // Export to CSV
  const handleExportReport = () => {
    if (invoices.length === 0) {
      alert("No invoices to export");
      return;
    }

    const headers = ["Date", "Invoice Number", "Customer Name", "Due In", "Amount", "Status"];
    const csvData = invoices.map(inv => [
      inv.date,
      inv.number,
      inv.party,
      inv.due,
      inv.amount,
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
    a.download = `sales_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="sales-invoices-page-header">
            <div className="sales-invoices-header-content">
              <div className="sales-invoices-title-section">
                <h2 className="sales-invoices-page-title">
                  <BsFileEarmarkText className="sales-invoices-title-icon" /> Sales Invoices
                </h2>
                <p className="sales-invoices-page-subtitle">View and manage all sales invoices</p>
              </div>
              <div className="sales-invoices-header-actions">
                <button className="sales-invoices-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="sales-invoices-summary-row">
            <div className="sales-invoices-summary-card total-sales">
              <div className="sales-invoices-card-icon-wrapper total-sales-icon">
                <BsCashStack className="sales-invoices-card-icon" />
              </div>
              <div className="sales-invoices-card-content">
                <h4>Total Sales</h4>
                <p>₹ {totalSales.toFixed(2)}</p>
              </div>
            </div>

            <div className="sales-invoices-summary-card paid-sales">
              <div className="sales-invoices-card-icon-wrapper paid-sales-icon">
                <BsCheckCircleFill className="sales-invoices-card-icon" />
              </div>
              <div className="sales-invoices-card-content">
                <h4>Paid</h4>
                <p>₹ {paid.toFixed(2)}</p>
              </div>
            </div>

            <div className="sales-invoices-summary-card unpaid-sales">
              <div className="sales-invoices-card-icon-wrapper unpaid-sales-icon">
                <BsXCircleFill className="sales-invoices-card-icon" />
              </div>
              <div className="sales-invoices-card-content">
                <h4>Unpaid</h4>
                <p>₹ {unpaid.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Filters + Buttons */}
          <div className="sales-invoices-filters-container">
            <div className="sales-invoices-filters-left">
              <div className="sales-invoices-search-box">
                <BsSearch className="sales-invoices-search-icon" />
                <input
                  type="text"
                  placeholder="Search by party or invoice number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sales-invoices-search-input"
                />
              </div>

              <div className="sales-invoices-filter-group">
                <BsFilter className="sales-invoices-filter-icon" />
                <select
                  value={advancedFilter}
                  onChange={(e) => {
                    setAdvancedFilter(e.target.value);
                    setAmountValue("");
                    setDateValue("");
                  }}
                  className="sales-invoices-filter-select"
                >
                  <option value="none">Select Filter</option>
                  <option value="status">By Status</option>
                  <option value="amount">By Amount</option>
                  <option value="date">By Date</option>
                </select>
              </div>

              {advancedFilter === "status" && (
                <div className="sales-invoices-status-filter">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="sales-invoices-status-select"
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              )}

              {advancedFilter === "amount" && (
                <div className="sales-invoices-amount-filter">
                  <BsCurrencyDollar className="sales-invoices-amount-icon" />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                    className="sales-invoices-amount-input"
                  />
                </div>
              )}

              {advancedFilter === "date" && (
                <div className="sales-invoices-date-filter">
                  <BsCalendar3 className="sales-invoices-date-icon" />
                  <input
                    type="date"
                    value={dateValue}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="sales-invoices-date-input"
                  />
                </div>
              )}
            </div>

            <div className="sales-invoices-filters-right">
              <Link to="/create-invoice">
                <button className="sales-invoices-create-btn">
                  <BsPlus /> Create Invoice
                </button>
              </Link>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="sales-invoices-table-container">
            <table className="sales-invoices-table">
              <thead>
                <tr>
                  <th><BsCalendar3 /> Date</th>
                  <th><BsFileEarmarkText /> Invoice Number</th>
                  <th><BsPeopleFill /> Customer Name</th>
                  <th>Due In</th>
                  <th><BsCashStack /> Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="sales-invoices-empty-state">
                      <BsInboxFill className="sales-invoices-empty-icon" />
                      <h3>No Invoices Found</h3>
                      <p>
                        {search || advancedFilter !== "none"
                          ? "No transactions matching the current filter"
                          : "Create your first sales invoice to get started"}
                      </p>
                      {!search && advancedFilter === "none" && (
                        <Link to="/create-invoice">
                          <button className="sales-invoices-empty-add-btn">
                            <BsPlus /> Create Your First Invoice
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, i) => (
                    <tr key={i}>
                      <td>{inv.date}</td>
                      <td className="invoice-number-cell">{inv.number}</td>
                      <td className="customer-name-cell">
                        <BsPeopleFill className="customer-icon" /> {inv.party}
                      </td>
                      <td>{inv.due}</td>
                      <td className="amount-cell">₹ {inv.amount}</td>
                      <td>
                        <span className={`sales-invoices-status-badge ${inv.status === "Paid" ? "paid" : "unpaid"}`}>
                          {inv.status === "Paid" ? <BsCheckCircleFill /> : <BsXCircleFill />}
                          {inv.status}
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

export default SalesInvoices;
