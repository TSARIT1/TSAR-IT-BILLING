import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import PricingSection from '../PricingSection';
import { BsShieldCheck, BsHeadset, BsArrowRepeat, BsCheckCircleFill, BsQuestionCircleFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const faqs = [
    {
      q: "Can I try TSAR IT Billing without paying anything upfront?",
      a: "Yes! Every new registration starts with a full-featured 15-Day Free Trial. No credit card or advance payment is required. You get unlimited access to GST invoicing, POS counter billing, multi-godown stock, and staff payroll."
    },
    {
      q: "Does any plan lock out certain features or modules?",
      a: "No. Unlike other billing software, we do NOT lock features behind expensive tiers. Every paid plan gives you 100% access to all current and future features including e-Invoicing, e-Way bills, multi-user access, and Android mobile sync."
    },
    {
      q: "How does payment through Razorpay work?",
      a: "When you choose any subscription plan, our integrated Razorpay checkout opens directly on your screen. You can securely pay using UPI (Google Pay, PhonePe, Paytm), Net Banking (50+ banks), Debit/Credit Cards, or Wallets. Your subscription activates instantly upon payment confirmation."
    },
    {
      q: "Can I migrate my existing customer and item records from Excel or Tally?",
      a: "Absolutely. Our platform has a built-in 1-click Excel/CSV import tool for products, inventory stock, and customer ledgers. Our support team can also assist with automated migration from Tally, Marg, or Vyapar at zero extra cost."
    },
    {
      q: "What happens when my subscription period ends?",
      a: "Your data remains completely safe and accessible in read-only mode so you can export invoices or verify audit reports at any time. You can renew your subscription whenever you are ready."
    }
  ];

  return (
    <div className="pricing-page-wrapper">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-dark text-white py-5" style={{ paddingTop: '110px' }}>
        <div className="container text-center py-4">
          <span className="badge bg-primary px-3 py-2 text-uppercase fw-bold mb-3">
            CLEAR & TRANSPARENT PRICING
          </span>
          <h1 className="display-5 fw-bold text-white mb-3">
            Simple, All-Inclusive Plans for <span className="text-primary">Every Business</span>
          </h1>
          <p className="lead text-light text-opacity-75 mx-auto mb-2" style={{ maxWidth: '680px', fontSize: '1.1rem' }}>
            No hidden charges, no per-invoice transaction fees, and no feature gates. Select your preferred tenure and start billing immediately.
          </p>
        </div>
      </section>

      {/* Main Pricing Section Component (Razorpay Integrated) */}
      <main>
        <PricingSection />
      </main>

      {/* Value Trust Guarantees */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-2">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <BsShieldCheck className="text-success display-5 mb-3" />
                <h5 className="fw-bold mb-2">100% Money-Back Guarantee</h5>
                <p className="text-muted small mb-0">
                  If you are not satisfied within your first 15 days of paid usage, our support team will refund your payment with zero questions asked.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <BsHeadset className="text-primary display-5 mb-3" />
                <h5 className="fw-bold mb-2">Free Dedicated Onboarding</h5>
                <p className="text-muted small mb-0">
                  Our accounting product specialists will walk you through your initial setup, configure your GST format, and import your inventory data.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <BsArrowRepeat className="text-warning display-5 mb-3" />
                <h5 className="fw-bold mb-2">Continuous Free Upgrades</h5>
                <p className="text-muted small mb-0">
                  All new GST statutory updates, government API changes, and feature enhancements are delivered to your portal automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-3" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-muted">Have a question about subscriptions, payments, or activation?</p>
          </div>

          <div className="accordion d-flex flex-column gap-3" id="pricingFaqAccordion">
            {faqs.map((faq, index) => (
              <div key={index} className="card border rounded-4 shadow-sm p-4 bg-white">
                <h5 className="fw-bold text-dark mb-2 d-flex align-items-start gap-2">
                  <BsQuestionCircleFill className="text-primary flex-shrink-0 mt-1" />
                  {faq.q}
                </h5>
                <p className="text-muted mb-0 ps-4 small" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <p className="text-muted mb-2">Still have questions?</p>
            <Link to="/contact" className="btn btn-outline-primary px-4 py-2 rounded-pill fw-bold">
              Speak with our Billing Specialist
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
