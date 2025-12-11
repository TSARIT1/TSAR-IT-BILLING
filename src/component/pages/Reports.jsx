import React from "react";

import "../purchsed.css";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
export default function Reports() {
  return (
    <>
      <Navbar />
      <div className="reports-layout">
        <Sidebar />

        <div className="reports-container">
          <h1 className="reports-title">Reports</h1>
          <div className="report-filters">
            {[
              "Party",
              "Category",
              "Payment Collection",
              "Item",
              "Invoice Details",
              "Summary",
            ].map((filter) => (
              <div className="filter-chip" key={filter}>
                {filter}
                <span className="close-icon">×</span>
              </div>
            ))}
          </div>
          <div className="report-grid">
            <div className="report-section">
              <div className="section-header">
                <i className="fa-regular fa-star section-icon"></i>
                Favourite
              </div>
              <p className="no-report">No Reports Found</p>
            </div>
            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-receipt section-icon"></i>
                GST
              </div>
              <p className="no-report">No Reports Found</p>
            </div>
            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-file-lines section-icon"></i>
                Transaction
              </div>
              <p className="no-report">No Reports Found</p>
            </div>

            <div className="report-section">
              <div className="section-header">
                <i className="fa-solid fa-box section-icon"></i>
                Item
              </div>
              <ul className="report-list">
                <li>Item Report By Party</li>
              </ul>
            </div>
            <div className="report-section wide">
              <div className="section-header">
                <i className="fa-solid fa-user section-icon"></i>
                Party
              </div>
              <ul className="report-list">
                <li>Receivable Ageing Report</li>
                <li>Party Report By Item</li>
                <li>Party Statement (Ledger)</li>
                <li>Party Wise Outstanding</li>
                <li>Sales Summary - Category Wise</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
