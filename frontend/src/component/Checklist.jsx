import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BsCheckCircleFill, 
  BsCircle, 
  BsListCheck, 
  BsArrowRight,
  BsStars
} from "react-icons/bs";

export default function Checklist() {
  const defaultItems = [
    { id: 1, text: "Configure Business Profile & GST", link: "/business-settings", completed: false },
    { id: 2, text: "Add Warehouse / Godown Location", link: "/godown", completed: false },
    { id: 3, text: "Add First Inventory Product", link: "/inventory", completed: false },
    { id: 4, text: "Create First Sales Invoice", link: "/create-invoice", completed: false },
    { id: 5, text: "Set up Bank Account & UPI ID", link: "/business-settings", completed: false },
  ];

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("portal_checklist");
    return saved ? JSON.parse(saved) : defaultItems;
  });

  const toggleItem = (id) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    localStorage.setItem("portal_checklist", JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="dashboard-card-box">
      <div className="box-header">
        <h4><BsListCheck className="text-success" /> Setup & Daily Checklist</h4>
        <span className="badge bg-primary-subtle text-primary fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
          {completedCount}/{items.length} Done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="small text-muted fw-semibold">Onboarding Progress</span>
          <span className="small fw-bold text-success">{progressPercent}%</span>
        </div>
        <div className="progress" style={{ height: '8px', borderRadius: '9999px', backgroundColor: '#f1f5f9' }}>
          <div 
            className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
            role="progressbar" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="d-flex flex-column gap-2 mb-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="d-flex align-items-center justify-content-between p-2 rounded-3 border"
            style={{ 
              backgroundColor: item.completed ? '#f8fafc' : '#ffffff',
              borderColor: item.completed ? '#e2e8f0' : '#cbd5e1'
            }}
          >
            <div 
              className="d-flex align-items-center gap-2" 
              style={{ cursor: 'pointer' }}
              onClick={() => toggleItem(item.id)}
            >
              {item.completed ? (
                <BsCheckCircleFill className="text-success fs-5 flex-shrink-0" />
              ) : (
                <BsCircle className="text-muted fs-5 flex-shrink-0" />
              )}
              <span className={`small fw-semibold ${item.completed ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                {item.text}
              </span>
            </div>

            <Link to={item.link} className="btn btn-sm btn-link p-0 text-primary" title="Open action">
              <BsArrowRight />
            </Link>
          </div>
        ))}
      </div>

      {progressPercent === 100 ? (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small mb-0" role="alert">
          <BsStars className="fs-5" /> 
          <div><strong>Great job!</strong> Your billing portal is completely configured.</div>
        </div>
      ) : (
        <div className="text-muted small text-center">
          Complete remaining steps to unlock automated e-invoicing.
        </div>
      )}
    </div>
  );
}
