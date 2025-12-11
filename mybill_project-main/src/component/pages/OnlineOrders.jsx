import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";
import { FaSearch, FaStore } from "react-icons/fa";

function OnlineOrders() {
  return (
    <div className="orders-wrapper">
      <Navbar />
      <Sidebar />

      <div className="orders-content">
        <h2 className="orders-title">Online Orders</h2>

        <div className="banner-box">
          <div className="banner-text">
            <p>Increase your sales, get <span className="highlight">Online Orders</span> with a single click</p>
            <button className="create-store-btn">Create Online Store</button>
          </div>
          <div className="banner-img"></div>
        </div>

        <div className="filter-row">
          <div className="search-box">
            <FaSearch className="search-icon" />
          </div>

          <select className="filter-select">
            <option>Last 365 Days</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Today</option>
          </select>
        </div>

        <div className="orders-table">
          <div className="table-header">
            <p>Date</p>
            <p>Quotation Number</p>
            <p>Party Name</p>
            <p>Amount</p>
            <p>Status</p>
            <p>Mode of Payment</p>
          </div>

          <div className="no-data-box">
            <FaStore className="no-data-icon" />
            <p>No Transactions Matching the current filter</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OnlineOrders;
