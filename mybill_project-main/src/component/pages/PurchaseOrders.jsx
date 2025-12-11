import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsCart3,
  BsCashStack,
  BsCalendar3,
  BsPeopleFill,
  BsPlus,
  BsInboxFill,
  BsDownload,
  BsCheckCircleFill,
  BsXCircleFill
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../purchaseOrders.css";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchaseOrders")) || [];
    setOrders(stored);
  }, []);

  // Calculate statistics
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const openOrders = orders.filter(o => o.status === "Open" || o.status === "Pending").length;
  const closedOrders = orders.filter(o => o.status === "Closed" || o.status === "Completed").length;

  // Export to CSV
  const handleExportReport = () => {
    if (orders.length === 0) {
      alert("No purchase orders to export");
      return;
    }

    const headers = ["Date", "Order Number", "Party Name", "Valid Till", "Amount", "Status"];
    const csvData = orders.map(o => [
      o.date,
      `PO-${o.number}`,
      o.partyName,
      o.validTill || "-",
      o.amount,
      o.status
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <div className="purchase-orders-page-header">
            <div className="purchase-orders-header-content">
              <div className="purchase-orders-title-section">
                <h2 className="purchase-orders-page-title">
                  <BsCart3 className="purchase-orders-title-icon" /> Purchase Orders
                </h2>
                <p className="purchase-orders-page-subtitle">Manage purchase orders to suppliers</p>
              </div>
              <div className="purchase-orders-header-actions">
                <button className="purchase-orders-report-btn" onClick={handleExportReport}>
                  <BsDownload /> Export Report
                </button>
                <button
                  className="purchase-orders-create-btn"
                  onClick={() => navigate("/purchase-orders/create")}
                >
                  <BsPlus /> Create Purchase Order
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="purchase-orders-summary-row">
            <div className="purchase-orders-summary-card total-orders">
              <div className="purchase-orders-card-icon-wrapper total-orders-icon">
                <BsCart3 className="purchase-orders-card-icon" />
              </div>
              <div className="purchase-orders-card-content">
                <h4>Total Orders</h4>
                <p>{totalOrders}</p>
              </div>
            </div>

            <div className="purchase-orders-summary-card total-amount">
              <div className="purchase-orders-card-icon-wrapper total-amount-icon">
                <BsCashStack className="purchase-orders-card-icon" />
              </div>
              <div className="purchase-orders-card-content">
                <h4>Total Amount</h4>
                <p>₹ {totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="purchase-orders-summary-card open-orders">
              <div className="purchase-orders-card-icon-wrapper open-orders-icon">
                <BsXCircleFill className="purchase-orders-card-icon" />
              </div>
              <div className="purchase-orders-card-content">
                <h4>Open</h4>
                <p>{openOrders}</p>
              </div>
            </div>

            <div className="purchase-orders-summary-card closed-orders">
              <div className="purchase-orders-card-icon-wrapper closed-orders-icon">
                <BsCheckCircleFill className="purchase-orders-card-icon" />
              </div>
              <div className="purchase-orders-card-content">
                <h4>Closed</h4>
                <p>{closedOrders}</p>
              </div>
            </div>
          </div>

          {/* Purchase Orders Table */}
          <div className="purchase-orders-table-container">
            {orders.length === 0 ? (
              <div className="purchase-orders-empty-state">
                <BsInboxFill className="purchase-orders-empty-icon" />
                <h3>No Purchase Orders Found</h3>
                <p>Start creating purchase orders to suppliers</p>
                <button
                  className="purchase-orders-empty-add-btn"
                  onClick={() => navigate("/purchase-orders/create")}
                >
                  <BsPlus /> Create Your First Purchase Order
                </button>
              </div>
            ) : (
              <table className="purchase-orders-table">
                <thead>
                  <tr>
                    <th><BsCalendar3 /> Date</th>
                    <th>Order Number</th>
                    <th><BsPeopleFill /> Party Name</th>
                    <th>Valid Till</th>
                    <th><BsCashStack /> Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((o, i) => (
                    <tr key={i}>
                      <td>{o.date}</td>
                      <td className="order-number-cell">PO-{o.number}</td>
                      <td className="party-name-cell">
                        <BsPeopleFill className="party-icon" /> {o.partyName}
                      </td>
                      <td>{o.validTill || "-"}</td>
                      <td className="amount-cell">₹ {o.amount}</td>
                      <td>
                        <span className={`purchase-orders-status-badge ${(o.status === "Closed" || o.status === "Completed") ? "closed" : "open"}`}>
                          {(o.status === "Closed" || o.status === "Completed") ? <BsCheckCircleFill /> : <BsXCircleFill />}
                          {o.status}
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
