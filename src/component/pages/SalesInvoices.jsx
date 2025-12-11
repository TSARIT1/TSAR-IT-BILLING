import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";

import { FaRupeeSign } from "react-icons/fa";
import { FiCalendar, FiSearch } from "react-icons/fi";
import { AiOutlineFileExclamation } from "react-icons/ai";
import { Link } from "react-router-dom";

function SalesInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("none");

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

  // ✅ Filtered & Sorted Data
  const filteredInvoices = invoices
    .filter((i) => {
      const matchesSearch =
        i.party?.toLowerCase().includes(search.toLowerCase()) ||
        i.number?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : i.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      return 0;
    });

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <div className="sales-header">
            <h2>Sales Invoices</h2>
            <div className="header-actions">
              <button className="report-btn">Reports</button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-row">
            <div className="summary-card total-card">
              <div className="icon"><FaRupeeSign /></div>
              <div>
                <h4>Total Sales</h4>
                <p>₹ {totalSales}</p>
              </div>
            </div>
            <div className="summary-card paid-card">
              <div className="icon"><FaRupeeSign /></div>
              <div>
                <h4>Paid</h4>
                <p>₹ {paid}</p>
              </div>
            </div>
            <div className="summary-card unpaid-card">
              <div className="icon"><FaRupeeSign /></div>
              <div>
                <h4>Unpaid</h4>
                <p>₹ {unpaid}</p>
              </div>
            </div>
          </div>

          {/* Filters + Button */}
          <div className="filters-row">
            <div className="filter-left">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Party or Invoice No."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="status-filter">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="sort-filter">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="none">Sort By</option>
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
            </div>

            <div className="filter-right">
              <button className="bulk-btn">Bulk Actions</button>
              <Link to="/create-invoice">
                <button className="create-btn">Create Sales Invoice</button>
              </Link>
            </div>
          </div>

          {/* Invoice Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Party Name</th>
                <th>Due In</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    <AiOutlineFileExclamation className="no-icon" />
                    <p>No Transactions Matching the current filter</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, i) => (
                  <tr key={i}>
                    <td>{inv.date}</td>
                    <td>{inv.number}</td>
                    <td>{inv.party}</td>
                    <td>{inv.due}</td>
                    <td>₹ {inv.amount}</td>
                    <td>
                      <span
                        className={`status-tag ${
                          inv.status === "Paid" ? "paid" : "unpaid"
                        }`}
                      >
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
    </>
  );
}

export default SalesInvoices;
