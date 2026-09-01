import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BsRocketTakeoffFill, 
  BsPlayCircleFill, 
  BsShieldCheck, 
  BsLightningChargeFill,
  BsArrowRight,
  BsPrinter,
  BsQrCodeScan,
  BsStars,
  BsCheck2Circle,
  BsAndroid2,
  BsAwardFill
} from 'react-icons/bs';
import tsarItLogo from '../asstes/tsar_it_logo.jpg';

export default function Hero() {
  const navigate = useNavigate();

  // Real-time counter simulation
  const [invoicesCount, setInvoicesCount] = useState(48);
  const [todayRevenue, setTodayRevenue] = useState(184250);

  useEffect(() => {
    const timer = setInterval(() => {
      setInvoicesCount(prev => prev + 1);
      setTodayRevenue(prev => prev + Math.floor(Math.random() * 1200 + 450));
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-saas-section">
      <div className="hero-grid-pattern"></div>
      <div className="hero-glow-bg"></div>
      
      <div className="container hero-container">
        <div className="row align-items-center g-5">
          {/* Left Column: Authentic Enterprise Value Proposition */}
          <div className="col-lg-6 hero-text-col">
            <div className="hero-announcement-badge">
              <span className="live-status-pulse"></span>
              <span className="badge-new">TSAR IT BILLING</span>
              <span className="hero-badge-txt">GST Invoicing, Multi-Godown Hub & Thermal POS</span>
              <BsArrowRight className="ms-1" />
            </div>

            <h1 className="hero-headline">
              India’s Most Reliable <span className="headline-gradient">GST Billing & POS</span> Software
            </h1>

            <p className="hero-subheading">
              Built for growing retail shops, distributors, wholesalers, manufacturers, and multi-branch enterprises. Generate audit-ready GST bills, sync godown stocks, print on 80mm/58mm thermal rolls, and run offline counter billing seamlessly.
            </p>

            {/* Value bullets */}
            <div className="hero-value-chips-grid">
              <div className="value-chip-card">
                <div className="chip-icon-box bg-success-subtle text-success">
                  <BsCheck2Circle />
                </div>
                <div>
                  <strong>8-Second GST Billing</strong>
                  <p className="text-muted mb-0 small">Automated HSN & CGST/SGST/IGST splits</p>
                </div>
              </div>

              <div className="value-chip-card">
                <div className="chip-icon-box bg-primary-subtle text-primary">
                  <BsPrinter />
                </div>
                <div>
                  <strong>Multi-Size Thermal Print</strong>
                  <p className="text-muted mb-0 small">A4, A5, 80mm & 58mm POS slips</p>
                </div>
              </div>

              <div className="value-chip-card">
                <div className="chip-icon-box bg-warning-subtle text-warning">
                  <BsQrCodeScan />
                </div>
                <div>
                  <strong>e-Way & IRN QR Ready</strong>
                  <p className="text-muted mb-0 small">Direct statutory compliance gateway</p>
                </div>
              </div>

              <div className="value-chip-card">
                <div className="chip-icon-box bg-info-subtle text-info">
                  <BsStars />
                </div>
                <div>
                  <strong>RAKI AI Copilot</strong>
                  <p className="text-muted mb-0 small">Real-time business intelligence & alerts</p>
                </div>
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="hero-cta-group">
              <button className="btn-saas-primary hero-main-cta shadow-lg" onClick={() => navigate('/register')}>
                <BsRocketTakeoffFill /> Start 15-Day Free Trial
              </button>
              <button className="btn-saas-secondary hero-secondary-cta" onClick={() => navigate('/login')}>
                <BsPlayCircleFill className="text-primary" /> Launch Portal Demo
              </button>
              <Link to="/download-app" className="btn btn-outline-dark d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none">
                <BsAndroid2 className="text-success fs-5" /> Download App
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="hero-trust-note">
              <span className="trust-item"><BsShieldCheck className="text-success" /> 100% Data Confidentiality</span>
              <span className="bullet-sep">•</span>
              <span className="trust-item">No credit card required</span>
              <span className="bullet-sep">•</span>
              <span className="trust-item">Full Excel/Tally data import</span>
            </div>
          </div>

          {/* Right Column: Workstation Mockup with Brand Image Asset */}
          <div className="col-lg-6 hero-mockup-col">
            <div className="hero-mockup-card glass-panel shadow-2xl animate-fade-in">
              {/* Window Frame Bar */}
              <div className="mockup-window-header">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-address-bar">
                  <span className="lock-icon">🔒</span> https://billing.tsaritservices.com/pos-counter/terminal-01
                </div>
                <div className="window-status-pill">
                  <span className="status-dot online"></span> Active Gateway
                </div>
              </div>

              {/* Workstation Dashboard Body */}
              <div className="mockup-window-body">
                {/* Real-time Business Metrics Strip */}
                <div className="mock-stat-row">
                  <div className="mock-stat-tile primary">
                    <span className="stat-label">TODAY'S REVENUE</span>
                    <h4 className="stat-number">₹ {todayRevenue.toLocaleString('en-IN')}.00</h4>
                    <span className="stat-growth text-success">↑ +21.4% vs yesterday</span>
                  </div>
                  <div className="mock-stat-tile success">
                    <span className="stat-label">BILLS PROCESSED</span>
                    <h4 className="stat-number">{invoicesCount} Invoices</h4>
                    <span className="stat-growth text-success">100% Tax Compliant</span>
                  </div>
                </div>

                {/* Live Real-time Tax Invoice Preview Card */}
                <div className="mock-invoice-box">
                  <div className="mock-invoice-head d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center gap-2">
                      <img 
                        src={tsarItLogo} 
                        alt="TSAR IT BILLING" 
                        style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
                        className="rounded border p-1 bg-white"
                      />
                      <div>
                        <span className="badge bg-primary text-white mb-1" style={{ fontSize: '9px' }}>TAX INVOICE #TSAR-2026-104</span>
                        <strong className="d-block text-dark small">Party: Shri Krishna Enterprise</strong>
                        <div className="text-muted" style={{ fontSize: '11px' }}>GSTIN: 36AABCU9603R1ZM</div>
                      </div>
                    </div>
                    <span className="badge-status paid">PAID VIA UPI</span>
                  </div>

                  <div className="mock-invoice-table mt-2">
                    <div className="mock-table-row header">
                      <span>Item / HSN</span>
                      <span>Qty</span>
                      <span>Rate</span>
                      <span className="text-end">Total</span>
                    </div>
                    <div className="mock-table-row">
                      <span>Cisco SG350 Gigabit Switch (8517)</span>
                      <span>2 pcs</span>
                      <span>₹ 28,500</span>
                      <span className="text-end">₹ 57,000.00</span>
                    </div>
                    <div className="mock-table-row">
                      <span>Thermal Billing Paper 80mm (4811)</span>
                      <span>50 rolls</span>
                      <span>₹ 65</span>
                      <span className="text-end">₹ 3,250.00</span>
                    </div>
                  </div>

                  <div className="mock-invoice-totals">
                    <div className="total-line">
                      <span>Taxable Amount</span>
                      <span>₹ 60,250.00</span>
                    </div>
                    <div className="total-line">
                      <span>CGST (9%) + SGST (9%)</span>
                      <span>₹ 10,845.00</span>
                    </div>
                    <div className="total-line grand-total">
                      <span>Grand Total (Rounded)</span>
                      <span className="amount-highlight">₹ 71,095.00</span>
                    </div>
                  </div>
                </div>

                {/* Instant Automation Micro Bar */}
                <div className="floating-badge-bottom mt-3">
                  <div className="floating-icon">
                    <BsLightningChargeFill />
                  </div>
                  <div>
                    <strong>Instant E-Way Bill & QR Code Attached</strong>
                    <div className="small text-muted">IRN: e9148b... | Print Ready: A4, A5, 80mm & 58mm Thermal</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
