import React, { useState, useEffect } from "react";
import { 
  BsCashStack, 
  BsBoxSeam, 
  BsBank, 
  BsArrowUpRight, 
  BsGraphUp,
  BsCheckCircleFill,
  BsExclamationCircle
} from "react-icons/bs";
import { getInvoices, getAllProducts, getAllCustomers, getBankAccounts } from "../services/api";

export default function Cards() {
  const [toCollect, setToCollect] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStockUnits, setTotalStockUnits] = useState(0);
  const [cashBank, setCashBank] = useState(0);
  const [accountsCount, setAccountsCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [invoicesCount, setInvoicesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRealData = async () => {
      setLoading(true);
      try {
        const [invList, prodList, bankList] = await Promise.allSettled([
          getInvoices(userId),
          getAllProducts(),
          getBankAccounts()
        ]);

        // 1. Process Invoices & Receivables
        if (invList.status === "fulfilled" && Array.isArray(invList.value)) {
          const invoices = invList.value;
          const salesTotal = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
          const pendingInvoices = invoices.filter(inv => !inv.isSaled && !inv.isDeleted);
          const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

          setTotalSales(salesTotal);
          setInvoicesCount(invoices.length);
          setToCollect(pendingTotal);
          setUnpaidCount(pendingInvoices.length);
        } else {
          setTotalSales(0);
          setInvoicesCount(0);
          setToCollect(0);
          setUnpaidCount(0);
        }

        // 2. Process Products & Stock
        if (prodList.status === "fulfilled" && Array.isArray(prodList.value)) {
          const prods = prodList.value;
          setTotalProducts(prods.length);
          const stockSum = prods.reduce((sum, p) => sum + (Number(p.remainingStock) || Number(p.totalStock) || 0), 0);
          setTotalStockUnits(stockSum);
        } else {
          setTotalProducts(0);
          setTotalStockUnits(0);
        }

        // 3. Process Bank Accounts
        if (bankList.status === "fulfilled" && Array.isArray(bankList.value) && bankList.value.length > 0) {
          const accs = bankList.value;
          setAccountsCount(accs.length);
          const balanceTotal = accs.reduce((sum, a) => sum + (Number(a.currentBalance) || Number(a.openingBalance) || 0), 0);
          setCashBank(balanceTotal);
        } else {
          setCashBank(0);
          setAccountsCount(0);
        }
      } catch (err) {
        console.error("Error loading dashboard card metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  const fmtInr = (n) => `₹ ${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. To Collect (Pending Receivables) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            To Collect (Receivables)
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-inner">
            <BsCashStack />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight mb-2 font-mono">
          {loading ? "..." : fmtInr(toCollect)}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`inline-flex items-center gap-1 font-semibold ${unpaidCount > 0 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"} px-2 py-0.5 rounded-full`}>
            {unpaidCount > 0 ? <BsExclamationCircle /> : <BsCheckCircleFill />}
            {unpaidCount > 0 ? `${unpaidCount} Pending` : "All Clear"}
          </span>
          <span className="text-slate-400">Customer Dues</span>
        </div>
      </div>

      {/* 2. Inventory Items & Stock */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 rounded-l"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Catalog & Stock
          </span>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg shadow-inner">
            <BsBoxSeam />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight mb-2 font-mono">
          {loading ? "..." : `${totalProducts} Products`}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
            <BsArrowUpRight /> {totalStockUnits.toLocaleString('en-IN')} Total Units
          </span>
          <span className="text-slate-400">Inventory</span>
        </div>
      </div>

      {/* 3. Cash & Bank Balance */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Liquid Cash + Bank
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-inner">
            <BsBank />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight mb-2 font-mono">
          {loading ? "..." : fmtInr(cashBank)}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <BsCheckCircleFill className="text-xs" /> {accountsCount > 0 ? `${accountsCount} Bank Accounts` : "Cash In Hand"}
          </span>
          <span className="text-slate-400">Live Balance</span>
        </div>
      </div>

      {/* 4. Total Sales */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 rounded-l"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Sales Revenue
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
            <BsGraphUp />
          </div>
        </div>
        <div className="text-2xl font-black text-indigo-700 tracking-tight mb-2 font-mono">
          {loading ? "..." : fmtInr(totalSales)}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            <BsArrowUpRight /> {invoicesCount} Invoices
          </span>
          <span className="text-slate-400">Verified</span>
        </div>
      </div>
    </div>
  );
}
