import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./dashboard.css";

function Sidebar() {
  const location = useLocation();

  const [openItems, setOpenItems] = useState(false);
  const [openSales, setOpenSales] = useState(false);
  const [openPurchases, setOpenPurchases] = useState(false);

  return (
    <aside className="sidebar">
      <div className="business-profile">
        <div className="profile-circle">B</div>
        <h4>Business Name</h4>
        <p>8595107083</p>
      </div>

      <Link to="/create-invoice">
        <button className="create-invoice-btn">+ Create Sales Invoice</button>
      </Link>

      <div className="menu-section">
        <p className="menu-title">GENERAL</p>
        <ul>
          <li className={location.pathname === "/dashboard" ? "active" : ""}>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className={location.pathname === "/parties" ? "active" : ""}>
            <Link to="/parties">Parties</Link>
          </li>
          <li
            className="dropdown-parent"
            onClick={() => setOpenItems(!openItems)}
          >
            <span>Items ▾</span>
          </li>
          {openItems && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/inventory">Inventory</Link>
              </li>
              <li>
                <Link to="/godown">Godown (Warehouse)</Link>
              </li>
            </ul>
          )}
          <li
            className="dropdown-parent"
            onClick={() => setOpenSales(!openSales)}
          >
            <span>Sales ▾</span>
          </li>
          {openSales && (
            <ul className="dropdown-menu">
              <li><Link to="/sales-invoices">Sales Invoices</Link></li>
              <li><Link to="/quotation">Quotation / Estimate</Link></li>
              <li><Link to="/payment-in">Payment In</Link></li>
              <li><Link to="/sales-return">Sales Return</Link></li>
              <li><Link to="/credit-note">Credit Note</Link></li>
              <li><Link to="/delivery-challan">Delivery Challan</Link></li>
              <li><Link to="/proforma-invoice">Proforma Invoice</Link></li>
            </ul>
          )}
          <li
            className="dropdown-parent"
            onClick={() => setOpenPurchases(!openPurchases)}
          >
            <span>Purchases ▾</span>
          </li>
          {openPurchases && (
            <ul className="dropdown-menu">
              <li><Link to="/purchase-invoices">Purchase Invoices</Link></li>
              <li><Link to="/payment-out">Payment Out</Link></li>
              <li><Link to="/purchase-return">Purchase Return</Link></li>
              <li><Link to="/debit-note">Debit Note</Link></li>
              <li><Link to="/purchase-orders">Purchase Orders</Link></li>
            </ul>
          )}

          <li className={location.pathname === "/reports" ? "active" : ""}>
            <Link to="/reports">Reports</Link>
          </li>
        </ul>
      </div>

     
     <div className="menu-section">
            <p className="menu-title">ACCOUNTING SOLUTIONS</p>

            <ul>
              <li>
                <Link to="/cash/bank">Cash & Bank</Link>
              </li>
              <li>
                <Link to="/e-invoicing">E-Invoicing</Link>
              </li>
              <li>
                <Link to="/automated-bills">Automated Bills</Link>
              </li>
              <li>
                <Link to="/expenses">Expenses</Link>
              </li>
              <li>
                <Link to="/pos-billing">POS Billing</Link>
              </li>
            </ul>
      </div>

    
      <div className="menu-section">
          <p className="menu-title">BUSINESS TOOLS</p>
          <ul>
            <li>
              <Link to="/staff-attendance">
                <i className="fa-solid fa-user-check icon"></i> Staff Attendance & Payroll
              </Link>
            </li>

            <li>
              <Link to="/online-orders">
                <i className="fa-solid fa-cart-shopping icon"></i> Online Orders
              </Link>
            </li>

            <li>
              <Link to="/sms-marketing">
                <i className="fa-solid fa-comment-sms icon"></i> SMS Marketing
              </Link>
            </li>

            <li>
              <Link to="/apply-loan">
                <i className="fa-solid fa-file-invoice-dollar icon"></i> Apply For Loan
              </Link>
            </li>
          </ul>
        </div>
        <div className="menu-section settings-section">
          <ul>
            <li>
              <Link to="/settings">
                <i className="fa-solid fa-gear icon" style={{color:"white"}}></i> Settings
              </Link>
            </li>
        </ul>
      </div>

    </aside>
  );
}

export default Sidebar;
