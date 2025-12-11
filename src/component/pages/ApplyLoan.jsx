import React, { useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";

function ApplyLoan() {
  const [step, setStep] = useState(1);

  return (
    <div className="loan-wrapper">
      <Navbar />
      <Sidebar />

      <div className="loan-content">

        {step === 1 && (
          <div className="loan-box">
            <h2>Get Instant business loan</h2>
            <p>Please enter phone number</p>

            <input
              type="text"
              className="loan-input"
              placeholder="Enter phone number"
              defaultValue="8595107083"
            />

            <button className="loan-btn" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="loan-box form-box">
            <h2>Business Details</h2>
            <p>Tell us more about your business</p>

            <label>Full Name</label>
            <input type="text" className="loan-input" placeholder="Business Name" />

            <label>Pincode</label>
            <input type="text" className="loan-input" placeholder="123456" />

            <label>Business Incorporation Date</label>
            <input type="date" className="loan-input" />

            <label>Business Type</label>
            <select className="loan-input">
              <option>Proprietorship</option>
              <option>Partnership</option>
              <option>Private Limited</option>
            </select>

            <label>Own House/Shop</label>

            <div className="toggle-row">
              <button className="toggle-btn">Yes</button>
              <button className="toggle-btn active">No</button>
            </div>

            <button className="loan-btn">Submit Application</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default ApplyLoan;
