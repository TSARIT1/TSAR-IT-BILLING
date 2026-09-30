import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BsClipboardCheck,
  BsLightningChargeFill,
  BsGraphUpArrow,
  BsChevronDown,
  BsAndroid2,
  BsDownload,
} from "react-icons/bs";

const APK = "/downloads/TSAR-IT-Billing-v4.14.15.apk";

/* ================= HOW IT WORKS ================= */
export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create your business profile",
      body: "Sign up and add your shop's GSTIN, logo, and bank details once. Everything else inherits your branding automatically.",
      meta: "Takes ~3 minutes",
    },
    {
      n: "02",
      title: "Add parties & items",
      body: "Import customers, suppliers, and stock from Excel or Tally — or just start typing. Every field is optional so nothing blocks you mid-sale.",
      meta: "Bulk import ready",
    },
    {
      n: "03",
      title: "Bill, print, and get paid",
      body: "Raise GST invoices from web or the Android app, print on thermal or A4, share on WhatsApp, and track collections from the dashboard.",
      meta: "Paid in days, not weeks",
    },
  ];

  return (
    <section className="tsg-section" id="how-it-works">
      <div className="container">
        <div className="text-center">
          <span className="tsg-kicker">How it works</span>
          <h2 className="tsg-display mt-3" style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
            From zero to first invoice <span className="tsg-gold-underline">today</span>
          </h2>
          <p className="tsg-lead mx-auto mt-3" style={{ maxWidth: "58ch" }}>
            No consultants. No training videos. The app is built so a first-time user
            finishes their first bill within minutes of signing up.
          </p>
        </div>

        <div className="tsg-steps">
          {steps.map((s) => (
            <div className="tsg-step" key={s.n}>
              <span className="step-index">{s.n}</span>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
              <div className="step-meta">{s.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= TESTIMONIALS ================= */
export function Testimonials() {
  const items = [
    {
      quote:
        "We used to close the counter book at 10 pm. Now the day's bills, stock, and collection summary are ready before I lock the shutter. The thermal printing from the app is the feature I never knew I needed this badly.",
      name: "Rakesh Sahu",
      role: "Sahu Electronics & Appliances, Raipur",
      init: "RS",
      color: "#7c1e2e",
    },
    {
      quote:
        "My CA asked for GSTR-1 data and the audit trail in the middle of filing season. Everything was already recorded — who billed what, when, and for how much. Filing took one evening instead of one week.",
      name: "Meera Krishnan",
      role: "Sri Meenakshi Textiles, Madurai",
      init: "MK",
      color: "#a87620",
    },
    {
      quote:
        "Three godowns, one dashboard. Stock transfers that needed a challan book now take one tap. The low-stock alert alone has saved us from losing counter sales twice this quarter.",
      name: "Amit Patel",
      role: "Krishna Agro Distributors, Rajkot",
      init: "AP",
      color: "#40111f",
    },
  ];

  return (
    <section className="tsg-section" style={{ background: "var(--tsg-paper)" }} id="testimonials">
      <div className="container">
        <div className="text-center">
          <span className="tsg-kicker">Loved by merchants</span>
          <h2 className="tsg-display mt-3" style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
            Trusted on counters across India
          </h2>
          <p className="tsg-lead mx-auto mt-3" style={{ maxWidth: "56ch" }}>
            From single-counter retail shops to multi-godown distributors — here's what
            owners say after switching from manual books and legacy software.
          </p>
        </div>

        <div className="tsg-testi-grid">
          {items.map((t) => (
            <figure className="tsg-testi" key={t.init}>
              <span className="quote-mark">“</span>
              <blockquote>{t.quote}</blockquote>
              <figcaption className="who">
                <span className="avatar" style={{ background: t.color }}>{t.init}</span>
                <span>
                  <span className="who-name d-block">{t.name}</span>
                  <span className="who-role">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */
export function Faq() {
  const [open, setOpen] = useState(0);

  const faqs = [
    {
      q: "Is TSAR IT Billing compliant with Indian GST rules?",
      a: "Yes. Invoices carry automatic CGST/SGST/IGST splits with HSN codes, support e-Invoicing (IRN + QR) and e-Way Bills through the government gateway, and map to GSTR-1, GSTR-2B and GSTR-3B reports for filing.",
    },
    {
      q: "Can I use it on my phone without internet?",
      a: "The Android app is offline-first: create bills, print on Bluetooth thermal printers, and scan barcodes with no connectivity. Everything auto-syncs the moment you're back online.",
    },
    {
      q: "What hardware do I need for thermal printing?",
      a: "Any standard 58mm or 80mm Bluetooth ESC/POS thermal printer works. No proprietary hardware is required — the app also prints professional A4/A5 PDFs if you bill from the web.",
    },
    {
      q: "How does pricing work? Are features locked behind plans?",
      a: "Every plan includes all features — invoicing, POS, inventory, godowns, payroll, reports, and the Android app. You only choose the billing duration. Start with a 15-day free trial; no credit card needed.",
    },
    {
      q: "Can my chartered accountant audit my books?",
      a: "Yes. Every invoice, party, item, expense, and staff change is recorded in an append-only audit trail with user, timestamp, and amount — viewable in the app's Audit Log (CA) screen.",
    },
    {
      q: "How do I move my existing data from Tally or Excel?",
      a: "Bulk import is built in for parties and items. Our onboarding team assists with the first import free of charge, and your data stays exportable at any time.",
    },
  ];

  return (
    <section className="tsg-section" id="faq">
      <div className="container">
        <div className="text-center">
          <span className="tsg-kicker">FAQ</span>
          <h2 className="tsg-display mt-3" style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
            Questions, answered straight
          </h2>
        </div>

        <div className="tsg-faq">
          {faqs.map((f, i) => (
            <div className={`tsg-faq-item ${open === i ? "open" : ""}`} key={i}>
              <button className="tsg-faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {f.q}
                <span className="faq-toggle"><BsChevronDown /></span>
              </button>
              <div className="tsg-faq-a">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FINAL CTA BANNER ================= */
export function CtaBanner() {
  return (
    <section className="tsg-section" style={{ paddingTop: 0 }}>
      <div className="tsg-cta-banner">
        <div className="tsg-cta-card">
          <div>
            <h2>Ready to bill like the enterprises do?</h2>
            <p>
              Join 100,000+ Indian businesses invoicing with TSAR IT — free for 15 days,
              your data stays yours, and onboarding is on us.
            </p>
          </div>
          <div className="tsg-cta-actions">
            <Link to="/register" className="tsg-btn tsg-btn-light">
              <BsLightningChargeFill /> Start Free Trial
            </Link>
            <a href={APK} download className="tsg-btn tsg-btn-outline-light">
              <BsDownload /> Download APK
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
