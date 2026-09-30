import React, { useState, useEffect } from "react";
import {
  BsGearFill,
  BsVolumeUpFill,
  BsWindowStack,
  BsCashCoin,
  BsExclamationTriangleFill,
  BsMegaphoneFill,
  BsCheck2Circle,
  BsX,
  BsPlayFill,
} from "react-icons/bs";
import { getNotificationSettings, updateNotificationSettings } from "../services/api";
import { playNotificationSound } from "../utils/soundUtil";
import "./NotificationSettingsModal.css";

export default function NotificationSettingsModal({ isOpen, onClose, businessId, userId, onSaved }) {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    popupEnabled: true,
    salesAlerts: true,
    paymentAlerts: true,
    invoiceAlerts: true,
    expenseAlerts: true,
    lowStockAlerts: true,
    ticketAlerts: true,
    systemAnnouncements: true,
    minAmountThreshold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getNotificationSettings(businessId, userId);
        if (data && data.id) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [isOpen, businessId, userId]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        businessId: businessId || null,
        userId: userId || null,
        minAmountThreshold: Number(settings.minAmountThreshold) || 0,
      };
      const res = await updateNotificationSettings(payload);
      setSettings(res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      if (onSaved) onSaved(res);
      // Store preferences locally for quick client reference
      localStorage.setItem("notif_sound_enabled", String(res.soundEnabled));
      localStorage.setItem("notif_popup_enabled", String(res.popupEnabled));
    } catch (err) {
      alert("Failed to save settings: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleTestSound = (type) => {
    playNotificationSound(type, 0.4);
  };

  return (
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal-header">
          <div className="d-flex align-items-center gap-2">
            <BsGearFill className="text-primary fs-5" />
            <h4 className="m-0">Business Notification Settings</h4>
          </div>
          <button className="notif-modal-close" onClick={onClose} title="Close">
            <BsX />
          </button>
        </div>

        {loading ? (
          <div className="p-5 text-center text-muted">Loading preferences...</div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="notif-modal-body">
              {savedSuccess && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3">
                  <BsCheck2Circle />
                  <span>Notification settings updated successfully!</span>
                </div>
              )}

              {/* Sound & Popups Section */}
              <div className="notif-pref-group">
                <div className="notif-group-title">Audio &amp; Visual Alerts</div>
                
                <div className="notif-toggle-row">
                  <div className="notif-toggle-info">
                    <span className="notif-toggle-label"><BsVolumeUpFill className="me-2 text-primary" /> Audio Chimes</span>
                    <span className="notif-toggle-sub">Play real-time crystal chime when transactions and alerts occur</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      onClick={() => handleTestSound("TRANSACTION")}
                      title="Test Audio"
                    >
                      <BsPlayFill /> Test Sound
                    </button>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={() => handleToggle("soundEnabled")}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-toggle-info">
                    <span className="notif-toggle-label"><BsWindowStack className="me-2 text-info" /> Screen Popups (Toasts)</span>
                    <span className="notif-toggle-sub">Show instant floating alert cards at bottom right of the screen</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.popupEnabled}
                      onChange={() => handleToggle("popupEnabled")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              {/* Transaction Filters */}
              <div className="notif-pref-group">
                <div className="notif-group-title">Business &amp; Transaction Events</div>

                <div className="notif-toggle-row">
                  <div className="notif-toggle-info">
                    <span className="notif-toggle-label"><BsCashCoin className="me-2 text-success" /> Sales &amp; Invoices</span>
                    <span className="notif-toggle-sub">Notify immediately when new sales are completed or bills generated</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.salesAlerts}
                      onChange={() => handleToggle("salesAlerts")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-toggle-info">
                    <span className="notif-toggle-label"><BsCashCoin className="me-2 text-primary" /> Payment Receipts (Payment In)</span>
                    <span className="notif-toggle-sub">Notify when payments are recorded from customers</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.paymentAlerts}
                      onChange={() => handleToggle("paymentAlerts")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-toggle-info">
                    <span className="notif-toggle-label"><BsExclamationTriangleFill className="me-2 text-warning" /> Low Stock &amp; Inventory</span>
                    <span className="notif-toggle-sub">Instant alerts when product inventory drops to 5 units or below</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.lowStockAlerts}
                      onChange={() => handleToggle("lowStockAlerts")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="notif-toggle-row">
                  <div className="notif-toggle-info">
                    <span className="notif-toggle-label"><BsMegaphoneFill className="me-2 text-indigo" /> System Announcements</span>
                    <span className="notif-toggle-sub">Important broadcasts and maintenance alerts from Super Admin</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.systemAnnouncements}
                      onChange={() => handleToggle("systemAnnouncements")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              {/* Threshold filter */}
              <div className="notif-pref-group mb-0">
                <div className="notif-group-title">Threshold Filter</div>
                <div className="mb-2">
                  <label className="form-label small text-muted">Minimum Transaction Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0 = Notify for all amounts"
                    value={settings.minAmountThreshold || 0}
                    onChange={(e) => setSettings({ ...settings, minAmountThreshold: e.target.value })}
                  />
                  <small className="text-secondary">Only show transaction notifications for amounts greater than or equal to this value.</small>
                </div>
              </div>
            </div>

            <div className="notif-modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
