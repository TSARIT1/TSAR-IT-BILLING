import React from "react";
import Navbar from "../Navbar";        
import Sidebar from "../Sidebar";      
import "../payment.css";        

function AutomatedBillsPage() {
  return (
    <>
      <Navbar />

      <div className="layout-container">
        <Sidebar />

        <div className="auto-bills-container">
          <h2 className="page-title">Automated Bills</h2>

          <div className="cards-wrapper">

            {/* Card 1 */}
            <div className="auto-card">
              <img src="/images/auto1.png" className="auto-img" alt="" />
              <h3>Creating repeated bills?</h3>
              <p>Automate sending of repeat bills based on a schedule of your choice</p>
            </div>

            {/* Card 2 */}
            <div className="auto-card">
              <img src="/images/auto2.png" className="auto-img" alt="" />
              <h3>Automated Billing</h3>
              <p>Send SMS reminders to customers daily/weekly/monthly</p>
            </div>

            {/* Card 3 */}
            <div className="auto-card">
              <img src="/images/auto3.png" className="auto-img" alt="" />
              <h3>Easy Reminders & Payment</h3>
              <p>Automatically receive notifications and collect payments</p>
            </div>

          </div>

          <div className="btn-container">
            <button className="create-btn">Create Automated Bill</button>
          </div>

        </div>
      </div>
    </>
  );
}

export default AutomatedBillsPage;
