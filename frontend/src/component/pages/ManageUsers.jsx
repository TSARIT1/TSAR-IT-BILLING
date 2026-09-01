import React, { useState, useEffect } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsPeopleFill, 
  BsShieldLockFill, 
  BsPlusCircleFill, 
  BsBriefcaseFill, 
  BsCheckCircleFill, 
  BsFileEarmarkTextFill,
  BsTrash,
  BsEnvelopeFill,
  BsTelephoneFill,
  BsPencilSquare
} from "react-icons/bs";
import Swal from "sweetalert2";
import "../dashboard.css";
import "../manageusers.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([
    {
      id: "USR-001",
      name: "Rajesh Sharma (Owner)",
      email: "admin@tsarit.com",
      mobile: "9876543210",
      role: "ADMIN",
      accessLevel: "Full System Vision (Financials, GST, Deletions, Approvals)",
      status: "ACTIVE"
    },
    {
      id: "USR-002",
      name: "Suresh Gupta & Associates (Chartered Accountant)",
      email: "ca.suresh@taxassociates.in",
      mobile: "9123456780",
      role: "CA",
      accessLevel: "GST Returns (GSTR-1, GSTR-3B), Audit Trails, Balance Sheet, Ledger Exports",
      status: "ACTIVE"
    },
    {
      id: "USR-003",
      name: "Vikram Reddy",
      email: "vikram.sales@tsarit.com",
      mobile: "9988776655",
      role: "SALESMAN",
      accessLevel: "POS Counter, Create Invoices, Customer Lookup (Financial reports hidden)",
      status: "ACTIVE"
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("USER"); // "USER" or "CA"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "USER",
    caFirm: "",
    caMembershipNo: ""
  });

  const handleOpenAddModal = (type) => {
    setModalType(type);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      role: type === "CA" ? "CA" : "USER",
      caFirm: type === "CA" ? "Gupta Tax Solutions" : "",
      caMembershipNo: type === "CA" ? "ICAI-40918" : ""
    });
    setShowAddModal(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      Swal.fire("Error", "Name and email are required.", "error");
      return;
    }

    const newUser = {
      id: "USR-" + Math.floor(100 + Math.random() * 900),
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile || "-",
      role: formData.role,
      accessLevel: formData.role === "CA" 
        ? `Dedicated CA Portal: Read/Audit GSTR-1, GSTR-3B, Balance Sheets, Audit Logs (${formData.caMembershipNo || "Chartered Accountant"})`
        : formData.role === "ADMIN" 
          ? "Full Administrative Control" 
          : "Standard Billing Operator / Sales Counter",
      status: "ACTIVE"
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
    Swal.fire({
      icon: "success",
      title: `${formData.role === "CA" ? "Chartered Accountant (CA)" : "Staff User"} Added!`,
      text: `An invitation email with secure access credentials has been dispatched to ${formData.email}.`,
      confirmButtonColor: "#4f46e5"
    });
  };

  const handleDeleteUser = (id) => {
    Swal.fire({
      title: "Remove Access?",
      text: "This user will immediately lose authorization to access your portal records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Revoke Access"
    }).then((res) => {
      if (res.isConfirmed) {
        setUsers(users.filter(u => u.id !== id));
        Swal.fire("Access Revoked", "The user has been removed.", "success");
      }
    });
  };

  return (
    <PortalLayout title="Multi-User & CA Chartered Accountant Access Control">
      <div className="manage-users-page-container animate-fade-in">
        {/* Top Header Card */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <BsShieldLockFill className="text-primary" /> Role-Based Access Control (RBAC)
              </h3>
              <p className="text-muted small mb-0">
                Grant dedicated, secure access to your staff operators and your external <strong>Chartered Accountant (CA)</strong> for direct GST auditing.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                onClick={() => handleOpenAddModal("CA")}
              >
                <BsFileEarmarkTextFill /> + Add Your CA
              </button>
              <button 
                className="btn btn-primary fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2"
                onClick={() => handleOpenAddModal("USER")}
              >
                <BsPlusCircleFill /> + Add Staff / User
              </button>
            </div>
          </div>
        </div>

        {/* Roles Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-primary border-4">
              <div className="text-muted small fw-bold">PORTAL ADMIN</div>
              <div className="fs-4 fw-bold text-dark mt-1">1 Account</div>
              <div className="small text-secondary mt-1">Full vision, tax configs & approvals</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4">
              <div className="text-muted small fw-bold">CA CHARTERED ACCOUNTANT</div>
              <div className="fs-4 fw-bold text-success mt-1">
                {users.filter(u => u.role === "CA").length} Dedicated CA
              </div>
              <div className="small text-secondary mt-1">Direct GSTR-1, GSTR-3B & ledger auditing</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-info border-4">
              <div className="text-muted small fw-bold">OPERATOR / SALES USERS</div>
              <div className="fs-4 fw-bold text-dark mt-1">
                {users.filter(u => u.role !== "CA" && u.role !== "ADMIN").length} Operators
              </div>
              <div className="small text-secondary mt-1">Daily billing & POS checkout terminal</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3">Active Authorized Users & External Auditors</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase">User / Official</th>
                  <th className="small text-muted text-uppercase">Contact Info</th>
                  <th className="small text-muted text-uppercase">Assigned Role</th>
                  <th className="small text-muted text-uppercase">Scope of Access</th>
                  <th className="small text-muted text-uppercase">Status</th>
                  <th className="small text-muted text-uppercase text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="fw-bold text-dark">{u.name}</div>
                      <div className="small text-muted font-monospace">{u.id}</div>
                    </td>
                    <td>
                      <div className="small"><BsEnvelopeFill className="me-1 text-muted" /> {u.email}</div>
                      <div className="small"><BsTelephoneFill className="me-1 text-muted" /> {u.mobile}</div>
                    </td>
                    <td>
                      {u.role === "ADMIN" && (
                        <span className="badge bg-primary text-white fw-bold px-2 py-1">👑 ADMIN</span>
                      )}
                      {u.role === "CA" && (
                        <span className="badge bg-success text-white fw-bold px-2 py-1">📄 CA (AUDITOR)</span>
                      )}
                      {u.role !== "ADMIN" && u.role !== "CA" && (
                        <span className="badge bg-secondary text-white fw-bold px-2 py-1">🧑‍💼 {u.role}</span>
                      )}
                    </td>
                    <td>
                      <span className="small text-secondary">{u.accessLevel}</span>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1 rounded-pill">
                        <BsCheckCircleFill className="me-1" /> Active
                      </span>
                    </td>
                    <td className="text-end">
                      {u.role !== "ADMIN" && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Revoke access"
                        >
                          <BsTrash /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Adding Staff / CA */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-4 border-0">
                <div className="modal-header bg-light border-bottom">
                  <h5 className="modal-title fw-bold">
                    {modalType === "CA" ? "📄 Add Your Chartered Accountant (CA)" : "🧑‍💼 Add Portal User / Staff"}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleSaveUser}>
                  <div className="modal-body p-4">
                    {modalType === "CA" ? (
                      <div className="alert alert-info py-2 small mb-3">
                        Giving CA access allows your auditor to independently export GSTR-1, GSTR-3B JSON/Excel, inspect audit logs, and reconcile ledgers without seeing internal profit markups.
                      </div>
                    ) : null}

                    <div className="mb-3">
                      <label className="form-label small fw-bold">{modalType === "CA" ? "CA Full Name / Firm Name *" : "Staff Full Name *"}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder={modalType === "CA" ? "e.g. CA Ramesh Sharma & Co" : "e.g. Anita Rao"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Email Address (Login ID) *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="e.g. ca@accountancy.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Mobile Number</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        placeholder="10-digit mobile number"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>

                    {modalType === "CA" ? (
                      <>
                        <div className="mb-3">
                          <label className="form-label small fw-bold">ICAI Membership No (Optional)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. ICAI-29831"
                            value={formData.caMembershipNo}
                            onChange={(e) => setFormData({ ...formData, caMembershipNo: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Role Assignment *</label>
                        <select 
                          className="form-select"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="USER">Salesman / Billing Counter Operator</option>
                          <option value="STOCK_MANAGER">Stock & Warehouse Manager</option>
                          <option value="PARTNER">Business Partner (Financials Access)</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer bg-light border-top">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold px-4">
                      {modalType === "CA" ? "Grant CA Access" : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
