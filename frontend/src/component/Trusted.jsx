import React from "react";
import { 
  BsShieldCheck, 
  BsPatchCheckFill, 
  BsBuildingCheck, 
  BsHeadset, 
  BsStarFill,
  BsFileEarmarkLock2Fill
} from "react-icons/bs";

export default function Trusted() {
  const metrics = [
    { number: "100,000+", label: "Verified GST Businesses", sub: "Pan India Presence" },
    { number: "₹ 850 Cr+", label: "Monthly GST Invoicing Volume", sub: "Zero Downtime Recorded" },
    { number: "99.99%", label: "Cloud Uptime & POS Sync", sub: "Tier-4 Bank Grade Cloud" },
    { number: "4.9 / 5.0", label: "Merchant Trust Rating", sub: "Over 22,000+ Reviews" },
  ];

  const highlights = [
    { 
      icon: <BsPatchCheckFill className="text-primary" />, 
      title: "Government Verified", 
      subtitle: "NIC GSP / ASP e-Way & e-Invoicing Direct API" 
    },
    { 
      icon: <BsShieldCheck className="text-success" />, 
      title: "Statutory 100% Tax Accuracy", 
      subtitle: "Dual Rule Validation (CGST/SGST/IGST & Cess)" 
    },
    { 
      icon: <BsFileEarmarkLock2Fill className="text-warning" />, 
      title: "256-Bit Vault Storage", 
      subtitle: "Daily automated encrypted ledger snapshots" 
    },
    { 
      icon: <BsHeadset className="text-danger" />, 
      title: "Dedicated CA Helpdesk", 
      subtitle: "Chartered Accountant & tax audit assistance" 
    },
  ];

  return (
    <section className="trusted-section">
      <div className="container">
        {/* Real-time Enterprise Metrics Bar */}
        <div className="trusted-metrics-bar shadow-sm">
          {metrics.map((m, i) => (
            <div key={i} className="trusted-metric-item">
              <h3 className="metric-number">{m.number}</h3>
              <p className="metric-desc">{m.label}</p>
              <span className="metric-sub">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* Enterprise Accreditations & Badges */}
        <div className="trusted-badges-grid mt-4">
          {highlights.map((b, i) => (
            <div key={i} className="trusted-badge-card">
              <div className="badge-icon-wrap">{b.icon}</div>
              <div className="badge-text-wrap">
                <h5 className="badge-title">{b.title}</h5>
                <p className="badge-subtitle">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
