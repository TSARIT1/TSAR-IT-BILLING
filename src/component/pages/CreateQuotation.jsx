import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";

function CreateQuotation() {
  const navigate = useNavigate();

  const [quotationNo, setQuotationNo] = useState(1);
  const [quotationDate, setQuotationDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [validDays, setValidDays] = useState(30);

  const [partyModalOpen, setPartyModalOpen] = useState(false);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newParty, setNewParty] = useState({ name: "", mobile: "" });

  const [items, setItems] = useState([
    { id: Date.now(), name: "", hsn: "", qty: 1, price: 0, discount: 0, tax: 0, amount: 0 },
  ]);

  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [autoRound, setAutoRound] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("quotations")) || [];
    setQuotationNo(stored.length + 1);

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

  const updateRow = (id, field, value) => {
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
  };

  const addItemRow = () => {
    setItems((p) => [
      ...p,
      { id: Date.now(), name: "", hsn: "", qty: 1, price: 0, discount: 0, tax: 0, amount: 0 },
    ]);
  };

  const removeItemRow = (id) => {
    setItems((p) => p.filter((r) => r.id !== id));
  };

  // ==== Amount Calculations ====
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
  const totalBeforeExtra = subtotal + Number(additionalCharges || 0) - Number(extraDiscount || 0);
  const tcsValue = applyTCS ? +(totalBeforeExtra * 0.01).toFixed(2) : 0;
  const totalRaw = totalBeforeExtra + tcsValue;
  const total = autoRound ? Math.round(totalRaw) : +totalRaw.toFixed(2);
  const balance = total - (Number(paymentAmount) || 0);

  const validityDate = (() => {
    const d = new Date(quotationDate);
    d.setDate(d.getDate() + Number(validDays || 0));
    return d.toISOString().split("T")[0];
  })();

  const openAddParty = () => setPartyModalOpen(true);

  const saveNewParty = () => {
    if (!newParty.name.trim()) return alert("Please enter party name");
    const updated = [...parties, { ...newParty }];
    setParties(updated);
    localStorage.setItem("parties", JSON.stringify(updated));
    setSelectedParty(newParty);
    setNewParty({ name: "", mobile: "" });
    setPartyModalOpen(false);
  };

  const handleSaveQuotation = () => {
    if (!selectedParty) return alert("Please select a party.");
    if (items.length === 0 || items.every((it) => !it.name.trim()))
      return alert("Please add at least one item.");

    const stored = JSON.parse(localStorage.getItem("quotations")) || [];
    const newQ = {
      id: Date.now(),
      number: `QTN-${stored.length + 1}`,
      date: quotationDate,
      party: selectedParty.name,
      items,
      additionalCharges: Number(additionalCharges || 0),
      extraDiscount: Number(extraDiscount || 0),
      total,
      paymentAmount: Number(paymentAmount || 0),
      balance,
      status: paymentAmount >= total ? "Closed" : "Open",
    };
    stored.push(newQ);
    localStorage.setItem("quotations", JSON.stringify(stored));
    alert("Quotation saved successfully!");
    navigate("/quotation-estimate");
  };

  const chooseParty = (p) => {
    setSelectedParty(p);
    setPartyModalOpen(false);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content create-quotation">
          <div className="quotation-top-bar">
            <div className="left-bar">
              <Link to="/quotation-estimate">
                <FiArrowLeft className="back-icon" />
              </Link>
              <h2>Create Quotation</h2>
            </div>
            <div className="right-bar">
              <button className="settings-btn">
                <FiSettings /> Settings
              </button>
              <button className="save-btn" onClick={handleSaveQuotation}>
                Save Quotation
              </button>
            </div>
          </div>

          <div className="quotation-body">
            <div className="bill-section">
              <div className="bill-to">
                <h4>Bill To</h4>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="add-party-box" onClick={openAddParty}>
                    {selectedParty ? (
                      <div style={{ textAlign: "left" }}>
                        <strong>{selectedParty.name}</strong>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          {selectedParty.mobile}
                        </div>
                      </div>
                    ) : (
                      "+ Add Party"
                    )}
                  </div>
                  {selectedParty && (
                    <button
                      style={{
                        background: "#fff",
                        border: "1px solid #ddd",
                        padding: "6px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedParty(null)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="quotation-details">
                <div className="detail-group">
                  <label>Quotation No:</label>
                  <input type="text" value={quotationNo} readOnly />
                </div>
                <div className="detail-group">
                  <label>Quotation Date:</label>
                  <input
                    type="date"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                  />
                </div>
                <div className="detail-group">
                  <label>Valid For:</label>
                  <div className="valid-days">
                    <input
                      type="number"
                      value={validDays}
                      onChange={(e) => setValidDays(e.target.value)}
                    />
                    <span>days</span>
                  </div>
                </div>
                <div className="detail-group">
                  <label>Validity Date:</label>
                  <input type="date" value={validityDate} readOnly />
                </div>
              </div>
            </div>

            {/* === ITEM TABLE === */}
            <div className="items-section">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Items / Services</th>
                    <th>HSN / SAC</th>
                    <th>Qty</th>
                    <th>Price / Item (₹)</th>
                    <th>Discount %</th>
                    <th>Tax %</th>
                    <th>Amount (₹)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <input
                          value={it.name}
                          onChange={(e) =>
                            updateRow(it.id, "name", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={it.hsn}
                          onChange={(e) =>
                            updateRow(it.id, "hsn", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.qty}
                          onChange={(e) =>
                            updateRow(it.id, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) =>
                            updateRow(it.id, "price", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.discount}
                          onChange={(e) =>
                            updateRow(it.id, "discount", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.tax}
                          onChange={(e) =>
                            updateRow(it.id, "tax", e.target.value)
                          }
                        />
                      </td>
                      <td>₹ {it.amount.toFixed(2)}</td>
                      <td>
                        <button onClick={() => removeItemRow(it.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="9" style={{ textAlign: "left", padding: 12 }}>
                      <button onClick={addItemRow} className="add-row-btn">
                        <AiOutlinePlus /> Add Item
                      </button>
                      <button className="barcode-btn">
                        <BsQrCodeScan /> Scan Barcode
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* === AMOUNT SUMMARY === */}
            <div className="quotation-footer">
              <div className="left-notes">
                <p className="add-notes">+ Add Notes</p>
                <div className="terms">
                  <h4>Terms and Conditions</h4>
                  <ol>
                    <li>Goods once sold will not be taken back or exchanged.</li>
                    <li>All disputes are subject to local jurisdiction.</li>
                  </ol>
                </div>
                <p className="add-account">+ Add New Account</p>
              </div>

              <div className="right-summary">
                <div className="amount-row">
                  <span>Subtotal:</span>
                  <span>₹ {subtotal.toFixed(2)}</span>
                </div>
                <div className="amount-row">
                  <span>Discount:</span>
                  <span>₹ {extraDiscount.toFixed(2)}</span>
                </div>
                <div className="amount-row">
                  <span>Tax:</span>
                  <span>₹ {totalTax.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Total:</span>
                  <span>₹ {total.toFixed(2)}</span>
                </div>

                <div className="payment-section">
                  <div className="add-dropdown">
                    <select>
                      <option>+ Add</option>
                    </select>
                    <input
                      type="text"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="₹ 0"
                    />
                  </div>
                  <button className="payment-btn">Enter Payment</button>
                </div>

                <div className="balance-amount">
                  <span>Balance Amount:</span>
                  <span>₹ {balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="signature-section">
              <p>
                Authorized Signatory for <strong>Business Name</strong>
              </p>
              <div className="add-signature">+ Add Signature</div>
            </div>
          </div>

          {partyModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Select / Add Party</h3>
                <div>
                  <strong>Existing Parties</strong>
                  <div className="party-list">
                    {parties.length === 0 && <p>No parties found</p>}
                    {parties.map((p, i) => (
                      <div key={i} className="party-item">
                        <div>
                          <strong>{p.name}</strong>
                          <div>{p.mobile}</div>
                        </div>
                        <button onClick={() => chooseParty(p)}>Select</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="add-party-form">
                  <strong>Add New Party</strong>
                  <div className="add-party-row">
                    <input
                      className="add-party-input"
                      placeholder="Party Name"
                      value={newParty.name}
                      onChange={(e) =>
                        setNewParty({ ...newParty, name: e.target.value })
                      }
                    />
                    <input
                      className="add-party-input"
                      placeholder="Mobile Number"
                      value={newParty.mobile}
                      onChange={(e) =>
                        setNewParty({ ...newParty, mobile: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="modal-buttons">
                  <button
                    className="cancel-btn"
                    onClick={() => setPartyModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="save-btn-modal" onClick={saveNewParty}>
                    Save & Select
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CreateQuotation;
