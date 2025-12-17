import { BsSpeedometer2, BsCalendar3 } from "react-icons/bs";
import "./dashboard.css";

function DashboardHeader() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="dashboard-page-header">
      <div className="dashboard-header-content">
        <div className="dashboard-title-section">
          <h2 className="dashboard-page-title">
            <BsSpeedometer2 className="dashboard-title-icon" /> Dashboard
          </h2>
          <p className="dashboard-page-subtitle">
            <BsCalendar3 /> {today}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;