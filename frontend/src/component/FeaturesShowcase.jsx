import React, { useState } from 'react';
import { 
  BsReceiptCutoff, 
  BsBoxSeam, 
  BsShop, 
  BsBuildings, 
  BsPeople, 
  BsFileEarmarkCheck, 
  BsCheckCircleFill, 
  BsArrowRight,
  BsShieldLock,
  BsLightningCharge,
  BsSpeedometer2
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function FeaturesShowcase() {
  const [activeTab, setActiveTab] = useState('invoicing');
  const navigate = useNavigate();

  const tabs = [
    { id: 'invoicing', label: 'GST Invoicing', icon: <BsReceiptCutoff /> },
    { id: 'inventory', label: 'Smart Inventory', icon: <BsBoxSeam /> },
    { id: 'pos', label: 'POS Terminal', icon: <BsShop /> },
    { id: 'godown', label: 'Multi-Warehouse', icon: <BsBuildings /> },
    { id: 'payroll', label: 'Staff & Payroll', icon: <BsPeople /> },
    { id: 'einvoicing', label: 'E-Invoicing & E-Way', icon: <BsFileEarmarkCheck /> },
  ];

  const contentMap = {
    invoicing: {
      badge: 'SPEED & COMPLIANCE',
      title: 'Generate compliant GST Invoices in under 8 seconds',
      description: 'Create professional tax invoices, proforma bills, quotations, and debit/credit notes effortlessly. Send directly to customers via WhatsApp, SMS, or Email.',
      metrics: [
        { value: '8 sec', label: 'Average Bill Creation' },
        { value: '100%', label: 'GST & e-Way Compliant' },
        { value: '3x', label: 'Faster Payment Collections' }
      ],
      points: [
        'Automatic CGST, SGST, and IGST tax splits and HSN lookup',
        'Custom invoice design templates with your brand logo & signature',
        'Built-in automated payment reminders to reduce overdue receivables',
        'Instant multi-currency & multi-tax rate support'
      ],
      ctaText: 'Explore GST Invoicing'
    },
    inventory: {
      badge: 'STOCK AUTOMATION',
      title: 'Real-time stock tracking with low-stock alerts',
      description: 'Never run out of high-demand items. Track product batches, expiry dates, serial numbers, barcodes, and profit margins in real-time across all product lines.',
      metrics: [
        { value: '2.8x', label: 'Faster Stock Rotation' },
        { value: '0%', label: 'Dead Stock Loss' },
        { value: 'Real-time', label: 'Stock Sync' }
      ],
      points: [
        'Automated reorder point warnings before you run out of stock',
        'Barcode scanner integration for lightning-fast inventory lookup',
        'Batch tracking with automated expiry date monitoring',
        'Category-wise stock valuation and gross margin reports'
      ],
      ctaText: 'Manage Inventory'
    },
    pos: {
      badge: 'HIGH SPEED COUNTER',
      title: 'Lightning-fast Point-of-Sale (POS) counter billing',
      description: 'Built for high-volume retail stores, supermarkets, and distributors. Touch-friendly UI, thermal printer support, and quick payment processing.',
      metrics: [
        { value: '0.5s', label: 'Barcode Scan Time' },
        { value: 'Multiple', label: 'Payment Modes' },
        { value: 'Offline', label: 'Resilient Mode' }
      ],
      points: [
        'Seamless support for thermal receipt printers & cash drawers',
        'Accept UPI QR codes, Credit Cards, Cash, and Split Payments',
        'Hold & retrieve multiple carts during peak customer rushes',
        'Integrated customer loyalty points and promotional discounts'
      ],
      ctaText: 'Launch POS Demo'
    },
    godown: {
      badge: 'LOGISTICS & SUPPLY',
      title: 'Multi-Godown & Warehouse inter-branch transfers',
      description: 'Track stock across multiple physical locations, branch warehouses, and distribution centers without manual spreadsheets.',
      metrics: [
        { value: 'Unlimited', label: 'Godown Locations' },
        { value: '1-Click', label: 'Stock Transfer' },
        { value: 'Zero', label: 'Transfer Discrepancies' }
      ],
      points: [
        'Move stock between godowns with automated delivery challans',
        'Godown-specific inventory valuation and available quantities',
        'Location-based user access controls and dispatch tracking',
        'Audit trail of all stock movements with time and supervisor logs'
      ],
      ctaText: 'Explore Godown Hub'
    },
    payroll: {
      badge: 'WORKFORCE MANAGEMENT',
      title: 'Staff attendance, wage calculation, and payroll ledger',
      description: 'Manage employee shifts, attendance records, salary structures, advances, and payroll payouts in one unified platform.',
      metrics: [
        { value: 'Daily/Monthly', label: 'Payout Cycles' },
        { value: '100%', label: 'Accurate Deductions' },
        { value: 'Instant', label: 'Salary Slips' }
      ],
      points: [
        'Daily present, absent, half-day, and overtime tracking',
        'Automated salary calculation considering leaves and advances',
        'Single-click salary payout receipts and staff statement exports',
        'Role-based access permissions for managers and cashiers'
      ],
      ctaText: 'Manage Staff'
    },
    einvoicing: {
      badge: 'GOVERNMENT GATEWAY',
      title: 'Direct NIC E-Invoicing & E-Way Bill generation',
      description: 'Generate IRN (Invoice Reference Number) and QR-code compliant e-invoices directly through authorized IRP portals without double entry.',
      metrics: [
        { value: 'Direct', label: 'NIC Portal Sync' },
        { value: 'Instant', label: 'IRN & QR Code' },
        { value: 'B2B & B2C', label: 'Compliance' }
      ],
      points: [
        'Single-click generation of IRN and signed QR codes',
        'Automated E-Way bill generation linked with invoice data',
        'Auto-cancellation and amendment workflows within government rules',
        'GSTR-1, GSTR-2B, and GSTR-3B auto-reconciliation reports'
      ],
      ctaText: 'Learn About E-Invoicing'
    }
  };

  const current = contentMap[activeTab];

  return (
    <section className="features-showcase-section" id="features">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="section-kicker">ALL-IN-ONE PLATFORM</span>
          <h2 className="section-main-title">Designed for Modern High-Growth Businesses</h2>
          <p className="section-subtitle">
            Everything your business needs to invoice clients, optimize stock, speed up sales, and automate accounting.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="feature-nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`feature-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Detail Showcase */}
        <div className="feature-showcase-card animate-fade-in" key={activeTab}>
          <div className="row align-items-center">
            {/* Left Content */}
            <div className="col-lg-6 showcase-text-col">
              <span className="showcase-badge">{current.badge}</span>
              <h3 className="showcase-title">{current.title}</h3>
              <p className="showcase-desc">{current.description}</p>

              <div className="showcase-points">
                {current.points.map((pt, idx) => (
                  <div key={idx} className="point-item">
                    <BsCheckCircleFill className="point-icon" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="showcase-actions">
                <button className="btn-saas-primary" onClick={() => navigate('/register')}>
                  {current.ctaText} <BsArrowRight />
                </button>
              </div>
            </div>

            {/* Right Interactive Card / Metrics */}
            <div className="col-lg-6 showcase-visual-col">
              <div className="showcase-visual-wrapper">
                <div className="metrics-grid">
                  {current.metrics.map((metric, idx) => (
                    <div key={idx} className="metric-box">
                      <h4 className="metric-val">{metric.value}</h4>
                      <p className="metric-lbl">{metric.label}</p>
                    </div>
                  ))}
                </div>

                <div className="feature-interactive-mock">
                  <div className="mock-header">
                    <div className="dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="mock-title">Live Module Preview: {tabs.find(t => t.id === activeTab)?.label}</div>
                  </div>
                  <div className="mock-body">
                    <div className="mock-row">
                      <span className="mock-tag success">Status: Active & Synced</span>
                      <span className="mock-time">Updated Just Now</span>
                    </div>
                    <div className="mock-stat-bar">
                      <div className="bar-fill" style={{ width: '88%' }}></div>
                    </div>
                    <div className="mock-footer-items">
                      <span><BsShieldLock /> Bank-grade 256-bit Encryption</span>
                      <span><BsSpeedometer2 /> 99.99% Cloud Uptime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon indigo">
              <BsLightningCharge />
            </div>
            <h4>Ultra-Fast Performance</h4>
            <p>Optimized architecture ensuring sub-second response times even with millions of inventory transactions.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon emerald">
              <BsShieldLock />
            </div>
            <h4>Audit-Ready GST Compliance</h4>
            <p>Always updated with the latest GST rules, e-invoice schemas, and tax slabs without requiring manual updates.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon amber">
              <BsSpeedometer2 />
            </div>
            <h4>Actionable Financial Analytics</h4>
            <p>Real-time P&L insights, cash flow forecasting, and automated customer ledger statements at your fingertips.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
