import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BsShieldCheck, 
  BsHeadset, 
  BsLockFill, 
  BsTwitterX, 
  BsLinkedin, 
  BsFacebook, 
  BsInstagram, 
  BsGithub,
  BsArrowRight,
  BsEnvelope,
  BsTelephone,
  BsShieldLockFill
} from 'react-icons/bs';

export default function Footer() {
  return (
    <footer className="enterprise-footer">
      {/* Top CTA Banner */}
      <div className="footer-cta-container">
        <div className="container">
          <div className="footer-cta-card">
            <div className="cta-left">
              <h2>Ready to streamline your billing & invoicing?</h2>
              <p>Join over 100,000+ growing enterprises powering their financial operations with TSAR IT Billing.</p>
            </div>
            <div className="cta-right">
              <Link to="/register" className="btn-saas-primary cta-btn">
                Start Free Billing Now <BsArrowRight />
              </Link>
              <Link to="/login" className="btn-saas-secondary cta-btn">
                Live Portal Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main-content">
        <div className="container">
          <div className="row g-4">
            {/* Column 1: Brand & Bio */}
            <div className="col-lg-4 col-md-6 footer-brand-col">
              <div className="footer-logo">
                <span className="logo-brand-mark">TSAR IT</span>
                <span className="logo-product-mark">BILLING</span>
              </div>
              <p className="footer-desc">
                Next-generation GST billing, multi-godown inventory, POS point-of-sale, and payroll platform designed for modern Indian enterprises and SMEs.
              </p>
              <div className="footer-trust-pills">
                <span className="trust-pill"><BsShieldCheck /> ISO 27001 Certified</span>
                <span className="trust-pill"><BsLockFill /> 256-bit SSL Bank Security</span>
              </div>
            </div>

            {/* Column 2: Solutions */}
            <div className="col-lg-2 col-md-6 footer-links-col">
              <h5 className="footer-col-title">Solutions</h5>
              <ul className="footer-link-list">
                <li><Link to="/dashboard">GST Invoicing</Link></li>
                <li><Link to="/inventory">Inventory Management</Link></li>
                <li><Link to="/godown">Multi-Godown Hub</Link></li>
                <li><Link to="/pos-billing">POS Counter Billing</Link></li>
                <li><Link to="/staff-attendance">Staff & Payroll</Link></li>
                <li><Link to="/e-invoicing">E-Invoicing & E-Way</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources & Modules */}
            <div className="col-lg-2 col-md-6 footer-links-col">
              <h5 className="footer-col-title">Portal Modules</h5>
              <ul className="footer-link-list">
                <li><Link to="/sales-invoices">Sales Invoices</Link></li>
                <li><Link to="/purchase-invoices">Purchase Orders</Link></li>
                <li><Link to="/parties">Customer Ledger</Link></li>
                <li><Link to="/cash/bank">Cash & Bank</Link></li>
                <li><Link to="/expenses">Expense Tracker</Link></li>
                <li><Link to="/reports">Financial Reports</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact & Newsletter */}
            <div className="col-lg-4 col-md-6 footer-contact-col">
              <h5 className="footer-col-title">Stay Connected</h5>
              <p className="newsletter-hint">Subscribe for monthly tax updates, GST tips, and feature announcements.</p>
              
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
                <input type="email" placeholder="Enter your business email" required />
                <button type="submit">Subscribe</button>
              </form>

              <div className="contact-details mt-3">
                <p><BsEnvelope className="me-2 text-primary" /> <a href="mailto:info@tsaritservices.com" className="text-white text-decoration-none">info@tsaritservices.com</a></p>
                <p><BsTelephone className="me-2 text-primary" /> <a href="tel:+919491301258" className="text-white text-decoration-none">+91 9491301258</a> / <a href="tel:+918142616767" className="text-white text-decoration-none">+91 8142616767</a></p>
              </div>

              <div className="social-links mt-3">
                <a href="#twitter" title="Twitter"><BsTwitterX /></a>
                <a href="#linkedin" title="LinkedIn"><BsLinkedin /></a>
                <a href="#facebook" title="Facebook"><BsFacebook /></a>
                <a href="#instagram" title="Instagram"><BsInstagram /></a>
                <a href="#github" title="GitHub"><BsGithub /></a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-divider"></div>

          {/* Bottom Copyright */}
          <div className="footer-bottom-row">
            <p className="copyright-text fw-semibold">
              All Copys are rights 2026 @TSAR IT PRIVATE LIMITED
            </p>
            <div className="footer-legal-links d-flex align-items-center gap-3">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security & Compliance</a>
              <a href="#sitemap">Sitemap</a>
              <Link 
                to="/super-admin-login" 
                className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 text-decoration-none d-inline-flex align-items-center gap-1 fw-semibold"
                title="Restricted Super Admin Console"
              >
                <BsShieldLockFill /> Super Admin Login
              </Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
