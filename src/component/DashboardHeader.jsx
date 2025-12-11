import "./dashboard.css";

function DashboardHeader() {
  return (
    <div className="header-wrapper" >
      <div className="right-icons">
        <button className="demo-btn">Book Demo</button>
      </div>

      <h2 className="page-title">Dashboard</h2>
    </div>
  );
}

export default DashboardHeader;