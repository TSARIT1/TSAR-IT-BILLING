import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiArrowLeft } from "react-icons/fi";
import "../payment.css";

function CreateExpense() {
  return (
    <>
      <Navbar />

      <div className="ce-layout">
        <Sidebar />

        <div className="ce-main">
          <div className="ce-topbar">
            <div className="ce-left">
              <FiArrowLeft className="ce-back" />
              <h2>Create Expense</h2>
            </div>

            <div className="ce-right">
              <button className="ce-settings">⚙</button>
              <button className="ce-cancel">Cancel</button>
              <button className="ce-save">Save</button>
            </div>
          </div>

          <div className="ce-body">

            <div className="ce-row">

              <div className="ce-box">
                <div className="ce-switch-row">
                  <span>Expense With GST</span>
                  <label className="ce-switch">
                    <input type="checkbox" />
                    <span className="ce-slider"></span>
                  </label>
                </div>

                <div className="ce-field">
                  <label>Expense Category</label>
                  <select>
                    <option>Select Category</option>
                  </select>
                </div>

                <div className="ce-field">
                  <label>Expense Number</label>
                  <input type="text" value="1" readOnly />
                </div>
              </div>

              <div className="ce-box">
                <div className="ce-field">
                  <label>Original Invoice Number</label>
                  <input type="text" />
                </div>

                <div className="ce-field">
                  <label>Date</label>
                  <input type="date" value="2025-11-24" />
                </div>

                <div className="ce-field">
                  <label>Payment Mode</label>
                  <select>
                    <option>Select</option>
                  </select>
                </div>

                <div className="ce-field">
                  <label>Note</label>
                  <textarea placeholder="Enter Notes"></textarea>
                </div>
              </div>

            </div>

            <div className="ce-add-box">
              + Add Item
            </div>

            <div className="ce-total-row">
              <span>Total Expense Amount</span>

              <div className="ce-total-field">
                ₹ <input type="text" value="0" readOnly />
              </div>
            </div>

            <div className="ce-empty-area"></div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CreateExpense;
