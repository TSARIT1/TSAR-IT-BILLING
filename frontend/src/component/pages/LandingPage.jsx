import React from "react";
import NavbarV6 from "../NavbarV6";
import HeroV6 from "../HeroV6";
import AppShowcaseV6 from "../AppShowcaseV6";
import { HowItWorks, Testimonials, Faq, CtaBanner } from "../SectionsV6";
import { BrandStrip, Industries, RealTime, Compare } from "../SectionsV7";
import FeaturesShowcase from "../FeaturesShowcase";
import PricingSection from "../PricingSection";
import Footer from "../Footer";
import "../style.css";
import "../landing-v6.css";

export default function LandingPage() {
  return (
    <div className="landing-page-wrapper" style={{ background: "var(--tsg-paper, #faf6f4)" }}>
      <NavbarV6 />
      <main>
        <HeroV6 />
        <BrandStrip />
        <MetricsBand />
        <HowItWorks />
        <Industries />
        <FeaturesShowcase />
        <RealTime />
        <AppShowcaseV6 />
        <Testimonials />
        <Compare />
        <Faq />
        <PricingSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

/* Dark burgundy-night metrics band sitting right under the hero */
function MetricsBand() {
  const metrics = [
    { number: "1,00,000+", label: "GST businesses", sub: "Pan-India presence" },
    { number: "₹850 Cr+", label: "Monthly invoicing volume", sub: "Zero downtime recorded" },
    { number: "99.99%", label: "Cloud uptime & POS sync", sub: "Tier-4 bank-grade cloud" },
    { number: "4.9 / 5.0", label: "Merchant trust rating", sub: "22,000+ verified reviews" },
  ];

  return (
    <section className="tsg-metrics">
      <div className="tsg-metrics-inner">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="tsg-metric-num">{m.number}</div>
            <div className="tsg-metric-label">{m.label}</div>
            <div className="tsg-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
