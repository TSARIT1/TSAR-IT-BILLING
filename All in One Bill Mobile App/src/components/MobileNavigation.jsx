import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BsSpeedometer2, 
  BsShop, 
  BsReceipt, 
  BsBoxSeam, 
  BsPeopleFill, 
  BsArrowRepeat 
} from "react-icons/bs";

export default function MobileNavigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`nav-tab ${isActive("/") ? "active" : ""}`}>
        <BsSpeedometer2 className="nav-icon" />
        <span>Home</span>
      </Link>
      <Link to="/pos" className={`nav-tab ${isActive("/pos") ? "active" : ""}`}>
        <BsShop className="nav-icon text-warning" />
        <span>POS</span>
      </Link>
      <Link to="/invoices" className={`nav-tab ${isActive("/invoices") ? "active" : ""}`}>
        <BsReceipt className="nav-icon" />
        <span>Bills</span>
      </Link>
      <Link to="/items" className={`nav-tab ${isActive("/items") ? "active" : ""}`}>
        <BsBoxSeam className="nav-icon" />
        <span>Items</span>
      </Link>
      <Link to="/parties" className={`nav-tab ${isActive("/parties") ? "active" : ""}`}>
        <BsPeopleFill className="nav-icon" />
        <span>Parties</span>
      </Link>
      <Link to="/sync" className={`nav-tab ${isActive("/sync") ? "active" : ""}`}>
        <BsArrowRepeat className="nav-icon" />
        <span>Sync</span>
      </Link>
    </nav>
  );
}
