import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsShieldCheck, 
  BsStars, 
  BsCheck2, 
  BsArrowRight, 
  BsCreditCardFill, 
  BsLightningChargeFill,
  BsClockHistory,
  BsCheckCircleFill,
  BsBuilding,
  BsReceipt,
  BsPeopleFill,
  BsArrowRepeat
} from "react-icons/bs";
import RazorpayCheckoutModal from "../RazorpayCheckoutModal";

export default function SubscriptionPlans() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [subData, setSubData] = useState({
    businessId: localStorage.getItem("businessId") || localStorage.getItem("userBusinessId") || "default",
    activePlan: localStorage.getItem("userPlanId") || "trial_15_days",
    planName: localStorage.getItem("userPlan") || "15 Days Free Trial",
    status: "TRIAL",
    isTrialActive: true,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    daysRemaining: parseInt(localStorage.getItem("trialDaysRemaining") || "15", 10),
    amountPaid: 0,
    paymentMethod: "FREE_TRIAL",
    quotas: {
      invoices: { used: 0, max: 1000 },
      godowns: { used: 1, max: 5 },
      users: { used: 1, max: 5 }
    }
  });

  const businessId = localStorage.getItem("businessId") || localStorage.getItem("userBusinessId") || "default";

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/subscriptions/current?businessId=${encodeURIComponent(businessId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSubData(data);
        if (data.planName) {
          localStorage.setItem("userPlan", data.planName);
        }
        if (data.activePlan) {
          localStorage.setItem("userPlanId", data.activePlan);
        }
        if (data.daysRemaining !== undefined) {
          localStorage.setItem("trialDaysRemaining", data.daysRemaining.toString());
        }
      } else if (res.status !== 401 && res.status !== 403) {
        console.warn("Could not fetch remote subscription data, using cached status.");
      }
    } catch (err) {
      console.warn("Could not fetch remote subscription data, using cached:", err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

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
            <p className="text-muted small mb-0">
              Tenant Business ID: <code className="text-primary fw-bold">{businessId}</code> • 100% Enterprise Modules Unlocked
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={fetchSubscription}
              disabled={isLoading}
              title="Refresh Subscription Status"
            >
              <BsArrowRepeat className={isLoading ? "spin" : ""} /> Refresh
            </button>
            <span className={`badge ${subData.status === 'EXPIRED' ? 'bg-danger' : 'bg-success-subtle text-success border border-success-subtle'} px-3 py-2 fw-semibold`}>
              <BsCheckCircleFill className="me-1" /> Active Plan: {subData.planName}
            </span>
          </div>
        </div>

        {/* Current Plan Overview Alert */}
        <div className="alert alert-primary d-flex flex-wrap justify-content-between align-items-center rounded-4 p-4 shadow-sm border-0 mb-4 bg-primary text-white">
          <div className="d-flex align-items-center gap-3">
            <BsLightningChargeFill className="fs-1 text-warning" />
            <div>
              <h5 className="fw-bold text-white mb-1">
                {subData.planName} ({subData.status})
              </h5>
              <span className="small text-white-50">
                Valid until: <strong>{subData.endDate || 'Continuous'}</strong> • All modules (GST, POS Thermal, Android Mobile App, All Sectors & Raki AI Copilot) are active.
              </span>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <span className="badge bg-white text-primary px-3 py-2 fw-bold d-flex align-items-center gap-1 fs-6">
              <BsClockHistory /> {subData.daysRemaining} Days Remaining
            </span>
          </div>
        </div>

        {/* Live Tenant Quotas */}
        {subData.quotas && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2">
                    <BsReceipt className="text-primary fs-5" /> Invoices / Month
                  </span>
                  <span className="badge bg-primary-subtle text-primary fw-bold">
                    {subData.quotas.invoices?.used ?? 0} / {subData.quotas.invoices?.max ?? 1000}
                  </span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ width: `${Math.min(100, (((subData.quotas.invoices?.used ?? 0) / (subData.quotas.invoices?.max || 1000)) * 100))}%` }}
                  />
                </div>
                <div className="d-flex justify-content-between text-muted small mt-2">
                  <span>Usage Quota</span>
                  <span>Unlimited on 1 Year+</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2">
                    <BsBuilding className="text-success fs-5" /> Godowns / Warehouses
                  </span>
                  <span className="badge bg-success-subtle text-success fw-bold">
                    {subData.quotas.godowns?.used ?? 1} / {subData.quotas.godowns?.max ?? 5}
                  </span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${Math.min(100, (((subData.quotas.godowns?.used ?? 1) / (subData.quotas.godowns?.max || 5)) * 100))}%` }}
                  />
                </div>
                <div className="d-flex justify-content-between text-muted small mt-2">
                  <span>Main Godown active</span>
                  <span>Multi-location sync</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2">
                    <BsPeopleFill className="text-info fs-5" /> Operators / Users
                  </span>
                  <span className="badge bg-info-subtle text-info fw-bold">
                    {subData.quotas.users?.used ?? 1} / {subData.quotas.users?.max ?? 5}
                  </span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: `${Math.min(100, (((subData.quotas.users?.used ?? 1) / (subData.quotas.users?.max || 5)) * 100))}%` }}
                  />
                </div>
                <div className="d-flex justify-content-between text-muted small mt-2">
                  <span>Role: TENANT_OWNER</span>
                  <span>Operator accounts ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Upgrade Cards */}
        <div className="row g-4 mb-4">
          {plans.map((plan) => {
            const isCurrent = subData.activePlan === plan.id;
            return (
              <div key={plan.id} className="col-12 col-md-6 col-xl-4">
                <div className={`card h-100 border rounded-4 shadow-sm p-4 bg-white position-relative ${isCurrent ? 'border-success border-2' : plan.isPopular ? 'border-primary border-2' : ''}`}>
                  <span className={`position-absolute top-0 end-0 m-3 badge ${isCurrent ? 'bg-success' : plan.isPopular ? 'bg-primary' : 'bg-light text-dark border'} px-3 py-1 fw-bold`}>
                    {isCurrent ? 'ACTIVE PLAN' : plan.badge}
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
                    className={`btn ${isCurrent ? 'btn-outline-success disabled' : plan.isPopular ? 'btn-primary' : 'btn-outline-primary'} w-100 py-3 fw-bold rounded-3 shadow-sm mt-auto d-flex align-items-center justify-content-center gap-2`}
                    onClick={() => handleOpenRazorpay(plan)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Currently Active' : (
                      <>
                        Pay with Razorpay <BsArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Transaction History Table */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <BsClockHistory className="text-primary" /> Active Plan & Transaction Record
            </h5>
            <span className="badge bg-light text-secondary border px-3 py-2">
              Tenant ID: {businessId}
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase">Txn / License ID</th>
                  <th className="small text-muted text-uppercase">Plan Tier</th>
                  <th className="small text-muted text-uppercase">Amount Paid</th>
                  <th className="small text-muted text-uppercase">Payment Method</th>
                  <th className="small text-muted text-uppercase">Start Date</th>
                  <th className="small text-muted text-uppercase">Valid Until</th>
                  <th className="small text-muted text-uppercase">Status</th>
                  <th className="small text-muted text-uppercase text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-bold text-primary font-monospace">
                    SUB-{subData.subscriptionId || "CURRENT"}
                  </td>
                  <td><strong>{subData.planName}</strong></td>
                  <td className="fw-bold">
                    {subData.amountPaid ? `₹ ${Number(subData.amountPaid).toLocaleString('en-IN')}` : "₹ 0.00 (Trial)"}
                  </td>
                  <td>{subData.paymentMethod || "FREE_TRIAL"}</td>
                  <td>{subData.startDate || "Active"}</td>
                  <td>{subData.endDate || "15 Days"}</td>
                  <td>
                    <span className={`badge ${subData.status === 'EXPIRED' ? 'bg-danger' : 'bg-success bg-opacity-10 text-success'} fw-bold px-2 py-1 rounded-pill`}>
                      <BsCheckCircleFill className="me-1" /> {subData.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="text-end">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => alert(`License certificate for ${subData.planName} (${businessId}) is verified and active.`)}
                    >
                      Verify License
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
                <div className="fw-bold small">Instant Tenant Provisioning</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Automated quota updates across Web & Android App</div>
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
        onSuccess={fetchSubscription}
      />
    </PortalLayout>
  );
}
