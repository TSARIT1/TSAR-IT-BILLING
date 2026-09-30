import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsMegaphoneFill,
  BsCashCoin,
  BsX,
  BsArrowRightShort,
  BsBellFill,
} from "react-icons/bs";
import "./NotificationToastContainer.css";

export default function NotificationToastContainer({ toasts, onDismiss, onRead }) {
  const navigate = useNavigate();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type, category) => {
    if (category === "SALE" || category === "PAYMENT" || type === "SUCCESS") {
      return <BsCashCoin className="notif-toast-icon success" />;
    }
    if (category === "INVENTORY" || type === "WARNING" || type === "DANGER") {
      return <BsExclamationTriangleFill className="notif-toast-icon warning" />;
    }
    if (category === "ANNOUNCEMENT" || type === "ANNOUNCEMENT") {
      return <BsMegaphoneFill className="notif-toast-icon announcement" />;
    }
    return <BsBellFill className="notif-toast-icon info" />;
  };

  const handleClick = (toast) => {
    if (onRead) onRead(toast.id);
    if (toast.actionUrl) {
      navigate(toast.actionUrl);
    }
    onDismiss(toast.id);
  };

  return (
    <div className="notif-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`notif-toast-card notif-toast-${(toast.type || "INFO").toLowerCase()} animate-slide-in`}
        >
          <div className="notif-toast-header">
            <div className="d-flex align-items-center gap-2">
              {getIcon(toast.type, toast.category)}
              <span className="notif-toast-badge">{toast.category || toast.type || "ALERT"}</span>
            </div>
            <button
              className="notif-toast-close"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              title="Dismiss"
            >
              <BsX />
            </button>
          </div>

          <div className="notif-toast-body" onClick={() => handleClick(toast)} role="button">
            <h5 className="notif-toast-title">{toast.title}</h5>
            <p className="notif-toast-msg">{toast.message}</p>
            {toast.amount && toast.amount > 0 && (
              <div className="notif-toast-amount">₹{Number(toast.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            )}
          </div>

          {toast.actionUrl && (
            <div className="notif-toast-footer">
              <button className="notif-toast-action" onClick={() => handleClick(toast)}>
                <span>View Details</span>
                <BsArrowRightShort />
              </button>
            </div>
          )}
          <div className="notif-toast-progress"></div>
        </div>
      ))}
    </div>
  );
}
