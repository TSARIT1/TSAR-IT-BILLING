import React from "react";
import { Link } from "react-router-dom";
import {
  BsShop,
  BsTruck,
  BsCupHot,
  BsCapsule,
  BsBagCheck,
  BsPhone,
  BsTree,
  BsWrench,
  BsBullseye,
  BsArrowRight,
  BsActivity,
  BsCloudCheckFill,
  BsBellFill,
  BsFileEarmarkTextFill,
  BsPeopleFill,
  BsGraphUpArrow,
  BsPrinterFill,
  BsCheck2,
  BsX,
  BsDash,
  BsStars,
} from "react-icons/bs";
import billbookLogo from "../asstes/billbook.png";

/* ================= BRAND STRIP (product identity + image) ================= */
export function BrandStrip() {
  return (
    <section className="tsg-brandstrip">
      <div className="container">
        <div className="tsg-brandstrip-card">
          <img src={billbookLogo} alt="Tsar IT BillingBook" className="tsg-brandstrip-logo" />
          <div className="tsg-brandstrip-copy">
            <h3>Meet BillingBook — our flagship billing product</h3>
            <p>
              The same engine that powers TSAR IT Billing on the web, on your counter,
              and in your pocket. One brand, one ledger, every device.
            </p>
          </div>
          <Link to="/features" className="tsg-btn tsg-btn-ghost">
            Explore the platform <BsArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================= INDUSTRIES (SME / SMB focus) ================= */
export function Industries() {
  const items = [
    {
      icon: <BsShop />, name: "Retail Shops",
      points: ["Fast counter POS with barcode scan", "Daily sales & cash reconciliation"],
    },
    {
      icon: <BsTruck />, name: "Wholesale & Distribution",
      points: ["Multi-godown stock & transfers", "Party-wise credit limits and dues"],
    },
    {
      icon: <BsCupHot />, name: "Restaurants & QSR",
      points: ["Quick KOT-style billing", "UPI, cash & split payments"],
    },
    {
      icon: <BsCapsule />, name: "Pharmacy & Medical",
      points: ["Batch & expiry tracking", "GST schedules with HSN codes"],
    },
    {
      icon: <BsBagCheck />, name: "Garments & Apparel",
      points: ["Size/colour-wise stock", "Season-wise discounts & returns"],
    },
    {
      icon: <BsPhone />, name: "Electronics & Mobile",
      points: ["IMEI / serial-number tracking", "Warranty-ready purchase entries"],
    },
    {
      icon: <BsTree />, name: "Agro & Seeds",
      points: ["Lot-wise inventory", "Mandi-style quick purchase bills"],
    },
    {
      icon: <BsWrench />, name: "Hardware & Electricals",
      points: ["Unit conversions (pcs/box/kg)", "Low-stock reorder alerts"],
    },
  ];

  return (
    <section className="tsg-section" id="industries">
      <div className="container">
        <div className="text-center">
          <span className="tsg-kicker">Made for small &amp; medium business</span>
          <h2 className="tsg-display mt-3" style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
            Built for the way India's <span className="tsg-gold-underline">SMEs</span> actually work
          </h2>
          <p className="tsg-lead mx-auto mt-3" style={{ maxWidth: "62ch" }}>
            We designed every screen for shop owners, not accountants. Whether you run
            one counter or ten godowns, the workflows below are ready on day one.
          </p>
        </div>

        <div className="tsg-ind-grid">
          {items.map((it) => (
            <div className="tsg-ind-card" key={it.name}>
              <span className="ind-icon">{it.icon}</span>
              <h5>{it.name}</h5>
              <ul>
                {it.points.map((p) => (
                  <li key={p}><BsCheck2 className="ind-check" /> {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= REAL-TIME FEATURES ================= */
export function RealTime() {
  const feats = [
    { icon: <BsCloudCheckFill />, t: "Live stock sync", d: "Web, Android and POS always show the same stock — the second a bill is made." },
    { icon: <BsActivity />, t: "Instant invoice PDF & share", d: "Bills render as branded PDFs and reach customers on WhatsApp instantly." },
    { icon: <BsBellFill />, t: "Low-stock & dues alerts", d: "Dashboard warns you before an item runs out or a payment goes overdue." },
    { icon: <BsGraphUpArrow />, t: "Live P&L & cashflow", d: "Today's sales, expenses and profit update with every transaction." },
    { icon: <BsFileEarmarkTextFill />, t: "Always-on CA audit trail", d: "Every create/edit/delete is recorded with who, when and how much." },
    { icon: <BsPrinterFill />, t: "Instant thermal printing", d: "80mm/58mm Bluetooth printers print the bill the moment it's saved." },
    { icon: <BsPeopleFill />, t: "Multi-staff, multi-device", d: "Owners and cashiers work in parallel — entries sync in real time." },
    { icon: <BsBullseye />, t: "Offline-first counter", d: "Internet down? Keep billing. Everything syncs the moment you're back." },
  ];

  const feed = [
    { t: "10:42:18", e: "SALE", d: "INV #1042 — Shri Krishna Ent. — ₹12,400", c: "green" },
    { t: "10:42:21", e: "SYNC", d: "Stock updated: Cisco Switch 34 → 32", c: "gold" },
    { t: "10:43:02", e: "PAYMENT", d: "UPI received ₹5,000 — Meena Traders", c: "green" },
    { t: "10:44:47", e: "ALERT", d: "Thermal Paper 80mm below reorder level", c: "red" },
    { t: "10:45:10", e: "AUDIT", d: "Staff Ramesh edited party phone number", c: "grey" },
    { t: "10:46:33", e: "PRINT", d: "80mm receipt printed — Counter 1", c: "gold" },
  ];

  return (
    <section className="tsg-section tsg-rt" id="realtime">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5">
            <span className="tsg-kicker">Real-time, not end-of-day</span>
            <h2 className="tsg-display mt-3" style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.5rem)" }}>
              Your books move as fast as your counter
            </h2>
            <p className="tsg-lead mt-3" style={{ maxWidth: "48ch" }}>
              No "sync tonight". Every bill, payment, stock change and alert lands across
              all your devices the moment it happens — with a live event stream you can
              watch from the dashboard.
            </p>

            <div className="tsg-rt-feats mt-4">
              {feats.map((f) => (
                <div className="tsg-rt-feat" key={f.t}>
                  <span className="rt-icon">{f.icon}</span>
                  <span>
                    <strong>{f.t}</strong>
                    <small>{f.d}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="tsg-rt-panel">
              <div className="rt-head">
                <span className="rt-live-dot" /> Live business stream
                <span className="rt-badge">real-time</span>
              </div>
              <div className="rt-body">
                {feed.map((f, i) => (
                  <div className="rt-row" key={i} style={{ animationDelay: `${i * 0.55}s` }}>
                    <span className="rt-time">{f.t}</span>
                    <span className={`rt-ev rt-${f.c}`}>{f.e}</span>
                    <span className="rt-desc">{f.d}</span>
                  </div>
                ))}
                <div className="rt-row rt-ghost" aria-hidden="true">
                  <span className="rt-time">··:··:··</span>
                  <span className="rt-ev">···</span>
                  <span className="rt-desc">waiting for the next event…</span>
                </div>
              </div>
              <div className="rt-foot">
                <BsStars className="text-warning" /> Powered by TSAR cloud — 99.99% uptime, bank-grade encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= COMPETITOR COMPARISON ================= */
export function Compare() {
  const rows = [
    { f: "Unlimited GST invoices on every plan", tsar: "yes", a: "partial", b: "no", c: "partial" },
    { f: "Multi-godown inventory included", tsar: "yes", a: "no", b: "partial", c: "partial" },
    { f: "Offline-first Android billing", tsar: "yes", a: "partial", b: "partial", c: "no" },
    { f: "Bluetooth thermal printing from the app", tsar: "yes", a: "yes", b: "yes", c: "yes" },
    { f: "Built-in CA audit log (who/when/what)", tsar: "yes", a: "no", b: "partial", c: "partial" },
    { f: "All fields optional — never blocked mid-sale", tsar: "yes", a: "no", b: "no", c: "no" },
    { f: "One transparent price — no feature gates", tsar: "yes", a: "no", b: "no", c: "partial" },
    { f: "Free data import assistance (Tally/Excel)", tsar: "yes", a: "partial", b: "partial", c: "partial" },
    { f: "e-Invoice (IRN) & e-Way bill generation", tsar: "yes", a: "yes", b: "yes", c: "yes" },
    { f: "Direct enterprise phone support", tsar: "yes", a: "partial", b: "partial", c: "yes" },
  ];

  const Cell = ({ v }) =>
    v === "yes" ? (
      <span className="cmp-yes"><BsCheck2 /> Yes</span>
    ) : v === "partial" ? (
      <span className="cmp-part"><BsDash /> Partial / add-on</span>
    ) : (
      <span className="cmp-no"><BsX /> No</span>
    );

  return (
    <section className="tsg-section" id="compare" style={{ background: "var(--tsg-paper)" }}>
      <div className="container">
        <div className="text-center">
          <span className="tsg-kicker">Honest comparison</span>
          <h2 className="tsg-display mt-3" style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
            How TSAR IT Billing compares
          </h2>
          <p className="tsg-lead mx-auto mt-3" style={{ maxWidth: "60ch" }}>
            We respect our competitors — they built this category. But we built for the
            shop owner who hates paywalls and blocked screens. Here's the plain truth.
          </p>
        </div>

        <div className="tsg-cmp-wrap">
          <table className="tsg-cmp">
            <thead>
              <tr>
                <th className="cmp-feat-col">Capability</th>
                <th className="cmp-us">TSAR IT Billing</th>
                <th>myBillBook</th>
                <th>Vyapar</th>
                <th>Desktop GST suites</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.f}>
                  <td className="cmp-feat-col">{r.f}</td>
                  <td className="cmp-us"><Cell v={r.tsar} /></td>
                  <td><Cell v={r.a} /></td>
                  <td><Cell v={r.b} /></td>
                  <td><Cell v={r.c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-4">
          <Link to="/register" className="tsg-btn tsg-btn-primary">
            Switch in one evening — free import help <BsArrowRight />
          </Link>
          <div className="mt-2 small text-muted">Competitor names are trademarks of their owners; comparison reflects publicly available information.</div>
        </div>
      </div>
    </section>
  );
}
