import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import { AutoSyncService } from "../services/autoSyncService";
import { NativeBridge } from "../services/nativeBridge";
import { 
  BsArrowRepeat, 
  BsCloudCheckFill, 
  BsHddStackFill, 
  BsWifi, 
  BsCheckCircleFill, 
  BsArrowLeft 
} from "react-icons/bs";

export default function MobileSyncCenter() {
  const [queue, setQueue] = useState([]);
  const [serverIp, setServerIp] = useState(
    localStorage.getItem("tsar_server_ip") || "localhost"
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");

  const refreshQueue = () => {
    setQueue(AutoSyncService.getPendingQueue());
  };

  useEffect(() => {
    refreshQueue();
  }, []);

  const handleSaveIp = (e) => {
    e.preventDefault();
    localStorage.setItem("tsar_server_ip", serverIp);
    NativeBridge.showToast(`Server IP set to: ${serverIp}`);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg("Connecting to server & synchronizing delta...");
    const res = await AutoSyncService.performFullSync();
    setIsSyncing(false);
    setSyncStatusMsg(res.message);
    refreshQueue();
  };

  return (
    <div className="mobile-app-shell pb-5 mb-4">
      {/* Header */}
      <header className="mobile-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="text-white fs-5"><BsArrowLeft /></Link>
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <BsArrowRepeat className="text-info" /> Auto-Sync & Offline Center
          </h6>
        </div>
        <span className="badge bg-success text-white">Bi-Directional</span>
      </header>

      <main className="p-3">
        {/* Status Card */}
        <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3 text-center">
          <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mx-auto mb-2">
            <BsCloudCheckFill className="fs-1" />
          </div>
          <h5 className="fw-bold mb-1">
            {queue.length === 0 ? "All Data Synchronized" : `${queue.length} Pending Mutations`}
          </h5>
          <p className="text-muted small mb-3">
            Offline bills, parties, and stock updates automatically sync when network connects.
          </p>

          <button 
            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
            disabled={isSyncing}
            onClick={handleSyncNow}
          >
            <BsArrowRepeat className={isSyncing ? "spinner-border spinner-border-sm" : ""} />
            {isSyncing ? "Syncing..." : "Sync Now With Server"}
          </button>

          {syncStatusMsg && (
            <div className="alert alert-info py-2 px-3 small mt-3 mb-0 text-start">
              {syncStatusMsg}
            </div>
          )}
        </div>

        {/* Server IP Configuration Card */}
        <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
          <h6 className="fw-bold small text-uppercase text-muted mb-2 d-flex align-items-center gap-1">
            <BsWifi className="text-primary" /> Backend Server IP (Wi-Fi / LAN)
          </h6>
          <form onSubmit={handleSaveIp}>
            <div className="input-group mb-2">
              <input 
                type="text" 
                className="form-control form-control-sm bg-light"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                placeholder="e.g. 192.168.1.100 or localhost"
              />
              <button type="submit" className="btn btn-dark btn-sm fw-semibold">Save</button>
            </div>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Port 8081 is used automatically (Spring Boot backend).
            </span>
          </form>
        </div>

        {/* Offline Queue Items List */}
        <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold small text-uppercase text-muted mb-0 d-flex align-items-center gap-1">
              <BsHddStackFill className="text-secondary" /> Offline Local Queue ({queue.length})
            </h6>
            {queue.length > 0 && (
              <button className="btn btn-sm btn-link text-danger p-0 small" onClick={() => { AutoSyncService.clearQueue(); refreshQueue(); }}>
                Clear
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-3 text-muted small">
              <BsCheckCircleFill className="text-success me-1" /> No pending offline transactions.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {queue.map((item) => (
                <div key={item.id} className="p-2 bg-light rounded border small d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-secondary me-1">{item.entityType}</span>
                    <span className="fw-bold text-dark">{item.payload.invoiceNumber || item.payload.name || "Transaction"}</span>
                  </div>
                  <span className="badge bg-warning text-dark">{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
