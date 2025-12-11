import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import "../purchsed.css";
import { useNavigate } from "react-router-dom";

function CreateDebitNote() {
  const [partyModal, setPartyModal] = useState(false);
  const [partyList, setPartyList] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newParty, setNewParty] = useState({ name: "", mobile: "" });
  const navigate = useNavigate();
  const [debitNo, setDebitNo] = useState(1);
  const [debitDate, setDebitDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [items, setItems] = useState([
    { id: Date.now(), name: "", qty: 1, price: 0, amount: 0 }
  ]);

  const addItem = () => {
    setItems((p) => [
      ...p,
      { id: Date.now(), name: "", qty: 1, price: 0, amount: 0 }
    ]);
  };

  const updateRow = (id, field, v) => {
    setItems((p) =>
      p.map((it) => {
        if (it.id !== id) return it;
        const q = field === "qty" ? Number(v) : it.qty;
        const pr = field === "price" ? Number(v) : it.price;
        return {
          ...it,
          [field]: v,
          amount: +(q * pr).toFixed(2)
        };
      })
    );
  };

  const removeItem = (id) => setItems((p) => p.filter((it) => it.id !== id));

  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const total = subtotal;

  const saveParty = () => {
    if (!newParty.name.trim()) return;
    setPartyList([...partyList, newParty]);
    setSelectedParty(newParty);
    setNewParty({ name: "", mobile: "" });
    setPartyModal(false);
  };

  return (
    <>
      <Navbar />

      <div className="dn-layout">
        <Sidebar />

        <div className="dn-main">
          <div className="dn-wrap">

            <div className="dn-header">
              <div className="dn-header-left">
                <FiArrowLeft className="dn-back" onClick={() => navigate("/debit-note")} />
                <h2>Create Debit Note</h2> 
              </div>

              <div className="dn-header-right">
                <button className="dn-settings"><FiSettings /> Settings</button>
                <button className="dn-save">Save Debit Note</button>
              </div>
            </div>

            <div className="dn-body">

              <div className="dn-left">

                <div className="dn-party-box">
                  <h4 style={{color:"black"}}>Bill From</h4>
                  <div className="dn-party-select" onClick={() => setPartyModal(true)}>
                    {selectedParty ? (
                      <div>
                        <strong>{selectedParty.name}</strong>
                        <p>{selectedParty.mobile}</p>
                      </div>
                    ) : (
                      "+ Add Party"
                    )}
                  </div>
                </div>

                <div className="dn-items-box">
                  <table className="dn-items-table">
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>ITEMS / REASON</th>
                        <th>QTY</th>
                        <th>PRICE</th>
                        <th>AMOUNT</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((it, i) => (
                        <tr key={it.id}>
                          <td style={{color:"black"}}>{i + 1}</td>
                          <td><input value={it.name} onChange={(e) => updateRow(it.id, "name", e.target.value)} /></td>
                          <td><input type="number" value={it.qty} onChange={(e) => updateRow(it.id, "qty", e.target.value)} /></td>
                          <td><input type="number" value={it.price} onChange={(e) => updateRow(it.id, "price", e.target.value)} /></td>
                          <td style={{color:"black"}}>₹ {it.amount}</td>
                          <td><button className="dn-remove" onClick={() => removeItem(it.id)}>X</button></td>
                        </tr>
                      ))}

                      <tr>
                        <td colSpan="6" className="dn-add-row">
                          <button className="dn-add-item" onClick={addItem}><AiOutlinePlus /> Add Item</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="dn-sign">
                  <p style={{color:"black"}}>Authorized Signatory</p>
                  <div className="dn-sign-btn">+ Add Signature</div>
                </div>
              </div>

              <div className="dn-right">

                <div className="dn-summary">
                  <div className="dn-srow">
                    <span style={{color:"black"}}>Debit Note No.</span>
                    <input readOnly value={debitNo} />
                  </div>

                  <div className="dn-srow">
                    <span style={{color:"black"}}>Debit Date</span>
                    <input type="date" value={debitDate} onChange={(e) => setDebitDate(e.target.value)} />
                  </div>

                  <div className="dn-srow">
                    <span style={{color:"black"}}>Subtotal</span>
                    <strong style={{color:"black"}}>₹ {subtotal}</strong>
                  </div>

                  <div className="dn-total">
                    <span style={{color:"black"}}>Total</span>
                    <strong style={{color:"black"}}>₹ {total}</strong>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

      {partyModal && (
        <div className="dn-modal">
          <div className="dn-modal-box">
            <h3>Add Party</h3>

            <input className="dn-modal-input" placeholder="Party Name"
              value={newParty.name}
              onChange={(e) => setNewParty({ ...newParty, name: e.target.value })} />

            <input className="dn-modal-input" placeholder="Mobile Number"
              value={newParty.mobile}
              onChange={(e) => setNewParty({ ...newParty, mobile: e.target.value })} />

            <div className="dn-modal-btns">
              <button className="dn-cancel" onClick={() => setPartyModal(false)}>Cancel</button>
              <button className="dn-save2" onClick={saveParty}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateDebitNote;
