import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";
import { FaWarehouse, FaUserAlt, FaPhoneAlt } from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";

function Godown() {
  const [showModal, setShowModal] = useState(false);
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

    const newGodown = {
      ...godownData,
      date: new Date().toLocaleDateString(),
    };

    const updated = [...godowns, newGodown];
    setGodowns(updated);
    localStorage.setItem("godowns", JSON.stringify(updated));

    // Reset form
    setGodownData({ name: "", city: "", manager: "", contact: "" });
    setShowModal(false);
  };

  const handleDeleteGodown = (index) => {
    const updated = godowns.filter((_, i) => i !== index);
    setGodowns(updated);
    localStorage.setItem("godowns", JSON.stringify(updated));
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content godown-page">
          <h2 className="godown-title">Godown Management</h2>

          {godowns.length === 0 ? (
            <div className="godown-container">
              <div className="godown-icon-box">
                <FaWarehouse className="godown-icon" />
              </div>
              <h3>Start managing multiple Godowns!</h3>
              <p>
                You can easily monitor and track your inventory across various
                Godowns and Store locations
              </p>
              <button className="enable-godown-btn" onClick={() => setShowModal(true)}>
                Enable Godown
              </button>
            </div>
          ) : (
            <div className="godown-list">
              <div className="list-header">
                <h3>All Godowns</h3>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                  + Add New Godown
                </button>
              </div>

              <table className="godown-table">
                <thead>
                  <tr>
                    <th>Godown Name</th>
                    <th>City</th>
                    <th>Manager</th>
                    <th>Contact</th>
                    <th>Created On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {godowns.map((g, i) => (
                    <tr key={i}>
                      <td>{g.name}</td>
                      <td>{g.city}</td>
                      <td>{g.manager}</td>
                      <td>{g.contact}</td>
                      <td>{g.date}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteGodown(i)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MODAL */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Add New Godown</h3>

                <div className="input-group">
                  <FaWarehouse className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Godown Name"
                    value={godownData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-group">
                  <MdLocationCity className="input-icon" />
                  <input
                    type="text"
                    name="city"
                    placeholder="City / Location"
                    value={godownData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-group">
                  <FaUserAlt className="input-icon" />
                  <input
                    type="text"
                    name="manager"
                    placeholder="Manager Name"
                    value={godownData.manager}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-group">
                  <FaPhoneAlt className="input-icon" />
                  <input
                    type="text"
                    name="contact"
                    placeholder="Contact Number"
                    value={godownData.contact}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="modal-buttons">
                  <button className="save-btn" onClick={handleAddGodown}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
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
