import React from "react";
import {
  BsFileEarmarkText,
  BsStar,
  BsReceipt,
  BsFileText,
  BsBox,
  BsPeopleFill,
  BsXCircle
} from "react-icons/bs";
import "../dashboard.css";
import "../reports.css";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

export default function Reports() {
  const filters = [
    "Party",
    "Category",
    "Payment Collection",
    "Item",
    "Invoice Details",
    "Summary",
  ];

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content">
          {/* Modern Page Header */}
          <div className="reports-page-header">
            <div className="reports-header-content">
              <div className="reports-title-section">
                <h2 className="reports-page-title">
                  <BsFileEarmarkText className="reports-title-icon" /> Reports
                </h2>
                <p className="reports-page-subtitle">View and analyze business reports</p>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="reports-filter-chips">
            {filters.map((filter) => (
              <div className="reports-filter-chip" key={filter}>
                {filter}
                <BsXCircle className="reports-chip-close-icon" />
              </div>
            ))}
          </div>

          {/* Report Grid */}
          <div className="reports-grid">
            {/* Favourite Reports */}
            <div className="reports-section">
              <div className="reports-section-header">
                <BsStar className="reports-section-icon" />
                <span>Favourite</span>
              </div>
              <div className="reports-section-content">
                <p className="reports-no-report">No Reports Found</p>
              </div>
            </div>

            {/* GST Reports */}
            <div className="reports-section">
              <div className="reports-section-header">
                <BsReceipt className="reports-section-icon" />
                <span>GST</span>
              </div>
              <div className="reports-section-content">
                <p className="reports-no-report">No Reports Found</p>
              </div>
            </div>

            {/* Transaction Reports */}
            <div className="reports-section">
              <div className="reports-section-header">
                <BsFileText className="reports-section-icon" />
                <span>Transaction</span>
              </div>
              <div className="reports-section-content">
                <p className="reports-no-report">No Reports Found</p>
              </div>
            </div>

            {/* Item Reports */}
            <div className="reports-section">
              <div className="reports-section-header">
                <BsBox className="reports-section-icon" />
                <span>Item</span>
              </div>
              <div className="reports-section-content">
                <ul className="reports-list">
                  <li className="reports-list-item">Item Report By Party</li>
                </ul>
              </div>
            </div>

            {/* Party Reports */}
            <div className="reports-section reports-section-wide">
              <div className="reports-section-header">
                <BsPeopleFill className="reports-section-icon" />
                <span>Party</span>
              </div>
              <div className="reports-section-content">
                <ul className="reports-list">
                  <li className="reports-list-item">Receivable Ageing Report</li>
                  <li className="reports-list-item">Party Report By Item</li>
                  <li className="reports-list-item">Party Statement (Ledger)</li>
                  <li className="reports-list-item">Party Wise Outstanding</li>
                  <li className="reports-list-item">Sales Summary - Category Wise</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
