import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";
import { useNavigate } from "react-router-dom";

function CreatePaymentOut() {
  const navigate = useNavigate();

  const [paymentNo, setPaymentNo] = useState(1);
  const [partyList, setPartyList] = useState([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [mode, setMode] = useState("Cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const pay = JSON.parse(localStorage.getItem("paymentOut")) || [];
    setPaymentNo(pay.length + 1);

    const parties = JSON.parse(localStorage.getItem("purchaseParties")) || [];
    setPartyList(parties);
  }, []);

  const savePayment = () => {
    if (!selectedParty) return alert("Select a party");
    if (!amount) return alert("Enter amount");

    const saved = JSON.parse(localStorage.getItem("paymentOut")) || [];

    const newPay = {
      id: Date.now(),
      paymentNo,
      party: selectedParty,
      amount,
      date,
      mode,
      notes
    };

    saved.push(newPay);
    localStorage.setItem("paymentOut", JSON.stringify(saved));

    navigate("/payment-out");
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content create-payment-out-page">

          <div className="paymentout-header" style={{marginTop:"3%"}}>
            <h2>Record Payment Out #{paymentNo}</h2>

            <div className="right-actions">
              <button className="cancel-btn" onClick={() => navigate("/payment-out")}>Cancel</button>
              <button className="save-btn" onClick={savePayment}>Save</button>
            </div>
          </div>

          <div className="paymentout-grid">

            <div className="left-box">
              <label>Party Name</label>
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
              >
                <option value="">Search party by name or number</option>
                {partyList.map((p, i) => (
                  <option key={i} value={p.name}>
                    {p.name} ({p.mobile})
                  </option>
                ))}
              </select>

              <label>Enter Payment Amount</label>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="right-box">
              <label>Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <label>Payment Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
              </select>

              <label>Payment Out Number</label>
              <input value={paymentNo} readOnly />

              <label>Notes</label>
              <textarea
                placeholder="Enter Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

export default CreatePaymentOut;
