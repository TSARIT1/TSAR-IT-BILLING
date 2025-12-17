import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { BsQrCodeScan } from "react-icons/bs";
import "../allPart.css";

export default function CreateCreditNote() {
  const navigate = useNavigate();

  const [noteNo, setNoteNo] = useState(1);
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [party, setParty] = useState(null);
  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [parties, setParties] = useState([]);
  const [newParty, setNewParty] = useState({ name: "", mobile: "" });
  const [invoiceLink, setInvoiceLink] = useState("");
  const [items, setItems] = useState([{ id: Date.now(), name: "", hsn: "", qty: 1, price: 0, discount: 0, tax: 0, amount: 0 }]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [autoRound, setAutoRound] = useState(false);
  const [paymentEntered, setPaymentEntered] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("creditNotes")) || [];
    setNoteNo(stored.length + 1);
    const storedParties = JSON.parse(localStorage.getItem("parties")) || [];
    setParties(storedParties);
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
  }, []); 

  function updateItem(id, field, value) {
    setItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it;
        const next = { ...it, [field]: value };
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

  function addItem() {
    setItems(p => [...p, { id: Date.now() + Math.random(), name: "", hsn: "", qty: 1, price: 0, discount: 0, tax: 0, amount: 0 }]);
  }

  function removeItem(id) {
    setItems(p => p.filter(it => it.id !== id));
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
  const totalBeforeExtras = subtotal + Number(additionalCharges || 0) - Number(extraDiscount || 0);
  const tcsValue = applyTCS ? +(totalBeforeExtras * 0.01).toFixed(2) : 0;
  const totalRaw = totalBeforeExtras + tcsValue;
  const total = autoRound ? Math.round(totalRaw) : +totalRaw.toFixed(2);
  const balance = total - (Number(paymentEntered) || 0);

  function openPartyModal() {
    setPartyModalOpen(true);
  }

  function saveNewParty() {
    if (!newParty.name.trim()) return;
    const updated = [...parties, { ...newParty }];
    setParties(updated);
    localStorage.setItem("parties", JSON.stringify(updated));
    setParty(newParty);
    setNewParty({ name: "", mobile: "" });
    setPartyModalOpen(false);
  }

  function selectParty(p) {
    setParty(p);
    setPartyModalOpen(false);
  }

  function saveCreditNote() {
    if (!party) {
      alert("Please add/select a party");
      return;
    }
    if (items.length === 0 || items.every(it => !it.name.trim())) {
      alert("Please add at least one item");
      return;
    }
    const stored = JSON.parse(localStorage.getItem("creditNotes")) || [];
    const newNote = {
      id: Date.now(),
      number: stored.length + 1,
      date: noteDate,
      party: party.name,
      partyDetails: party,
      invoice: invoiceLink,
      items,
      subtotal,
      discount: extraDiscount,
      tax: totalTax,
      additionalCharges,
      tcsValue,
      total,
      paymentEntered,
      balance,
      status: paymentEntered >= total ? "Closed" : "Open"
    };
    stored.push(newNote);
    localStorage.setItem("creditNotes", JSON.stringify(stored));
    navigate("/credit-note");
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content create-credit" style={{ marginTop: "5%" }}>
          <div className="create-topbar">
            <div className="left">
              <Link to="/credit-note"><FiArrowLeft className="back" /></Link>
              <h2>Create Credit Note</h2>
            </div>
            <div className="right">
              <button className="settings-small"><FiSettings /></button>
              <button className="cancel-small" onClick={() => navigate("/credit-note")}>Cancel</button>
              <button className="save-small" onClick={saveCreditNote}>Save Credit Note</button>
            </div>
          </div>

          <div className="credit-body">
            <div className="left-area">
              <div className="bill-to-box">
                <h4>Bill To</h4>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="add-party-dashed" onClick={openPartyModal}>
                    {party ? (
                      <div style={{ textAlign: "left" }}>
                        <strong>{party.name}</strong>
                        <div style={{ fontSize: 13, color: "#666" }}>{party.mobile}</div>
                      </div>
                    ) : (
                      "+ Add Party"
                    )}
                  </div>
                </div>
              </div>

              <div className="items-area">
                <table className="create-items-table">
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>ITEMS / SERVICES</th>
                      <th>HSN / SAC</th>
                      <th>QTY</th>
                      <th>PRICE/ITEM (₹)</th>
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
                        <td><input value={it.name} onChange={(e) => updateItem(it.id, "name", e.target.value)} placeholder="Item name" /></td>
                        <td><input value={it.hsn} onChange={(e) => updateItem(it.id, "hsn", e.target.value)} placeholder="HSN" /></td>
                        <td><input type="number" value={it.qty} onChange={(e) => updateItem(it.id, "qty", e.target.value)} /></td>
                        <td><input type="number" value={it.price} onChange={(e) => updateItem(it.id, "price", e.target.value)} /></td>
                        <td><input type="number" value={it.discount} onChange={(e) => updateItem(it.id, "discount", e.target.value)} /></td>
                        <td><input type="number" value={it.tax} onChange={(e) => updateItem(it.id, "tax", e.target.value)} /></td>
                        <td>₹ {it.amount?.toFixed(2) || "0.00"}</td>
                        <td><button className="remove-row" onClick={() => removeItem(it.id)}>Remove</button></td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="9" className="add-row-cell">
                        <button className="add-item-btn" onClick={addItem}><AiOutlinePlus /> Add Item</button>
                        <button className="scan-barcode-btn"><BsQrCodeScan /> Scan Barcode</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="notes-section">
                <p className="add-notes-link">+ Add Notes</p>
                <div className="terms-box">
                  <h4>Terms and Conditions</h4>
                  <ol>
                    <li>Goods once sold will not be taken back or exchanged</li>
                    <li>All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only</li>
                  </ol>
                </div>
                <p className="add-account-link">+ Add New Account</p>
              </div>
            </div>

            <div className="right-area">
              <div className="meta-box">
                <div className="meta-row">
                  <div className="meta-item">
                    <label>Credit Note No:</label>
                    <input type="text" value={noteNo} readOnly />
                  </div>
                  <div className="meta-item">
                    <label>Credit Note Date:</label>
                    <input type="date" value={noteDate} onChange={(e) => setNoteDate(e.target.value)} />
                  </div>
                </div>

                <div className="meta-row">
                  <label>Link to Invoice :</label>
                  <input placeholder="Search invoices" value={invoiceLink} onChange={(e) => setInvoiceLink(e.target.value)} />
                </div>
              </div>

              <div className="summary-box">
                <p className="add-charge" onClick={() => { const v = prompt("Additional charges", additionalCharges); if (v !== null) setAdditionalCharges(Number(v || 0)); }}>+ Add Additional Charges</p>
                <div className="summary-line"><span>Taxable Amount</span><span>₹ {taxableAmount.toFixed(2)}</span></div>
                <p className="add-discount" onClick={() => { const v = prompt("Discount amount", extraDiscount); if (v !== null) setExtraDiscount(Number(v || 0)); }}>+ Add Discount</p>
                <div className="summary-line"><span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span></div>
                <div className="summary-line"><span>Tax</span><span>₹ {totalTax.toFixed(2)}</span></div>
                <div className="summary-line"><span>Additional Charges</span><span>₹ {Number(additionalCharges || 0).toFixed(2)}</span></div>

                <div className="check-row">
                  <input type="checkbox" checked={applyTCS} onChange={(e) => setApplyTCS(e.target.checked)} />
                  <label>Apply TCS</label>
                </div>

                <div className="check-row">
                  <input type="checkbox" checked={autoRound} onChange={(e) => setAutoRound(e.target.checked)} />
                  <label>Auto Round Off</label>
                </div>

                <div className="total-line"><span>Total Amount</span><span>₹ {total.toFixed(2)}</span></div>

                <div className="payment-entry">
                  <div className="pay-controls">
                    <select>
                      <option>+ Add</option>
                    </select>
                    <input type="number" placeholder="₹ 0" value={paymentEntered} onChange={(e) => setPaymentEntered(e.target.value)} />
                  </div>
                  <button className="enter-payment" onClick={() => alert("Payment entered")}>Enter Payment amount</button>
                </div>

                <div className="balance-line"><span>Balance Amount</span><span>₹ {balance.toFixed(2)}</span></div>
              </div>

              <div className="signature-box">
                <p>Authorized signatory for <strong>Business Name</strong></p>
                <div className="add-sign">+ Add Signature</div>
              </div>
            </div>
          </div>

          {partyModalOpen && (
            <div className="party-modal">
              <div className="party-modal-card">
                <h3>Select / Add Party</h3>
                <div className="existing-parties">
                  <strong>Existing Parties</strong>
                  <div>
                    {parties.length === 0 && <div className="no-party">No parties found</div>}
                    {parties.map((p, i) => (
                      <div className="party-row" key={i}>
                        <div>
                          <strong>{p.name}</strong>
                          <div className="party-mobile">{p.mobile}</div>
                        </div>
                        <div>
                          <button className="select-party-btn" onClick={() => selectParty(p)}>Select</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="add-party-section">
                  <strong>Add New Party</strong>
                  <div className="add-party-row">
                    <input className="party-input" placeholder="Party Name" value={newParty.name} onChange={(e) => setNewParty(s => ({ ...s, name: e.target.value }))} />
                    <input className="party-input" placeholder="Mobile" value={newParty.mobile} onChange={(e) => setNewParty(s => ({ ...s, mobile: e.target.value }))} />
                  </div>
                </div>

                <div className="party-modal-actions">
                  <button className="cancel-small" onClick={() => setPartyModalOpen(false)}>Cancel</button>
                  <button className="save-small" onClick={saveNewParty}>Save & Select</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
