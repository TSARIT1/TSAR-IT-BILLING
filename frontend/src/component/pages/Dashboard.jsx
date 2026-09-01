import React from "react";
import { Link } from "react-router-dom";
import { 
  BsReceiptCutoff, 
  BsShop, 
  BsBoxSeam, 
  BsPeopleFill, 
  BsPlusCircleFill, 
  BsLightningChargeFill,
  BsBuildings,
  BsBarChartLineFill
} from "react-icons/bs";
import PortalLayout from "../PortalLayout";
import Cards from "../Cards";
import Transactions from "../Transactions";
import Checklist from "../Checklist";

export default function Dashboard() {
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    storedUser = {};
  }
  const businessName = storedUser.businessName || "TSAR IT Solutions";
  const ownerName = storedUser.ownerName || "Administrator";
  const companyLogo = localStorage.getItem("companyLogo") || "";

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PortalLayout title="Executive Dashboard">
      {/* 1. Welcome Banner */}
      <div className="dashboard-welcome-banner animate-fade-in d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="banner-text-block d-flex align-items-center gap-3">
          {companyLogo ? (
            <div className="bg-white p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
              <img src={companyLogo} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div className="bg-white bg-opacity-25 p-3 rounded-3 text-white fs-3 d-flex align-items-center justify-content-center">
              🏢
            </div>
          )}
          <div>
            <h2 className="banner-title mb-1">Welcome back, {ownerName}! 👋</h2>
            <p className="banner-subtitle mb-0">
              Here's what's happening with <strong>{businessName}</strong> today ({todayStr}).
            </p>
          </div>
        </div>

        <div className="banner-cta-group">
          <Link to="/create-invoice" className="btn-saas-primary">
            <BsPlusCircleFill /> Create Sales Bill
          </Link>
          <Link to="/pos-billing" className="btn btn-light text-dark fw-bold px-3 py-2 rounded-3 shadow-sm d-inline-flex align-items-center gap-2">
            <BsShop className="text-primary" /> POS Counter
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Stat Cards */}
      <div className="animate-fade-in">
        <Cards />
      </div>

      {/* 3. Launchpad Quick Actions Grid */}
      <div className="launchpad-grid animate-fade-in">
        <Link to="/create-invoice" className="launchpad-tile">
          <div className="launchpad-icon blue">
            <BsReceiptCutoff />
          </div>
          <div>
            <div className="launchpad-title">New GST Bill</div>
            <div className="launchpad-sub">8-second tax invoice</div>
          </div>
        </Link>

        <Link to="/inventory" className="launchpad-tile">
          <div className="launchpad-icon green">
            <BsBoxSeam />
          </div>
          <div>
            <div className="launchpad-title">Inventory Stock</div>
            <div className="launchpad-sub">Track batches & barcodes</div>
          </div>
        </Link>

        <Link to="/godown" className="launchpad-tile">
          <div className="launchpad-icon purple">
            <BsBuildings />
          </div>
          <div>
            <div className="launchpad-title">Godown Hub</div>
            <div className="launchpad-sub">Inter-warehouse transfer</div>
          </div>
        </Link>

        <Link to="/staff-attendance" className="launchpad-tile">
          <div className="launchpad-icon orange">
            <BsPeopleFill />
          </div>
          <div>
            <div className="launchpad-title">Staff & Payroll</div>
            <div className="launchpad-sub">Mark shifts & calculate salary</div>
          </div>
        </Link>
      </div>

      {/* 4. Lower Two-Column Grid: Transactions + Checklist */}
      <div className="dashboard-lower-grid animate-fade-in">
        <Transactions />
        <Checklist />
      </div>
    </PortalLayout>
  );
}
