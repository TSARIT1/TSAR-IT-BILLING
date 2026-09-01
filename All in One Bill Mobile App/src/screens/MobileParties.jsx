import React, { useState } from "react";
import { Link } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import { 
  BsPeopleFill, 
  BsSearch, 
  BsTelephoneFill, 
  BsArrowLeft,
  BsBuilding 
} from "react-icons/bs";

export default function MobileParties() {
  const [parties] = useState([
    { id: 1, name: "Kaveri Agro Tech", type: "Customer", phone: "+91 98450 12345", gstin: "36AAACT1234F1Z5", balance: 14500 },
    { id: 2, name: "Lotus Textiles Retail", type: "Customer", phone: "+91 97890 23456", gstin: "36BBBP2345K1Z1", balance: 28000 },
    { id: 3, name: "Bharat Agro Suppliers", type: "Supplier", phone: "+91 99220 34567", gstin: "27AABCB9876C1Z2", balance: -52000 }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filtered = parties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <div className="mobile-app-shell pb-5 mb-4">
      <header className="mobile-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="text-white fs-5"><BsArrowLeft /></Link>
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <BsPeopleFill className="text-success" /> Parties & Contacts
          </h6>
        </div>
      </header>

      <main className="p-3">
        <div className="input-group mb-3 shadow-sm">
          <span className="input-group-text bg-white border-end-0"><BsSearch className="text-muted" /></span>
          <input 
            type="text" 
            className="form-control form-control-sm border-start-0 bg-white"
            placeholder="Search party by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column gap-2">
          {filtered.map(p => (
            <div key={p.id} className="card border shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <h6 className="fw-bold text-dark mb-0">{p.name}</h6>
                  <span className="badge bg-light text-secondary border small">{p.type}</span>
                </div>
                <div className="text-end">
                  <span className={`fw-bold small ${p.balance >= 0 ? 'text-danger' : 'text-success'}`}>
                    {p.balance >= 0 ? `To Receive: ₹${p.balance}` : `To Pay: ₹${Math.abs(p.balance)}`}
                  </span>
                </div>
              </div>
              <div className="text-muted small mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                <span><BsTelephoneFill className="text-muted me-1" /> {p.phone}</span>
                <span className="text-truncate" style={{ maxWidth: '140px' }}>{p.gstin}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
