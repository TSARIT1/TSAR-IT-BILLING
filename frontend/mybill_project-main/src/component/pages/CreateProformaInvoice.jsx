import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../nextpart.css";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

function CreateProformaInvoice() {
   const navigate = useNavigate();
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [paymentTerms, setPaymentTerms] = useState(30);
  const [expiryDate, setExpiryDate] = useState("");

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
      amount: 0,
    },
  ]);

  const [addCharges, setAddCharges] = useState(0);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [autoRound, setAutoRound] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("proformas")) || [];
    setInvoiceNo(stored.length + 1);

    const savedParties = JSON.parse(localStorage.getItem("parties")) || [];
    setPartyList(savedParties);
  }, []);

  useEffect(() => {
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + Number(paymentTerms || 0));
    setExpiryDate(d.toISOString().split("T")[0]);
  }, [invoiceDate, paymentTerms]);

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        const q = Number(updated.qty);
        const p = Number(updated.price);
        const d = (q * p * Number(updated.discount)) / 100;
        const taxable = q * p - d;
        const t = (taxable * Number(updated.tax)) / 100;
        updated.amount = taxable + t;
        return updated;
      })
    );
  };

  const addRow = () => {
    setItems((p) => [
      ...p,
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
  };

  const removeRow = (id) => {
    setItems((p) => p.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((t, it) => t + it.amount, 0);
  const taxableAmount = items.reduce((t, it) => {
    const q = it.qty;
    const p = it.price;
    const d = (q * p * it.discount) / 100;
    return t + (q * p - d);
  }, 0);
  const taxAmount = subtotal - taxableAmount;

  let total = subtotal + Number(addCharges || 0) - Number(extraDiscount || 0);
  if (autoRound) total = Math.round(total);

  const saveProforma = () => {
    if (!selectedParty) return alert("Select Party First");
    if (items.every((it) => !it.name.trim())) return alert("Add at least one item");

    const stored = JSON.parse(localStorage.getItem("proformas")) || [];

    stored.push({
      id: Date.now(),
      number: invoiceNo,
      date: invoiceDate,
      expiry: expiryDate,
      party: selectedParty.name,
      partyDetails: selectedParty,
      items,
      addCharges,
      extraDiscount,
      total,
      taxableAmount,
      taxAmount,
      paymentTerms,
      status: "Open",
    });

    localStorage.setItem("proformas", JSON.stringify(stored));

    alert("Proforma Invoice Saved");
  };

  const saveParty = () => {
    if (!newParty.name.trim()) return;
    const updated = [...partyList, newParty];
    localStorage.setItem("parties", JSON.stringify(updated));
    setPartyList(updated);
    setSelectedParty(newParty);
    setNewParty({ name: "", mobile: "" });
    setPartyModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content proforma-create">
          <div className="pc-top" style={{marginTop:"5%"}}>
            <FiArrowLeft className="back-icon" onClick={() => navigate("/proforma-invoice")} />
            <h2>Create Proforma Invoice</h2>

            <button className="pc-save-btn" onClick={saveProforma}>
              Save Proforma Invoice
            </button>
          </div>

          <div className="pc-body">
            <div className="bill-box">
              <h4>Bill To</h4>

              <div className="bill-to">
                <div
                  className="party-box"
                  onClick={() => setPartyModal(true)}
                >
                  {selectedParty ? (
                    <>
                      <strong>{selectedParty.name}</strong>
                      <div>{selectedParty.mobile}</div>
                    </>
                  ) : (
                    "+ Add Party"
                  )}
                </div>
              </div>

              <div className="invoice-details">
                <div className="detail-item">
                  <label>Proforma Invoice No</label>
                  <input type="text" value={invoiceNo} readOnly />
                </div>

                <div className="detail-item">
                  <label>Proforma Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>

                <div className="detail-item">
                  <label>Payment Terms</label>
                  <input
                    type="number"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                </div>

                <div className="detail-item">
                  <label>Expiry Date</label>
                  <input type="date" value={expiryDate} readOnly />
                </div>
              </div>
            </div>

            <div className="item-section">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Item / Service</th>
                    <th>HSN / SAC</th>
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
                      <td>
                        <input
                          value={it.name}
                          onChange={(e) =>
                            updateItem(it.id, "name", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={it.hsn}
                          onChange={(e) =>
                            updateItem(it.id, "hsn", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(it.id, "qty", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) =>
                            updateItem(it.id, "price", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={it.discount}
                          onChange={(e) =>
                            updateItem(it.id, "discount", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          value={it.tax}
                          onChange={(e) =>
                            updateItem(it.id, "tax", e.target.value)
                          }
                        />
                      </td>

                      <td>₹ {it.amount.toFixed(2)}</td>

                      <td>
                        <button className="remove-btn" onClick={() => removeRow(it.id)}>×</button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="9">
                      <button className="add-btn" onClick={addRow}>
                        + Add Item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="summary-box">
              <div className="left-notes">
                <h4>Terms and Conditions</h4>
                <div className="terms">
                  <p>1. Goods once sold will not be taken back</p>
                  <p>2. All disputes subject to [ENTER_CITY_NAME]</p>
                </div>
              </div>

              <div className="right-total">
                <div className="line">
                  <span>Subtotal</span>
                  <strong>₹ {subtotal.toFixed(2)}</strong>
                </div>

                <div className="line">
                  <span>Taxable Amount</span>
                  <strong>₹ {taxableAmount.toFixed(2)}</strong>
                </div>

                <div className="line">
                  <span>Tax Amount</span>
                  <strong>₹ {taxAmount.toFixed(2)}</strong>
                </div>

                <div className="line">
                  <span>Additional Charges</span>
                  <input
                    type="number"
                    value={addCharges}
                    onChange={(e) => setAddCharges(e.target.value)}
                  />
                </div>

                <div className="line">
                  <span>Discount</span>
                  <input
                    type="number"
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(e.target.value)}
                  />
                </div>

                <div className="line">
                  <span>Auto Round Off</span>
                  <input
                    type="checkbox"
                    checked={autoRound}
                    onChange={(e) => setAutoRound(e.target.checked)}
                  />
                </div>

                <div className="line total">
                  <span>Total Amount</span>
                  <strong>₹ {total}</strong>
                </div>
              </div>
            </div>

            <div className="signature-box">
              <p>Authorized signatory for Business Name</p>
              <div className="sign-btn">+ Add Signature</div>
            </div>
          </div>

          {partyModal && (
            <div className="modal-bg">
              <div className="modal">
                <h3>Select / Add Party</h3>

                {partyList.map((p, i) => (
                  <div key={i} className="party-row" onClick={() => {setSelectedParty(p); setPartyModal(false);}}>
                    <strong>{p.name}</strong>
                    <div>{p.mobile}</div>
                  </div>
                ))}

                <h4>Add New</h4>
                <input
                  placeholder="Name"
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                />
                <input
                  placeholder="Mobile"
                  value={newParty.mobile}
                  onChange={(e) => setNewParty({ ...newParty, mobile: e.target.value })}
                />

                <button onClick={saveParty} className="save-party-btn">Save</button>
                <button onClick={() => setPartyModal(false)} className="close-modal-btn">Close</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default CreateProformaInvoice;
