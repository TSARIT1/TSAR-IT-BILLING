import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsShieldLockFill,
  BsTicketDetailedFill,
  BsSearch,
  BsBoxArrowRight,
  BsArrowRepeat,
  BsPersonBadgeFill,
  BsBuildingCheck,
  BsMegaphoneFill,
  BsGraphUp,
  BsPeopleFill,
  BsReceiptCutoff,
  BsCashCoin,
  BsClockHistory,
  BsSnow2,
  BsCheckCircleFill,
  BsExclamationOctagonFill,
  BsStars,
  BsReplyFill,
  BsTrash,
  BsPhoneFill,
  BsToggleOn,
  BsToggleOff,
  BsCloudUploadFill,
} from "react-icons/bs";
import Swal from "sweetalert2";
import {
  getPlatformStats,
  getAllTenants,
  setTenantFreeze,
  setTenantPlan,
  setTicketStatus,
  superAdminBroadcast,
  getPlatformAudit,
  getTickets,
  getTicketReplies,
  addTicketReply,
  deleteTenantAccount,
  getAppConfig,
  updateAppConfig,
  getAppPlans,
} from "../../services/api";
import "./SuperAdminPanel.css";

const PLANS = [
  { id: "trial_15_days", name: "15-Day Trial" },
  { id: "plan_1_month", name: "1 Month" },
  { id: "plan_3_months", name: "3 Months" },
  { id: "plan_6_months", name: "6 Months" },
  { id: "plan_1_year", name: "1 Year" },
  { id: "plan_2_years", name: "2 Years" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: <BsGraphUp /> },
  { id: "tenants", label: "Tenants & Users", icon: <BsBuildingCheck /> },
  { id: "tickets", label: "Support Tickets", icon: <BsTicketDetailedFill /> },
  { id: "apk", label: "APK Control", icon: <BsPhoneFill /> },
  { id: "broadcast", label: "Broadcast", icon: <BsMegaphoneFill /> },
  { id: "audit", label: "Platform Audit", icon: <BsClockHistory /> },
];

