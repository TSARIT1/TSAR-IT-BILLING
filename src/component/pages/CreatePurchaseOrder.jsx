import React, { useState, useRef, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiArrowLeft, FiSettings } from "react-icons/fi";
import "../purchsed.css";
import { useNavigate } from "react-router-dom";

export default function CreatePurchaseOrder() {
  const [partyModal, setPartyModal] = useState(false);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const navigate = useNavigate();

  const [poMeta, setPoMeta] = useState({
    no: 1,
    poDate: new Date().toISOString().slice(0,10),
    validTill: (() => {
      const d = new Date(); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10);
    })()
  });

  const [items, setItems] = useState([{ id: Date.now(), name: "", hsn:"", qty:1, price:0, discount:0, tax:0 }]);
  const fileRef = useRef(null);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    if(items.length === 0) addItem();
  }, []);

  function addItem(){
    setItems(prev => [...prev, { id: Date.now()+Math.random(), name:"", hsn:"", qty:1, price:0, discount:0, tax:0 }]);
  }

  function removeItem(id){
    setItems(prev => prev.filter(i=>i.id!==id));
  }

  function updateItem(id, field, value){
    setItems(prev => prev.map(i => i.id===id ? {...i, [field]: value} : i));
  }

  function rowCalc(it){
    const q = Number(it.qty)||0;
    const p = Number(it.price)||0;
    const disc = Number(it.discount)||0;
    const tax = Number(it.tax)||0;
    const base = q*p;
    const afterDisc = base - (base * disc / 100);
    const taxAmt = afterDisc * tax / 100;
    return { base, afterDisc, taxAmt, total: afterDisc + taxAmt };
  }

  function subtotal(){
    return items.reduce((s,it)=> s + rowCalc(it).afterDisc, 0);
  }

  function totalTax(){
    return items.reduce((s,it)=> s + rowCalc(it).taxAmt, 0);
  }

  function totalAmount(){
    return subtotal() + totalTax();
  }

  function savePO(){
    const payload = { meta: poMeta, party: selectedParty, items, totals: { subtotal: subtotal(), tax: totalTax(), total: totalAmount() } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `purchase-order-${poMeta.no}.json`;
    a.click();
  }

  function onSignature(e){
    const f = e.target.files && e.target.files[0];
    if(f) setSignature(f.name);
  }

  function addParty(p){
    setParties(prev => [...prev, p]);
    setSelectedParty(p);
    setPartyModal(false);
  }

  return (
    <>
      <Navbar />
      <div className="po-layout">
        <Sidebar />
        <main className="po-main">
          <div className="po-wrap po-create-wrap">

            <div className="create-header" style={{marginTop:"3%"}}>
              <div className="create-left">
                <button className="back-btn" onClick={() => navigate("/purchase-orders")}><FiArrowLeft /> Back</button>
                <h3>Create Purchase Order</h3>
              </div>

              <div className="create-right">
                <button className="settings-btn"><FiSettings /> Settings</button>
                <button className="save-btn" onClick={savePO}>Save Purchase Order</button>
              </div>
            </div>

            <div className="create-body">

              <section className="left-col">
                <h4>Bill From</h4>

                <div className="add-party-box" onClick={()=>setPartyModal(true)}>
                  {selectedParty ? (
                    <div className="party-card">
                      <strong>{selectedParty.name}</strong>
                      <div>{selectedParty.mobile}</div>
                    </div>
                  ) : <div className="add-placeholder">+ Add Party</div>}
                </div>

                <table className="po-items-table">
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>ITEMS / SERVICES</th>
                      <th>HSN/ SAC</th>
                      <th>QTY</th>
                      <th>PRICE/ITEM (₹)</th>
                      <th>DISCOUNT</th>
                      <th>TAX</th>
                      <th>AMOUNT (₹)</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((it, idx) => {
                      const r = rowCalc(it);
                      return (
                        <tr key={it.id}>
                          <td>{idx+1}</td>
                          <td><input value={it.name} onChange={e=>updateItem(it.id,'name', e.target.value)} /></td>
                          <td><input value={it.hsn} onChange={e=>updateItem(it.id,'hsn', e.target.value)} /></td>
                          <td><input type="number" value={it.qty} onChange={e=>updateItem(it.id,'qty', e.target.value)} /></td>
                          <td><input type="number" value={it.price} onChange={e=>updateItem(it.id,'price', e.target.value)} /></td>
                          <td><input type="number" value={it.discount} onChange={e=>updateItem(it.id,'discount', e.target.value)} /></td>
                          <td><input type="number" value={it.tax} onChange={e=>updateItem(it.id,'tax', e.target.value)} /></td>
                          <td>{r.total.toFixed(2)}</td>
                          <td><button className="remove-row" onClick={()=>removeItem(it.id)}>Delete</button></td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="9" className="add-item-row"><button onClick={addItem} className="add-item-btn">+ Add Item</button></td>
                    </tr>
                  </tbody>
                </table>

                <div className="notes">
                  <a>+ Add Notes</a>
                  <div className="terms">
                    Terms and Conditions
                    <div className="term-box">1. Goods once sold will not be taken back or exchanged<br/>2. All disputes are subject to jurisdiction only</div>
                  </div>
                </div>
              </section>

              <aside className="right-col">

                <div className="meta-box">
                  <div className="meta-row"><label>PO No:</label><input readOnly value={poMeta.no} /></div>
                  <div className="meta-row"><label>PO Date:</label><input type="date" value={poMeta.poDate} onChange={e=>setPoMeta({...poMeta, poDate:e.target.value})} /></div>
                  <div className="meta-row"><label>Valid Till:</label><input type="date" value={poMeta.validTill} onChange={e=>setPoMeta({...poMeta, validTill:e.target.value})} /></div>
                </div>

                <div className="summary-box">
                  <div className="summary-row"><span>SUBTOTAL</span><span style={{marginLeft:"50px"}}>₹ {subtotal().toFixed(2)}</span></div>
                  <div className="summary-row"><span>TAX</span><span style={{marginLeft:"100px"}}>₹ {totalTax().toFixed(2)}</span></div>
                  <div className="summary-row total"><span>Total Amount</span><strong style={{marginLeft:"50px"}}>₹ {totalAmount().toFixed(2)}</strong></div>
                </div>

                <div className="signature">
                  <div>Authorized signatory for Business Name</div>

                  <div className="sig-box">
                    {signature ?
                      <div className="sig-file">{signature}</div>
                      :
                      <div className="sig-placeholder">+ Add Signature</div>
                    }

                    <input type="file" ref={fileRef} style={{display:'none'}} onChange={onSignature} />

                    <button onClick={()=>fileRef.current.click()} className="sig-upload">Upload</button>
                  </div>
                </div>

              </aside>
            </div>
          </div>
        </main>
      </div>

      {partyModal && (
        <div className="party-modal">
          <div className="party-box">
            <h3>Add Party</h3>
            <input placeholder="Name" id="pname" />
            <input placeholder="Mobile" id="pmobile" />

            <div className="modal-actions">
              <button onClick={()=>setPartyModal(false)} className="modal-cancel">Cancel</button>
              <button
                className="modal-add"
                onClick={()=>{
                  const name = document.getElementById('pname').value;
                  const mobile = document.getElementById('pmobile').value;
                  if(!name) return;
                  addParty({ id: Date.now(), name, mobile });
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
