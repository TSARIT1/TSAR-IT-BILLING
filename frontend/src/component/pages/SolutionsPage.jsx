import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BsShop, 
  BsBuildings, 
  BsTruck, 
  BsGearWideConnected, 
  BsCapsule, 
  BsTagFill, 
  BsCheckCircleFill, 
  BsArrowRight,
  BsCupHotFill,
  BsLaptopFill,
  BsBoxes,
  BsFileEarmarkTextFill,
  BsQrCode,
  BsShareFill,
  BsSendCheckFill
} from 'react-icons/bs';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function SolutionsPage() {
  const [activeIndustry, setActiveIndustry] = useState('retail');

  const industries = [
    { id: 'retail', label: 'Retail Shop', icon: <BsShop />, badge: 'POINT OF SALE' },
    { id: 'distribution', label: 'Distribution', icon: <BsTruck />, badge: 'LOGISTICS & FLEET' },
    { id: 'wholesale', label: 'Wholesale', icon: <BsBoxes />, badge: 'BULK ORDERS' },
    { id: 'manufacturing', label: 'Manufacturing', icon: <BsGearWideConnected />, badge: 'PRODUCTION & BOM' },
    { id: 'services', label: 'Service-Based', icon: <BsBuildings />, badge: 'PROJECT BILLING' },
    { id: 'restaurants', label: 'Restaurants & Cafe', icon: <BsCupHotFill />, badge: 'KOT & TABLES' },
    { id: 'hotel', label: 'Hotel & Lodging', icon: <BsBuildings />, badge: 'ROOM RESERVATIONS' },
    { id: 'pharmacy', label: 'Pharmacy & Chemist', icon: <BsCapsule />, badge: 'BATCH & EXPIRY' },
    { id: 'fmcg', label: 'FMCG & Consumer Goods', icon: <BsBoxes />, badge: 'FAST TURNOVER' },
    { id: 'textile', label: 'Textile & Garments', icon: <BsTagFill />, badge: 'SIZES & VARIANTS' },
    { id: 'electronics', label: 'Electronics & Mobile', icon: <BsLaptopFill />, badge: 'IMEI & SERIAL NO' }
  ];

  const industryDetails = {
    retail: {
      title: 'High-Velocity Billing Software for Retail Shops & Supermarkets',
      subtitle: 'Built for fast checkouts, barcode scanning, discount coupons, and multi-mode payment collection.',
      challenges: 'Eliminate long customer queues, avoid manual billing errors, and balance daily cash drawers instantly.',
      features: [
        'Rapid item search with USB and wireless Bluetooth barcode scanners',
        'Direct thermal receipt printing in 58mm / 80mm roll formats with your logo',
        'Hold-bill and recall feature during busy checkout rushes',
        'Customer loyalty points, promotional discounts, and festive offers'
      ],
      recommendedModules: ['POS Counter Terminal', 'Inventory Barcoding', 'Customer Loyalty', 'Cash Drawer Balance']
    },
    distribution: {
      title: 'Distribution & Supply Chain Billing Management',
      subtitle: 'Coordinate secondary sales, route distribution, delivery challans, and real-time field collections.',
      challenges: 'Reconciling delivery agent cash collections, transit stock variances, and dealer payment cycles.',
      features: [
        'Automated dispatch planning with vehicle trip sheets and LR numbers',
        'Dealer-wise credit ceiling warnings and outstanding age-analysis',
        'Mobile app field billing for salesmen with real-time stock sync',
        'Instant WhatsApp e-Bill sharing with integrated UPI payment links'
      ],
      recommendedModules: ['Route Distribution', 'Delivery Challans', 'Outstanding Ageing', 'Mobile Field App']
    },
    wholesale: {
      title: 'Bulk Order Billing for Wholesalers & Distributors',
      subtitle: 'Handle bulk pricing tiers, customer credit limits, delivery challans, and multi-vehicle dispatch with precision.',
      challenges: 'Managing complex customer credit ledgers, multi-pack pricing, and overdue payment collections.',
      features: [
        'Tiered wholesale pricing based on order volume and customer category',
        'Customer credit balance checks with automatic credit limit warnings',
        'Convert quotations to delivery challans and tax invoices with one click',
        'Automated payment reminders sent over WhatsApp and SMS with payment links'
      ],
      recommendedModules: ['Customer Credit Ledger', 'Delivery Challans', 'Multi-Rate Pricing', 'WhatsApp Automation']
    },
    manufacturing: {
      title: 'Assembly & Inventory for Manufacturers',
      subtitle: 'Manage Bill of Materials (BOM), track raw material consumption, and transfer finished goods into warehouses.',
      challenges: 'Tracking wastage, multi-stage production costs, and stock transfers across factory godowns.',
      features: [
        'Multi-level Bill of Materials (BOM) for accurate manufacturing cost tracking',
        'Automated deduction of raw materials upon completion of finished goods batches',
        'Inter-godown transfer orders with transit vehicle tracking and delivery receipts',
        'Quality check and batch inspection audit logs'
      ],
      recommendedModules: ['Manufacturing BOM', 'Multi-Godown Hub', 'Raw Material Ledger', 'Stock Audits']
    },
    services: {
      title: 'Professional Billing for Service & IT Companies',
      subtitle: 'Issue formal proforma invoices, track milestone payments, and maintain TDS deduction ledgers effortlessly.',
      challenges: 'Managing advance retainers, statutory TDS deductions, and milestone-based project billing.',
      features: [
        'Proforma invoice generation with automated conversion to tax bill upon payment',
        'Detailed SAC code categorization and multi-state IGST billing',
        'Section 194C/194J TDS and TCS calculation and ledger reporting',
        'Client statement of account with one-click PDF download'
      ],
      recommendedModules: ['Proforma Invoicing', 'TDS/TCS Compliance', 'Quotation Builder', 'Client Ledgers']
    },
    restaurants: {
      title: 'Restaurant, Cafe & Quick-Service (QSR) Billing',
      subtitle: 'Kitchen Order Tickets (KOT), dine-in table management, food aggregator sync, and express counter billing.',
      challenges: 'Kitchen communication delays, split bills, and managing food ingredient costs.',
      features: [
        'Instant Kitchen Order Ticket (KOT) printing to kitchen thermal printers',
        'Table layout visualizer with running bill status and table merge options',
        'Recipe-based food raw ingredient consumption tracking',
        'Split payment support (Cash + UPI + Cards on same bill)'
      ],
      recommendedModules: ['KOT Kitchen Printing', 'Table Layout Manager', 'Ingredient Costing', 'Express Food Counter']
    },
    hotel: {
      title: 'Hotel, Resort & Guest House Billing',
      subtitle: 'Room reservation check-in/out, laundry & room service folios, and unified checkout GST invoicing.',
      challenges: 'Consolidating multiple amenities onto a single checkout bill with varying GST rates (12% & 18%).',
      features: [
        'Guest check-in, ID proof capture, and room status calendar',
        'Post restaurant and laundry charges directly to the room folio',
        'Automatic GST rate classification based on room tariff slabs',
        'Corporate billing with company GSTIN and PO reference numbers'
      ],
      recommendedModules: ['Room Folio Billing', 'Tariff GST Slabs', 'Guest ID Logs', 'Corporate Invoicing']
    },
    pharmacy: {
      title: 'Batch & Expiry Precision for Pharmacies & Chemists',
      subtitle: 'Comply with drug controller guidelines with mandatory batch numbers, manufacture dates, and doctor prescription logs.',
      challenges: 'Preventing the sale of expired medicines and complying with schedule H/H1 regulatory audits.',
      features: [
        'Prominent expiry alerts that block billing of expired drug batches',
        'Doctor name and patient prescription details embedded directly into bills',
        'Fast salt-composition and generic alternative medicine search',
        'Audit-ready stock register categorized by drug schedule and supplier'
      ],
      recommendedModules: ['Batch & Expiry Tracker', 'Doctor Prescription Tags', 'Salt Search', 'Drug Audit Register']
    },
    fmcg: {
      title: 'Fast-Moving Consumer Goods (FMCG) Distribution & Billing',
      subtitle: 'High-turnover stock tracking, carton and pack conversions, scheme discounts, and beat billing.',
      challenges: 'Managing promotional free schemes (Buy 10 Get 1), margin calculations, and fast expiring goods.',
      features: [
        'Packaging unit conversions (Carton to Box to Single Pcs)',
        'Automatic promotional trade scheme discounts and free-issue billing',
        'Beat-wise salesman routing and customer collection reports',
        'Fast thermal and dot-matrix continuous paper invoice printing'
      ],
      recommendedModules: ['Unit Conversions', 'Trade Schemes', 'Beat Billing', 'Volume Pricing']
    },
    textile: {
      title: 'Size & Color Matrix for Textile, Apparel & Garments',
      subtitle: 'Organize high-variety clothing, footwear, and fabrics with matrix-based size, color, and design variants.',
      challenges: 'Handling thousands of SKU permutations across different sizes, fits, and colorways.',
      features: [
        'Matrix item setup: single product master with multiple Size and Color variants',
        'Custom clothing price-tags and barcode sticker label generation',
        'Seasonal stock clearance and markdown discount automation',
        'Exchange and return management with instant credit note adjustments'
      ],
      recommendedModules: ['Size-Color Matrix', 'Barcode Label Generator', 'Credit Note Adjustments', 'Variant Reports']
    },
    electronics: {
      title: 'Serial Number & IMEI Tracking for Electronics & Mobiles',
      subtitle: 'Maintain unique IMEI numbers, warranty periods, technician repair job cards, and serial-tracked stock.',
      challenges: 'Tracking supplier and customer warranty claims, serial number validation, and technician repairs.',
      features: [
        'Individual barcode and IMEI/Serial number scanning at checkout',
        'Print warranty terms, brand service centers, and IMEI numbers on invoices',
        'Customer repair job cards with status tracking and service charges',
        'Supplier warranty return tracking and replacement stock logs'
      ],
      recommendedModules: ['IMEI/Serial Tracker', 'Warranty Cards', 'Service Job Sheets', 'Electronics POS']
    }
  };

  const active = industryDetails[activeIndustry];

  return (
    <div className="solutions-page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-dark text-white py-5" style={{ paddingTop: '110px' }}>
        <div className="container text-center py-4">
          <span className="badge bg-primary px-3 py-2 text-uppercase fw-bold mb-3">
            ENTERPRISE INDIAN BILLING & SECTORS
          </span>
          <h1 className="display-5 fw-bold text-white mb-3">
            Tailored Specifically for Your <span className="text-primary">Industry Sector</span>
          </h1>
          <p className="lead text-light text-opacity-75 mx-auto mb-4" style={{ maxWidth: '780px', fontSize: '1.1rem' }}>
            From high-speed retail supermarkets and distributors to restaurants, hotels, pharmacies, textile boutiques, and electronics shops — TSAR IT Billing delivers deep operational compliance.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn btn-primary px-4 py-3 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
              Start Free Trial <BsArrowRight />
            </Link>
            <Link to="/contact" className="btn btn-outline-light px-4 py-3 rounded-pill fw-bold">
              Book a Sector Specialist Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Industry Tabs Horizontal Bar */}
      <section className="py-4 border-bottom bg-white sticky-top shadow-sm" style={{ top: '70px', zIndex: 90 }}>
        <div className="container">
          <div className="d-flex overflow-auto pb-1 gap-2 no-scrollbar">
            {industries.map((ind) => (
              <button
                key={ind.id}
                className={`btn btn-sm px-3 py-2 rounded-pill fw-bold text-nowrap d-flex align-items-center gap-2 ${
                  activeIndustry === ind.id 
                    ? 'btn-primary shadow-sm' 
                    : 'btn-light text-secondary'
                }`}
                onClick={() => setActiveIndustry(ind.id)}
              >
                {ind.icon}
                <span>{ind.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active Industry Deep-Dive */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-3">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill align-self-start mb-3">
                  {industries.find(i => i.id === activeIndustry)?.badge}
                </span>

                <h2 className="fw-bold text-dark mb-2">{active.title}</h2>
                <p className="text-secondary fs-5 mb-4">{active.subtitle}</p>

                <div className="p-3 bg-light rounded-3 mb-4 border-start border-primary border-4">
                  <h6 className="fw-bold text-dark mb-1">Operational Challenge Solved:</h6>
                  <p className="small text-secondary mb-0">{active.challenges}</p>
                </div>

                <h5 className="fw-bold text-dark mb-3">Key Specialized Capabilities:</h5>
                <div className="row g-3 mb-4">
                  {active.features.map((feat, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="d-flex align-items-start gap-2">
                        <BsCheckCircleFill className="text-success mt-1 flex-shrink-0" />
                        <span className="small text-secondary fw-semibold">{feat}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/register" className="btn btn-primary px-4 py-2 rounded-3 fw-bold">
                    Deploy {industries.find(i => i.id === activeIndustry)?.label} Workflow
                  </Link>
                  <Link to="/pos-billing" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold">
                    Open Interactive POS Counter
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                <h5 className="fw-bold text-dark mb-3">Recommended Enterprise Modules:</h5>
                <ul className="list-group list-group-flush">
                  {active.recommendedModules.map((mod, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                      <span className="fw-bold text-secondary">{mod}</span>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                        Enabled
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                <h5 className="fw-bold mb-2">Need a Custom Industry Configuration?</h5>
                <p className="small text-light text-opacity-75 mb-3">
                  Our engineering team can create customized print slips, barcode layouts, and tax classifications for your specialized trade.
                </p>
                <Link to="/contact" className="btn btn-light text-dark fw-bold rounded-3 btn-sm align-self-start">
                  Speak with Product Engineer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Core Indian Billing Standards Grid */}
      <section className="py-5 bg-white border-top">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary px-3 py-2 text-uppercase fw-bold mb-2">COMPLETE CAPABILITIES</span>
            <h2 className="fw-bold text-dark">7 Core Pillars of TSAR IT Billing</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Standardized across all sectors to ensure 100% statutory adherence to Indian GST, E-Way, E-Invoicing and banking rules.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border rounded-4 p-4 shadow-sm hover-lift">
                <div className="fs-2 text-primary mb-3"><BsFileEarmarkTextFill /></div>
                <h5 className="fw-bold text-dark">1. GST Billing & Invoicing</h5>
                <p className="small text-secondary mb-0">
                  Generate professional tax invoices, bills of supply, delivery challans, credit/debit notes with automated CGST, SGST, and IGST calculation.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 p-4 shadow-sm hover-lift">
                <div className="fs-2 text-success mb-3"><BsBoxes /></div>
                <h5 className="fw-bold text-dark">2. Inventory Management</h5>
                <p className="small text-secondary mb-0">
                  Real-time stock alerts, reorder levels, multi-godown storage, batch/expiry tracking, and item-wise profit margin analytics.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 p-4 shadow-sm hover-lift">
                <div className="fs-2 text-warning mb-3"><BsBuildings /></div>
                <h5 className="fw-bold text-dark">3. Double-Entry Bookkeeping</h5>
                <p className="small text-secondary mb-0">
                  Automated customer & supplier ledgers, trial balance, daybook reports, and audit trails formatted specifically for Chartered Accountants (CAs).
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 p-4 shadow-sm hover-lift">
                <div className="fs-2 text-info mb-3"><BsShop /></div>
                <h5 className="fw-bold text-dark">4. POS Counter Billing</h5>
                <p className="small text-secondary mb-0">
                  Ultra-fast cashier checkout with barcode scanning, cash drawer management, customer loyalty points, and 80mm/58mm thermal receipts.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 p-4 shadow-sm hover-lift">
                <div className="fs-2 text-danger mb-3"><BsShareFill /></div>
                <h5 className="fw-bold text-dark">5. Business Marketing</h5>
                <p className="small text-secondary mb-0">
                  Send bulk promotional SMS, automated WhatsApp festive greetings, overdue payment reminders, and custom business greeting cards.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border rounded-4 p-4 shadow-sm hover-lift">
                <div className="fs-2 text-primary mb-3"><BsTruck /></div>
                <h5 className="fw-bold text-dark">6. eWay Billing</h5>
                <p className="small text-secondary mb-0">
                  Generate Part-A and Part-B compliant E-Way bills directly from invoices with vehicle tracking and transporter IDs for consignments above ₹50,000.
                </p>
              </div>
            </div>

            <div className="col-md-12">
              <div className="card border rounded-4 p-4 shadow-sm bg-light">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="fs-2 text-success"><BsSendCheckFill /></div>
                      <h4 className="fw-bold text-dark mb-0">7. eInvoicing (IRN & QR Generation)</h4>
                    </div>
                    <p className="small text-secondary mb-0">
                      Direct NIC / IRP integration for real-time Invoice Reference Number (IRN) generation and signed digital QR codes for B2B transactions meeting government turnover thresholds.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <Link to="/register" className="btn btn-primary fw-bold px-4 py-2 rounded-3">
                      Activate Free Compliance Trial
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
