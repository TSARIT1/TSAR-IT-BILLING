// CreateSalesReturn.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../createSalesReturn.css";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
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
        <div className="dashboard-content create-sales-return" style={{ marginTop: "5%" }}>
          <div className="top-bar">
            <div className="left-bar">
              <Link to="/sales-return"><FiArrowLeft className="back-icon" /></Link>
              <h2>Create Sales Return</h2>
            </div>
            <div className="right-bar">
              <button className="settings-btn"><FiSettings /> Settings</button>
              <button className="save-btn" onClick={handleSave}>Save Sales Return</button>
            </div>
          </div>

          <div className="bill-section">
            <div className="bill-to">
              <h4>Bill To</h4>
              <div className="add-party-box">{party ? <div style={{ textAlign: "left" }}><strong>{party}</strong></div> : "+ Add Party"}</div>
            </div>

            <div className="right-details">
              <div className="detail-row">
                <div className="detail-group">
                  <label>Sales Return No:</label>
                  <input type="text" value={returnNo} readOnly />
                </div>
                <div className="detail-group">
                  <label>Sales Return Date:</label>
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
              </div>

              <div className="detail-row">
                <div style={{ flex: 1 }}>
                  <label>Link to Invoice :</label>
                  <input placeholder="Search invoices" value={invoiceLink} onChange={(e) => setInvoiceLink(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="items-section">
            <table className="items-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>ITEMS / SERVICES</th>
                  <th>HSN / SAC</th>
                  <th>QTY</th>
                  <th>PRICE / ITEM (₹)</th>
                  <th>DISCOUNT</th>
                  <th>TAX</th>
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
                    <td>₹ {it.amount?.toFixed(2) || "0.00"}</td>
                    <td><button className="row-remove" onClick={() => removeItemRow(it.id)}>Remove</button></td>
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

          <div className="footer-section">
            <div className="left-notes">
              <p className="add-notes" onClick={() => { }}>+ Add Notes</p>
              <div className="terms">
                <h4>Terms and Conditions</h4>
                <ol>
                  <li>Goods once sold will not be taken back or exchanged</li>
                  <li>All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only</li>
                </ol>
              </div>
              <p className="add-account">+ Add New Account</p>
            </div>

            <div className="right-summary">
              <p className="link-text" onClick={() => { const v = prompt("Additional charges", additionalCharges); if (v !== null) setAdditionalCharges(Number(v || 0)); }}>+ Add Additional Charges</p>
              <div className="amount-row"><span>Taxable Amount</span><span>₹ {taxableAmount.toFixed(2)}</span></div>
              <p className="link-text" onClick={() => { const v = prompt("Discount amount", extraDiscountFixed); if (v !== null) setExtraDiscountFixed(Number(v || 0)); }}>+ Add Discount</p>
              <div className="amount-row"><span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span></div>
              <div className="amount-row"><span>Tax</span><span>₹ {totalTax.toFixed(2)}</span></div>
              <div className="amount-row"><span>Additional Charges</span><span>₹ {Number(additionalCharges || 0).toFixed(2)}</span></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <input type="checkbox" checked={applyTCS} onChange={(e) => setApplyTCS(e.target.checked)} />
                <label>Apply TCS</label>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <input type="checkbox" checked={autoRound} onChange={(e) => setAutoRound(e.target.checked)} />
                <label>Auto Round Off</label>
              </div>

              <div className="amount-row" style={{ marginTop: 12, fontWeight: 700 }}><span>Total Amount</span><span>₹ {total.toFixed(2)}</span></div>

              <div className="payment-entry" style={{ marginTop: 12 }}>
                <div className="add-dropdown">
                  <select>
                    <option>+ Add</option>
                  </select>
                  <input type="number" value={paymentEntered} onChange={(e) => setPaymentEntered(e.target.value)} placeholder="₹ 0" />
                </div>
                <button className="payment-btn" onClick={() => { alert("Payment entered"); }}>Enter Payment amount</button>
              </div>

              <div className="balance-amount" style={{ marginTop: 12 }}><span>Balance Amount</span><span>₹ {balance.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="signature-section">
            <p>Authorized signatory for <strong>Business Name</strong></p>
            <div className="add-signature">+ Add Signature</div>
          </div>
        </div>
      </div>
    </>
  );
}
