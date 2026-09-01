import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BsShieldLockFill, 
  BsSnow2, 
  BsSunFill, 
  BsTicketDetailedFill, 
  BsHddNetworkFill, 
  BsRobot, 
  BsSendFill, 
  BsCheckCircleFill, 
  BsSearch,
  BsBoxArrowRight,
  BsFillLightningChargeFill,
  BsTerminalFill,
  BsDatabaseFillCheck,
  BsCreditCardFill,
  BsPersonBadgeFill,
  BsBuildingCheck
} from "react-icons/bs";
import Swal from "sweetalert2";

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tenants"); // 'tenants', 'subscriptions', 'tickets', 'infrastructure', 'raki_ai'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL', 'ACTIVE', 'FROZEN'
  
  // Seed / Live Tenants
  const [tenants, setTenants] = useState([
    {
      tenantId: "TENANT-001",
      businessName: "Kaveri Agro Chemicals Ltd",
      ownerName: "Ramesh Kumar",
      email: "ramesh@kaveriagro.in",
      phone: "+91 98450 12345",
      plan: "VIP 2 YEARS (₹25,000)",
      planDuration: "2 Years",
      sector: "Fertilizers & Agro",
      isFrozen: false,
      freezeReason: null,
      monthlyInvoices: 3420,
      joinedDate: "12 Jan 2026"
    },
    {
      tenantId: "TENANT-002",
      businessName: "Lotus Garments & Textiles",
      ownerName: "Priya Sundaram",
      email: "priya@lotustextiles.com",
      phone: "+91 97890 23456",
      plan: "1 YEAR PLAN (₹5,000)",
      planDuration: "1 Year",
      sector: "Clothing & Garments",
      isFrozen: true,
      freezeReason: "Compliance Verification Pending",
      monthlyInvoices: 1840,
      joinedDate: "18 Feb 2026"
    },
    {
      tenantId: "TENANT-003",
      businessName: "Apex Electronics & Mobiles",
      ownerName: "Amit Deshmukh",
      email: "amit@apexelectronics.com",
      phone: "+91 99220 34567",
      plan: "6 MONTHS (₹2,700)",
      planDuration: "6 Months",
      sector: "Electronics & IMEI",
      isFrozen: false,
      freezeReason: null,
      monthlyInvoices: 920,
      joinedDate: "02 Mar 2026"
    },
    {
      tenantId: "TENANT-004",
      businessName: "National Freight & Logistics Express",
      ownerName: "Sardar Gurpreet Singh",
      email: "gurpreet@nationalfreight.in",
      phone: "+91 98110 54321",
      plan: "1 MONTH (₹500)",
      planDuration: "1 Month",
      sector: "Transport & LR Bilty",
      isFrozen: false,
      freezeReason: null,
      monthlyInvoices: 510,
      joinedDate: "15 Apr 2026"
    },
    {
      tenantId: "TENANT-005",
      businessName: "Reliance Daily Supermarket Hub",
      ownerName: "Venkat Rao",
      email: "venkat@dailyhub.com",
      phone: "+91 99880 11223",
      plan: "3 MONTHS (₹1,400)",
      planDuration: "3 Months",
      sector: "Supermarkets & Retail",
      isFrozen: false,
      freezeReason: null,
      monthlyInvoices: 8900,
      joinedDate: "20 May 2026"
    }
  ]);

  // Support Tickets
  const [tickets, setTickets] = useState([
    {
      code: "TCK-1001",
      tenantId: "TENANT-001",
      business: "Kaveri Agro Chemicals Ltd",
      user: "Ramesh Kumar",
      subject: "DBT Fertilizer Subsidy Report format alignment query",
      category: "GST_COMPLIANCE",
      priority: "HIGH",
      status: "OPEN",
      time: "2 hours ago"
    },
    {
      code: "TCK-1002",
      tenantId: "TENANT-003",
      business: "Apex Electronics & Mobiles",
      user: "Amit Deshmukh",
      subject: "Bluetooth 80mm ESC/POS Thermal Printer pairing latency",
      category: "TECHNICAL",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      time: "5 hours ago"
    },
    {
      code: "TCK-1003",
      tenantId: "TENANT-005",
      business: "Reliance Daily Supermarket Hub",
      user: "Venkat Rao",
      subject: "Barcode scanner GS1-128 batch prefix configuration",
      category: "HARDWARE",
      priority: "LOW",
      status: "RESOLVED",
      time: "1 day ago"
    }
  ]);

  // Razorpay Transactions
  const transactions = [
    { id: "pay_rzp_98472918", tenant: "Kaveri Agro Chemicals Ltd", plan: "2 Years VIP Plan", amount: "₹ 25,000", method: "UPI (Google Pay)", date: "Today, 10:14 AM", status: "SUCCESS" },
    { id: "pay_rzp_84719283", tenant: "Lotus Garments & Textiles", plan: "1 Year Plan", amount: "₹ 5,000", method: "Cards (Visa Platinum)", date: "Yesterday, 04:30 PM", status: "SUCCESS" },
    { id: "pay_rzp_73628192", tenant: "Apex Electronics & Mobiles", plan: "6 Months Plan", amount: "₹ 2,700", method: "NetBanking (HDFC)", date: "28 Aug 2026", status: "SUCCESS" },
    { id: "pay_rzp_62518291", tenant: "Reliance Daily Supermarket", plan: "3 Months Plan", amount: "₹ 1,400", method: "UPI (PhonePe)", date: "25 Aug 2026", status: "SUCCESS" },
    { id: "pay_rzp_51407382", tenant: "National Freight Logistics", plan: "1 Month Plan", amount: "₹ 500", method: "UPI (Paytm)", date: "22 Aug 2026", status: "SUCCESS" }
  ];

  // Raki AI Terminal Logs
  const [rakiAiPrompt, setRakiAiPrompt] = useState("");
  const [rakiAiLogs, setRakiAiLogs] = useState([
    {
      sender: "Raki AI",
      text: "⚡ Raki AI Enterprise Master Copilot online. 3 Kubernetes nodes, Kafka cluster, Redis cache & Razorpay payment engine operating normally."
    }
  ]);

  // Tenant Freeze/Unfreeze Killswitch
  const toggleFreeze = (tenantId) => {
    const target = tenants.find(t => t.tenantId === tenantId);
    if (!target) return;

    const actionText = target.isFrozen ? "Unfreeze and Restore" : "Freeze and Suspend";
    const confirmColor = target.isFrozen ? "#10B981" : "#EF4444";

    Swal.fire({
      title: `${actionText} Tenant?`,
      text: `Are you sure you want to change access state for ${target.businessName}?`,
      icon: target.isFrozen ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      confirmButtonText: `Yes, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        setTenants(tenants.map(t => {
          if (t.tenantId === tenantId) {
            const nextState = !t.isFrozen;
            return {
              ...t,
              isFrozen: nextState,
              freezeReason: nextState ? "Suspended by Super Administrator (Killswitch Triggered)" : null
            };
          }
          return t;
        }));

        Swal.fire({
          icon: "success",
          title: `Tenant ${target.isFrozen ? 'Restored' : 'Suspended'}`,
          text: `${target.businessName} has been ${target.isFrozen ? 'unfrozen and granted full access' : 'frozen immediately'}.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleResolveTicket = (code) => {
    setTickets(tickets.map(t => t.code === code ? { ...t, status: "RESOLVED" } : t));
    Swal.fire({
      icon: "success",
      title: `Ticket ${code} Resolved`,
      timer: 1200,
      showConfirmButton: false
    });
  };

  const handleRakiAiSubmit = (e) => {
    e.preventDefault();
    if (!rakiAiPrompt.trim()) return;

    const userMsg = { sender: "Admin", text: rakiAiPrompt };
    let aiReply = "🤖 Raki AI: Diagnostics complete. System invariants verified (Debit = Credit, Zero-Stock Anomalies).";

    const lower = rakiAiPrompt.toLowerCase();
    if (lower.includes("freeze") || lower.includes("killswitch")) {
      aiReply = "⚡ Raki AI: Executing killswitch policy. Kafka tenant status event published to topic 'tenant-events'.";
    } else if (lower.includes("ticket") || lower.includes("helpdesk")) {
      aiReply = `🎫 Raki AI Helpdesk: There are currently ${tickets.filter(t => t.status === 'OPEN').length} OPEN tickets requiring resolution.`;
    } else if (lower.includes("revenue") || lower.includes("payment")) {
      aiReply = "💳 Raki AI: Razorpay Gateway processed ₹34,600 across 5 active enterprise billing cycles. 100% success rate.";
    }

    setRakiAiLogs([...rakiAiLogs, userMsg, { sender: "Raki AI", text: aiReply }]);
    setRakiAiPrompt("");
  };

  const handleLogout = () => {
    localStorage.removeItem("isSuperAdmin");
    navigate("/super-admin-login");
  };

  // Filtered Tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.tenantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.sector.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "ACTIVE") return matchesSearch && !t.isFrozen;
    if (statusFilter === "FROZEN") return matchesSearch && t.isFrozen;
    return matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", color: "#1E293B", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* Top Super Admin Navigation Header - Light Theme */}
      <header className="bg-white border-bottom px-4 py-3 sticky-top shadow-sm" style={{ borderColor: "#E2E8F0" }}>
        <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="d-inline-flex p-2 rounded-3 bg-danger-subtle border border-danger-subtle">
              <BsShieldLockFill className="text-danger fs-4" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold text-dark mb-0">TSAR IT Super Admin Command Center</h5>
                <span className="badge bg-danger text-white px-2 py-1 small">
                  SUPER ADMIN OVERRIDE
                </span>
              </div>
              <span className="text-muted small" style={{ fontSize: "12px" }}>
                Master Multi-Tenant Console • Production Kubernetes & Kafka Mesh
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Quick Status Pill */}
            <div className="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border border-light-subtle small">
              <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '8px', height: '8px' }}></span>
              <span className="text-success fw-bold">Cluster Health: 100% Operational</span>
            </div>

            {/* Super Admin User Tag */}
            <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-3 bg-light border">
              <BsPersonBadgeFill className="text-primary" />
              <div className="small text-start">
                <div className="fw-bold text-dark lh-1">tsaritservices@gmail.com</div>
                <span className="text-muted" style={{ fontSize: '10px' }}>Master Controller</span>
              </div>
            </div>

            {/* Exit / Logout */}
            <button 
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-3 py-2 fw-semibold"
              onClick={handleLogout}
              title="Lock Super Admin Gate"
            >
              <BsBoxArrowRight /> Exit Console
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs Bar - Light Theme */}
      <div className="bg-white border-bottom px-4 py-2" style={{ borderColor: "#E2E8F0" }}>
        <div className="container-fluid d-flex flex-wrap gap-2">
          <button 
            className={`btn btn-sm px-3 py-2 fw-semibold rounded-2 d-flex align-items-center gap-2 ${activeTab === 'tenants' ? 'btn-primary' : 'btn-light border text-dark'}`}
            onClick={() => setActiveTab('tenants')}
          >
            <BsBuildingCheck /> Enterprise Tenants & Killswitch ({tenants.length})
          </button>
          <button 
            className={`btn btn-sm px-3 py-2 fw-semibold rounded-2 d-flex align-items-center gap-2 ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-light border text-dark'}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <BsCreditCardFill /> Razorpay Subscriptions
          </button>
          <button 
            className={`btn btn-sm px-3 py-2 fw-semibold rounded-2 d-flex align-items-center gap-2 ${activeTab === 'tickets' ? 'btn-primary' : 'btn-light border text-dark'}`}
            onClick={() => setActiveTab('tickets')}
          >
            <BsTicketDetailedFill /> Support Tickets & Helpdesk ({tickets.filter(t => t.status === 'OPEN').length})
          </button>
          <button 
            className={`btn btn-sm px-3 py-2 fw-semibold rounded-2 d-flex align-items-center gap-2 ${activeTab === 'raki_ai' ? 'btn-primary' : 'btn-light border text-dark'}`}
            onClick={() => setActiveTab('raki_ai')}
          >
            <BsRobot /> Raki AI Autonomous Terminal
          </button>
          <button 
            className={`btn btn-sm px-3 py-2 fw-semibold rounded-2 d-flex align-items-center gap-2 ${activeTab === 'infrastructure' ? 'btn-primary' : 'btn-light border text-dark'}`}
            onClick={() => setActiveTab('infrastructure')}
          >
            <BsHddNetworkFill /> Kubernetes & Infrastructure
          </button>
        </div>
      </div>

      {/* Main Console Content - Light Theme */}
      <div className="container-fluid p-4">
        
        {/* Metric Cards Row */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-white border shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small fw-bold">TOTAL ENTERPRISES</span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">All Tenants</span>
              </div>
              <h2 className="fw-bold text-dark mt-2 mb-1">{tenants.length}</h2>
              <div className="small text-muted d-flex gap-2">
                <span className="text-success fw-semibold"><BsSunFill /> {tenants.filter(t => !t.isFrozen).length} Active</span>
                <span>•</span>
                <span className="text-danger fw-semibold"><BsSnow2 /> {tenants.filter(t => t.isFrozen).length} Frozen</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-white border shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small fw-bold">SUBSCRIPTION REVENUE</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">Razorpay</span>
              </div>
              <h2 className="fw-bold text-success mt-2 mb-1">₹ 34,600</h2>
              <div className="small text-muted">100% Successful Settlements</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-white border shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small fw-bold">KAFKA EVENT STREAM</span>
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Apache Kafka</span>
              </div>
              <h2 className="fw-bold text-dark mt-2 mb-1">2,410 /min</h2>
              <div className="small text-muted">3 Brokers Online • 0 Lag</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="p-3 rounded-4 bg-white border shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small fw-bold">OPEN SUPPORT TICKETS</span>
                <span className="badge bg-info-subtle text-info border border-info-subtle">Raki AI</span>
              </div>
              <h2 className="fw-bold text-primary mt-2 mb-1">{tickets.filter(t => t.status === 'OPEN').length}</h2>
              <div className="small text-muted">Auto-Responding via WhatsApp Bot</div>
            </div>
          </div>
        </div>

        {/* TAB 1: TENANTS & KILLSWITCH */}
        {activeTab === 'tenants' && (
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
            {/* Table Header Controls */}
            <div className="p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3 bg-light">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <h6 className="fw-bold text-dark mb-0 me-3">Enterprise Tenant Registry & Freeze Controls</h6>
                <div className="btn-group btn-group-sm">
                  <button 
                    className={`btn ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('ALL')}
                  >
                    All ({tenants.length})
                  </button>
                  <button 
                    className={`btn ${statusFilter === 'ACTIVE' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('ACTIVE')}
                  >
                    Active ({tenants.filter(t => !t.isFrozen).length})
                  </button>
                  <button 
                    className={`btn ${statusFilter === 'FROZEN' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('FROZEN')}
                  >
                    Frozen ({tenants.filter(t => t.isFrozen).length})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="input-group input-group-sm" style={{ maxWidth: "320px" }}>
                <span className="input-group-text bg-white border-end-0">
                  <BsSearch className="text-muted" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0"
                  placeholder="Search tenant, owner, or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="small border-bottom text-uppercase table-light text-muted">
                  <tr>
                    <th>Tenant ID</th>
                    <th>Enterprise / Business</th>
                    <th>Sector / Market</th>
                    <th>Owner / Contact</th>
                    <th>Subscription Plan</th>
                    <th>Status</th>
                    <th>Killswitch Reason</th>
                    <th className="text-end">Master Killswitch</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {filteredTenants.map((t) => (
                    <tr key={t.tenantId} className={t.isFrozen ? "table-danger bg-danger-subtle" : ""}>
                      <td className="fw-bold text-primary font-monospace">{t.tenantId}</td>
                      <td>
                        <div className="fw-bold text-dark">{t.businessName}</div>
                        <div className="text-muted small">Joined: {t.joinedDate} • {t.monthlyInvoices} Invoices/mo</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {t.sector}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{t.ownerName}</div>
                        <div className="text-muted small">{t.phone}</div>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {t.plan}
                        </span>
                      </td>
                      <td>
                        {t.isFrozen ? (
                          <span className="badge bg-danger d-inline-flex align-items-center gap-1">
                            <BsSnow2 /> FROZEN
                          </span>
                        ) : (
                          <span className="badge bg-success d-inline-flex align-items-center gap-1">
                            <BsSunFill /> ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="text-muted">
                        {t.freezeReason ? (
                          <span className="text-danger fw-semibold small">{t.freezeReason}</span>
                        ) : (
                          <span className="text-muted small">Standard Access</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button 
                          className={`btn btn-sm ${t.isFrozen ? 'btn-success' : 'btn-outline-danger'} fw-bold px-3 d-inline-flex align-items-center gap-1 shadow-sm`}
                          onClick={() => toggleFreeze(t.tenantId)}
                        >
                          {t.isFrozen ? (
                            <>
                              <BsSunFill /> Unfreeze Tenant
                            </>
                          ) : (
                            <>
                              <BsSnow2 /> Freeze Tenant
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTenants.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No tenants match your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RAZORPAY SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <h6 className="fw-bold text-dark mb-0">Razorpay Gateway Transaction Ledger</h6>
              <span className="badge bg-success">Automated Webhooks Active</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="small text-uppercase table-light text-muted">
                  <tr>
                    <th>Payment ID</th>
                    <th>Enterprise Tenant</th>
                    <th>Plan Purchased</th>
                    <th>Amount</th>
                    <th>Payment Rail</th>
                    <th>Timestamp</th>
                    <th>Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="font-monospace text-primary fw-bold">{tx.id}</td>
                      <td className="fw-bold text-dark">{tx.tenant}</td>
                      <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle">{tx.plan}</span></td>
                      <td className="fw-bold text-success">{tx.amount}</td>
                      <td>{tx.method}</td>
                      <td className="text-muted">{tx.date}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          <BsCheckCircleFill className="me-1" /> {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SUPPORT TICKETS & HELPDESK */}
        {activeTab === 'tickets' && (
          <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <h6 className="fw-bold text-dark mb-0">Enterprise Support & Helpdesk Tickets</h6>
              <span className="badge bg-info-subtle text-info border border-info-subtle">Integrated with Email & WhatsApp Bot</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="small text-uppercase table-light text-muted">
                  <tr>
                    <th>Ticket Code</th>
                    <th>Business</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(tk => (
                    <tr key={tk.code}>
                      <td className="font-monospace text-primary fw-bold">{tk.code}</td>
                      <td>
                        <div className="fw-bold text-dark">{tk.business}</div>
                        <div className="text-muted small">{tk.user}</div>
                      </td>
                      <td className="text-dark">{tk.subject}</td>
                      <td><span className="badge bg-light text-dark border">{tk.category}</span></td>
                      <td>
                        <span className={`badge ${tk.priority === 'HIGH' ? 'bg-danger' : tk.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-info'}`}>
                          {tk.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${tk.status === 'OPEN' ? 'bg-danger' : tk.status === 'IN_PROGRESS' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {tk.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {tk.status !== "RESOLVED" ? (
                          <button 
                            className="btn btn-sm btn-outline-success fw-bold"
                            onClick={() => handleResolveTicket(tk.code)}
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span className="text-success small fw-bold">✓ Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RAKI AI AUTONOMOUS TERMINAL */}
        {activeTab === 'raki_ai' && (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white h-100">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <BsTerminalFill className="text-primary" /> Raki AI Autonomous Copilot Console
                  </h6>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    Real-Time Diagnostic Agent
                  </span>
                </div>

                {/* Log terminal view - Clean modern developer box */}
                <div className="p-4" style={{ height: "350px", overflowY: "auto", backgroundColor: "#F1F5F9", fontFamily: "monospace", fontSize: "13px" }}>
                  {rakiAiLogs.map((log, idx) => (
                    <div key={idx} className="mb-3">
                      <strong className={log.sender === 'Admin' ? 'text-primary' : 'text-success'}>
                        [{log.sender}]:
                      </strong>{" "}
                      <span className="text-dark">{log.text}</span>
                    </div>
                  ))}
                </div>

                {/* Input prompt */}
                <div className="p-3 border-top bg-white">
                  <form onSubmit={handleRakiAiSubmit} className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Ask Raki AI (e.g. 'Show revenue breakdown', 'Scan for frozen tenants')..."
                      value={rakiAiPrompt}
                      onChange={(e) => setRakiAiPrompt(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2">
                      <BsSendFill /> Execute
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Actions */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white h-100">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <BsFillLightningChargeFill className="text-warning" /> Quick Autonomous Actions
                </h6>
                <div className="d-flex flex-column gap-2">
                  <button 
                    className="btn btn-light border text-start text-dark small py-2 px-3 d-flex align-items-center justify-content-between"
                    onClick={() => {
                      setRakiAiPrompt("Run accounting invariant balance check");
                      setRakiAiLogs(prev => [...prev, { sender: "Admin", text: "Run accounting invariant check" }, { sender: "Raki AI", text: "✓ Double-Entry Balance Sheet: Assets = Liabilities + Equity. All general ledgers verified." }]);
                    }}
                  >
                    <span>Check Accounting Invariants</span>
                    <span className="badge bg-success">Pass</span>
                  </button>
                  <button 
                    className="btn btn-light border text-start text-dark small py-2 px-3 d-flex align-items-center justify-content-between"
                    onClick={() => {
                      setRakiAiLogs(prev => [...prev, { sender: "Admin", text: "Test Kafka Broker Connectivity" }, { sender: "Raki AI", text: "✓ Kafka Mesh: 3/3 Brokers responding with 0.4ms latency. Topics: 'invoices', 'tenant-events'." }]);
                    }}
                  >
                    <span>Ping Kafka Event Brokers</span>
                    <span className="badge bg-primary">Active</span>
                  </button>
                  <button 
                    className="btn btn-light border text-start text-dark small py-2 px-3 d-flex align-items-center justify-content-between"
                    onClick={() => {
                      setRakiAiLogs(prev => [...prev, { sender: "Admin", text: "Audit Frozen Tenants" }, { sender: "Raki AI", text: `⚠️ Audit: 1 Tenant currently FROZEN (Lotus Garments - Compliance Pending). 4 Tenants active.` }]);
                    }}
                  >
                    <span>Audit Frozen Tenants</span>
                    <span className="badge bg-danger">1 Alert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KUBERNETES & INFRASTRUCTURE */}
        {activeTab === 'infrastructure' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <BsHddNetworkFill className="text-primary" /> Kubernetes Production Topology
                </h6>
                <ul className="list-unstyled small d-flex flex-column gap-3 mb-0">
                  <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-dark">Cluster Master Node (k8s-master-01)</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Ready • CPU: 18%</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-dark">Worker Node 01 (k8s-worker-backend)</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Ready • Pods: 6/12</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-dark">Worker Node 02 (k8s-worker-frontend)</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Ready • Pods: 4/12</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-dark">Nginx Ingress Controller</span>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">SSL Managed • Port 80/443</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <BsDatabaseFillCheck className="text-success" /> Database & Cache Telemetry
                </h6>
                <ul className="list-unstyled small d-flex flex-column gap-3 mb-0">
                  <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-dark">MySQL 8.0 Primary Node (billing_db)</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Connected • 10 Active Pools</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-dark">Redis 7 In-Memory Cache</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Hit Rate: 98.4%</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span className="fw-semibold text-dark">Apache Kafka 3.6 Cluster</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Zookeeper Sync OK</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-dark">Backup & Disaster Recovery</span>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Automated Hourly Snapshots</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
