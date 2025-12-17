import { BsCashStack, BsWallet2, BsBank } from "react-icons/bs";
import "./dashboard.css";

function Cards() {
  return (
    <div className="dashboard-cards-row">

      <div className="dashboard-stat-card to-collect">
        <div className="dashboard-card-icon-wrapper to-collect-icon">
          <BsCashStack className="dashboard-card-icon" />
        </div>
        <div className="dashboard-card-content">
          <p className="dashboard-card-label">To Collect</p>
          <h3 className="dashboard-card-value">₹ 0</h3>
          <span className="dashboard-card-badge positive">+0.0%</span>
        </div>
      </div>

      <div className="dashboard-stat-card to-pay">
        <div className="dashboard-card-icon-wrapper to-pay-icon">
          <BsWallet2 className="dashboard-card-icon" />
        </div>
        <div className="dashboard-card-content">
          <p className="dashboard-card-label">To Pay</p>
          <h3 className="dashboard-card-value">₹ 0</h3>
          <span className="dashboard-card-badge negative">-0.0%</span>
        </div>
      </div>

      <div className="dashboard-stat-card cash-bank">
        <div className="dashboard-card-icon-wrapper cash-bank-icon">
          <BsBank className="dashboard-card-icon" />
        </div>
        <div className="dashboard-card-content">
          <p className="dashboard-card-label">Cash + Bank Balance</p>
          <h3 className="dashboard-card-value">₹ 0</h3>
          <span className="dashboard-card-badge neutral">0.0%</span>
        </div>
      </div>

    </div>
  );
}

export default Cards;
