import React, { useState, useEffect } from "react";
import {
  BsBuilding,
  BsGeoAltFill,
  BsPersonFill,
  BsTelephoneFill,
  BsPlus,
  BsPencilSquare,
  BsTrash,
  BsCalendar3,
  BsCheckCircle,
  BsXCircle
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../godown.css";

function Godown() {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [godownData, setGodownData] = useState({
    name: "",
    city: "",
    manager: "",
    contact: "",
  });
  const [godowns, setGodowns] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("godowns")) || [];
    setGodowns(stored);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGodownData({ ...godownData, [name]: value });
  };

  const handleAddGodown = () => {
    const { name, city, manager, contact } = godownData;
    if (!name || !city || !manager || !contact) {
      alert("Please fill all fields!");
      return;
    }

    if (editingIndex !== null) {
      // Update existing godown
      const updated = [...godowns];
      updated[editingIndex] = {
        ...godownData,
        date: godowns[editingIndex].date, // Keep original date
      };
      setGodowns(updated);
      localStorage.setItem("godowns", JSON.stringify(updated));
      setEditingIndex(null);
    } else {
      // Add new godown
      const newGodown = {
        ...godownData,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
      };

      const updated = [...godowns, newGodown];
      setGodowns(updated);
      localStorage.setItem("godowns", JSON.stringify(updated));
    }

    // Reset form
    setGodownData({ name: "", city: "", manager: "", contact: "" });
    setShowModal(false);
  };

  const handleEditGodown = (index) => {
    setGodownData(godowns[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDeleteGodown = (index) => {
    if (window.confirm("Are you sure you want to delete this godown?")) {
      const updated = godowns.filter((_, i) => i !== index);
      setGodowns(updated);
      localStorage.setItem("godowns", JSON.stringify(updated));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setGodownData({ name: "", city: "", manager: "", contact: "" });
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="godown-page-header">
            <div className="godown-header-content">
              <div className="godown-title-section">
                <h2 className="godown-page-title">
                  <BsBuilding className="godown-title-icon" /> Godown Management
                </h2>
                <p className="godown-page-subtitle">Manage warehouses and storage locations</p>
              </div>
              {godowns.length > 0 && (
                <div className="godown-header-actions">
                  <button className="godown-add-btn" onClick={() => setShowModal(true)}>
                    <BsPlus /> Add Godown
                  </button>
                </div>
              )}
            </div>
          </div>

          {godowns.length === 0 ? (
            /* Empty State */
            <div className="godown-empty-container">
              <div className="godown-empty-content">
                <div className="godown-empty-icon-wrapper">
                  <BsBuilding className="godown-empty-icon" />
                </div>
                <h3>Start Managing Multiple Godowns!</h3>
                <p>
                  You can easily monitor and track your inventory across various
                  warehouses and store locations
                </p>
                <button className="godown-enable-btn" onClick={() => setShowModal(true)}>
                  <BsPlus /> Enable Godown
                </button>
              </div>
            </div>
          ) : (
            /* Godown List */
            <div className="godown-list-container">
              <div className="godown-summary-row">
                <div className="godown-summary-card">
                  <div className="godown-summary-icon-wrapper">
                    <BsBuilding className="godown-summary-icon" />
                  </div>
                  <div className="godown-summary-content">
                    <h4>Total Godowns</h4>
                    <p>{godowns.length}</p>
                  </div>
                </div>
              </div>

              <div className="godown-table-container">
                <table className="godown-table">
                  <thead>
                    <tr>
                      <th><BsBuilding /> Godown Name</th>
                      <th><BsGeoAltFill /> City</th>
                      <th><BsPersonFill /> Manager</th>
                      <th><BsTelephoneFill /> Contact</th>
                      <th><BsCalendar3 /> Created On</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {godowns.map((g, i) => (
                      <tr key={i}>
                        <td className="godown-name-cell">
                          <BsBuilding className="godown-row-icon" /> {g.name}
                        </td>
                        <td>{g.city}</td>
                        <td>{g.manager}</td>
                        <td>{g.contact}</td>
                        <td>{g.date}</td>
                        <td className="godown-actions-cell">
                          <button
                            className="godown-action-btn edit-btn"
                            onClick={() => handleEditGodown(i)}
                            title="Edit Godown"
                          >
                            <BsPencilSquare />
                          </button>
                          <button
                            className="godown-action-btn delete-btn"
                            onClick={() => handleDeleteGodown(i)}
                            title="Delete Godown"
                          >
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODAL */}
          {showModal && (
            <div className="godown-modal-overlay" onClick={handleCloseModal}>
              <div className="godown-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="godown-modal-header">
                  <h3>
                    <BsBuilding /> {editingIndex !== null ? "Edit Godown" : "Add New Godown"}
                  </h3>
                  <button className="godown-modal-close" onClick={handleCloseModal}>
                    <BsXCircle />
                  </button>
                </div>

                <div className="godown-modal-body">
                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsBuilding className="label-icon-godown" /> Godown Name
                    </label>
                    <div className="godown-input-wrapper">
                      <BsBuilding className="godown-input-icon" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter godown name"
                        value={godownData.name}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>

                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsGeoAltFill className="label-icon-godown" /> City / Location
                    </label>
                    <div className="godown-input-wrapper">
                      <BsGeoAltFill className="godown-input-icon" />
                      <input
                        type="text"
                        name="city"
                        placeholder="Enter city or location"
                        value={godownData.city}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>

                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsPersonFill className="label-icon-godown" /> Manager Name
                    </label>
                    <div className="godown-input-wrapper">
                      <BsPersonFill className="godown-input-icon" />
                      <input
                        type="text"
                        name="manager"
                        placeholder="Enter manager name"
                        value={godownData.manager}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>

                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsTelephoneFill className="label-icon-godown" /> Contact Number
                    </label>
                    <div className="godown-input-wrapper">
                      <BsTelephoneFill className="godown-input-icon" />
                      <input
                        type="text"
                        name="contact"
                        placeholder="Enter contact number"
                        value={godownData.contact}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="godown-modal-footer">
                  <button className="godown-cancel-btn" onClick={handleCloseModal}>
                    <BsXCircle /> Cancel
                  </button>
                  <button className="godown-save-btn" onClick={handleAddGodown}>
                    <BsCheckCircle /> {editingIndex !== null ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Godown;
