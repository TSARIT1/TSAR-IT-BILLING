import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";
import { FaCalendarCheck, FaMoneyCheckAlt, FaBell } from "react-icons/fa";

function StaffAttendance() {
  return (
    <div className="staff-wrapper">
      <Navbar />
      <Sidebar />
      <div className="staff-content">
        <h2 className="page-title">Staff Attendance & Payroll</h2>

        <div className="features-row">
          <div className="feature-box">
            <div className="icon-wrap">
              <FaCalendarCheck className="feature-icon" />
            </div>
            <p className="feature-text">Mark your staff's attendance digitally</p>
          </div>

          <div className="feature-box">
            <div className="icon-wrap">
              <FaMoneyCheckAlt className="feature-icon" />
            </div>
            <p className="feature-text">
              Simplify payroll by adding salary, advance & pending payments
            </p>
          </div>

          <div className="feature-box">
            <div className="icon-wrap">
              <FaBell className="feature-icon" />
            </div>
            <p className="feature-text">
              Set custom reminders to mark attendance timely
            </p>
          </div>
        </div>

        <h3 className="middle-title">Mark attendance and manage payroll</h3>
        <p className="middle-sub">Add staff to mark attendance and manage payroll with ease!</p>

        <button className="add-staff-btn">+ Add Staff</button>
      </div>
    </div>
  );
}

export default StaffAttendance;
