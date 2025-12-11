import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
import "../nextpart.css";

function CreatePurchaseInvoice() {
  const navigate = useNavigate();

  const [invoiceNo, setInvoiceNo] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [paymentTerms, setPaymentTerms] = useState(30);

  const [partyModal, setPartyModal] = useState(false);
  const [partyList, setPartyList] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);

  const [newParty, setNewParty] = useState({ name: "", mobile: "" });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: "",
      hsn: "",
      qty: 1,
      price: 0,
      discount: 0,
      tax: 0,
      amount: 0
    }
  ]);

  const [extraCharges, setExtraCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [applyTDS, setApplyTDS] = useState(false);
  const [roundOff, setRoundOff] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    setInvoiceNo(saved.length + 1);

    const parties = JSON.parse(localStorage.getItem("purchaseParties")) || [];
    setPartyList(parties);
  }, []);

  const updateRow = (id, field, value) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it;

        const next = { ...it, [field]: value };
        const qty = Number(next.qty);
        const price = Number(next.price);
        const disc = Number(next.discount);
        const tax = Number(next.tax);

        const base = qty * price;
        const discountValue = (base * disc) / 100;
        const taxable = base - discountValue;
        const taxValue = (taxable * tax) / 100;

        next.amount = taxable + taxValue;
        return next;
      })
    );
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        hsn: "",
        qty: 1,
        price: 0,
        discount: 0,
        tax: 0,
        amount: 0
      }
    ]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const subtotal = items.reduce((s, it) => s + it.amount, 0);

  const taxableAmount = items.reduce((s, it) => {
    const base = it.qty * it.price;
    const disc = (base * it.discount) / 100;
    return s + (base - disc);
  }, 0);

  const taxTotal = subtotal - taxableAmount;

  const beforeFinal = subtotal + Number(extraCharges) - Number(extraDiscount);

  const tcsValue = applyTCS ? (beforeFinal * 0.01) : 0;
  const tdsValue = applyTDS ? (beforeFinal * 0.01) : 0;

  let finalTotal = beforeFinal + tcsValue - tdsValue;
  finalTotal = roundOff ? Math.round(finalTotal) : finalTotal;

  const balance = finalTotal - paidAmount;

  const expiryDate = (() => {
    const d = new Date(purchaseDate);
    d.setDate(d.getDate() + Number(paymentTerms));
    return d.toISOString().split("T")[0];
  })();

  const saveParty = () => {
    if (!newParty.name.trim()) return alert("Enter party name");

    const updated = [...partyList, newParty];
    setPartyList(updated);
    localStorage.setItem("purchaseParties", JSON.stringify(updated));

    setSelectedParty(newParty);

    setNewParty({ name: "", mobile: "" });
    setPartyModal(false);
  };

  const saveInvoice = () => {
    if (!selectedParty) return alert("Please select/add Party.");

    const saved = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];

    const newInv = {
      id: Date.now(),
      number: invoiceNo,
      date: purchaseDate,
      due: expiryDate,

      // FIXED: SAVE PARTY NAME & MOBILE
      partyName: selectedParty.name,
      partyMobile: selectedParty.mobile,

      items,
      subtotal,
      taxableAmount,
      taxTotal,
      finalTotal,
      status: paidAmount >= finalTotal ? "Paid" : "Unpaid"
    };

    saved.push(newInv);
    localStorage.setItem("purchaseInvoices", JSON.stringify(saved));

    alert("Purchase Invoice Saved!");
    navigate("/purchase-invoices");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content">
          <div className="purchase-header" style={{marginTop:"5%"}}>
            <div className="left">
              <FiArrowLeft className="back-icon" onClick={() => navigate("/purchase-invoices")} />
              <h2>Create Purchase Invoice</h2>
            </div>

            <div className="right">
              <button className="settings-btn"><FiSettings /> Settings</button>
              <button className="save-btn" onClick={saveInvoice}>Save</button>
            </div>
          </div>

          <div className="bill-section">
            <div>
              <h4>Bill From</h4>
              <div className="add-party-box" onClick={() => setPartyModal(true)}>
                {selectedParty ? (
                  <>
                    <strong>{selectedParty.name}</strong>
                    <div>{selectedParty.mobile}</div>
                  </>
                ) : "+ Add Party"}
              </div>
            </div>

            <div className="bill-details">
              <div className="input-group">
                <label>Invoice Number</label>
                <input value={invoiceNo} readOnly />
              </div>

              <div className="input-group">
                <label>Invoice Date</label>
                <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Payment Terms</label>
                <input type="number" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Due Date</label>
                <input type="date" value={expiryDate} readOnly />
              </div>
            </div>
          </div>

          <div className="items-section">
            <table className="items-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Item / Service</th>
                  <th>HSN</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Discount %</th>
                  <th>Tax %</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {items.map((it, i) => (
                  <tr key={it.id}>
                    <td>{i + 1}</td>
                    <td><input value={it.name} onChange={(e) => updateRow(it.id, "name", e.target.value)} /></td>
                    <td><input value={it.hsn} onChange={(e) => updateRow(it.id, "hsn", e.target.value)} /></td>
                    <td><input type="number" value={it.qty} onChange={(e) => updateRow(it.id, "qty", e.target.value)} /></td>
                    <td><input type="number" value={it.price} onChange={(e) => updateRow(it.id, "price", e.target.value)} /></td>
                    <td><input type="number" value={it.discount} onChange={(e) => updateRow(it.id, "discount", e.target.value)} /></td>
                    <td><input type="number" value={it.tax} onChange={(e) => updateRow(it.id, "tax", e.target.value)} /></td>
                    <td>₹ {it.amount.toFixed(2)}</td>
                    <td><button onClick={() => removeItem(it.id)}>X</button></td>
                  </tr>
                ))}

                <tr>
                  <td colSpan="9">
                    <button className="add-item-btn" onClick={addItem}>+ Add Item</button>
                    <button className="barcode-btn"><BsQrCodeScan /> Scan Barcode</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="totals-box">
            <div className="total-row"><span>Subtotal</span><strong>₹ {subtotal}</strong></div>
            <div className="total-row"><span>Taxable Amount</span><strong>₹ {taxableAmount}</strong></div>
            <div className="total-row"><span>Tax Total</span><strong>₹ {taxTotal}</strong></div>
            <div className="total-row"><span>Total</span><strong>₹ {finalTotal}</strong></div>
          </div>

          {partyModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Add Party</h3>

                <input
                  className="modal-input"
                  placeholder="Party Name"
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                />

                <input
                  className="modal-input"
                  placeholder="Mobile Number"
                  value={newParty.mobile}
                  onChange={(e) => setNewParty({ ...newParty, mobile: e.target.value })}
                />

                <div className="modal-btns">
                  <button className="modal-cancel" onClick={() => setPartyModal(false)}>Cancel</button>
                  <button className="modal-save" onClick={saveParty}>Save</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default CreatePurchaseInvoice;
