import { BsReceipt, BsInboxFill } from "react-icons/bs";
import "./dashboard.css";

function Transactions() {
  return (
    <div className="dashboard-box">
      <div className="dashboard-box-header">
        <h4><BsReceipt /> Latest Transactions</h4>
      </div>
      <div className="dashboard-empty-state">
        <BsInboxFill className="dashboard-empty-icon" />
        <p>No transactions yet</p>
        <span className="dashboard-empty-hint">Transactions will appear here once you start creating invoices</span>
      </div>
    </div>
  );
}

export default Transactions;
