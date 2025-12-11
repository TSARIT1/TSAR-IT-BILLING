import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { FiSearch } from "react-icons/fi";
import "../payment.css";
import { useNavigate } from "react-router-dom";

function Expenses() {
    const navigate = useNavigate();
  return (
    <>
      <Navbar />

      <div className="exp-layout">
        <Sidebar />

        <div className="exp-main">
          <div className="exp-header-top">
            <h2 style={{color:"black",fontWeight:"bolder"}}>Expenses</h2>

            <div className="exp-actions">
              <button className="exp-report-btn">
                Reports
              </button>

              <button className="exp-create-btn" onClick={() => navigate("/createexpense")}>
                Create Expense
              </button>
            </div>
          </div>

          <div className="exp-filters">
            <div className="exp-search">
              <FiSearch />
              <input placeholder="Search" />
            </div>

            <select>
              <option>Last 365 Days</option>
            </select>

            <select>
              <option>All Expenses Categories</option>
            </select>
          </div>

          <div className="exp-table-box">

            <div className="exp-table-header">
              <div>Date</div>
              <div>Expense Number</div>
              <div>Party Name</div>
              <div>Category</div>
              <div>Amount</div>
            </div>

            <div className="exp-no-data">
              <img src="/no-data-icon.png" alt="" />
              <p>No Transactions Matching the current filter</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Expenses;
