import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  BsSpeedometer2, 
  BsPeopleFill, 
  BsBoxSeam, 
  BsReceipt, 
  BsCartCheckFill, 
  BsBarChartLineFill, 
  BsBank2, 
  BsFileEarmarkSpreadsheetFill, 
  BsWalletFill, 
  BsShop, 
  BsPersonBadgeFill, 
  BsCartFill, 
  BsChatDotsFill, 
  BsCashCoin, 
  BsGearFill, 
  BsBoxArrowRight,
  BsChevronDown,
  BsChevronRight,
  BsPlusLg,
  BsShieldCheck,
  BsLightningChargeFill,
  BsKanban,
  BsGearWideConnected,
  BsBriefcaseFill,
  BsShieldLockFill,
  BsTicketDetailedFill,
  BsAndroid2,
  BsStars
} from "react-icons/bs";
import tsarItLogo from "../asstes/tsar_it_logo.jpg";

export default function Sidebar({ isOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [openItems, setOpenItems] = useState(
    location.pathname === "/inventory" || location.pathname === "/godown"
  );
  const [openSales, setOpenSales] = useState(
    location.pathname.includes("sale") || 
    location.pathname.includes("quotation") || 
    location.pathname.includes("credit-note") || 
    location.pathname.includes("delivery-challan") || 
    location.pathname.includes("proforma") ||
    location.pathname.includes("payment-in")
  );
  const [openPurchases, setOpenPurchases] = useState(
    location.pathname.includes("purchase") || 
    location.pathname.includes("debit-note") || 
    location.pathname.includes("payment-out")
  );

  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    storedUser = {};
  }
  const businessName = storedUser.businessName || "TSAR IT Billing";
  const ownerName = storedUser.ownerName || "Administrator";
  const isSuperAdmin = storedUser.role === "SUPER_ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onCloseMobile}></div>}

      <aside className={`portal-sidebar-dark ${isOpen ? "mobile-open" : ""}`}>
        {/* Sidebar Brand Top */}
        <div className="sidebar-brand-box">
          <Link to="/dashboard" className="sidebar-logo-link d-flex align-items-center gap-2" onClick={onCloseMobile}>
            <div className="sidebar-brand-logo-icon p-1 bg-dark rounded border border-secondary" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={tsarItLogo} alt="TSAR IT BILLING" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-title text-white fw-bold" style={{ fontSize: '0.95rem', letterSpacing: '0.02em' }}>TSAR IT BILLING</span>
            </div>
          </Link>
        </div>

        {/* Business Card Pill */}
        <div className="sidebar-business-card">
          <div className="business-avatar">{businessName.charAt(0).toUpperCase()}</div>
          <div className="business-info">
            <h5 className="business-title" title={businessName}>{businessName}</h5>
            <p className="business-status">
              <span className="status-dot"></span>
              <span className="status-text">Active Enterprise</span>
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="sidebar-action-box">
          <Link to="/create-invoice" className="btn-sidebar-create" onClick={onCloseMobile}>
            <BsPlusLg className="create-icon" />
            <span>Create Sales Bill</span>
            <span className="shortcut-tag">+</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-menu-scroll">
          {/* GENERAL */}
          <div className="menu-group">
            <span className="group-label">GENERAL</span>
            <ul className="group-list">
              <li className={isActive("/dashboard") ? "active" : ""}>
                <Link to="/dashboard" onClick={onCloseMobile}>
                  <BsSpeedometer2 className="menu-icon" />
                  <span className="menu-text">Dashboard</span>
                </Link>
              </li>
              <li className={isActive("/parties") ? "active" : ""}>
                <Link to="/parties" onClick={onCloseMobile}>
                  <BsPeopleFill className="menu-icon" />
                  <span className="menu-text">Parties & Customers</span>
                </Link>
              </li>

              {/* Items Accordion */}
              <li className={`has-submenu ${openItems ? "open" : ""}`}>
                <button className="submenu-trigger" onClick={() => setOpenItems(!openItems)}>
                  <div className="trigger-left">
                    <BsBoxSeam className="menu-icon" />
                    <span className="menu-text">Items & Inventory</span>
                  </div>
                  {openItems ? <BsChevronDown className="arrow" /> : <BsChevronRight className="arrow" />}
                </button>
                {openItems && (
                  <ul className="submenu-list">
                    <li className={isActive("/inventory") ? "active" : ""}>
                      <Link to="/inventory" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Inventory Stock
                      </Link>
                    </li>
                    <li className={isActive("/godown") ? "active" : ""}>
                      <Link to="/godown" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Godown (Warehouses)
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          {/* SALES */}
          <div className="menu-group">
            <span className="group-label">SALES & BILLING</span>
            <ul className="group-list">
              <li className={`has-submenu ${openSales ? "open" : ""}`}>
                <button className="submenu-trigger" onClick={() => setOpenSales(!openSales)}>
                  <div className="trigger-left">
                    <BsReceipt className="menu-icon" />
                    <span className="menu-text">Sales Management</span>
                  </div>
                  {openSales ? <BsChevronDown className="arrow" /> : <BsChevronRight className="arrow" />}
                </button>
                {openSales && (
                  <ul className="submenu-list">
                    <li className={isActive("/sales-invoices") ? "active" : ""}>
                      <Link to="/sales-invoices" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Sales Invoices
                      </Link>
                    </li>
                    <li className={isActive("/quotation") ? "active" : ""}>
                      <Link to="/quotation" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Quotations / Estimates
                      </Link>
                    </li>
                    <li className={isActive("/payment-in") ? "active" : ""}>
                      <Link to="/payment-in" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Payment In (Receipts)
                      </Link>
                    </li>
                    <li className={isActive("/sales-return") ? "active" : ""}>
                      <Link to="/sales-return" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Sales Return
                      </Link>
                    </li>
                    <li className={isActive("/credit-note") ? "active" : ""}>
                      <Link to="/credit-note" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Credit Note
                      </Link>
                    </li>
                    <li className={isActive("/delivery-challan") ? "active" : ""}>
                      <Link to="/delivery-challan" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Delivery Challan
                      </Link>
                    </li>
                    <li className={isActive("/proforma-invoice") ? "active" : ""}>
                      <Link to="/proforma-invoice" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Proforma Invoice
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          {/* PURCHASES */}
          <div className="menu-group">
            <span className="group-label">PURCHASES & EXPENSES</span>
            <ul className="group-list">
              <li className={`has-submenu ${openPurchases ? "open" : ""}`}>
                <button className="submenu-trigger" onClick={() => setOpenPurchases(!openPurchases)}>
                  <div className="trigger-left">
                    <BsCartCheckFill className="menu-icon" />
                    <span className="menu-text">Purchases</span>
                  </div>
                  {openPurchases ? <BsChevronDown className="arrow" /> : <BsChevronRight className="arrow" />}
                </button>
                {openPurchases && (
                  <ul className="submenu-list">
                    <li className={isActive("/purchase-invoices") ? "active" : ""}>
                      <Link to="/purchase-invoices" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Purchase Invoices
                      </Link>
                    </li>
                    <li className={isActive("/payment-out") ? "active" : ""}>
                      <Link to="/payment-out" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Payment Out (Disbursements)
                      </Link>
                    </li>
                    <li className={isActive("/purchase-return") ? "active" : ""}>
                      <Link to="/purchase-return" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Purchase Return
                      </Link>
                    </li>
                    <li className={isActive("/debit-note") ? "active" : ""}>
                      <Link to="/debit-note" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Debit Note
                      </Link>
                    </li>
                    <li className={isActive("/purchase-orders") ? "active" : ""}>
                      <Link to="/purchase-orders" onClick={onCloseMobile}>
                        <span className="sub-dot"></span> Purchase Orders
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className={isActive("/expenses") ? "active" : ""}>
                <Link to="/expenses" onClick={onCloseMobile}>
                  <BsWalletFill className="menu-icon" />
                  <span className="menu-text">Expenses & Bills</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ACCOUNTING & POS */}
          <div className="menu-group">
            <span className="group-label">ACCOUNTING & POS</span>
            <ul className="group-list">
              <li className={isActive("/pos-billing") ? "active" : ""}>
                <Link to="/pos-billing" onClick={onCloseMobile} className="highlight-menu-link">
                  <BsShop className="menu-icon text-warning" />
                  <span className="menu-text">POS Billing Counter</span>
                  <span className="badge bg-warning text-dark ms-auto py-0 px-2 fw-bold" style={{ fontSize: '9px' }}>FAST</span>
                </Link>
              </li>
              <li className={isActive("/cash/bank") ? "active" : ""}>
                <Link to="/cash/bank" onClick={onCloseMobile}>
                  <BsBank2 className="menu-icon" />
                  <span className="menu-text">Cash & Bank Accounts</span>
                </Link>
              </li>
              <li className={isActive("/e-invoicing") ? "active" : ""}>
                <Link to="/e-invoicing" onClick={onCloseMobile}>
                  <BsFileEarmarkSpreadsheetFill className="menu-icon" />
                  <span className="menu-text">E-Invoicing & E-Way</span>
                  <span className="badge bg-primary-subtle text-primary ms-auto py-0 px-2" style={{ fontSize: '9px' }}>GST</span>
                </Link>
              </li>
              <li className={isActive("/reports") ? "active" : ""}>
                <Link to="/reports" onClick={onCloseMobile}>
                  <BsBarChartLineFill className="menu-icon" />
                  <span className="menu-text">Double-Entry Reports</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* BUSINESS TOOLS */}
          <div className="menu-group">
            <span className="group-label">BUSINESS SUITE</span>
            <ul className="group-list">
              <li className={isActive("/crm") ? "active" : ""}>
                <Link to="/crm" onClick={onCloseMobile}>
                  <BsKanban className="menu-icon" />
                  <span className="menu-text">CRM & Pipeline</span>
                </Link>
              </li>
              <li className={isActive("/manufacturing") ? "active" : ""}>
                <Link to="/manufacturing" onClick={onCloseMobile}>
                  <BsGearWideConnected className="menu-icon" />
                  <span className="menu-text">Manufacturing (BOM)</span>
                </Link>
              </li>
              <li className={isActive("/procurement") ? "active" : ""}>
                <Link to="/procurement" onClick={onCloseMobile}>
                  <BsBriefcaseFill className="menu-icon" />
                  <span className="menu-text">Procurement & RFQ</span>
                </Link>
              </li>
              <li className={isActive("/compliance") ? "active" : ""}>
                <Link to="/compliance" onClick={onCloseMobile}>
                  <BsShieldCheck className="menu-icon" />
                  <span className="menu-text">Statutory Compliance</span>
                </Link>
              </li>
              {isSuperAdmin && (
                <li className={isActive("/super-admin") ? "active" : ""}>
                  <Link to="/super-admin" onClick={onCloseMobile}>
                    <BsShieldLockFill className="menu-icon text-danger" />
                    <span className="menu-text text-danger fw-bold">Super Admin Panel</span>
                  </Link>
                </li>
              )}
              <li className={isActive("/support-tickets") ? "active" : ""}>
                <Link to="/support-tickets" onClick={onCloseMobile}>
                  <BsTicketDetailedFill className="menu-icon" />
                  <span className="menu-text">Support Tickets</span>
                </Link>
              </li>
              <li className={isActive("/staff-attendance") ? "active" : ""}>
                <Link to="/staff-attendance" onClick={onCloseMobile}>
                  <BsPersonBadgeFill className="menu-icon" />
                  <span className="menu-text">Staff & Payroll</span>
                </Link>
              </li>
              <li className={isActive("/online-orders") ? "active" : ""}>
                <Link to="/online-orders" onClick={onCloseMobile}>
                  <BsCartFill className="menu-icon" />
                  <span className="menu-text">Online Store Orders</span>
                </Link>
              </li>
              <li className={isActive("/download-app") ? "active" : ""}>
                <Link to="/download-app" onClick={onCloseMobile}>
                  <BsAndroid2 className="menu-icon text-success" />
                  <span className="menu-text text-success fw-bold">Download Mobile App</span>
                </Link>
              </li>
              <li className={isActive("/subscription") ? "active" : ""}>
                <Link to="/subscription" onClick={onCloseMobile}>
                  <BsStars className="menu-icon text-warning" />
                  <span className="menu-text text-warning fw-bold">Subscription & Plans</span>
                </Link>
              </li>
              <li className={isActive("/sms-marketing") ? "active" : ""}>
                <Link to="/sms-marketing" onClick={onCloseMobile}>
                  <BsChatDotsFill className="menu-icon" />
                  <span className="menu-text">SMS Promotions</span>
                </Link>
              </li>
              <li className={isActive("/apply-loan") ? "active" : ""}>
                <Link to="/apply-loan" onClick={onCloseMobile}>
                  <BsCashCoin className="menu-icon" />
                  <span className="menu-text">Instant MSME Loan</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-user-footer">
          <div className="user-details">
            <div className="user-avatar">{ownerName.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <div className="user-name" title={ownerName}>{ownerName}</div>
              <div className="user-role">
                <BsShieldCheck className="role-icon" /> Administrator
              </div>
            </div>
          </div>
          <div className="user-quick-actions">
            <Link to="/business-settings" title="Business Settings" className="btn-footer-icon" onClick={onCloseMobile}>
              <BsGearFill />
            </Link>
            <button onClick={handleLogout} title="Sign Out" className="btn-footer-icon btn-logout-icon">
              <BsBoxArrowRight />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
