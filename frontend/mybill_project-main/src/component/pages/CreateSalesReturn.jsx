// CreateSalesReturn.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../createSalesReturn.css";
import { FiArrowLeft, FiSettings, FiSave, FiX } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { BsQrCodeScan } from "react-icons/bs";

export default function CreateSalesReturn() {
  const navigate = useNavigate();
  const [returnNo, setReturnNo] = useState(1);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [party, setParty] = useState("");
  const [invoiceLink, setInvoiceLink] = useState("");
  const [items, setItems] = useState([
    { id: Date.now(), name: "", hsn: "", qty: 1, price: 0, discount: 0, tax: 0, amount: 0 },
  ]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [extraDiscountFixed, setExtraDiscountFixed] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [autoRound, setAutoRound] = useState(false);
  const [paymentEntered, setPaymentEntered] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("salesReturns")) || [];
    setReturnNo(stored.length + 1);
  }, []);

  useEffect(() => {
    const updated = items.map((it) => {
      const qty = Number(it.qty) || 0;
      const price = Number(it.price) || 0;
      const discount = Number(it.discount) || 0;
      const tax = Number(it.tax) || 0;
      const base = qty * price;
      const discValue = (base * discount) / 100;
      const taxable = base - discValue;
      const taxValue = (taxable * tax) / 100;
      const amount = +(taxable + taxValue).toFixed(2);
      return { ...it, amount };
    });
    setItems(updated);
  }, []); // initial calc only

  function updateRow(id, field, value) {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: value };
        const qty = Number(next.qty) || 0;
        const price = Number(next.price) || 0;
        const discount = Number(next.discount) || 0;
        const tax = Number(next.tax) || 0;
        const base = qty * price;
        const discValue = (base * discount) / 100;
        const taxable = base - discValue;
        const taxValue = (taxable * tax) / 100;
        next.amount = +(taxable + taxValue).toFixed(2);
        return next;
      })
    );
  }

  function addItemRow() {
    setItems((p) => [...p, { id: Date.now() + Math.random(), name: "", hsn: "", qty: 1, price: 0, discount: 0, tax: 0, amount: 0 }]);
  }

  function removeItemRow(id) {
    setItems((p) => p.filter((r) => r.id !== id));
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const taxableAmount = items.reduce((s, it) => {
    const qty = Number(it.qty) || 0;
    const price = Number(it.price) || 0;
    const discount = Number(it.discount) || 0;
    const base = qty * price;
    const discValue = (base * discount) / 100;
    const taxable = base - discValue;
    return s + taxable;
  }, 0);
  const totalTax = subtotal - taxableAmount;
  const totalBeforeExtras = subtotal + Number(additionalCharges || 0) - Number(extraDiscountFixed || 0);
  const tcsValue = applyTCS ? +(totalBeforeExtras * 0.01).toFixed(2) : 0;
  const totalRaw = totalBeforeExtras + tcsValue;
  const total = autoRound ? Math.round(totalRaw) : +totalRaw.toFixed(2);
  const balance = total - (Number(paymentEntered) || 0);

  function handleSave() {
    if (!party) {
      alert("Add party");
      return;
    }
    if (items.length === 0 || items.every((it) => !it.name.trim())) {
      alert("Add at least one item");
      return;
    }
    const stored = JSON.parse(localStorage.getItem("salesReturns")) || [];
    const newR = {
      id: Date.now(),
      number: stored.length + 1,
      date: returnDate,
      party,
      invoice: invoiceLink,
      items,
      subtotal,
      discount: extraDiscountFixed,
      tax: totalTax,
      additionalCharges,
      tcsValue,
      total,
      paymentEntered,
      balance,
      status: paymentEntered >= total ? "Closed" : "Open",
    };
    stored.push(newR);
    localStorage.setItem("salesReturns", JSON.stringify(stored));
    navigate("/sales-return");
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content create-sales-return" style={{ marginTop: "2%" }}>
          {/* Enhanced Header */}
          <div className="top-bar">
            <div className="left-bar">
              <Link to="/sales-return"><FiArrowLeft className="back-icon" /></Link>
              <div className="header-text">
                <h2>
                  <i className="bi bi-arrow-return-left"></i> Create Sales Return
                </h2>
                <p className="header-subtitle">Process customer returns and refunds</p>
              </div>
            </div>
            <div className="right-bar">
              <button className="settings-btn"><FiSettings /> Settings</button>
              <button className="cancel-btn" onClick={() => navigate("/sales-return")}>
                <FiX /> Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                <FiSave /> Save Return
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="return-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="card-content">
                <h4>Return No.</h4>
                <p>SR-{returnNo}</p>
              </div>
            </div>
            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-calendar-event"></i>
              </div>
              <div className="card-content">
                <h4>Return Date</h4>
                <p>{new Date(returnDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div className="summary-card red">
              <div className="card-icon">
                <i className="bi bi-currency-rupee"></i>
              </div>
              <div className="card-content">
                <h4>Total Amount</h4>
                <p>₹ {total.toFixed(2)}</p>
              </div>
            </div>
            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="card-content">
                <h4>Items</h4>
                <p>{items.length}</p>
              </div>
            </div>
          </div>

          {/* Bill Section */}
          <div className="bill-section">
            <div className="bill-to">
              <h4><i className="bi bi-person-circle"></i> Bill To</h4>
              <div className="add-party-box">
                {party ? (
                  <div style={{ textAlign: "left" }}>
                    <strong><i className="bi bi-building"></i> {party}</strong>
                  </div>
                ) : (
                  <span><i className="bi bi-plus-circle"></i> Add Party</span>
                )}
              </div>
            </div>

            <div className="right-details">
              <div className="detail-row">
                <div className="detail-group">
                  <label><i className="bi bi-hash"></i> Sales Return No:</label>
                  <input type="text" value={returnNo} readOnly className="readonly-input" />
                </div>
                <div className="detail-group">
                  <label><i className="bi bi-calendar3"></i> Sales Return Date:</label>
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
              </div>

              <div className="detail-row">
                <div style={{ flex: 1 }}>
                  <label><i className="bi bi-link-45deg"></i> Link to Invoice:</label>
                  <input placeholder="Search invoices..." value={invoiceLink} onChange={(e) => setInvoiceLink(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="items-section">
            <div className="section-header">
              <i className="bi bi-cart3"></i>
              <h3>Return Items</h3>
            </div>
            <table className="items-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>ITEMS / SERVICES</th>
                  <th>HSN / SAC</th>
                  <th>QTY</th>
                  <th>PRICE / ITEM (₹)</th>
                  <th>DISCOUNT (%)</th>
                  <th>TAX (%)</th>
                  <th>AMOUNT (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td><input value={it.name} onChange={(e) => updateRow(it.id, "name", e.target.value)} placeholder="Item name" /></td>
                    <td><input value={it.hsn} onChange={(e) => updateRow(it.id, "hsn", e.target.value)} placeholder="HSN" /></td>
                    <td><input type="number" value={it.qty} onChange={(e) => updateRow(it.id, "qty", e.target.value)} /></td>
                    <td><input type="number" value={it.price} onChange={(e) => updateRow(it.id, "price", e.target.value)} /></td>
                    <td><input type="number" value={it.discount} onChange={(e) => updateRow(it.id, "discount", e.target.value)} /></td>
                    <td><input type="number" value={it.tax} onChange={(e) => updateRow(it.id, "tax", e.target.value)} /></td>
                    <td className="amount-cell">₹ {it.amount?.toFixed(2) || "0.00"}</td>
                    <td><button className="row-remove" onClick={() => removeItemRow(it.id)}><i className="bi bi-trash"></i></button></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="9" className="add-item-row">
                    <button className="add-row-btn" onClick={addItemRow}><AiOutlinePlus /> Add Item</button>
                    <button className="barcode-btn"><BsQrCodeScan /> Scan Barcode</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="footer-section">
            <div className="left-notes">
              <p className="add-notes" onClick={() => { }}><i className="bi bi-plus-circle"></i> Add Notes</p>
              <div className="terms">
                <h4><i className="bi bi-file-text"></i> Terms and Conditions</h4>
                <ol>
                  <li>Goods once sold will not be taken back or exchanged</li>
                  <li>All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only</li>
                </ol>
              </div>
              <p className="add-account"><i className="bi bi-bank"></i> Add New Account</p>
            </div>

            <div className="right-summary">
              <p className="link-text" onClick={() => { const v = prompt("Additional charges", additionalCharges); if (v !== null) setAdditionalCharges(Number(v || 0)); }}>
                <i className="bi bi-plus-circle"></i> Add Additional Charges
              </p>
              <div className="amount-row"><span>Taxable Amount</span><span>₹ {taxableAmount.toFixed(2)}</span></div>
              <p className="link-text" onClick={() => { const v = prompt("Discount amount", extraDiscountFixed); if (v !== null) setExtraDiscountFixed(Number(v || 0)); }}>
                <i className="bi bi-percent"></i> Add Discount
              </p>
              <div className="amount-row"><span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span></div>
              <div className="amount-row"><span>Tax</span><span>₹ {totalTax.toFixed(2)}</span></div>
              <div className="amount-row"><span>Additional Charges</span><span>₹ {Number(additionalCharges || 0).toFixed(2)}</span></div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={applyTCS} onChange={(e) => setApplyTCS(e.target.checked)} />
                  <span>Apply TCS (1%)</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={autoRound} onChange={(e) => setAutoRound(e.target.checked)} />
                  <span>Auto Round Off</span>
                </label>
              </div>

              <div className="total-amount-row">
                <span><i className="bi bi-calculator"></i> Total Amount</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>

              <div className="payment-entry">
                <label><i className="bi bi-wallet2"></i> Payment Entry</label>
                <div className="add-dropdown">
                  <select>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                  </select>
                  <input type="number" value={paymentEntered} onChange={(e) => setPaymentEntered(e.target.value)} placeholder="₹ 0.00" />
                </div>
                <button className="payment-btn" onClick={() => { alert("Payment entered"); }}>
                  <i className="bi bi-check-circle"></i> Enter Payment
                </button>
              </div>

              <div className="balance-amount">
                <span><i className="bi bi-cash-stack"></i> Balance Amount</span>
                <span>₹ {balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <p>Authorized signatory for <strong>Business Name</strong></p>
            <div className="add-signature">
              <i className="bi bi-pen"></i> Add Signature
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
