import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../nextpart.css";

function CreateDeliveryChallan() {
  const navigate = useNavigate();

  const [dcNo, setDcNo] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [party, setParty] = useState("");
  const [items, setItems] = useState([
    { id: Date.now(), name: "", qty: 1, price: 0, amount: 0 },
  ]);

  const [paymentMode, setPaymentMode] = useState("");
  const [receivedIn, setReceivedIn] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

  const subtotal = items.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0);
  const tax = subtotal * 0.00;
  const total = subtotal + tax;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("deliveryChallans")) || [];
    setDcNo(stored.length + 1);
  }, []);

  const updateRow = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              [field]: value,
              amount:
                field === "qty" || field === "price"
                  ? (field === "qty" ? value : it.qty) *
                    (field === "price" ? value : it.price)
                  : it.amount,
            }
          : it
      )
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: "", qty: 1, price: 0, amount: 0 },
    ]);
  };

  const removeRow = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const saveChallan = () => {
    if (!party.trim()) return alert("Enter Party Name");
    if (items.length === 0) return alert("Add at least one item");

    const stored = JSON.parse(localStorage.getItem("deliveryChallans")) || [];

    const newChallan = {
      id: Date.now(),
      number: dcNo,
      date,
      party,
      items,
      subtotal,
      tax,
      total,
      paymentMode,
      receivedIn,
      paymentAmount,
      notes,
      status: paymentAmount >= total ? "Closed" : "Open",
    };

    stored.push(newChallan);
    localStorage.setItem("deliveryChallans", JSON.stringify(stored));

    alert("Delivery Challan Saved Successfully");
    navigate("/delivery-challan");
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content create-delivery">

          <div className="dc-header">
            <div className="left">
              <FiArrowLeft className="back-icon" onClick={() => navigate("/delivery-challan")} />
              <h2>Create Delivery Challan</h2>
            </div>

            <div className="right">
              <button className="settings-btn"><FiSettings /> Settings</button>
              <button className="cancel-btn" onClick={() => navigate("/delivery-challan")}>Cancel</button>
              <button className="save-btn" onClick={saveChallan}>Save</button>
            </div>
          </div>

          <div className="dc-body">

            <div className="bill-box">
              <h4>Bill To</h4>
              <input
                type="text"
                placeholder="Enter Party Name"
                value={party}
                onChange={(e) => setParty(e.target.value)}
              />

              <div className="grid-2">
                <div>
                  <label>Delivery Challan No</label>
                  <input type="text" value={`DC-${dcNo}`} readOnly />
                </div>

                <div>
                  <label>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="items-box">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
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
                          onChange={(e) => updateRow(it.id, "name", e.target.value)}
                          placeholder="Item Name"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.qty}
                          onChange={(e) => updateRow(it.id, "qty", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) => updateRow(it.id, "price", e.target.value)}
                        />
                      </td>
                      <td>₹ {it.amount}</td>
                      <td>
                        <button className="remove-row" onClick={() => removeRow(it.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="6">
                      <button className="add-row-btn" onClick={addRow}>+ Add Item</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="payment-box">
              <h4>Payment Details</h4>

              <div className="grid-2">
                <div>
                  <label>Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="">Select Mode</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label>Payment Received In</label>
                  <select value={receivedIn} onChange={(e) => setReceivedIn(e.target.value)}>
                    <option value="">Select</option>
                    <option>Bank</option>
                    <option>Wallet</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <label>Payment Amount</label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              <label>Notes</label>
              <textarea
                placeholder="Enter Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="summary-box">
              <div className="row">
                <span>Subtotal</span>
                <span>₹ {subtotal.toFixed(2)}</span>
              </div>

              <div className="row">
                <span>Tax</span>
                <span>₹ {tax.toFixed(2)}</span>
              </div>

              <div className="row total">
                <span>Total Amount</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CreateDeliveryChallan;
