import { BsCheckCircle, BsCircle, BsListCheck } from "react-icons/bs";
import "./dashboard.css";

function Checklist() {
  const checklistItems = [
    { id: 1, text: "Set up your business profile", completed: false },
    { id: 2, text: "Add your first party", completed: false },
    { id: 3, text: "Create your first invoice", completed: false },
  ];

  return (
    <div className="dashboard-box">
      <div className="dashboard-box-header">
        <h4><BsListCheck /> Today's Checklist</h4>
        <span className="dashboard-checklist-badge">0/{checklistItems.length}</span>
      </div>
      <div className="dashboard-checklist-items">
        {checklistItems.map(item => (
          <div key={item.id} className="dashboard-checklist-item">
            {item.completed ? (
              <BsCheckCircle className="checklist-icon completed" />
            ) : (
              <BsCircle className="checklist-icon" />
            )}
            <span className={item.completed ? "completed-text" : ""}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Checklist;
