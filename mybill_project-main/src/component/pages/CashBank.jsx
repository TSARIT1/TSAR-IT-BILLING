import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";
import { FiCalendar } from "react-icons/fi";

function CashBank() {
  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content cashbank-page">

          {/* TITLE BAR */}
          <div className="cashbank-header"style={{marginTop:"4%"}}>
            <h2>Cash and Bank</h2>

            <div className="top-buttons">
              <button className="white-btn">+ Add/Reduce Money</button>
              <button className="white-btn">⇄ Transfer Money</button>
              <button className="purple-btn">+ Add New Account</button>
            </div>
          </div>

          <div className="cashbank-body">
            <div className="left-panel">

              <div className="balance-card">
                <p>Total Balance:</p>
                <h3>₹0</h3>
              </div>

              <div className="cash-card">
                <p>Cash</p>
                <span>₹0</span>
              </div>

              <div className="cash-card">
                <p>Cash in hand</p>
                <span>₹0</span>
              </div>

              <div className="bankaccount-header">
                <p>Bank Accounts</p>
                <button className="add-bank-btn">+ Add New Bank</button>
              </div>

              <div className="bank-item">
                <i className="icon">🏦</i>
                <p>Unlinked Transactions</p>
                <span>₹0</span>
              </div>

            </div>
            <div className="right-panel">

              <div className="tab-header">
                <button className="active-tab">Transactions</button>
              </div>

              <div className="transaction-filter">
                <FiCalendar className="filter-icon" />
                <select>
                  <option>Last Week</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>

              <div className="no-transaction-box">
                <img src="/mnt/data/cashbank.PNG" alt="icon" className="empty-icon" />
                <h4>No Transactions</h4>
                <p>You don't have any transaction in selected period</p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CashBank;
