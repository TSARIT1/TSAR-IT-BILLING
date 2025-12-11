import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
import "../purchsed.css";
import { useNavigate } from "react-router-dom";

function CreatePurchaseReturn() {
  const navigate = useNavigate();

  const [partyModal, setPartyModal] = useState(false);
  const [partyList, setPartyList] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newParty, setNewParty] = useState({ name: "", mobile: "" });

  const [returnNo, setReturnNo] = useState(1);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: "",
      hsn: "",
      qty: 1,
      price: 0,
      discount: 0,
      tax: 0,
      amount: 0,
    },
  ]);

  const [extraCharges, setExtraCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [autoRound, setAutoRound] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("purchaseReturns")) || [];
    setReturnNo(saved.length + 1);

    const parties = JSON.parse(localStorage.getItem("purchaseReturnParties")) || [];
    setPartyList(parties);
  }, []);

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const updateRow = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;

        const next = { ...it, [field]: value };

        const qty = toNum(next.qty);
        const price = toNum(next.price);
        const disc = toNum(next.discount);
        const tax = toNum(next.tax);

        const base = qty * price;
        const discAmount = (base * disc) / 100;
        const taxable = base - discAmount;
        const taxAmount = (taxable * tax) / 100;

        next.amount = Number((taxable + taxAmount).toFixed(2));

        
        next.qty = qty;
        next.price = price;
        next.discount = disc;
        next.tax = tax;

        return next;
      })
    );
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: "",
        hsn: "",
        qty: 1,
        price: 0,
        discount: 0,
        tax: 0,
        amount: 0,
      },
    ]);

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = items.reduce((s, it) => s + toNum(it.amount), 0);
  const taxableAmount = items.reduce((s, it) => {
    const base = toNum(it.qty) * toNum(it.price);
    const disc = (base * toNum(it.discount)) / 100;
    return s + (base - disc);
  }, 0);

  const taxTotal = Number((subtotal - taxableAmount).toFixed(2));
  let totalAmount = subtotal + toNum(extraCharges) - toNum(extraDiscount);
  const tcsValue = applyTCS ? Number((totalAmount * 0.01).toFixed(2)) : 0;
  totalAmount += tcsValue;
  totalAmount = autoRound ? Math.round(totalAmount) : Number(totalAmount.toFixed(2));
  totalAmount = Number(totalAmount);

  const balance = Number((totalAmount - toNum(receivedAmount)).toFixed(2));
  const saveParty = () => {
    if (!newParty.name.trim()) {
      alert("Please enter party name");
      return;
    }

    const newObj = { name: newParty.name.trim(), mobile: newParty.mobile.trim() };
    const updated = [...partyList, newObj];
    setPartyList(updated);
    localStorage.setItem("purchaseReturnParties", JSON.stringify(updated));

    setSelectedParty(newObj);
    setNewParty({ name: "", mobile: "" });
    setPartyModal(false);
  };
  const savePurchaseReturn = () => {
    if (!selectedParty) {
      alert("Select a Party");
      return;
    }
    if (items.every((it) => !String(it.name || "").trim())) {
      alert("Add at least one item");
      return;
    }

    const all = JSON.parse(localStorage.getItem("purchaseReturns")) || [];

    const newReturn = {
      id: Date.now(),
      number: returnNo,
      date: returnDate,
      party: selectedParty,
      items,
      subtotal,
      taxableAmount,
      taxTotal,
      extraCharges: toNum(extraCharges),
      extraDiscount: toNum(extraDiscount),
      tcsValue,
      totalAmount,
      receivedAmount: toNum(receivedAmount),
      balance,
      status: balance <= 0 ? "Paid" : "Unpaid",
    };

    all.push(newReturn);
    localStorage.setItem("purchaseReturns", JSON.stringify(all));

    alert("Purchase Return Saved!");
    navigate("/purchase-return");
  };

  
  const chooseParty = (p) => {
    setSelectedParty(p);
    setPartyModal(false);
  };

  return (
    <>
      <Navbar />

      <div className="prc-layout">
        <Sidebar />

        <div className="prc-main">
          <div className="prc-wrapper">
            
            <div className="prc-header">
              <div className="prc-header-left">
                <FiArrowLeft className="prc-back-icon" onClick={() => navigate("/purchase-return")} />
                <h2 style={{color:"black"}}>Create Purchase Return</h2>
              </div>

              <div className="prc-header-right">
                <button className="prc-settings"><FiSettings /> Settings</button>
                <button className="prc-save-btn" onClick={savePurchaseReturn}>Save Purchase Return</button>
              </div>
            </div>
            <div className="prc-body">
              <div className="prc-left">
                <div className="prc-party-box">
                  <h4>Bill From</h4>

                  <div className="prc-party-select" onClick={() => setPartyModal(true)} style={{color:"black"}}>
                    {selectedParty ? (
                      <div style={{color:"black"}} >
                        <strong style={{color:"black"}}>{selectedParty.name}</strong>
                        <p className="prc-small">{selectedParty.mobile}</p>
                      </div>
                    ) : (
                      <div className="prc-add-text">+ Add Party</div>
                    )}
                  </div>
                </div>
                <div className="prc-items-box">
                  <table className="prc-items-table">
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>ITEMS / SERVICES</th>
                        <th>HSN / SAC</th>
                        <th>QTY</th>
                        <th>PRICE/ITEM (₹)</th>
                        <th>DISCOUNT %</th>
                        <th>TAX %</th>
                        <th>AMOUNT (₹)</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((it, i) => (
                        <tr key={it.id}>
                          <td>{i + 1}</td>
                          <td><input value={it.name} onChange={(e) => updateRow(it.id, "name", e.target.value)} placeholder="Item name" /></td>
                          <td><input value={it.hsn} onChange={(e) => updateRow(it.id, "hsn", e.target.value)} placeholder="HSN" /></td>
                          <td><input type="number" value={it.qty} onChange={(e) => updateRow(it.id, "qty", e.target.value)} min="0" /></td>
                          <td><input type="number" value={it.price} onChange={(e) => updateRow(it.id, "price", e.target.value)} min="0" /></td>
                          <td><input type="number" value={it.discount} onChange={(e) => updateRow(it.id, "discount", e.target.value)} min="0" /></td>
                          <td><input type="number" value={it.tax} onChange={(e) => updateRow(it.id, "tax", e.target.value)} min="0" /></td>
                          <td style={{color:"black"}}>₹ {Number(it.amount || 0).toFixed(2)}</td>
                          <td><button className="prc-remove" onClick={() => removeItem(it.id)}>X</button></td>
                        </tr>
                      ))}

                      <tr>
                        <td colSpan="9" className="prc-add-item-row">
                          <button className="prc-add-item-btn" onClick={addItem}>+ Add Item</button>
                          <button className="prc-barcode-btn"><BsQrCodeScan /> Scan Barcode</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT */}
              <div className="prc-right">
                <div className="prc-summary-box">
                  <div className="prc-summary-row">
                    <span>Subtotal</span>
                    <strong>₹ {Number(subtotal).toFixed(2)}</strong>
                  </div>

                  <div className="prc-summary-row">
                    <span>Taxable Amount</span>
                    <strong>₹ {Number(taxableAmount).toFixed(2)}</strong>
                  </div>

                  <div className="prc-summary-row">
                    <span>Tax Amount</span>
                    <strong>₹ {Number(taxTotal).toFixed(2)}</strong>
                  </div>

                  <div className="prc-summary-row">
                    <span>Additional Charges</span>
                    <input type="number" value={extraCharges} onChange={(e) => setExtraCharges(toNum(e.target.value))} />
                  </div>

                  <div className="prc-summary-row">
                    <span>Discount</span>
                    <input type="number" value={extraDiscount} onChange={(e) => setExtraDiscount(toNum(e.target.value))} />
                  </div>

                  <div className="prc-check-row">
                    <input id="prc-tcs" type="checkbox" checked={applyTCS} onChange={(e) => setApplyTCS(e.target.checked)} />
                    <label htmlFor="prc-tcs">Apply TCS (1%)</label>
                  </div>

                  <div className="prc-check-row">
                    <input id="prc-round" type="checkbox" checked={autoRound} onChange={(e) => setAutoRound(e.target.checked)} />
                    <label htmlFor="prc-round">Auto Round Off</label>
                  </div>

                  <div className="prc-summary-total">
                    <span>Total Amount</span>
                    <strong>₹ {Number(totalAmount).toFixed(2)}</strong>
                  </div>

                  <div className="prc-summary-row">
                    <span>Amount Received</span>
                    <input type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(toNum(e.target.value))} />
                  </div>

                  <div className="prc-summary-total prc-balance">
                    <span>Balance Amount</span>
                    <strong>₹ {Number(balance).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="prc-sign-box">
                  <p>Authorized Signatory</p>
                  <div className="prc-sign-btn">+ Add Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {partyModal && (
        <div className="prc-modal">
          <div className="prc-modal-box">
            <h3 style={{color:"black"}}>Select or Add Party</h3>

            <div style={{ marginBottom: 12 }}>
              <strong style={{color:"black"}}>Existing Parties</strong>
              <div style={{ maxHeight: 160, overflow: "auto", marginTop: 8,color:"blue" }}>
                {partyList.length === 0 && <div style={{ color: "#706c6cff" }}>No parties</div>}
                {partyList.map((p, idx) => (
                  <div key={idx} className="prc-party-item" onClick={() => chooseParty(p)}>
                    <strong >{p.name}</strong>
                    <div className="prc-small">{p.mobile}</div>
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ margin: "10px 0" }} />

            <div style={{ marginBottom: 10 }}>
              <strong>Add New Party</strong>
              <input
                className="prc-modal-input"
                placeholder="Party Name"
                value={newParty.name}
                onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
              />
              <input
                className="prc-modal-input"
                placeholder="Mobile Number"
                value={newParty.mobile}
                onChange={(e) => setNewParty({ ...newParty, mobile: e.target.value })}
              />
            </div>

            <div className="prc-modal-btns">
              <button className="prc-cancel" onClick={() => setPartyModal(false)}>Cancel</button>
              <button className="prc-save" onClick={saveParty}>Save & Select</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePurchaseReturn;
