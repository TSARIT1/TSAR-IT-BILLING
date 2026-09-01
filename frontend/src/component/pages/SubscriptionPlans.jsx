import React, { useState } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsShieldCheck, 
  BsStars, 
  BsCheck2, 
  BsArrowRight, 
  BsCreditCardFill, 
  BsLightningChargeFill,
  BsClockHistory,
  BsCheckCircleFill
} from "react-icons/bs";
import RazorpayCheckoutModal from "../RazorpayCheckoutModal";

export default function SubscriptionPlans() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(
    localStorage.getItem("userPlan") || "15 Days Free Trial"
  );

  const plans = [
    {
      id: "plan_1_month",
      name: "1 Month Plan",
      tagline: "Monthly billing for full enterprise flexibility.",
      price: 500,
      priceDisplay: "₹ 500",
      duration: "1 Month Validity",
      savings: "Standard Rate",
      badge: "MONTHLY",
      isPopular: false
    },
    {
      id: "plan_3_months",
      name: "3 Months Plan",
      tagline: "Quarterly subscription plan with cost savings.",
      price: 1400,
      priceDisplay: "₹ 1,400",
      duration: "3 Months Validity",
      savings: "Save ₹100",
      badge: "QUARTERLY",
      isPopular: false
    },
    {
      id: "plan_6_months",
      name: "6 Months Plan",
      tagline: "Semi-annual plan designed for growing businesses.",
      price: 2700,
      priceDisplay: "₹ 2,700",
      duration: "6 Months Validity",
      savings: "Save ₹300",
      badge: "SEMI-ANNUAL",
      isPopular: false
    },
    {
      id: "plan_1_year",
      name: "1 Year Plan",
      tagline: "Annual commitment with 2 months free savings.",
      price: 5000,
      priceDisplay: "₹ 5,000",
      duration: "1 Year Validity",
      savings: "Save ₹1,000",
      badge: "BEST VALUE",
      isPopular: true
    },
    {
      id: "plan_2_years",
      name: "2 Years Enterprise Plan",
      tagline: "VIP dedicated support with custom cloud deployment.",
      price: 25000,
      priceDisplay: "₹ 25,000",
      duration: "2 Years Validity",
      savings: "Enterprise Cloud Instance",
      badge: "VIP ENTERPRISE",
      isPopular: false
    }
  ];

  const handleOpenRazorpay = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <PortalLayout title="Subscription & License Plans">
      <div className="container-fluid p-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <BsCreditCardFill className="text-primary" /> Subscription & Plan Management
            </h4>
            <p className="text-muted small mb-0">15-day free trial active • 100% enterprise features available in all plans</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
              <BsCheckCircleFill className="me-1" /> Active Plan: {currentPlan}
            </span>
          </div>
        </div>

        {/* Current Plan Overview Alert */}
        <div className="alert alert-primary d-flex flex-wrap justify-content-between align-items-center rounded-3 p-3 shadow-sm border-0 mb-4 bg-primary text-white">
          <div className="d-flex align-items-center gap-3">
            <BsLightningChargeFill className="fs-1 text-warning" />
            <div>
              <h6 className="fw-bold text-white mb-0">Full Enterprise Access Unlocked</h6>
              <span className="small text-white-50">All modules (GST, POS, Mobile App, All Sectors & Raki AI) are enabled without restrictions.</span>
            </div>
          </div>
          <div className="d-flex gap-2 mt-2 mt-md-0">
            <span className="badge bg-white text-primary px-3 py-2 fw-bold d-flex align-items-center gap-1">
              <BsClockHistory /> 15 Days Free Trial Active
            </span>
          </div>
        </div>

        {/* Plan Upgrade Cards */}
        <div className="row g-4 mb-4">
          {plans.map((plan) => (
            <div key={plan.id} className="col-12 col-md-6 col-xl-4">
              <div className={`card h-100 border rounded-4 shadow-sm p-4 bg-white position-relative ${plan.isPopular ? 'border-primary border-2' : ''}`}>
                <span className={`position-absolute top-0 end-0 m-3 badge ${plan.isPopular ? 'bg-primary' : 'bg-light text-dark border'} px-3 py-1 fw-bold`}>
                  {plan.badge}
                </span>

                <h5 className="fw-bold text-dark mb-1">{plan.name}</h5>
                <p className="text-muted small mb-3">{plan.tagline}</p>

                <div className="p-3 bg-light rounded-3 text-center mb-3 border">
                  <h2 className="fw-bold text-primary mb-0">{plan.priceDisplay}</h2>
                  <span className="text-muted small fw-semibold">{plan.duration}</span>
                  {plan.savings && (
                    <div className="text-success small fw-bold mt-1">{plan.savings}</div>
                  )}
                </div>

                <h6 className="small fw-bold text-muted text-uppercase mb-2">Features Included:</h6>
                <ul className="list-unstyled small mb-4 d-flex flex-column gap-2">
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span>Unlimited GST & POS Invoicing</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span>Android Mobile App Auto-Sync</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span>All Indian Business Sectors</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span>Double-Entry Reports & GSTR-1/3B</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <BsCheck2 className="text-success fw-bold" />
                    <span>Raki AI Copilot & WhatsApp Bot</span>
                  </li>
                </ul>

                <button 
                  className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-outline-primary'} w-100 py-3 fw-bold rounded-3 shadow-sm mt-auto d-flex align-items-center justify-content-center gap-2`}
                  onClick={() => handleOpenRazorpay(plan)}
                >
                  Pay with Razorpay <BsArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Transaction History Table */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <BsClockHistory className="text-primary" /> Plan Transaction & Billing History
            </h5>
            <span className="badge bg-light text-secondary border px-3 py-2">
              Auto-Renew: Active
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase">Txn Reference</th>
                  <th className="small text-muted text-uppercase">Plan Tier</th>
                  <th className="small text-muted text-uppercase">Amount Paid</th>
                  <th className="small text-muted text-uppercase">Payment Method</th>
                  <th className="small text-muted text-uppercase">Billing Date</th>
                  <th className="small text-muted text-uppercase">Valid Until</th>
                  <th className="small text-muted text-uppercase">Status</th>
                  <th className="small text-muted text-uppercase text-end">Invoice Slip</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-bold text-primary font-monospace">TXN_RZP_998124</td>
                  <td><strong>Enterprise Annual (1 Year)</strong></td>
                  <td className="fw-bold">₹ 5,000.00</td>
                  <td>UPI (Google Pay)</td>
                  <td>15 Aug 2026</td>
                  <td>15 Aug 2027</td>
                  <td>
                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                      <BsCheckCircleFill className="me-1" /> Active
                    </span>
                  </td>
                  <td className="text-end">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => alert('Downloading GST Tax Invoice for TXN_RZP_998124...')}
                    >
                      Receipt PDF
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold text-secondary font-monospace">TXN_RZP_441209</td>
                  <td>Standard (3 Months)</td>
                  <td className="fw-bold">₹ 1,400.00</td>
                  <td>Credit Card (HDFC)</td>
                  <td>15 May 2026</td>
                  <td>15 Aug 2026</td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary fw-bold px-2 py-1 rounded-pill">
                      Expired
                    </span>
                  </td>
                  <td className="text-end">
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => alert('Downloading GST Tax Invoice for TXN_RZP_441209...')}
                    >
                      Receipt PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Razorpay Trust Banner */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <BsShieldCheck className="text-success fs-3" />
              <div className="text-start">
                <div className="fw-bold small">Official Razorpay Integration</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>UPI (GPay, PhonePe, Paytm), Cards, NetBanking</div>
              </div>
            </div>
            <div className="vr d-none d-md-block"></div>
            <div className="d-flex align-items-center gap-2">
              <BsLightningChargeFill className="text-warning fs-3" />
              <div className="text-start">
                <div className="fw-bold small">Instant Activation</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Automated subscription provisioning</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay Modal */}
      <RazorpayCheckoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </PortalLayout>
  );
}
