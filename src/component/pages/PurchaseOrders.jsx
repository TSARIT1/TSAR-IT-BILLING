import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../purchsed.css";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [statusFilter, setStatusFilter] = useState("Show Open Orders");
  const orders = [];

  return (
    <>
      <Navbar />
      <div className="po-layout">
        <Sidebar />
        <main className="po-main">
          <div className="po-wrap">
            <div className="po-header" style={{marginTop:"3%"}}>
              <h2>Purchase Orders</h2>
              <div className="po-actions">
                <div className="po-search">
                  <svg className="po-search-icon" width="16" height="16" viewBox="0 0 24 24"><path fill="#6b7280" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                  <input
                    placeholder="Search purchase orders"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="po-filter">
                  <select value={dateFilter} onChange={(e)=>setDateFilter(e.target.value)}>
                    <option>Last 365 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                  </select>
                </div>

                <div className="po-filter">
                  <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                    <option>Show Open Orders</option>
                    <option>Show All</option>
                    <option>Show Closed</option>
                  </select>
                </div>

                <button className="po-create" onClick={() => navigate("/purchase-orders/create")}>
                  Create Purchase Order
                </button>
              </div>
            </div>

            <div className="po-table-wrap">
              <table className="po-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Purchase Order Number</th>
                    <th>Party Name</th>
                    <th>Valid Till</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
              </table>

              {orders.length === 0 && (
                <div className="po-empty">
                  <img src={"/mnt/data/create Purchase Order.PNG"} alt="empty" />
                  <p>No Transactions Matching the current filter</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