/** Modules the super admin can switch on/off for every install, without a new APK. */
const APP_MODULES = [
  { key: "smsMarketing", label: "SMS & WhatsApp Marketing" },
  { key: "caAudit", label: "CA Audit Hub (GSTR + exports)" },
  { key: "smsGateway", label: "SMS Marketing Campaigns" },
  { key: "smsFreeGateway", label: "Free own-SIM SMS Gateway" },
  { key: "eInvoice", label: "E-Invoicing" },
  { key: "pos", label: "Point of Sale" },
  { key: "whatsapp", label: "WhatsApp Sharing" },
  { key: "aiAssistant", label: "AI Assistant" },
  { key: "subscription", label: "Subscription / Plans" },
];

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [audit, setAudit] = useState({ content: [], totalElements: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", type: "INFO", target: "ALL" });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replySending, setReplySending] = useState(false);

  // --- Android APK remote control ---
  const [appConfig, setAppConfig] = useState(null);
  const [appPlans, setAppPlans] = useState([]);
  const [appSaving, setAppSaving] = useState(false);
  const [planDraft, setPlanDraft] = useState({});

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, tk, a] = await Promise.allSettled([getPlatformStats(), getAllTenants(), getTickets(), getPlatformAudit(0, 150)]);
      if (s.status === "fulfilled") setStats(s.value);
      if (t.status === "fulfilled" && Array.isArray(t.value)) setTenants(t.value);
      if (tk.status === "fulfilled" && Array.isArray(tk.value)) setTickets(tk.value);
      if (a.status === "fulfilled" && a.value?.content) setAudit(a.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadAppConfig = useCallback(async () => {
    try {
      const [cfg, plans] = await Promise.allSettled([getAppConfig(), getAppPlans()]);
      if (cfg.status === "fulfilled" && cfg.value) {
        setAppConfig(cfg.value);
        setPlanDraft(Object.fromEntries(
          (Array.isArray(cfg.value.plansOverride) && cfg.value.plansOverride.length
            ? cfg.value.plansOverride
            : Array.isArray(plans.value) ? plans.value : []
          ).map((p) => [p.planId, p.price])
        ));
      }
      if (plans.status === "fulfilled" && Array.isArray(plans.value)) setAppPlans(plans.value);
    } catch (err) {
      Swal.fire("Failed to load APK config", err?.response?.data?.error || "Please retry", "error");
    }
  }, []);

  useEffect(() => { if (activeTab === "apk") loadAppConfig(); }, [activeTab, loadAppConfig]);

  const saveAppConfig = async (patch, successTitle = "APK config saved") => {
    try {
      setAppSaving(true);
      const res = await updateAppConfig(patch);
      if (res?.config) setAppConfig(res.config);
      Swal.fire({ icon: "success", title: successTitle, text: "Every install picks this up on next launch.", timer: 1800, showConfirmButton: false });
      loadAppConfig();
    } catch (err) {
      Swal.fire("Save failed", err?.response?.data?.error || "Please retry", "error");
    } finally {
      setAppSaving(false);
    }
  };

  const toggleFlag = (key) => {
    const flags = { ...(appConfig?.featureFlags || {}) };
    flags[key] = !flags[key];
    saveAppConfig({ featureFlags: flags }, `${APP_MODULES.find((m) => m.key === key)?.label || key} ${flags[key] ? "enabled" : "disabled"}`);
  };

  const savePlanPrices = () => {
    const override = appPlans.map((p) => ({
      ...p,
      price: Number(planDraft[p.planId] ?? p.price) || 0,
    }));
    saveAppConfig({ plansOverride: override }, "Plan prices updated for all tenants");
  };

  const clearPlanOverride = () =>
    saveAppConfig({ plansOverride: [] }, "Plan prices reset to defaults");

  const handleFreeze = async (tenant) => {
    const freezing = !tenant.isFrozen;
    const { value: reason } = await Swal.fire({
      title: freezing ? "Freeze this tenant?" : "Unfreeze this tenant?",
      html: `<strong>${tenant.businessName || tenant.ownerName}</strong><br>${
        freezing
          ? "They will be blocked from logging in immediately."
          : "Full access will be restored."}`,
      icon: freezing ? "warning" : "question",
      input: freezing ? "text" : undefined,
      inputLabel: freezing ? "Reason (shown to the tenant)" : undefined,
      inputValue: freezing ? "Account suspended by platform administrator" : undefined,
      showCancelButton: true,
      confirmButtonColor: freezing ? "#b23b3b" : "#1a7f4e",
      confirmButtonText: freezing ? "Freeze now" : "Unfreeze",
    });
    if (!reason && freezing) return;
    if (!reason && !freezing && !tenant.isFrozen) return;

    try {
      await setTenantFreeze(tenant.businessId, freezing, reason);
      Swal.fire({ icon: "success", title: freezing ? "Tenant frozen" : "Tenant restored", timer: 1300, showConfirmButton: false });
      loadAll();
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Action failed", "error");
    }
  };

  const handlePlan = async (tenant) => {
    const { value: planId } = await Swal.fire({
      title: `Activate plan — ${tenant.businessName || tenant.ownerName}`,
      input: "select",
      inputOptions: Object.fromEntries(PLANS.map(p => [p.id, p.name])),
      inputPlaceholder: "Choose a plan",
      showCancelButton: true,
      confirmButtonColor: "#7c1e2e",
    });
    if (!planId) return;
    try {
      await setTenantPlan(tenant.businessId, planId);
      Swal.fire({ icon: "success", title: "Plan activated", text: PLANS.find(p => p.id === planId)?.name, timer: 1400, showConfirmButton: false });
      loadAll();
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Action failed", "error");
    }
  };

  const handleTicketStatus = async (ticket, status) => {
    try {
      await setTicketStatus(ticket.id, status);
      setTickets(ts => ts.map(t => (t.id === ticket.id ? { ...t, status } : t)));
      Swal.fire({ icon: "success", title: `Ticket #${ticket.id} → ${status}`, timer: 1100, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Action failed", "error");
    }
  };

  const openThread = async (ticket) => {
    const id = ticket.id;
    if (openTicketId === id) { setOpenTicketId(null); return; }
    setOpenTicketId(id);
    setThread([]);
    setThreadLoading(true);
    setReplyDraft("");
    try {
      const data = await getTicketReplies(id);
      setThread(Array.isArray(data?.replies) ? data.replies : []);
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Could not load the conversation", "error");
      setOpenTicketId(null);
    } finally {
      setThreadLoading(false);
    }
  };

  const sendReply = async (ticket) => {
    if (!replyDraft.trim()) return;
    setReplySending(true);
    try {
      const data = await addTicketReply(ticket.id, replyDraft.trim());
      if (data?.reply) setThread(th => [...th, data.reply]);
      if (data?.status) setTickets(ts => ts.map(t => (t.id === ticket.id ? { ...t, status: data.status } : t)));
      setReplyDraft("");
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Reply failed", "error");
    } finally {
      setReplySending(false);
    }
  };

  const handleDeleteTenant = async (tenant) => {
    const label = tenant.businessName || tenant.ownerName || tenant.email;
    const { value: confirmText } = await Swal.fire({
      title: "Delete this tenant permanently?",
      html: `<strong>${label}</strong><br><br>` +
        "This wipes the account, business profile, customers, products, invoices, " +
        "expenses, staff, subscriptions — <b>everything</b>.<br><br>" +
        "Audit history is retained for compliance. <b>This cannot be undone.</b>",
      icon: "warning",
      input: "text",
      inputLabel: 'Type DELETE to confirm',
      inputPlaceholder: "DELETE",
      showCancelButton: true,
      confirmButtonColor: "#b23b3b",
      confirmButtonText: "Delete forever",
      preConfirm: (v) => (v === "DELETE" ? v : Swal.showValidationMessage("Type DELETE exactly to confirm")),
    });
    if (confirmText !== "DELETE") return;
    try {
      const res = await deleteTenantAccount(tenant.userId);
      Swal.fire({
        icon: "success",
        title: "Tenant deleted",
        html: `${label} removed.<br>Businesses wiped: <b>${res.businessesDeleted ?? 0}</b>`,
        timer: 2200,
        showConfirmButton: false,
      });
      loadAll();
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Delete failed", "error");
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) {
      Swal.fire("Required", "Message cannot be empty.", "warning");
      return;
    }
    setBroadcastSending(true);
    try {
      await superAdminBroadcast(broadcastForm);
      Swal.fire({ icon: "success", title: "Broadcast sent", timer: 1500, showConfirmButton: false });
      setBroadcastForm({ title: "", message: "", type: "INFO", target: "ALL" });
    } catch (err) {
      Swal.fire("Failed", err?.response?.data?.error || "Broadcast failed", "error");
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleLogout = () => {
    ["token", "user", "userId", "businessData"].forEach(k => localStorage.removeItem(k));
    navigate("/super-admin-login");
  };

  const filteredTenants = tenants.filter(t => {
    const q = searchTerm.toLowerCase();
    const matches =
      (t.businessName || "").toLowerCase().includes(q) ||
      (t.ownerName || "").toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      (t.mobileNo || "").includes(searchTerm);
    if (statusFilter === "ACTIVE") return matches && !t.isFrozen;
    if (statusFilter === "FROZEN") return matches && t.isFrozen;
    return matches;
  });

  const statCards = stats ? [
    { icon: <BsPeopleFill />, label: "Registered Users", value: stats.totalUsers, tone: "bur" },
    { icon: <BsBuildingCheck />, label: "Businesses (Tenants)", value: stats.totalBusinesses, tone: "gold" },
    { icon: <BsReceiptCutoff />, label: "Invoices Created", value: stats.totalInvoices, tone: "bur" },
    { icon: <BsCashCoin />, label: "Platform Revenue", value: `₹${Number(stats.platformRevenue || 0).toLocaleString("en-IN")}`, tone: "gold" },
    { icon: <BsTicketDetailedFill />, label: "Open Tickets", value: stats.openTickets, tone: "bur" },
    { icon: <BsStars />, label: "Active Subscriptions", value: stats.activeSubscriptions, tone: "gold" },
    { icon: <BsExclamationOctagonFill />, label: "Frozen Tenants", value: stats.frozenTenants, tone: "red" },
    { icon: <BsClockHistory />, label: "Audit Events", value: Number(stats.auditEvents).toLocaleString("en-IN"), tone: "grey" },
  ] : [];

  return (
    <div className="sap-shell">
      {/* ---------- Top bar ---------- */}
      <header className="sap-topbar">
        <div className="sap-topbar-left">
          <span className="sap-shield"><BsShieldLockFill /></span>
          <div>
            <div className="sap-title-row">
              <h1>TSAR IT Command Center</h1>
              <span className="sap-badge">SUPER ADMIN</span>
            </div>
            <span className="sap-subtitle">{user.email || "admin"} · full platform control, every action audited</span>
          </div>
        </div>
        <div className="sap-topbar-right">
          <button className="sap-btn sap-btn-ghost" onClick={loadAll} disabled={loading}>
            <BsArrowRepeat className={loading ? "sap-spin" : ""} /> Refresh
          </button>
          <button className="sap-btn sap-btn-dark" onClick={handleLogout}>
            <BsBoxArrowRight /> Sign out
          </button>
        </div>
      </header>

      {/* ---------- Tabs ---------- */}
      <nav className="sap-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`sap-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.id === "tickets" && tickets.filter(x => (x.status || "").toLowerCase() !== "closed" && x.status !== "RESOLVED").length > 0 && (
              <span className="sap-count">{tickets.filter(x => (x.status || "").toLowerCase() !== "closed" && x.status !== "RESOLVED").length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="sap-body">
        {/* ================= OVERVIEW ================= */}
        {activeTab === "overview" && (
          <>
            <div className="sap-stat-grid">
              {statCards.map(c => (
                <div className={`sap-stat tone-${c.tone}`} key={c.label}>
                  <span className="sap-stat-icon">{c.icon}</span>
                  <span className="sap-stat-value">{loading ? "…" : c.value}</span>
                  <span className="sap-stat-label">{c.label}</span>
                </div>
              ))}
            </div>

            <div className="sap-two-col">
              <section className="sap-card">
                <div className="sap-card-head">
                  <h3>Latest platform activity</h3>
                  <button className="sap-link" onClick={() => setActiveTab("audit")}>View all</button>
                </div>
                <div className="sap-feed">
                  {audit.content.slice(0, 8).map((a, i) => (
                    <div className="sap-feed-row" key={i}>
                      <span className="sap-feed-ev">{a.actionType || a.action || "EVENT"}</span>
                      <span className="sap-feed-desc">{a.notes || a.description || a.moduleName || "—"}</span>
                      <span className="sap-feed-time">{a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : ""}</span>
                    </div>
                  ))}
                  {audit.content.length === 0 && <div className="sap-empty">No activity recorded yet.</div>}
                </div>
              </section>

              <section className="sap-card">
                <div className="sap-card-head">
                  <h3>Tenants needing attention</h3>
                  <button className="sap-link" onClick={() => setActiveTab("tenants")}>Manage</button>
                </div>
                <div className="sap-feed">
                  {tenants.filter(t => t.isFrozen || t.planStatus === "EXPIRED" || t.planStatus === "NONE").slice(0, 8).map((t, i) => (
                    <div className="sap-feed-row" key={i}>
                      <span className={`sap-feed-ev ${t.isFrozen ? "ev-red" : "ev-gold"}`}>{t.isFrozen ? "FROZEN" : t.planStatus}</span>
                      <span className="sap-feed-desc">{t.businessName || t.ownerName} · {t.email || "—"}</span>
                      <button className="sap-link" onClick={() => handleFreeze(t)}>{t.isFrozen ? "Unfreeze" : "Review"}</button>
                    </div>
                  ))}
                  {tenants.filter(t => t.isFrozen || t.planStatus === "EXPIRED" || t.planStatus === "NONE").length === 0 &&
                    <div className="sap-empty">All tenants are healthy. <BsCheckCircleFill className="text-success" /></div>}
                </div>
              </section>
            </div>
          </>
        )}

        {/* ================= TENANTS ================= */}
        {activeTab === "tenants" && (
          <section className="sap-card">
            <div className="sap-card-head sap-wrap">
              <h3>All tenants & users <span className="sap-muted">({filteredTenants.length})</span></h3>
              <div className="sap-filters">
                <div className="sap-search">
                  <BsSearch />
                  <input placeholder="Search name, email, phone…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="sap-seg">
                  {["ALL", "ACTIVE", "FROZEN"].map(s => (
                    <button key={s} className={statusFilter === s ? "on" : ""} onClick={() => setStatusFilter(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sap-table-wrap">
              <table className="sap-table">
                <thead>
                  <tr>
                    <th>Business / Owner</th>
                    <th>Contact</th>
                    <th>Plan</th>
                    <th>Invoices</th>
                    <th>Status</th>
                    <th className="sap-actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map(t => (
                    <tr key={t.userId} className={t.isFrozen ? "row-frozen" : ""}>
                      <td>
                        <div className="sap-cell-main">{t.businessName || "—"}</div>
                        <div className="sap-cell-sub">{t.ownerName || "—"}{t.isSuperAdmin ? " · platform admin" : ""}</div>
                      </td>
                      <td>
                        <div className="sap-cell-main">{t.email || "—"}</div>
                        <div className="sap-cell-sub">{t.mobileNo || "—"}</div>
                      </td>
                      <td>
                        <div className="sap-cell-main">{t.planName || "—"}</div>
                        <div className="sap-cell-sub">{t.planStatus || ""}{t.planEndDate ? ` · till ${new Date(t.planEndDate).toLocaleDateString("en-IN")}` : ""}</div>
                      </td>
                      <td>{t.invoiceCount ?? 0}</td>
                      <td>
                        {t.isFrozen
                          ? <span className="sap-pill pill-red">Frozen</span>
                          : <span className="sap-pill pill-green">Active</span>}
                      </td>
                      <td className="sap-actions-col">
                        <button className="sap-btn sap-btn-sm sap-btn-ghost" onClick={() => handleFreeze(t)}>
                          <BsSnow2 /> {t.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                        <button className="sap-btn sap-btn-sm sap-btn-ghost" onClick={() => handlePlan(t)}>
                          <BsStars /> Plan
                        </button>
                        <button className="sap-btn sap-btn-sm sap-btn-danger" onClick={() => handleDeleteTenant(t)}>
                          <BsTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTenants.length === 0 && (
                    <tr><td colSpan="6" className="sap-empty">No tenants match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= TICKETS ================= */}
        {activeTab === "tickets" && (
          <section className="sap-card">
            <div className="sap-card-head"><h3>Support tickets <span className="sap-muted">({tickets.length})</span></h3></div>
            <div className="sap-tickets">
              {tickets.map(t => {
                const open = (t.status || "").toLowerCase() !== "closed" && t.status !== "RESOLVED";
                const ticketCode = `TCK-${String(t.id).padStart(4, "0")}`;
                const isOpen = openTicketId === t.id;
                return (
                  <div className={`sap-ticket ${open ? "" : "done"}`} key={t.id}>
                    <div className="sap-ticket-main" role="button" onClick={() => openThread(t)} style={{ cursor: "pointer" }}>
                      <div className="sap-cell-main">
                        <span className="sap-tck-code">{ticketCode}</span>
                        {t.subject || "Support request"}
                      </div>
                      <div className="sap-cell-sub clamp2">{t.message}</div>
                      <div className="sap-cell-sub">
                        {t.priority ? `Priority: ${t.priority}` : ""} · {t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
                        {thread.length > 0 && isOpen ? ` · ${thread.length} message${thread.length > 1 ? "s" : ""}` : " · click to open conversation"}
                      </div>
                    </div>
                    <div className="sap-ticket-side">
                      <span className={`sap-pill ${open ? "pill-amber" : "pill-green"}`}>{(t.status || "open").toUpperCase()}</span>
                      <div className="sap-ticket-actions">
                        <button className="sap-btn sap-btn-sm sap-btn-ghost" onClick={() => openThread(t)}>
                          <BsReplyFill /> {isOpen ? "Hide" : "Reply"}
                        </button>
                        {open && (
                          <>
                            <button className="sap-btn sap-btn-sm sap-btn-ghost" onClick={() => handleTicketStatus(t, "in-progress")}>In progress</button>
                            <button className="sap-btn sap-btn-sm sap-btn-primary" onClick={() => handleTicketStatus(t, "closed")}>Resolve</button>
                          </>
                        )}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="sap-thread" onClick={e => e.stopPropagation()}>
                        {threadLoading ? (
                          <div className="sap-empty">Loading conversation…</div>
                        ) : (
                          <>
                            <div className="sap-thread-msg merchant"><b>{t.subject}</b><p>{t.message}</p></div>
                            {thread.map(r => (
                              <div key={r.id} className={`sap-thread-msg ${r.fromSupport ? "support" : "merchant"}`}>
                                <b>{r.authorName || (r.fromSupport ? "TSAR IT Support" : "Merchant")}
                                  <span className="sap-thread-time">{r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : ""}</span>
                                </b>
                                <p>{r.message}</p>
                              </div>
                            ))}
                            <div className="sap-thread-compose">
                              <textarea
                                rows="2"
                                placeholder="Write your answer to the merchant…"
                                value={replyDraft}
                                onChange={e => setReplyDraft(e.target.value)}
                              />
                              <button
                                className="sap-btn sap-btn-sm sap-btn-primary"
                                disabled={replySending || !replyDraft.trim()}
                                onClick={() => sendReply(t)}
                              >
                                <BsReplyFill /> {replySending ? "Sending…" : "Send reply"}
                              </button>
                            </div>
                            <div className="sap-hint">Merchant sees your reply in their Support Desk instantly. First reply moves the ticket to IN-PROGRESS.</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {tickets.length === 0 && <div className="sap-empty">No tickets — the helpdesk is clear.</div>}
            </div>
          </section>
        )}

        {/* ================= ANDROID APK REMOTE CONTROL ================= */}
        {activeTab === "apk" && (
          <section className="sap-card">
            <div className="sap-card-head">
              <h3><BsPhoneFill /> Android APK Control</h3>
              <p className="sap-hint">
                Change app behaviour for every install instantly — no new APK needed.
                Apps read this on launch and cache it for offline use.
              </p>
            </div>

            {!appConfig ? (
              <div className="sap-empty">Loading app configuration…</div>
            ) : (
              <>
                {/* ---- Maintenance kill switch ---- */}
                <div className="sap-form">
                  <h4>Maintenance mode</h4>
                  <p className="sap-hint">Blocks all app logins until switched off.</p>
                  <button
                    className="sap-btn"
                    disabled={appSaving}
                    onClick={() => saveAppConfig(
                      { maintenanceMode: !appConfig.maintenanceMode },
                      !appConfig.maintenanceMode ? "Maintenance mode ON" : "Maintenance mode OFF")}
                  >
                    {appConfig.maintenanceMode ? <BsToggleOn /> : <BsToggleOff />}
                    {appConfig.maintenanceMode ? "ON — app is blocked" : "OFF — app is live"}
                  </button>
                  <label>Message shown during maintenance</label>
                  <input
                    defaultValue={appConfig.maintenanceMessage || ""}
                    onBlur={(e) => e.target.value !== appConfig.maintenanceMessage &&
                      saveAppConfig({ maintenanceMessage: e.target.value }, "Maintenance message updated")}
                  />
                </div>

                {/* ---- Forced update gate ---- */}
                <div className="sap-form">
                  <h4>Release &amp; forced update</h4>
                  <div className="sap-grid-2">
                    <div>
                      <label>Latest version name</label>
                      <input
                        defaultValue={appConfig.latestVersionName || ""}
                        onBlur={(e) => e.target.value !== appConfig.latestVersionName &&
                          saveAppConfig({ latestVersionName: e.target.value }, "Version name updated")}
                      />
                    </div>
                    <div>
                      <label>Latest version code</label>
                      <input
                        type="number"
                        defaultValue={appConfig.latestVersionCode ?? 0}
                        onBlur={(e) => Number(e.target.value) !== appConfig.latestVersionCode &&
                          saveAppConfig({ latestVersionCode: Number(e.target.value) }, "Latest version code updated")}
                      />
                    </div>
                    <div>
                      <label>Minimum version code (force update below this)</label>
                      <input
                        type="number"
                        defaultValue={appConfig.minVersionCode ?? 0}
                        onBlur={(e) => Number(e.target.value) !== appConfig.minVersionCode &&
                          saveAppConfig({ minVersionCode: Number(e.target.value) }, "Minimum version updated")}
                      />
                    </div>
                    <div>
                      <label>APK download URL</label>
                      <input
                        defaultValue={appConfig.apkUrl || ""}
                        onBlur={(e) => e.target.value !== appConfig.apkUrl &&
                          saveAppConfig({ apkUrl: e.target.value }, "APK URL updated")}
                      />
                    </div>
                  </div>
                  <label>Release notes</label>
                  <textarea
                    rows={3}
                    defaultValue={appConfig.releaseNotes || ""}
                    onBlur={(e) => e.target.value !== appConfig.releaseNotes &&
                      saveAppConfig({ releaseNotes: e.target.value }, "Release notes updated")}
                  />
                  <label>Forced-update message</label>
                  <input
                    defaultValue={appConfig.minVersionNotes || ""}
                    onBlur={(e) => e.target.value !== appConfig.minVersionNotes &&
                      saveAppConfig({ minVersionNotes: e.target.value }, "Update message updated")}
                  />
                  <p className="sap-hint">Last updated by {appConfig.updatedBy} at {appConfig.updatedAt}</p>
                </div>

                {/* ---- Module feature flags ---- */}
                <div className="sap-form">
                  <h4>Module feature flags</h4>
                  <p className="sap-hint">Hide or roll out a module for everyone instantly.</p>
                  <div className="sap-flag-grid">
                    {APP_MODULES.map((m) => {
                      const on = appConfig.featureFlags?.[m.key] !== false;
                      return (
                        <button
                          key={m.key}
                          className={`sap-flag ${on ? "on" : "off"}`}
                          disabled={appSaving}
                          onClick={() => toggleFlag(m.key)}
                        >
                          {on ? <BsToggleOn /> : <BsToggleOff />}
                          <span>{m.label}</span>
                          <em>{on ? "ON" : "OFF"}</em>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ---- Plan pricing across all tenants ---- */}
                <div className="sap-form">
                  <h4>Plan pricing (all tenants)</h4>
                  <p className="sap-hint">Price changes apply to the Buy screen in the app immediately.</p>
                  <table className="sap-table">
                    <thead>
                      <tr><th>Plan</th><th>Duration</th><th style={{ width: 160 }}>Price (₹)</th></tr>
                    </thead>
                    <tbody>
                      {appPlans.map((p) => (
                        <tr key={p.planId}>
                          <td>{p.name}{p.badge ? ` · ${p.badge}` : ""}</td>
                          <td>{p.duration}</td>
                          <td>
                            <input
                              type="number"
                              value={planDraft[p.planId] ?? p.price}
                              onChange={(e) => setPlanDraft({ ...planDraft, [p.planId]: e.target.value })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="sap-actions">
                    <button className="sap-btn primary" disabled={appSaving} onClick={savePlanPrices}>
                      <BsCloudUploadFill /> Save prices
                    </button>
                    <button className="sap-btn" disabled={appSaving} onClick={clearPlanOverride}>
                      Reset to defaults
                    </button>
                  </div>
                </div>

                {/* ---- In-app banner + support ---- */}
                <div className="sap-form">
                  <h4>In-app banner &amp; support</h4>
                  <label>Announcement banner (empty = hidden)</label>
                  <input
                    defaultValue={appConfig.announcementBanner || ""}
                    onBlur={(e) => e.target.value !== appConfig.announcementBanner &&
                      saveAppConfig({ announcementBanner: e.target.value }, "Banner updated")}
                  />
                  <div className="sap-grid-2">
                    <div>
                      <label>Support phone</label>
                      <input
                        defaultValue={appConfig.supportPhone || ""}
                        onBlur={(e) => e.target.value !== appConfig.supportPhone &&
                          saveAppConfig({ supportPhone: e.target.value }, "Support phone updated")}
                      />
                    </div>
                    <div>
                      <label>Support email</label>
                      <input
                        defaultValue={appConfig.supportEmail || ""}
                        onBlur={(e) => e.target.value !== appConfig.supportEmail &&
                          saveAppConfig({ supportEmail: e.target.value }, "Support email updated")}
                      />
                    </div>
                  </div>
                </div>

                {/* ---- Blocked tenants ---- */}
                <div className="sap-form">
                  <h4>Blocked installs</h4>
                  <label>Business IDs to block (one per line)</label>
                  <textarea
                    rows={3}
                    defaultValue={(appConfig.blockedTenants || []).join("\n")}
                    onBlur={(e) => saveAppConfig(
                      { blockedTenants: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) },
                      "Block list updated")}
                  />
                </div>
              </>
            )}
          </section>
        )}

        {/* ================= BROADCAST ================= */}
        {activeTab === "broadcast" && (
          <section className="sap-card sap-narrow">
            <div className="sap-card-head"><h3>Broadcast a platform notification</h3></div>
            <form className="sap-form" onSubmit={handleBroadcast}>
              <label>Title</label>
              <input
                placeholder="e.g. Scheduled maintenance on Sunday 2 AM"
                value={broadcastForm.title}
                onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              />
              <label>Message *</label>
              <textarea
                rows="4"
                placeholder="What should every tenant know?"
                value={broadcastForm.message}
                onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
              />
              <div className="sap-form-row">
                <div>
                  <label>Type</label>
                  <select value={broadcastForm.type} onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })}>
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label>Target</label>
                  <select value={broadcastForm.target} onChange={e => setBroadcastForm({ ...broadcastForm, target: e.target.value })}>
                    <option value="ALL">All tenants</option>
                  </select>
                </div>
              </div>
              <button className="sap-btn sap-btn-primary sap-btn-wide" disabled={broadcastSending}>
                {broadcastSending ? "Sending…" : (<><BsMegaphoneFill /> Send broadcast</>)}
              </button>
              <p className="sap-hint">Delivered to the in-app notification inbox of every tenant. Recorded in the audit trail.</p>
            </form>
          </section>
        )}

        {/* ================= AUDIT ================= */}
        {activeTab === "audit" && (
          <section className="sap-card">
            <div className="sap-card-head">
              <h3>Platform audit trail <span className="sap-muted">({Number(audit.totalElements).toLocaleString("en-IN")} events)</span></h3>
            </div>
            <div className="sap-table-wrap">
              <table className="sap-table">
                <thead>
                  <tr><th>When</th><th>Actor</th><th>Role</th><th>Action</th><th>Entity</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {audit.content.map((a, i) => (
                    <tr key={i}>
                      <td className="nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" }) : "—"}</td>
                      <td>{a.userName || a.userId || "—"}</td>
                      <td>{a.userName === "SUPER_ADMIN" ? "SUPER_ADMIN" : a.userName || "—"}</td>
                      <td><span className="sap-feed-ev">{a.actionType || a.action || "—"}</span></td>
                      <td>{a.moduleName || "—"}{a.recordId ? ` · ${String(a.recordId).slice(0, 12)}` : ""}</td>
                      <td className="sap-note">{a.notes || a.description || "—"}</td>
                    </tr>
                  ))}
                  {audit.content.length === 0 && <tr><td colSpan="6" className="sap-empty">No audit events yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
