import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../manageusers.css";

export default function ManageUsers() {
  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
    <div className="manage-container">
      <h2 className="page-title">Manage Users</h2>

      <div className="stats-box">
        <div className="stat">
          <p className="stat-label">Number of Users</p>
          <p className="stat-value">1</p>
        </div>
        <div className="stat">
          <p className="stat-label">Activities Performed (Last 30 Days)</p>
          <p className="stat-value">0</p>
        </div>
      </div>

      <div className="roles-section">
        <h3>User Roles</h3>
        <ul className="roles-list">
          <li>👑 Admin <span className="role-note">(Full Vision)</span></li>
          <li>🤝 Partner</li>
          <li>📄 CA</li>
          <li>🧑‍💼 Salesman</li>
          <li>📦 Stock Manager</li>
          <li>🚚 Delivery Boy</li>
        </ul>
      </div>

      <div className="features-section">
        <h3>Features</h3>
        <ul className="features-list">
          <li>📘 Staffwise Daybook Report</li>
          <li>📊 Activity Tracker</li>
        </ul>
      </div>

      <div className="info-box">
        <p>Give access to users and monitor their actions.</p>
        <p>Manage your business more efficiently with full control and vision.</p>
      </div>

      <div className="action-buttons">
        <button className="add-user-btn">+ Add New User</button>
        <button className="add-ca-btn">+ Add Your CA</button>
      </div>
    </div>
    </div>
    </div>
    </>
  );

}
