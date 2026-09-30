import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  BsCheckCircleFill, 
  BsCircle, 
  BsListCheck, 
  BsArrowRight,
  BsStars,
  BsArrowRepeat,
  BsCalendarCheck,
  BsLightningChargeFill,
  BsShieldCheck,
  BsCheck2Circle
} from "react-icons/bs";
import { 
  getAllProducts, 
  getBankAccounts, 
  getInvoices, 
  getGodowns,
  getSales,
  getBusinessSettings 
} from "../services/api";

/**
 * Setup & Daily Checklist - Enterprise Edition
 * Features:
 *  - Real-time automated verification against live backend APIs
 *  - Dual-mode tabs: 📋 Onboarding Setup (Core Milestones) & ⚡ Daily Checklist (Daily Store Routines)
 *  - Instant interactive toggle with localStorage persistence
 *  - Real-time auto-refresh on window focus and manual re-sync button
 *  - Daily tasks reset cleanly each calendar day
 */
export default function Checklist() {
  const [activeTab, setActiveTab] = useState("setup"); // "setup" | "daily"
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState("");

  // Default Onboarding Setup Items
  const initialSetupItems = [
    { 
      id: 1, 
      key: "profile", 
      title: "Configure Business Profile & GST", 
      desc: "Add your legal entity name, GSTIN & registered address",
      link: "/business-settings", 
      completed: false 
    },
    { 
      id: 2, 
      key: "godown", 
      title: "Add Warehouse / Godown Location", 
      desc: "Designate central stock depot or retail counter",
      link: "/godown", 
      completed: false 
    },
    { 
      id: 3, 
      key: "inventory", 
      title: "Add First Inventory Product", 
      desc: "Catalog items with selling price, tax rate & barcode",
      link: "/inventory", 
      completed: false 
    },
    { 
      id: 4, 
      key: "invoice", 
      title: "Create First Sales Invoice", 
      desc: "Issue an audit-compliant GST bill or POS receipt",
      link: "/create-invoice", 
      completed: false 
    },
    { 
      id: 5, 
      key: "bank", 
      title: "Set up Bank Account & UPI ID", 
      desc: "Enable QR payments and link company bank ledger",
      link: "/cash/bank", 
      completed: false 
    },
  ];

  // Default Daily Checklist Items
  const todayKey = new Date().toISOString().slice(0, 10);
  const initialDailyItems = [
    { 
      id: 101, 
      key: "daily_cash", 
      title: "Opening Cash & Float Count", 
      desc: "Verify counter starting cash before business hours",
      link: "/cash/bank", 
      completed: false 
    },
    { 
      id: 102, 
      key: "daily_stock", 
      title: "Inspect Low Stock & Reorder Alerts", 
      desc: "Replenish high-velocity items and critical inventory",
      link: "/inventory", 
      completed: false 
    },
    { 
      id: 103, 
      key: "daily_sales", 
      title: "Issue Daily Counter Bills & Sales", 
      desc: "Record customer transactions via Quick POS or Invoicing",
      link: "/pos-billing", 
      completed: false 
    },
    { 
      id: 104, 
      key: "daily_collections", 
      title: "Follow-Up on Unpaid Customer Dues", 
      desc: "Review receivables and collect overdue balances",
      link: "/sales-invoices", 
      completed: false 
    },
    { 
      id: 105, 
      key: "daily_closing", 
      title: "Day-End Register Closing & Summary", 
      desc: "Reconcile daily cash, UPI receipts & view Daybook",
      link: "/reports", 
      completed: false 
    },
  ];

  const [setupItems, setSetupItems] = useState(initialSetupItems);
  const [dailyItems, setDailyItems] = useState(initialDailyItems);

  // Real-time verification against backend + local state
  const verifyLiveProgress = useCallback(async () => {
    setSyncing(true);
    let storedUser = {};
    let businessData = {};
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      businessData = JSON.parse(localStorage.getItem("businessData") || "{}");
    } catch (e) {}

    const userId = localStorage.getItem("userId") || storedUser.userId || storedUser.id;
    const userBusinessId = localStorage.getItem("userBusinessId") || businessData.userBusinessId || storedUser.businessId;

    // 1. Profile Verification:
    // Check local profile + try fetching backend business settings if available
    let hasProfile = Boolean(
      (storedUser.businessName && storedUser.businessName !== "My Business") ||
      (businessData.businessName && businessData.businessName !== "My Business") ||
      businessData.gstNo ||
      storedUser.gstNo ||
      userBusinessId
    );

    // 2. Query products, bank accounts, invoices, sales, godowns in parallel with graceful fallbacks
    let hasGodown = false;
    let hasProducts = false;
    let hasInvoices = false;
    let hasBank = false;
    let hasTodaySales = false;

    try {
      const [prodRes, bankRes, invRes, salesRes, godownRes] = await Promise.allSettled([
        getAllProducts(userBusinessId),
        getBankAccounts(),
        userId ? getInvoices(userId) : Promise.resolve([]),
        getSales(),
        userBusinessId ? getGodowns(userBusinessId) : Promise.resolve([]),
      ]);

      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
        hasProducts = true;
      }
      if (bankRes.status === "fulfilled" && Array.isArray(bankRes.value) && bankRes.value.length > 0) {
        hasBank = true;
      }
      if (invRes.status === "fulfilled" && Array.isArray(invRes.value) && invRes.value.length > 0) {
        hasInvoices = true;
      }
      if (salesRes.status === "fulfilled" && Array.isArray(salesRes.value) && salesRes.value.length > 0) {
        hasInvoices = true; // Sales also count as created invoices
        // Check if any sale was created today
        const todayStr = new Date().toISOString().slice(0, 10);
        hasTodaySales = salesRes.value.some(s => s.date && String(s.date).includes(todayStr));
      }
      if (godownRes.status === "fulfilled" && Array.isArray(godownRes.value) && godownRes.value.length > 0) {
        hasGodown = true;
      } else if (userBusinessId) {
        // Many single-branch stores use default business premises as godown
        hasGodown = true;
      }
    } catch (err) {
      console.warn("Checklist verification network notice:", err);
    }

    // Load manual user overrides from localStorage
    let setupOverrides = {};
    let dailyOverrides = {};
    try {
      setupOverrides = JSON.parse(localStorage.getItem("portal_setup_overrides") || "{}");
      dailyOverrides = JSON.parse(localStorage.getItem(`portal_daily_${todayKey}`) || "{}");
    } catch (e) {}

    // Update Setup Items with live detections or explicit user overrides
    setSetupItems([
      { 
        id: 1, 
        key: "profile", 
        title: "Configure Business Profile & GST", 
        desc: "Add your legal entity name, GSTIN & registered address",
        link: "/business-settings", 
        completed: setupOverrides.profile !== undefined ? setupOverrides.profile : hasProfile 
      },
      { 
        id: 2, 
        key: "godown", 
        title: "Add Warehouse / Godown Location", 
        desc: "Designate central stock depot or retail counter",
        link: "/godown", 
        completed: setupOverrides.godown !== undefined ? setupOverrides.godown : hasGodown 
      },
      { 
        id: 3, 
        key: "inventory", 
        title: "Add First Inventory Product", 
        desc: "Catalog items with selling price, tax rate & barcode",
        link: "/inventory", 
        completed: setupOverrides.inventory !== undefined ? setupOverrides.inventory : hasProducts 
      },
      { 
        id: 4, 
        key: "invoice", 
        title: "Create First Sales Invoice", 
        desc: "Issue an audit-compliant GST bill or POS receipt",
        link: "/create-invoice", 
        completed: setupOverrides.invoice !== undefined ? setupOverrides.invoice : hasInvoices 
      },
      { 
        id: 5, 
        key: "bank", 
        title: "Set up Bank Account & UPI ID", 
        desc: "Enable QR payments and link company bank ledger",
        link: "/cash/bank", 
        completed: setupOverrides.bank !== undefined ? setupOverrides.bank : hasBank 
      },
    ]);

    // Update Daily Items with today's status or overrides
    setDailyItems([
      { 
        id: 101, 
        key: "daily_cash", 
        title: "Opening Cash & Float Count", 
        desc: "Verify counter starting cash before business hours",
        link: "/cash/bank", 
        completed: dailyOverrides.daily_cash !== undefined ? dailyOverrides.daily_cash : false 
      },
      { 
        id: 102, 
        key: "daily_stock", 
        title: "Inspect Low Stock & Reorder Alerts", 
        desc: "Replenish high-velocity items and critical inventory",
        link: "/inventory", 
        completed: dailyOverrides.daily_stock !== undefined ? dailyOverrides.daily_stock : false 
      },
      { 
        id: 103, 
        key: "daily_sales", 
        title: "Issue Daily Counter Bills & Sales", 
        desc: "Record customer transactions via Quick POS or Invoicing",
        link: "/pos-billing", 
        completed: dailyOverrides.daily_sales !== undefined ? dailyOverrides.daily_sales : hasTodaySales 
      },
      { 
        id: 104, 
        key: "daily_collections", 
        title: "Follow-Up on Unpaid Customer Dues", 
        desc: "Review receivables and collect overdue balances",
        link: "/sales-invoices", 
        completed: dailyOverrides.daily_collections !== undefined ? dailyOverrides.daily_collections : false 
      },
      { 
        id: 105, 
        key: "daily_closing", 
        title: "Day-End Register Closing & Summary", 
        desc: "Reconcile daily cash, UPI receipts & view Daybook",
        link: "/reports", 
        completed: dailyOverrides.daily_closing !== undefined ? dailyOverrides.daily_closing : false 
      },
    ]);

    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSyncing(false);
  }, [todayKey]);

  // Initial load + real-time event listeners
  useEffect(() => {
    verifyLiveProgress();

    // Re-verify automatically when browser tab regains focus
    const handleFocus = () => verifyLiveProgress();
    window.addEventListener("focus", handleFocus);

    // Listen for custom billing data mutation events
    const handleDataMutated = () => verifyLiveProgress();
    window.addEventListener("tsar_data_mutated", handleDataMutated);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("tsar_data_mutated", handleDataMutated);
    };
  }, [verifyLiveProgress]);

  // Toggle Setup Item
  const toggleSetupItem = (id) => {
    setSetupItems(prev => {
      const target = prev.find(i => i.id === id);
      if (!target) return prev;
      const nextState = !target.completed;
      const updated = prev.map(item => item.id === id ? { ...item, completed: nextState } : item);
      try {
        const overrides = JSON.parse(localStorage.getItem("portal_setup_overrides") || "{}");
        overrides[target.key] = nextState;
        localStorage.setItem("portal_setup_overrides", JSON.stringify(overrides));
      } catch (e) {}
      return updated;
    });
  };

  // Toggle Daily Item
  const toggleDailyItem = (id) => {
    setDailyItems(prev => {
      const target = prev.find(i => i.id === id);
      if (!target) return prev;
      const nextState = !target.completed;
      const updated = prev.map(item => item.id === id ? { ...item, completed: nextState } : item);
      try {
        const overrides = JSON.parse(localStorage.getItem(`portal_daily_${todayKey}`) || "{}");
        overrides[target.key] = nextState;
        localStorage.setItem(`portal_daily_${todayKey}`, JSON.stringify(overrides));
      } catch (e) {}
      return updated;
    });
  };

  // Progress metrics calculation
  const currentItems = activeTab === "setup" ? setupItems : dailyItems;
  const currentToggle = activeTab === "setup" ? toggleSetupItem : toggleDailyItem;
  const completedCount = currentItems.filter(i => i.completed).length;
  const totalCount = currentItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const setupDoneCount = setupItems.filter(i => i.completed).length;
  const dailyDoneCount = dailyItems.filter(i => i.completed).length;

  return (
    <div className="dashboard-card-box checklist-enterprise-box">
      {/* Box Header */}
      <div className="box-header d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="checklist-header-icon-wrap">
            <BsListCheck className="fs-5 text-primary" />
          </div>
          <div>
            <h4 className="checklist-main-title mb-0">Setup &amp; Daily Checklist</h4>
            <span className="checklist-subtext text-muted">
              {activeTab === "setup" ? "Onboarding Milestone Tracker" : "Daily Operational Routine"}
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            type="button"
            className={`btn-sync-refresh ${syncing ? "syncing" : ""}`}
            onClick={verifyLiveProgress}
            title={lastSyncedTime ? `Live synced at ${lastSyncedTime}. Click to re-verify.` : "Click to re-verify live"}
          >
            <BsArrowRepeat />
          </button>
          <span className="badge checklist-badge-count">
            {completedCount}/{totalCount} Done
          </span>
        </div>
      </div>

      {/* Segmented Mode Switcher */}
      <div className="checklist-segmented-nav mb-3">
        <button
          type="button"
          className={`checklist-nav-pill ${activeTab === "setup" ? "active" : ""}`}
          onClick={() => setActiveTab("setup")}
        >
          <BsShieldCheck className="me-1" />
          <span>Setup Milestones</span>
          <span className="pill-counter">{setupDoneCount}/{setupItems.length}</span>
        </button>

        <button
          type="button"
          className={`checklist-nav-pill ${activeTab === "daily" ? "active" : ""}`}
          onClick={() => setActiveTab("daily")}
        >
          <BsCalendarCheck className="me-1" />
          <span>Daily Checklist</span>
          <span className="pill-counter">{dailyDoneCount}/{dailyItems.length}</span>
        </button>
      </div>

      {/* Real-time Progress Bar */}
      <div className="checklist-progress-block mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="progress-label">
            {activeTab === "setup" ? "Onboarding Progress" : "Today's Operations Progress"}
          </span>
          <span className={`progress-percentage ${progressPercent === 100 ? "text-success fw-bolder" : ""}`}>
            {progressPercent}% Complete
          </span>
        </div>
        <div className="progress checklist-bar-track">
          <div 
            className={`progress-bar checklist-bar-fill ${progressPercent === 100 ? "completed" : ""}`}
            role="progressbar" 
            style={{ width: `${progressPercent}%` }}
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      {/* Dynamic Item List */}
      <div className="checklist-items-stack mb-3">
        {currentItems.map((item) => (
          <div 
            key={item.id} 
            className={`checklist-item-row ${item.completed ? "is-completed" : "is-pending"}`}
          >
            {/* Interactive Checkbox Control */}
            <button
              type="button"
              className="checklist-check-btn"
              onClick={() => currentToggle(item.id)}
              title={item.completed ? "Click to mark pending" : "Click to mark completed"}
              aria-label={`Mark ${item.title}`}
            >
              {item.completed ? (
                <BsCheckCircleFill className="check-icon-done" />
              ) : (
                <BsCircle className="check-icon-pending" />
              )}
            </button>

            {/* Title & Description */}
            <div 
              className="checklist-text-area"
              onClick={() => currentToggle(item.id)}
            >
              <div className={`checklist-item-title ${item.completed ? "text-strike" : ""}`}>
                {item.title}
              </div>
              <div className="checklist-item-desc">
                {item.desc}
              </div>
            </div>

            {/* Quick Action Navigation */}
            <Link 
              to={item.link} 
              className="checklist-action-arrow"
              title={`Go to ${item.title}`}
            >
              <BsArrowRight />
            </Link>
          </div>
        ))}
      </div>

      {/* Completion Status / Next Step Message */}
      {progressPercent === 100 ? (
        <div className="checklist-completion-banner animate-fade-in">
          <div className="completion-icon-wrap">
            <BsStars className="fs-5" />
          </div>
          <div className="completion-text">
            <strong>{activeTab === "setup" ? "All Set Up! 🚀" : "All Tasks Cleared! 🌟"}</strong>
            <div>
              {activeTab === "setup" 
                ? "Your enterprise workspace is 100% configured for automated e-invoicing & GST compliance."
                : "Today's store closing and accounting checkpoints are complete."}
            </div>
          </div>
        </div>
      ) : (
        <div className="checklist-footer-note">
          <span className="dot-live"></span>
          <span>
            {activeTab === "setup"
              ? "Complete remaining setup items to unlock automated e-invoicing & multi-godown sync."
              : "Check off operational routines as you complete them throughout the workday."}
          </span>
        </div>
      )}
    </div>
  );
}
