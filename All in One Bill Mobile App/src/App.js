import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import MobileDashboard from "./screens/MobileDashboard";
import MobilePosBilling from "./screens/MobilePosBilling";
import MobileCreateInvoice from "./screens/MobileCreateInvoice";
import MobileParties from "./screens/MobileParties";
import MobileInventory from "./screens/MobileInventory";
import MobileSyncCenter from "./screens/MobileSyncCenter";

export default function App() {
  return (
    <Router>
      <div className="mobile-viewport">
        <Routes>
          <Route path="/" element={<MobileDashboard />} />
          <Route path="/pos" element={<MobilePosBilling />} />
          <Route path="/create-invoice" element={<MobileCreateInvoice />} />
          <Route path="/invoices" element={<MobileCreateInvoice />} />
          <Route path="/parties" element={<MobileParties />} />
          <Route path="/items" element={<MobileInventory />} />
          <Route path="/sync" element={<MobileSyncCenter />} />
        </Routes>
      </div>
    </Router>
  );
}
