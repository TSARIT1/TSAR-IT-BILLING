import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../expenses.css";
import { FiSearch, FiDownload, FiFilter } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function Expenses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [categoryFilter, setCategoryFilter] = useState("All Expenses Categories");

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content expenses-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="expenses-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-receipt-cutoff"></i> Expenses
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Track and manage all your business expenses
              </p>
            </div>

            <div className="header-actions">
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-file-earmark-bar-graph"></i> Reports
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/createexpense")}
              >
                <i className="bi bi-plus-circle"></i> Create Expense
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="expense-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="card-content">
                <h4>Total Expenses</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">This Year</span>
              </div>
            </div>

            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-calendar-month"></i>
              </div>
              <div className="card-content">
                <h4>This Month</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">0 Transactions</span>
              </div>
            </div>

            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-graph-up"></i>
              </div>
              <div className="card-content">
                <h4>Average/Month</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">Last 6 Months</span>
              </div>
            </div>

            <div className="summary-card red">
              <div className="card-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div className="card-content">
                <h4>Pending</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">0 Items</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="expenses-filters-card">
            <div className="filters-row">
              {/* Search */}
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="           Search by expense number, party name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Date Filter */}
              <div className="filter-group">
                <i className="bi bi-calendar3"></i>
                <select
                  className="form-select form-select-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option>Last 365 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Month</option>
                  <option>This Year</option>
                {/*  <option>Custom Range</option> */}
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <i className="bi bi-funnel"></i>
                <select
                  className="form-select form-select-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All Expenses Categories</option>
                  <option>Office Supplies</option>
                  <option>Travel</option>
                  <option>Utilities</option>
                  <option>Rent</option>
                  <option>Salary</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Export Button */}
              <button className="btn btn-outline-success btn-sm export-btn">
                <FiDownload /> Export
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="expenses-table-card">
            {/* Table Header */}
            <div className="table-header-row">
              <div className="header-cell">
                <i className="bi bi-calendar-event"></i> Date
              </div>
              <div className="header-cell">
                <i className="bi bi-hash"></i> Expense Number
              </div>
              <div className="header-cell">
                <i className="bi bi-person"></i> Party Name
              </div>
              <div className="header-cell">
                <i className="bi bi-tag"></i> Category
              </div>
              <div className="header-cell">
                <i className="bi bi-currency-rupee"></i> Amount
              </div>
              <div className="header-cell">
                <i className="bi bi-gear"></i> Actions
              </div>
            </div>

            {/* Empty State */}
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h4>No Expenses Found</h4>
              <p>No transactions matching the current filter</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/createexpense")}
              >
                <i className="bi bi-plus-circle"></i> Create Your First Expense
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Expenses;
