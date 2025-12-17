import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../onlineOrders.css";
import { FiSearch, FiShoppingCart, FiTrendingUp, FiPackage } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function OnlineOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 365 Days");

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content online-orders-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="orders-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-cart-check"></i> Online Orders
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Manage and track your online store orders
              </p>
            </div>

            <div className="header-actions">
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-gear"></i> Settings
              </button>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-shop"></i> Create Online Store
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="orders-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-cart3"></i>
              </div>
              <div className="card-content">
                <h4>Total Orders</h4>
                <p className="amount">0</p>
                <span className="subtitle">All Time</span>
              </div>
            </div>

            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="card-content">
                <h4>Completed</h4>
                <p className="amount">0</p>
                <span className="subtitle">This Month</span>
              </div>
            </div>

            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="card-content">
                <h4>Pending</h4>
                <p className="amount">0</p>
                <span className="subtitle">Awaiting Processing</span>
              </div>
            </div>

            <div className="summary-card purple">
              <div className="card-icon">
                <i className="bi bi-currency-rupee"></i>
              </div>
              <div className="card-content">
                <h4>Revenue</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">This Month</span>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="promo-banner">
            <div className="banner-content">
              <div className="banner-icon">
                <i className="bi bi-shop-window"></i>
              </div>
              <div className="banner-text">
                <h3>Increase your sales, get <span className="highlight">Online Orders</span> with a single click</h3>
                <p>Create your online store and start receiving orders from customers worldwide</p>
              </div>
            </div>
            <button className="btn btn-lg btn-light banner-button">
              <i className="bi bi-plus-circle"></i> Create Online Store
            </button>
          </div>

          {/* Filters Section */}
          <div className="orders-filters-card">
            <div className="filters-row">
              {/* Search */}
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="       Search by order number, party name..."
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
                  <option>Last 7 Days</option>
                  <option>Today</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <i className="bi bi-funnel"></i>
                <select className="form-select form-select-sm">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>

              {/* Export Button */}
              <button className="btn btn-outline-success btn-sm export-btn">
                <i className="bi bi-download"></i> Export
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="orders-table-card">
            {/* Table Header */}
            <div className="table-header-row">
              <div className="header-cell">
                <i className="bi bi-calendar-event"></i> Date
              </div>
              <div className="header-cell">
                <i className="bi bi-hash"></i> Order Number
              </div>
              <div className="header-cell">
                <i className="bi bi-person"></i> Party Name
              </div>
              <div className="header-cell">
                <i className="bi bi-currency-rupee"></i> Amount
              </div>
              <div className="header-cell">
                <i className="bi bi-info-circle"></i> Status
              </div>
              <div className="header-cell">
                <i className="bi bi-credit-card"></i> Payment Mode
              </div>
              <div className="header-cell">
                <i className="bi bi-gear"></i> Actions
              </div>
            </div>

            {/* Empty State */}
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-shop"></i>
              </div>
              <h4>No Online Orders Yet</h4>
              <p>No transactions matching the current filter</p>
              <button className="btn btn-primary mt-3">
                <i className="bi bi-plus-circle"></i> Create Your Online Store
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default OnlineOrders;
