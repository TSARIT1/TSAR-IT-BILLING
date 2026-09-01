import React from "react";
import PortalLayout from "../PortalLayout";
import "../payment.css";

function AutomatedBillsPage() {
  return (
    <PortalLayout title="Automated Recurring Bills">
      <div className="auto-bills-page-container animate-fade-in">
        <div className="auto-bills-container">
          <h2 className="page-title">Automated Bills & Recurring Invoices</h2>

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
            <button className="create-btn">+ Create Automated Recurring Bill</button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

export default AutomatedBillsPage;
