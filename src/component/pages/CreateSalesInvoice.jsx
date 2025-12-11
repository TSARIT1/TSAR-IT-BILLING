import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import { Link } from "react-router-dom";


function CreateSalesInvoice() {
  const [party, setParty] = useState("");
  const [mobile, setMobile] = useState("");
  const [items, setItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerm, setPaymentTerm] = useState(30);

  const addItem = () => {
    setItems([...items, { name: "", qty: 1, price: 0, discount: 0, tax: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.price, 0);
  const totalDiscount = items.reduce((acc, i) => acc + (i.qty * i.price * i.discount) / 100, 0);
  const taxTotal = items.reduce((acc, i) => acc + (i.qty * i.price * i.tax) / 100, 0);
  const total = subtotal - totalDiscount + taxTotal;

  // ✅ SAVE to localStorage
  const handleSave = () => {
    if (!party.trim()) {
      alert("Please enter Party Name");
      return;
    }

    const newParty = {
      name: party,
      mobile: mobile || "-",
      type: "Customer",
      balance: total,
    };

    const existing = JSON.parse(localStorage.getItem("parties")) || [];
    const updated = [...existing, newParty];
    localStorage.setItem("parties", JSON.stringify(updated));

    alert("Invoice Saved & Party Added!");
    setParty("");
    setMobile("");
    setItems([]);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content" style={{ marginTop: "5%" }}>
          <h2 className="page-title">Create Sales Invoice</h2>

          <div className="invoice-body">
            <div className="invoice-section">
              <h4>Bill To</h4>
              <input
                type="text"
                placeholder="Enter Party Name"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="invoice-section">
              <h4>Items / Services</h4>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Price (₹)</th>
                    <th>Discount (%)</th>
                    <th>Tax (%)</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(index, "name", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(index, "qty", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(index, "discount", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.tax}
                          onChange={(e) => updateItem(index, "tax", e.target.value)}
                        />
                      </td>
                      <td>
                        {(
                          item.qty * item.price -
                          (item.qty * item.price * item.discount) / 100 +
                          (item.qty * item.price * item.tax) / 100
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="add-item-btn" onClick={addItem}>
                + Add Item
              </div>
            </div>

            <div className="invoice-section">
              <h4>Terms and Conditions</h4>
              <ul>
                <li>Goods once sold will not be taken back or exchanged</li>
                <li>
                  All disputes are subject to [YOUR_CITY_NAME] jurisdiction only
                </li>
              </ul>
            </div>

            <div className="amount-section">
              <p>
                <strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}
              </p>
              <p>
                <strong>Discount:</strong> ₹{totalDiscount.toFixed(2)}
              </p>
              <p>
                <strong>Tax:</strong> ₹{taxTotal.toFixed(2)}
              </p>
              <p className="total">
                <strong>Total:</strong> ₹{total.toFixed(2)}
              </p>
            </div>
            <div style={{marginTop:"10px"}}>
              <Link to="/dashboard">
                <button className="back-btn" >
                  Go back
                </button>
              </Link>
            </div>
            <div style={{ textAlign: "right", marginTop: "-30px" }}>
              <button className="save-btn" onClick={handleSave}>
                Save Sales Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateSalesInvoice;
