import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BsReceiptCutoff, 
  BsBoxSeam, 
  BsShop, 
  BsBuildings, 
  BsPeople, 
  BsFileEarmarkCheck, 
  BsCheckCircleFill, 
  BsArrowRight,
  BsShieldCheck,
  BsLightningChargeFill,
  BsClockHistory,
  BsCloudCheckFill,
  BsPrinterFill,
  BsGraphUpArrow,
  BsPhoneFill
} from 'react-icons/bs';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState('invoicing');

  const featureTabs = [
    { id: 'invoicing', label: 'GST Invoicing', icon: <BsReceiptCutoff /> },
    { id: 'inventory', label: 'Smart Inventory', icon: <BsBoxSeam /> },
    { id: 'pos', label: 'POS Terminal', icon: <BsShop /> },
    { id: 'godown', label: 'Multi-Warehouse', icon: <BsBuildings /> },
    { id: 'payroll', label: 'Staff & Payroll', icon: <BsPeople /> },
    { id: 'einvoicing', label: 'E-Invoicing & E-Way', icon: <BsFileEarmarkCheck /> }
  ];

  const featureDetails = {
    invoicing: {
      badge: 'SPEED & TAX ACCURACY',
      title: 'Generate Audit-Ready GST Invoices in Seconds',
      description: 'Create professional tax invoices, proforma bills, quotations, delivery challans, and credit/debit notes with automated tax computation and instant customer sharing.',
      highlights: [
        'Instant CGST, SGST, IGST tax split with automated HSN/SAC code lookup',
        'Customizable templates with your logo, digital signature, and bank UPI QR code',
        'Direct 1-click sharing via WhatsApp, SMS, and transactional Email',
        'Built-in receivables ledger and overdue payment reminders'
      ],
      stats: [
        { value: '< 8s', label: 'Bill Generation Time' },
        { value: '100%', label: 'GST Compliance' },
        { value: '3x', label: 'Faster Collections' }
      ]
    },
    inventory: {
      badge: 'REAL-TIME STOCK SYNC',
      title: 'Smart Inventory Management with Automated Alerts',
      description: 'Track stock movement across all product lines, prevent stockouts with reorder point warnings, and maintain precision batch, barcode, and expiry tracking.',
      highlights: [
        'Automated low-stock and dead-stock alerts with custom reorder levels',
        'Barcode scanner integration for lightning-fast product lookup and billing',
        'Batch tracking with automated expiry date monitoring for perishable goods',
        'Stock adjustment logs and live profit margin calculation per product'
      ],
      stats: [
        { value: 'Real-time', label: 'Multi-device Sync' },
        { value: '0%', label: 'Dead Stock Losses' },
        { value: '100k+', label: 'SKU Support' }
      ]
    },
    pos: {
      badge: 'HIGH-VOLUME RETAIL',
      title: 'Lightning-Fast Touch POS Counter Billing',
      description: 'Designed for supermarkets, retail counters, and walk-in shops requiring maximum speed, barcode scanning, thermal printing, and multi-payment acceptance.',
      highlights: [
        'Full touchscreen keyboard-optimized counter interface',
        'Seamless compatibility with 58mm and 80mm ESC/POS thermal printers',
        'Split payment support across Cash, UPI, Credit Cards, and Store Credits',
        'Instant day-end cash register reconciliation and shift summary reports'
      ],
      stats: [
        { value: '0.5s', label: 'Scan-to-Bill Latency' },
        { value: 'Offline', label: 'Mode Resiliency' },
        { value: 'All', label: 'Printer Models' }
      ]
    },
    godown: {
      badge: 'LOGISTICS & DISTRIBUTION',
      title: 'Centralized Multi-Godown & Warehouse Hub',
      description: 'Transfer stock effortlessly between warehouses, branches, and retail storefronts with comprehensive transit challans and location-wise stock audits.',
      highlights: [
        'Create unlimited warehouses, godowns, and branch stock centers',
        'Inter-godown stock transfer workflow with automated transit verification',
        'Location-specific stock availability and reorder threshold management',
        'Export comprehensive warehouse PDF audit logs and CSV stock manifests'
      ],
      stats: [
        { value: 'Multi-hub', label: 'Warehouse Network' },
        { value: '1-Click', label: 'Stock Transfers' },
        { value: 'Zero', label: 'Discrepancy Audits' }
      ]
    },
    payroll: {
      badge: 'HUMAN CAPITAL & PAYROLL',
      title: 'Integrated Staff Attendance & Payroll Ledger',
      description: 'Manage employee shifts, record daily attendance, track salary advances, and generate monthly payslips with statutory calculations.',
      highlights: [
        'Visual monthly attendance calendar with Present, Absent, and Half-day tracking',
        'Automated salary calculation factoring in daily wage rates and deductions',
        'Advance payment ledger and loan deduction tracking per employee',
        'Downloadable monthly payroll salary slips ready for bank transfer'
      ],
      stats: [
        { value: 'Automated', label: 'Wage Calculation' },
        { value: 'Instant', label: 'Salary Slips' },
        { value: '100%', label: 'Payroll Transparency' }
      ]
    },
    einvoicing: {
      badge: 'DIRECT GOVERNMENT INTEGRATION',
      title: 'Direct Government NIC E-Invoicing & E-Way Bills',
      description: 'Stay completely compliant with Indian GST mandates through direct IRP API integration for instantaneous IRN and QR code generation.',
      highlights: [
        '1-click IRN (Invoice Reference Number) generation directly from sales bills',
        'Digitally signed QR codes embedded automatically into invoice prints',
        'Automated Part-A and Part-B E-Way Bill generation with vehicle tracking',
        'Ready-to-file GSTR-1, GSTR-2B, and GSTR-3B statutory tax reconciliation'
      ],
      stats: [
        { value: 'Direct', label: 'Govt NIC Gateway' },
        { value: 'Instant', label: 'IRN & QR Embedding' },
        { value: 'B2B/B2C', label: 'Ready Compliance' }
      ]
    }
  };

  const active = featureDetails[activeTab];

  return (
    <div className="features-page-wrapper">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-dark text-white py-5" style={{ paddingTop: '110px' }}>
        <div className="container text-center py-4">
          <span className="badge bg-primary px-3 py-2 text-uppercase fw-bold mb-3">
            ENTERPRISE PLATFORM CAPABILITIES
          </span>
          <h1 className="display-5 fw-bold text-white mb-3">
            Everything You Need to Run Your <span className="text-primary">Business Finances</span>
          </h1>
          <p className="lead text-light text-opacity-75 mx-auto mb-4" style={{ maxWidth: '750px', fontSize: '1.1rem' }}>
            From high-speed retail POS to multi-godown stock logistics, e-invoicing compliance, and automated payroll — all unified in one cloud portal.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn btn-primary px-4 py-3 rounded-pill fw-bold d-inline-flex align-items-center gap-2">
              Start 15-Day Free Trial <BsArrowRight />
            </Link>
            <Link to="/pricing" className="btn btn-outline-light px-4 py-3 rounded-pill fw-bold">
              View All Pricing Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Showcase */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-3">
          {/* Tab Navigation Pill Bar */}
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'btn-primary shadow-sm'
                    : 'btn-white bg-white text-secondary border'
                }`}
                style={{ fontSize: '0.95rem' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Content Card */}
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden p-4 p-md-5 bg-white">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 fw-bold text-uppercase mb-2">
                  {active.badge}
                </span>
                <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '1.85rem' }}>
                  {active.title}
                </h2>
                <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {active.description}
                </p>

                <div className="d-flex flex-column gap-3 mb-4">
                  {active.highlights.map((point, index) => (
                    <div key={index} className="d-flex align-items-start gap-3">
                      <BsCheckCircleFill className="text-success fs-5 flex-shrink-0 mt-1" />
                      <span className="text-dark fw-medium" style={{ fontSize: '0.98rem' }}>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-3 pt-2">
                  <Link to="/register" className="btn btn-primary px-4 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2">
                    Try This Feature Free <BsArrowRight />
                  </Link>
                  <Link to="/contact" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold">
                    Request Live Demo
                  </Link>
                </div>
              </div>

              {/* Stats & Key Metrics Box */}
              <div className="col-lg-5">
                <div className="bg-light p-4 rounded-4 border">
                  <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                    <BsGraphUpArrow className="text-primary" /> Key Performance Indicators
                  </h5>
                  <div className="row g-3 mb-4">
                    {active.stats.map((stat, i) => (
                      <div key={i} className="col-12">
                        <div className="bg-white p-3 rounded-3 shadow-sm border">
                          <div className="fw-bold text-primary display-6" style={{ fontSize: '1.8rem' }}>{stat.value}</div>
                          <div className="text-muted small fw-semibold">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary d-flex align-items-center gap-2 small fw-semibold">
                    <BsShieldCheck className="fs-5 flex-shrink-0" />
                    Available across all business plans with zero hidden add-on costs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of All Additional Tools */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Included Enterprise Tools</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              Every TSAR IT Billing subscription includes access to our entire ecosystem of specialized business utilities.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border rounded-4 shadow-sm">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-primary bg-opacity-10 text-primary fs-4">
                    <BsPhoneFill />
                  </div>
                  <h5 className="fw-bold mb-0">Android Mobile App</h5>
                </div>
                <p className="text-muted small mb-0">
                  Run billing on the move, scan barcodes using your phone camera, and print thermal slips over Bluetooth.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border rounded-4 shadow-sm">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-success bg-opacity-10 text-success fs-4">
                    <BsCloudCheckFill />
                  </div>
                  <h5 className="fw-bold mb-0">Automated Daily Backups</h5>
                </div>
                <p className="text-muted small mb-0">
                  Your business ledgers, customer contact lists, and invoices are backed up automatically to encrypted cloud storage.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 p-4 border rounded-4 shadow-sm">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 bg-warning bg-opacity-10 text-warning fs-4">
                    <BsPrinterFill />
                  </div>
                  <h5 className="fw-bold mb-0">Thermal & A4 Formats</h5>
                </div>
                <p className="text-muted small mb-0">
                  Switch effortlessly between regular A4/A5 laser prints and compact 2-inch or 3-inch roll thermal receipts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container py-3">
          <h2 className="fw-bold mb-3">Ready to Modernize Your Operations?</h2>
          <p className="lead text-white text-opacity-75 mx-auto mb-4" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
            Set up your business profile in 2 minutes. Start issuing tax invoices and managing stock today.
          </p>
          <Link to="/register" className="btn btn-light px-4 py-3 rounded-pill fw-bold text-primary shadow">
            Create Free Account Now <BsArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
