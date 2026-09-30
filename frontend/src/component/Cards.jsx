import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BsCashStack,
  BsBoxSeam,
  BsBank,
  BsArrowUpRight,
  BsGraphUp,
  BsCheckCircleFill,
  BsExclamationCircle,
} from "react-icons/bs";
import { getSales, getAllProducts, getBankAccounts } from "../services/api";

/**
 * Executive KPI cards on the Dashboard - Enterprise Edition.
 * Real-time synced, gracefully cached in sessionStorage, zero hang on loading.
 */
export default function Cards() {
  // Read cached metrics if available to eliminate initial '...'
  const getCached = () => {
    try {
      const saved = sessionStorage.getItem("tsar_dashboard_kpis");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const cached = getCached();

  const [toCollect, setToCollect] = useState(cached?.toCollect || 0);
  const [unpaidCount, setUnpaidCount] = useState(cached?.unpaidCount || 0);
  const [totalProducts, setTotalProducts] = useState(cached?.totalProducts || 0);
  const [totalStockUnits, setTotalStockUnits] = useState(cached?.totalStockUnits || 0);
  const [cashBank, setCashBank] = useState(cached?.cashBank || 0);
  const [accountsCount, setAccountsCount] = useState(cached?.accountsCount || 0);
  const [totalSales, setTotalSales] = useState(cached?.totalSales || 0);
  const [salesCount, setSalesCount] = useState(cached?.salesCount || 0);
  const [loading, setLoading] = useState(!cached);

  const fetchRealData = useCallback(async () => {
    const userBusinessId = localStorage.getItem("userBusinessId");

    // Guard timeout to prevent cards from being stuck in loading state
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500, "timeout"));

    try {
      const results = await Promise.race([
        Promise.allSettled([
          getSales(),
          getAllProducts(userBusinessId),
          getBankAccounts(),
        ]),
        timeoutPromise
      ]);

      if (results === "timeout") {
        setLoading(false);
        return;
      }

      const [salesRes, prodRes, bankRes] = results;

      let nextToCollect = 0;
      let nextUnpaidCount = 0;
      let nextTotalSales = 0;
      let nextSalesCount = 0;
      let nextTotalProducts = 0;
      let nextStockSum = 0;
      let nextCashBank = 0;
      let nextAccountsCount = 0;

      // 1. Sales: revenue + true receivables
      if (salesRes.status === "fulfilled" && Array.isArray(salesRes.value)) {
        const seen = new Set();
        const sales = salesRes.value.filter((s) => {
          const key = s.saleId ?? s.saleItemId ?? `${s.customerId}-${s.amount}-${s.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const amountOf = (s) => Number(s.amount ?? s.totalAmount ?? 0) || 0;
        const isPaidSale = (s) => {
          if (s.isPaid === true || s.paid === true) return true;
          if (s.isPaid === false || s.paid === false) return false;
          const status = String(s.status || "").toUpperCase();
          if (status === "PAID" || status === "SETTLED") return true;
          if (status === "UNPAID" || status === "PENDING" || status === "DUE") return false;
          return true;
        };
        nextTotalSales = sales.reduce((sum, s) => sum + amountOf(s), 0);
        const unpaid = sales.filter((s) => !isPaidSale(s));
        nextToCollect = unpaid.reduce((sum, s) => sum + amountOf(s), 0);
        nextSalesCount = sales.length;
        nextUnpaidCount = unpaid.length;
      }

      // 2. Products & stock
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
        let prods = prodRes.value;
        if (userBusinessId) {
          prods = prods.filter((p) => !p.userBusinessId || p.userBusinessId === userBusinessId);
        }
        nextTotalProducts = prods.length;
        nextStockSum = prods.reduce(
          (sum, p) => sum + (Number(p.remainingStock) || Number(p.totalStock) || 0),
          0
        );
      }

      // 3. Bank accounts balance
      if (bankRes.status === "fulfilled" && Array.isArray(bankRes.value) && bankRes.value.length > 0) {
        const accs = bankRes.value;
        nextAccountsCount = accs.length;
        nextCashBank = accs.reduce(
          (sum, a) => sum + (Number(a.currentBalance) || Number(a.openingBalance) || 0),
          0
        );
      }

      // Commit to state
      setToCollect(nextToCollect);
      setUnpaidCount(nextUnpaidCount);
      setTotalSales(nextTotalSales);
      setSalesCount(nextSalesCount);
      setTotalProducts(nextTotalProducts);
      setTotalStockUnits(nextStockSum);
      setCashBank(nextCashBank);
      setAccountsCount(nextAccountsCount);

      // Save to cache for instant rendering next time
      try {
        sessionStorage.setItem("tsar_dashboard_kpis", JSON.stringify({
          toCollect: nextToCollect,
          unpaidCount: nextUnpaidCount,
          totalSales: nextTotalSales,
          salesCount: nextSalesCount,
          totalProducts: nextTotalProducts,
          totalStockUnits: nextStockSum,
          cashBank: nextCashBank,
          accountsCount: nextAccountsCount,
        }));
      } catch (e) {}

    } catch (err) {
      console.warn("Notice: KPI metrics sync notice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();

    // Auto-refresh when tab regains focus or billing data changes
    const onFocus = () => fetchRealData();
    window.addEventListener("focus", onFocus);
    window.addEventListener("tsar_data_mutated", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("tsar_data_mutated", onFocus);
    };
  }, [fetchRealData]);

  const fmtInr = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="dashboard-cards-grid">
      {/* 1. To Collect (true receivables from unpaid sales) */}
      <Link to="/sales-invoices" className="executive-stat-card stat-card-link">
        <div className="stat-icon-wrapper amber">
          <BsCashStack />
        </div>
        <div className="stat-info-wrap">
          <div className="stat-label-text">To Collect (Receivables)</div>
          <div className="stat-main-number font-mono">
            {loading && !cached ? <span className="stat-skeleton">₹ 0.00</span> : fmtInr(toCollect)}
          </div>
          <div className="stat-foot-row">
            <span className={`stat-trend-tag ${unpaidCount > 0 ? "negative" : "positive"}`}>
              {unpaidCount > 0 ? <BsExclamationCircle /> : <BsCheckCircleFill />}
              {unpaidCount > 0 ? `${unpaidCount} unpaid bill${unpaidCount > 1 ? "s" : ""}` : "All collected"}
            </span>
            <span className="stat-foot-note">Customer dues</span>
          </div>
        </div>
      </Link>

      {/* 2. Catalog & Stock */}
      <Link to="/inventory" className="executive-stat-card stat-card-link">
        <div className="stat-icon-wrapper emerald">
          <BsBoxSeam />
        </div>
        <div className="stat-info-wrap">
          <div className="stat-label-text">Catalog &amp; Stock</div>
          <div className="stat-main-number">
            {loading && !cached ? <span className="stat-skeleton">0 Products</span> : `${totalProducts} Products`}
          </div>
          <div className="stat-foot-row">
            <span className="stat-trend-tag positive">
              <BsArrowUpRight /> {totalStockUnits.toLocaleString("en-IN")} units
            </span>
            <span className="stat-foot-note">Inventory</span>
          </div>
        </div>
      </Link>

      {/* 3. Liquid Cash + Bank */}
      <Link to="/cash/bank" className="executive-stat-card stat-card-link">
        <div className="stat-icon-wrapper rose">
          <BsBank />
        </div>
        <div className="stat-info-wrap">
          <div className="stat-label-text">Liquid Cash + Bank</div>
          <div className="stat-main-number font-mono">
            {loading && !cached ? <span className="stat-skeleton">₹ 0.00</span> : fmtInr(cashBank)}
          </div>
          <div className="stat-foot-row">
            <span className="stat-trend-tag positive">
              <BsCheckCircleFill /> {accountsCount} account{accountsCount === 1 ? "" : "s"}
            </span>
            <span className="stat-foot-note">Live balance</span>
          </div>
        </div>
      </Link>

      {/* 4. Total Sales Revenue (confirmed sales) */}
      <Link to="/sales-invoices" className="executive-stat-card stat-card-link">
        <div className="stat-icon-wrapper indigo">
          <BsGraphUp />
        </div>
        <div className="stat-info-wrap">
          <div className="stat-label-text">Total Sales Revenue</div>
          <div className="stat-main-number font-mono">
            {loading && !cached ? <span className="stat-skeleton">₹ 0.00</span> : fmtInr(totalSales)}
          </div>
          <div className="stat-foot-row">
            <span className="stat-trend-tag neutral">
              <BsArrowUpRight /> {salesCount} sale{salesCount === 1 ? "" : "s"}
            </span>
            <span className="stat-foot-note">Confirmed bills</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
