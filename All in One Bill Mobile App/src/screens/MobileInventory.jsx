import React, { useState } from "react";
import { Link } from "react-router-dom";
import MobileNavigation from "../components/MobileNavigation";
import { 
  BsBoxSeam, 
  BsSearch, 
  BsArrowLeft 
} from "react-icons/bs";

export default function MobileInventory() {
  const [items] = useState([
    { id: 1, name: "Premium Basmati Rice (1kg)", stock: 45, unit: "KG", price: 120, minStock: 20 },
    { id: 2, name: "Cotton Slim Shirt (L)", stock: 18, unit: "PCS", price: 899, minStock: 10 },
    { id: 3, name: "NPK 19:19:19 Fertilizer (50kg)", stock: 120, unit: "BAG", price: 2050, minStock: 50 },
    { id: 4, name: "Samsung Galaxy A15 (128GB)", stock: 6, unit: "PCS", price: 13999, minStock: 5 }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mobile-app-shell pb-5 mb-4">
      <header className="mobile-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Link to="/" className="text-white fs-5"><BsArrowLeft /></Link>
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <BsBoxSeam className="text-primary" /> Inventory Stock
          </h6>
        </div>
      </header>

      <main className="p-3">
        <div className="input-group mb-3 shadow-sm">
          <span className="input-group-text bg-white border-end-0"><BsSearch className="text-muted" /></span>
          <input 
            type="text" 
            className="form-control form-control-sm border-start-0 bg-white"
            placeholder="Search item stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column gap-2">
          {filtered.map(it => (
            <div key={it.id} className="card border shadow-sm rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold text-dark mb-0">{it.name}</h6>
                  <span className="text-primary fw-bold small">Selling: ₹{it.price}</span>
                </div>
                <div className="text-end">
                  <span className="badge bg-primary-subtle text-primary border fs-6">
                    {it.stock} {it.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
