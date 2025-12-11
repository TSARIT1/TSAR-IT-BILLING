
import Cards from "../Cards";
import Checklist from "../Checklist";
import DashboardHeader from "../DashboardHeader";
import "../dashboard.css"
import Sidebar from "../Sidebar";
import Transactions from "../Transactions";
import Navbar from "../Navbar"

function Dashboard() {
  return (
     <>
      <Navbar />
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content">
          <DashboardHeader />

         
          <div className="cards-section">
            <Cards />
          </div>

         
          <div className="grid-section">
            <Transactions />
            <Checklist />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
