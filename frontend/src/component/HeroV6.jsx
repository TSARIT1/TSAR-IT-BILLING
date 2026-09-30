import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsRocketTakeoffFill,
  BsAndroid2,
  BsPrinter,
  BsQrCodeScan,
  BsLightningChargeFill,
  BsShieldCheck,
} from "react-icons/bs";
import tsarItLogo from "../asstes/tsar_it_logo.jpg";

const APK = "/downloads/TSAR-IT-Billing-v4.14.14.apk";

export default function HeroV6() {
  const navigate = useNavigate();

  // Live-feel counters for the invoice panel
  const [revenue, setRevenue] = useState(184250);
  const [bills, setBills] = useState(48);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevenue((p) => p + Math.floor(Math.random() * 1200 + 450));
      setBills((p) => p + 1);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="tsg-hero">
      <div className="tsg-hero-inner">
        {/* ---------- Left: story ---------- */}
        <div>
          <div className="tsg-hero-badge">
            <span className="pill">New</span>
            GST Billing · POS · Multi-Godown · Android App
          </div>

          <h1>
            Run your entire shop from <em>one counter</em>.
          </h1>

          <p className="tsg-lead">
            TSAR IT Billing turns any phone or PC into a complete GST billing desk —
            audit-ready invoices in seconds, live stock across godowns, thermal
            printing from the app, and a ledger your CA will love.
          </p>

          <div className="tsg-hero-actions">
            <button className="tsg-btn tsg-btn-primary" onClick={() => navigate("/register")}>
              <BsRocketTakeoffFill /> Start 15-Day Free Trial
            </button>
            <a className="tsg-btn tsg-btn-ghost" href={APK} download>
              <BsAndroid2 className="text-success" /> Get the Android App
            </a>
          </div>

          <div className="tsg-hero-note">
            <span><BsShieldCheck style={{ color: "var(--tsg-gold)" }} /> No credit card required</span>
            <span className="dot">•</span>
            <span>Set up in under 10 minutes</span>
            <span className="dot">•</span>
            <span>Free onboarding &amp; data import</span>
          </div>

          <div className="tsg-hero-proof">
            <div className="faces">
              {[
                { i: "RS", c: "#7c1e2e" },
                { i: "MK", c: "#a87620" },
                { i: "AP", c: "#40111f" },
                { i: "NV", c: "#9c3d52" },
              ].map((f) => (
                <span key={f.i} className="face" style={{ background: f.c }}>{f.i}</span>
              ))}
            </div>
            <div className="proof-text">
              <span className="tsg-stars">★★★★★</span>
              <strong> 4.9/5</strong> from 22,000+ merchants across India
            </div>
          </div>
        </div>

        {/* ---------- Right: live invoice panel ---------- */}
        <div className="tsg-hero-visual">
          <div className="tsg-invoice-panel">
            <div className="tsg-invoice-head">
              <div className="inv-brand">
                <img src={tsarItLogo} alt="TSAR IT" />
                Tax Invoice
              </div>
              <span className="inv-status paid-dot">Paid via UPI</span>
            </div>

            <div className="tsg-invoice-body">
              <div className="inv-meta">
                <span>No. <strong>#TSAR-2026-104</strong></span>
                <span>Shri Krishna Enterprise</span>
                <span>GSTIN 36AABCU9603R1ZM</span>
              </div>

              <table className="tsg-inv-table">
                <thead>
                  <tr>
                    <th>Item / HSN</th>
                    <th>Qty</th>
                    <th className="num">Rate</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cisco SG350 Switch <span className="muted">(8517)</span></td>
                    <td>2 pcs</td>
                    <td className="num">₹28,500</td>
                    <td className="num">₹57,000.00</td>
                  </tr>
                  <tr>
                    <td>Thermal Paper 80mm <span className="muted">(4811)</span></td>
                    <td>50 rolls</td>
                    <td className="num">₹65</td>
                    <td className="num">₹3,250.00</td>
                  </tr>
                  <tr>
                    <td>Barcode Scanner 2D <span className="muted">(8471)</span></td>
                    <td>1 pc</td>
                    <td className="num">₹4,750</td>
                    <td className="num">₹4,750.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="tsg-inv-totals">
                <div className="row"><span>Taxable Amount</span><span>₹65,000.00</span></div>
                <div className="row"><span>CGST (9%) + SGST (9%)</span><span>₹11,700.00</span></div>
                <div className="row grand"><span>Grand Total</span><span className="gold">₹76,700.00</span></div>
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <div className="tsg-float-chip chip-tl">
            <span className="chip-icon ci-gold"><BsPrinter /></span>
            <span>80mm / 58mm print<small>Bluetooth thermal ready</small></span>
          </div>
          <div className="tsg-float-chip chip-br">
            <span className="chip-icon ci-bur"><BsQrCodeScan /></span>
            <span>e-Invoice &amp; e-Way ready<small>IRN + QR auto-attached</small></span>
          </div>
        </div>
      </div>

      {/* bottom gradient seam into metrics band */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: "var(--tsg-line)" }} />
    </section>
  );
}
