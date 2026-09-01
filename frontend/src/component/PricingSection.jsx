import React, { useState } from 'react';
import { BsCheck2, BsStars, BsArrowRight, BsShieldCheck, BsLightningChargeFill, BsCurrencyRupee } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';

export default function PricingSection() {
  const navigate = useNavigate();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plans = [
    {
      id: 'trial_15_days',
      name: '15 Days Free Trial',
      tagline: 'Experience the entire enterprise platform with zero upfront commitment.',
      price: 0,
      priceDisplay: '₹ 0',
      duration: '15 Days Access',
      badge: 'FREE TRIAL',
      isPopular: false,
      isTrial: true,
      buttonText: 'Start 15-Day Free Trial',
      buttonClass: 'btn-outline-primary'
    },
    {
      id: 'plan_1_month',
      name: '1 Month Plan',
      tagline: 'Full flexibility with month-to-month billing for all business sizes.',
      price: 500,
      priceDisplay: '₹ 500',
      duration: 'Per Month',
      badge: 'POPULAR',
      isPopular: false,
      isTrial: false,
      buttonText: 'Subscribe via Razorpay',
      buttonClass: 'btn-primary'
    },
    {
      id: 'plan_3_months',
      name: '3 Months Plan',
      tagline: 'Quarterly billing plan offering cost savings and seamless continuity.',
      price: 1400,
      priceDisplay: '₹ 1,400',
      duration: 'For 3 Months',
      savings: 'Save ₹100',
      badge: 'QUARTERLY',
      isPopular: false,
      isTrial: false,
      buttonText: 'Subscribe via Razorpay',
      buttonClass: 'btn-primary'
    },
    {
      id: 'plan_6_months',
      name: '6 Months Plan',
      tagline: 'Semi-annual plan designed for growing retail and wholesale businesses.',
      price: 2700,
      priceDisplay: '₹ 2,700',
      duration: 'For 6 Months',
      savings: 'Save ₹300',
      badge: 'SEMI-ANNUAL',
      isPopular: false,
      isTrial: false,
      buttonText: 'Subscribe via Razorpay',
      buttonClass: 'btn-primary'
    },
    {
      id: 'plan_1_year',
      name: '1 Year Plan',
      tagline: 'Annual commitment with 2 months free savings and priority onboarding.',
      price: 5000,
      priceDisplay: '₹ 5,000',
      duration: 'For 1 Year',
      savings: 'Save ₹1,000',
      badge: 'BEST VALUE',
      isPopular: true,
      isTrial: false,
      buttonText: 'Subscribe via Razorpay',
      buttonClass: 'btn-primary'
    },
    {
      id: 'plan_2_years',
      name: '2 Years Enterprise Plan',
      tagline: 'Maximum stability with VIP dedicated support and custom cloud setup.',
      price: 25000,
      priceDisplay: '₹ 25,000',
      duration: 'For 2 Years',
      savings: 'Enterprise Cloud Instance',
      badge: 'VIP ENTERPRISE',
      isPopular: false,
      isTrial: false,
      buttonText: 'Subscribe via Razorpay',
      buttonClass: 'btn-dark'
    }
  ];

  // Every single plan includes ALL features
  const allFeatures = [
    'Unlimited GST Sales & Purchase Tax Invoices',
    'High-Speed Touch POS Billing & Thermal Printing',
    'All Sectors (Agro, Garments, Electronics IMEI, Transport, Supermarkets)',
    'Android Mobile App & Real-Time Offline Auto-Sync',
    'Direct Government E-Invoicing & E-Way Bill Portal Sync',
    'Multi-Godown / Warehouse Inventory & Stock Transfers',
    'Double-Entry Accounting, Profit & Loss & Balance Sheet',
    'Statutory Indian GST Returns (GSTR-1, GSTR-2B, GSTR-3B)',
    'Staff Attendance Ledger & Automated Payroll Slips',
    'Automated WhatsApp Bot & Transactional Email Receipts',
    'Raki AI Autonomous Business & Support Copilot',
    'Unlimited Items, Customers, Suppliers & Invoices'
  ];

  const handlePlanAction = (plan) => {
    if (plan.isTrial) {
      navigate('/register');
    } else {
      setSelectedPlanForCheckout(plan);
      setIsModalOpen(true);
    }
  };

  return (
    <section className="pricing-section py-5" id="pricing" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="container py-4">
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-bold text-uppercase mb-2">
            TRANSPARENT ALL-INCLUSIVE PRICING
          </span>
          <h2 className="display-6 fw-bold text-dark mb-2">
            100% Features Available in <span className="text-primary">Every Plan</span>
          </h2>
          <p className="lead text-muted fs-6 mx-auto mb-3" style={{ maxWidth: "700px" }}>
            No feature locks. Start with our <strong>15-day free trial</strong> or choose your billing tenure with instant <strong>Razorpay</strong> activation.
          </p>

          <div className="alert alert-success d-inline-flex align-items-center gap-2 py-2 px-4 shadow-sm border-0 rounded-pill">
            <BsShieldCheck className="text-success fs-5" />
            <span className="fw-semibold small">
              Every plan includes ALL Enterprise, POS, Mobile App, GST & Raki AI features.
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="row g-4 mb-5">
          {plans.map((plan) => (
            <div key={plan.id} className="col-12 col-md-6 col-lg-4">
              <div className={`card h-100 border rounded-4 shadow-sm p-4 bg-white position-relative ${plan.isPopular ? 'border-primary border-2' : ''}`}>
                {plan.badge && (
                  <span className={`position-absolute top-0 end-0 m-3 badge ${plan.isPopular ? 'bg-primary' : plan.isTrial ? 'bg-success' : 'bg-light text-dark border'} px-3 py-1 fw-bold`}>
                    {plan.badge}
                  </span>
                )}

                <h4 className="fw-bold text-dark mb-1">{plan.name}</h4>
                <p className="text-muted small mb-3" style={{ minHeight: "38px" }}>{plan.tagline}</p>

                {/* Price Display */}
                <div className="p-3 bg-light rounded-3 text-center mb-3 border">
                  <h2 className="fw-bold text-primary mb-0">{plan.priceDisplay}</h2>
                  <span className="text-muted small fw-semibold">{plan.duration}</span>
                  {plan.savings && (
                    <div className="text-success small fw-bold mt-1">{plan.savings}</div>
                  )}
                </div>

                {/* Feature Checklist */}
                <h6 className="small fw-bold text-muted text-uppercase mb-2">All Features Included:</h6>
                <ul className="list-unstyled small mb-4 d-flex flex-column gap-2">
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span><strong>GST Invoicing</strong> & POS Counter</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span><strong>Android Mobile App</strong> with Auto-Sync</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span><strong>All Sectors</strong> (Agro, Garments, Electronics)</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span><strong>Double-Entry Accounting</strong> & GSTR-1/3B</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span><strong>WhatsApp Bot</strong> & Raki AI Copilot</span>
                  </li>
                </ul>

                {/* Button Action */}
                <div className="mt-auto">
                  <button 
                    className={`btn ${plan.buttonClass} w-100 py-3 fw-bold rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2`}
                    onClick={() => handlePlanAction(plan)}
                  >
                    {plan.buttonText} <BsArrowRight />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Razorpay Trust Banner */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <BsShieldCheck className="text-success fs-3" />
              <div className="text-start">
                <div className="fw-bold small">Official Razorpay Partner</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>UPI, Cards, NetBanking, QR</div>
              </div>
            </div>
            <div className="vr d-none d-md-block"></div>
            <div className="d-flex align-items-center gap-2">
              <BsLightningChargeFill className="text-warning fs-3" />
              <div className="text-start">
                <div className="fw-bold small">Instant Plan Activation</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Immediate unlocking of all modules</div>
              </div>
            </div>
            <div className="vr d-none d-md-block"></div>
            <div className="d-flex align-items-center gap-2">
              <BsStars className="text-primary fs-3" />
              <div className="text-start">
                <div className="fw-bold small">15-Day Free Trial</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>100% Risk-Free Guarantee</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlanForCheckout}
      />
    </section>
  );
}
