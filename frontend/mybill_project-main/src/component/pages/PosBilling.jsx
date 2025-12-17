import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";

function PosBilling() {
  return (
    <div className="pos-container">
      <Navbar />
      <Sidebar />

      <div className="pos-content">
        <div className="top-bar">
          <button className="exit-btn">← Exit POS [ESC]</button>
          <h2>POS Billing</h2>

          <div className="settings-sec">
            <button className="help-btn">Watch how to use POS Billing</button>
            <button className="settings-btn">Settings [CTRL + S]</button>
          </div>
        </div>

        <div className="billing-header">
          <p>Billing Screen 1 [CTRL + 1]</p>
          <button className="hold-btn">+ Hold Bill & Create Another [CTRL + B]</button>
        </div>

        <div className="actions">
          <button className="action-btn">+ New Item [CTRL + I]</button>
          <button className="action-btn">Change Price [P]</button>
          <button className="action-btn">Change QTY [Q]</button>
          <button className="delete-btn">Delete Item [DEL]</button>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search by Item Name/Item Code or Scan Barcode" />
          <span className="f1">[F1]</span>
        </div>

        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Items</th>
                <th>Item Code</th>
                <th>MRP</th>
                <th>SP (₹)</th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
          </table>

          <div className="empty-box">
            <div className="empty-icon">📦</div>
            <p>Add items by searching item name or item code</p>
            <p>Or</p>
            <p>Scan barcode to add items</p>
          </div>
        </div>

        <div className="right-panel">
          <button className="small-btn">Add Discount [F2]</button>
          <button className="small-btn">Add Additional Charge [F3]</button>

          <div className="bill-box">
            <h4>Bill details</h4>
            <div className="line"><span>Sub Total</span><span>₹ 0</span></div>
            <div className="line"><span>Tax</span><span>₹ 0</span></div>
            <div className="total"><span>Total Amount</span><span>₹ 0</span></div>
          </div>

          <div className="bill-box">
            <h4>Received Amount [F4]</h4>
            <div className="line"><span>₹ 0</span>
              <select>
                <option>Cash</option>
              </select>
            </div>
          </div>

          <div className="bill-box">
            <h4>Customer Details [F5]</h4>
            <p>Cash Sale</p>
          </div>

          <div className="footer-btns">
            <button className="print-btn">Save & Print [F6]</button>
            <button className="save-btn">Save Bill [F7]</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosBilling;
