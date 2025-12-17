import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../cashBank.css";
import { FiCalendar, FiTrendingUp } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function CashBank() {
  const [filterType, setFilterType] = React.useState("Last 30 Days");
const [customFromDate, setCustomFromDate] = React.useState("");
const [customToDate, setCustomToDate] = React.useState("");
  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content cashbank-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header with Bootstrap Buttons */}
          <div className="cashbank-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-wallet2 text-primary"></i> Cash and Bank
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Manage your financial accounts
              </p>
            </div>

            <div className="top-buttons">
              <button className="btn btn-outline-success btn-sm action-btn">
                <i className="bi bi-plus-circle-fill"></i> Add/Reduce Money
              </button>
              <button className="btn btn-outline-info btn-sm action-btn">
                <i className="bi bi-arrow-left-right"></i> Transfer Money
              </button>
              <button className="btn btn-primary btn-sm action-btn">
                <i className="bi bi-bank"></i> Add New Account
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="cashbank-body">
            {/* Left Panel - Accounts with Bootstrap Cards */}
            <div className="left-panel">

              {/* Total Balance Card */}
              <div className="card border-primary shadow-sm balance-card-enhanced">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">
                        <i className="bi bi-cash-stack"></i> Total Balance
                      </p>
                      <h3 className="mb-0 text-primary fw-bold">₹0.00</h3>
                    </div>
                    <div className="balance-icon">
                      <i className="bi bi-wallet2 text-primary"></i>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="badge bg-success">
                      <i className="bi bi-arrow-up"></i> 0% this month
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Accounts Section */}
              <div className="accounts-section">
                <h6 className="section-title">
                  <i className="bi bi-cash-coin text-success"></i> Cash Accounts
                </h6>

                {/* Cash */}
                <div className="account-item-enhanced">
                  <div className="d-flex align-items-center">
                    <div className="account-icon bg-success">
                      <i className="bi bi-wallet"></i>
                    </div>
                    <div className="ms-3">
                      <p className="mb-0 fw-semibold">Cash</p>
                      <small className="text-muted">Primary Account</small>
                    </div>
                  </div>
                  <span className="badge bg-light text-dark">₹0.00</span>
                </div>

                {/* Cash in hand */}
                <div className="account-item-enhanced">
                  <div className="d-flex align-items-center">
                    <div className="account-icon bg-info">
                      <i className="bi bi-cash"></i>
                    </div>
                    <div className="ms-3">
                      <p className="mb-0 fw-semibold">Cash in hand</p>
                      <small className="text-muted">Secondary Account</small>
                    </div>
                  </div>
                  <span className="badge bg-light text-dark">₹0.00</span>
                </div>
              </div>

              {/* Bank Accounts Section */}
              <div className="accounts-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="section-title mb-0">
                    <i className="bi bi-bank text-warning"></i> Bank Accounts
                  </h6>
                  <button className="btn btn-link btn-sm text-primary p-0">
                    <i className="bi bi-plus-circle"></i> Add New Bank
                  </button>
                </div>

                {/* Unlinked Transactions */}
                <div className="account-item-enhanced bank-item">
                  <div className="d-flex align-items-center">
                    <div className="account-icon bg-warning">
                      <i className="bi bi-link-45deg"></i>
                    </div>
                    <div className="ms-3">
                      <p className="mb-0 fw-semibold">Unlinked Transactions</p>
                      <small className="text-muted">
                        <span className="badge badge-sm bg-warning text-dark">Pending</span>
                      </small>
                    </div>
                  </div>
                  <span className="badge bg-light text-dark">₹0.00</span>
                </div>
              </div>

            </div>

            {/* Right Panel - Transactions with Bootstrap */}
            <div className="right-panel">

              {/* Transactions Header with Nav Pills */}
              <div className="transactions-header-enhanced">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <a className="nav-link active" href="#">
                      <i className="bi bi-receipt"></i> Transactions
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <i className="bi bi-graph-up"></i> Analytics
                    </a>
                  </li>
                </ul>
              </div>

              {/* Filter with Bootstrap Form Controls */}
              <div className="transaction-filter-enhanced">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <FiCalendar />
                  </span>
                  <select className="form-select form-select-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}>
                    <option>Last 30 Days</option>
                    <option>Last Week</option>
                    <option>Last 90 Days</option>
                    <option>This Year</option>
                 {/*   <option>Custom Range</option> */}
                  </select>
                </div>

               <div className="filter-actions d-flex gap-2">
                {/*
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                    <i className="bi bi-funnel"></i>
                    Filter
                  </button>
                  */}
                  <button className="btn btn-sm btn-warning text-white d-flex align-items-center gap-1">
                    <i className="bi bi-download"></i>
                    Export
                  </button>
                </div>
              </div>

              {/* CUSTOM DATE PICKERS SECTION */}
        {filterType === "Custom Range" && (
           <div className="d-flex gap-3 mt-2 flex-wrap">

               <div className="input-group input-group-sm" style={{ maxWidth: "200px" }}>
               <span className="input-group-text bg-white">From</span>
               <input
                   type="date"
                   className="form-control form-control-sm"
                   value={customFromDate}
                   onChange={(e) => setCustomFromDate(e.target.value)}
                   />
               </div>

        <div className="input-group input-group-sm" style={{ maxWidth: "200px" }}>
         <span className="input-group-text bg-white">To</span>
        <input
           type="date"
           className="form-control form-control-sm"
           value={customToDate}
           onChange={(e) => setCustomToDate(e.target.value)}
         />
                </div>

               </div>
        )}

              {/* Enhanced Empty State */}
              <div className="no-transactions-enhanced">
                <div className="empty-state-content">
                  <div className="empty-icon-large">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h4 className="mt-3">No Transactions</h4>
                  <p className="text-muted">You don't have any transaction in selected period</p>
                  <button className="btn btn-primary mt-3">
                    <i className="bi bi-plus-circle"></i> Add Transaction
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CashBank;
