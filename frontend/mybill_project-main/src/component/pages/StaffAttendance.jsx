import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../staffAttendance.css";
import { FiUsers, FiCalendar, FiDollarSign, FiClock } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function StaffAttendance() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content staff-attendance-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="staff-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-people-fill"></i> Staff Attendance & Payroll
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Manage staff attendance and payroll efficiently
              </p>
            </div>

            <div className="header-actions">
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-file-earmark-bar-graph"></i> Reports
              </button>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-person-plus"></i> Add Staff
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="staff-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="card-content">
                <h4>Total Staff</h4>
                <p className="amount">0</p>
                <span className="subtitle">Active Employees</span>
              </div>
            </div>

            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="card-content">
                <h4>Present Today</h4>
                <p className="amount">0</p>
                <span className="subtitle">0% Attendance</span>
              </div>
            </div>

            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="card-content">
                <h4>Total Payroll</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">This Month</span>
              </div>
            </div>

            <div className="summary-card red">
              <div className="card-icon">
                <i className="bi bi-exclamation-circle"></i>
              </div>
              <div className="card-content">
                <h4>Pending Payments</h4>
                <p className="amount">₹ 0.00</p>
                <span className="subtitle">0 Staff</span>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="month-selector-card">
            <div className="selector-content">
              <label>
                <i className="bi bi-calendar-month"></i> Select Month
              </label>
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <button className="btn btn-outline-success btn-sm">
              <i className="bi bi-download"></i> Export Attendance
            </button>
          </div>

          {/* Feature Cards */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper blue">
                <i className="bi bi-calendar-check"></i>
              </div>
              <h3>Digital Attendance</h3>
              <p>Mark your staff's attendance digitally with ease and accuracy</p>
              <ul className="feature-list">
                <li><i className="bi bi-check2"></i> Daily attendance tracking</li>
                <li><i className="bi bi-check2"></i> Automatic calculations</li>
                <li><i className="bi bi-check2"></i> Attendance history</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper orange">
                <i className="bi bi-cash-coin"></i>
              </div>
              <h3>Payroll Management</h3>
              <p>Simplify payroll by adding salary, advance & pending payments</p>
              <ul className="feature-list">
                <li><i className="bi bi-check2"></i> Salary calculations</li>
                <li><i className="bi bi-check2"></i> Advance payments</li>
                <li><i className="bi bi-check2"></i> Payment tracking</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper green">
                <i className="bi bi-bell"></i>
              </div>
              <h3>Smart Reminders</h3>
              <p>Set custom reminders to mark attendance timely and never miss</p>
              <ul className="feature-list">
                <li><i className="bi bi-check2"></i> Custom notifications</li>
                <li><i className="bi bi-check2"></i> Daily reminders</li>
                <li><i className="bi bi-check2"></i> Email alerts</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <div className="cta-content">
              <div className="cta-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="cta-text">
                <h3>Mark attendance and manage payroll</h3>
                <p>Add staff to mark attendance and manage payroll with ease!</p>
              </div>
            </div>
            <button className="btn btn-lg btn-primary cta-button">
              <i className="bi bi-person-plus-fill"></i> Add Your First Staff Member
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default StaffAttendance;
