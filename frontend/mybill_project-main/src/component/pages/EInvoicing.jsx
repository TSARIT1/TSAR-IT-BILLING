import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";

export default function EInvoicing() {
  const features = [
    {
      title: "Automatic e-invoice generation",
      icon: (
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 2h10v20H7z" />
          <path d="M9 6h6M9 10h6M9 14h3" />
        </svg>
      )
    },
    {
      title: "Hassle e-way bill generation using IRN",
      icon: (
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 6h18v12H3z" />
          <path d="M7 14l3 3 7-7" />
        </svg>
      )
    },
    {
      title: "Easy GSTR1 reconciliation",
      icon: (
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 20V4h16v16z" />
          <path d="M8 14l2 2 6-6" />
        </svg>
      )
    }
  ];

  return (
    <div className="layout-container">
      <div className="sidebar-area"><Sidebar /></div>
      <div className="navbar-area"><Navbar /></div>

      <div className="content-area">
        <div className="header-row" style={{marginTop:"3%"}} >
          <h2>e-Invoicing</h2>
          <button className="what-btn">What is e-Invoicing</button>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon-box">{f.icon}</div>
              <p>{f.title}</p>
            </div>
          ))}
        </div>

        <div className="bottom-text">
          Try India's easiest and fastest e-invoicing solution today
          <br />
          <button className="start-btn">Start Generating e-Invoices</button>
        </div>
      </div>
    </div>
  );
}
