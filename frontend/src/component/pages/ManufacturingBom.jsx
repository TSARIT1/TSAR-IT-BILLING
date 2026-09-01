import React, { useState } from "react";
import PortalLayout from "../PortalLayout";
import { 
  BsGearWideConnected, 
  BsPlusLg, 
  BsTrash3, 
  BsCalculator, 
  BsBoxSeam, 
  BsLayersFill,
  BsCheckCircleFill,
  BsLightningChargeFill
} from "react-icons/bs";

export default function ManufacturingBom() {
  const [boms, setBoms] = useState([
    {
      id: 1,
      bomNumber: "BOM-2026-001",
      productName: "Premium Cotton Shirt (XL)",
      outputQty: 1,
      unit: "PCS",
      materialCost: 840.00,
      laborCost: 120.00,
      overheadCost: 40.00,
      totalCost: 1000.00,
      materials: [
        { name: "High Grade Cotton Fabric", qty: 2.5, unit: "MTR", unitCost: 300.00, total: 750.00 },
        { name: "Metal Pearl Buttons", qty: 1.0, unit: "SET", unitCost: 50.00, total: 50.00 },
        { name: "Garment Packing Box", qty: 1.0, unit: "PCS", unitCost: 40.00, total: 40.00 }
      ]
    },
    {
      id: 2,
      bomNumber: "BOM-2026-002",
      productName: "NPK 19:19:19 Soluble Fertilizer 50kg Bag",
      outputQty: 1,
      unit: "BAG",
      materialCost: 1850.00,
      laborCost: 150.00,
      overheadCost: 50.00,
      totalCost: 2050.00,
      materials: [
        { name: "Urea Granules", qty: 20.0, unit: "KG", unitCost: 35.00, total: 700.00 },
        { name: "Di-Ammonium Phosphate (DAP)", qty: 20.0, unit: "KG", unitCost: 45.00, total: 900.00 },
        { name: "Muriate of Potash (MOP)", qty: 10.0, unit: "KG", unitCost: 25.00, total: 250.00 }
      ]
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBom, setNewBom] = useState({
    productName: "",
    outputQty: 1,
    unit: "PCS",
    laborCost: 0,
    overheadCost: 0,
    materials: [
      { name: "", qty: 1, unit: "PCS", unitCost: 0 }
    ]
  });

  const handleAddMaterialRow = () => {
    setNewBom({
      ...newBom,
      materials: [...newBom.materials, { name: "", qty: 1, unit: "PCS", unitCost: 0 }]
    });
  };

  const handleRemoveMaterialRow = (index) => {
    const updated = newBom.materials.filter((_, i) => i !== index);
    setNewBom({ ...newBom, materials: updated });
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...newBom.materials];
    updated[index][field] = value;
    setNewBom({ ...newBom, materials: updated });
  };

  const calculateMaterialTotal = (mats) => {
    return mats.reduce((acc, m) => acc + ((parseFloat(m.qty) || 0) * (parseFloat(m.unitCost) || 0)), 0);
  };

  const currentMaterialCost = calculateMaterialTotal(newBom.materials);
  const currentTotalCost = currentMaterialCost + (parseFloat(newBom.laborCost) || 0) + (parseFloat(newBom.overheadCost) || 0);

  const handleSaveBom = (e) => {
    e.preventDefault();
    if (!newBom.productName) return;

    const created = {
      id: Date.now(),
      bomNumber: `BOM-2026-${Math.floor(100 + Math.random() * 900)}`,
      productName: newBom.productName,
      outputQty: parseFloat(newBom.outputQty) || 1,
      unit: newBom.unit,
      materialCost: currentMaterialCost,
      laborCost: parseFloat(newBom.laborCost) || 0,
      overheadCost: parseFloat(newBom.overheadCost) || 0,
      totalCost: currentTotalCost,
      materials: newBom.materials.map(m => ({
        name: m.name,
        qty: parseFloat(m.qty) || 1,
        unit: m.unit,
        unitCost: parseFloat(m.unitCost) || 0,
        total: (parseFloat(m.qty) || 1) * (parseFloat(m.unitCost) || 0)
      }))
    };

    setBoms([created, ...boms]);
    setShowCreateModal(false);
    setNewBom({
      productName: "",
      outputQty: 1,
      unit: "PCS",
      laborCost: 0,
      overheadCost: 0,
      materials: [{ name: "", qty: 1, unit: "PCS", unitCost: 0 }]
    });
  };

  return (
    <PortalLayout>
      <div className="container-fluid p-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <BsGearWideConnected className="text-primary" /> Manufacturing & Bill of Materials (BOM)
            </h4>
            <p className="text-muted small mb-0">Multi-level assembly costing, raw material consumption, and production orders</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold" onClick={() => setShowCreateModal(true)}>
            <BsPlusLg /> Create New BOM
          </button>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">ACTIVE BOM TEMPLATES</span>
              <h3 className="fw-bold mb-0 text-primary mt-1">{boms.length}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">PRODUCTION INVARIANT</span>
              <p className="small mb-0 text-success fw-bold mt-1 d-flex align-items-center gap-1">
                <BsCheckCircleFill /> Total Cost = Materials + Labor + Overheads
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
              <span className="text-muted small fw-bold">MRP STOCK DEDUCTION</span>
              <p className="small mb-0 text-dark fw-semibold mt-1">Automatic Inward/Outward Sync</p>
            </div>
          </div>
        </div>

        {/* BOM Cards List */}
        <div className="row g-3">
          {boms.map((bom) => (
            <div key={bom.id} className="col-12 col-xl-6">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                <div className="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-primary text-white me-2">{bom.bomNumber}</span>
                    <span className="fw-bold text-dark">{bom.productName}</span>
                  </div>
                  <span className="badge bg-light text-secondary border">Output: {bom.outputQty} {bom.unit}</span>
                </div>
                <div className="card-body p-3">
                  <h6 className="small fw-bold text-muted text-uppercase mb-2">Raw Material Components</h6>
                  <div className="table-responsive mb-3">
                    <table className="table table-sm table-bordered align-middle mb-0">
                      <thead className="table-light small">
                        <tr>
                          <th>Material Name</th>
                          <th>Qty Required</th>
                          <th>Unit Cost</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {bom.materials.map((mat, idx) => (
                          <tr key={idx}>
                            <td>{mat.name}</td>
                            <td>{mat.qty} {mat.unit}</td>
                            <td>₹{mat.unitCost.toFixed(2)}</td>
                            <td className="text-end fw-semibold">₹{mat.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cost Summary Breakdown */}
                  <div className="bg-light p-3 rounded-2 border">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Total Material Cost:</span>
                      <span className="fw-semibold">₹{bom.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Direct Labor Cost:</span>
                      <span className="fw-semibold">₹{bom.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Factory Overhead Cost:</span>
                      <span className="fw-semibold">₹{bom.overheadCost.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2 border-top fw-bold text-primary">
                      <span>Total Unit Production Cost:</span>
                      <span>₹{bom.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create BOM Modal */}
        {showCreateModal && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-3">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">Create Bill of Materials (BOM)</h5>
                  <button className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <form onSubmit={handleSaveBom}>
                  <div className="modal-body p-4">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Finished Product Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          placeholder="e.g. Premium Cotton Shirt (XL)"
                          value={newBom.productName}
                          onChange={(e) => setNewBom({ ...newBom, productName: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">Output Quantity</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={newBom.outputQty}
                          onChange={(e) => setNewBom({ ...newBom, outputQty: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold">Output Unit</label>
                        <select 
                          className="form-select"
                          value={newBom.unit}
                          onChange={(e) => setNewBom({ ...newBom, unit: e.target.value })}
                        >
                          <option value="PCS">PCS</option>
                          <option value="BAG">BAG</option>
                          <option value="KG">KG</option>
                          <option value="LTR">LTR</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold mb-0">Raw Material Components</label>
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddMaterialRow}>
                        + Add Raw Material
                      </button>
                    </div>

                    {newBom.materials.map((mat, idx) => (
                      <div key={idx} className="row g-2 mb-2 align-items-center">
                        <div className="col-md-5">
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Raw Material Item Name"
                            required
                            value={mat.name}
                            onChange={(e) => handleMaterialChange(idx, "name", e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="form-control form-control-sm" 
                            placeholder="Qty"
                            required
                            value={mat.qty}
                            onChange={(e) => handleMaterialChange(idx, "qty", e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Unit (MTR, KG)"
                            value={mat.unit}
                            onChange={(e) => handleMaterialChange(idx, "unit", e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="form-control form-control-sm" 
                            placeholder="Unit Cost (₹)"
                            required
                            value={mat.unitCost}
                            onChange={(e) => handleMaterialChange(idx, "unitCost", e.target.value)}
                          />
                        </div>
                        <div className="col-md-1 text-end">
                          {newBom.materials.length > 1 && (
                            <button type="button" className="btn btn-sm text-danger p-0" onClick={() => handleRemoveMaterialRow(idx)}>
                              <BsTrash3 />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="row g-3 mt-3 pt-3 border-top">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Direct Labor Cost (₹)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={newBom.laborCost}
                          onChange={(e) => setNewBom({ ...newBom, laborCost: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Factory Overhead Cost (₹)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={newBom.overheadCost}
                          onChange={(e) => setNewBom({ ...newBom, overheadCost: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="alert alert-primary mt-3 mb-0 d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Calculated Production Cost:</span>
                      <span className="fs-5 fw-bold text-primary">₹{currentTotalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="modal-footer border-top bg-light">
                    <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-semibold px-4">Save BOM Template</button>
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
