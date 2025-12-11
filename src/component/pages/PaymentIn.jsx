import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../allPart.css";

function PaymentIn() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("payments")) || [];
    setPayments(stored);
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content payment-in" style={{marginTop:"5%"}}>
          <div className="payment-in-top">
            <h2>Payment In</h2>
            <button
              className="create-payment-btn"
              onClick={() => navigate("/create-payment-in")}
            >
              + Create Payment In
            </button>
          </div>

          <div className="payment-table-box">
            {payments.length === 0 ? (
              <p className="no-data">No Transactions Found</p>
            ) : (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Payment No</th>
                    <th>Party Name</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Received In</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.paymentDate}</td>
                      <td>{`PAY-${p.paymentNo}`}</td>
                      <td>{p.party}</td>
                      <td>₹ {p.amount}</td>
                      <td>{p.paymentMode}</td>
                      <td>{p.receivedIn || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentIn;
