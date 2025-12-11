import React from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../payment.css";
import { FaBullhorn, FaTags } from "react-icons/fa";

function SmsPromotion() {
  return (
    <div className="sms-wrapper">
      <Navbar />
      <Sidebar />

      <div className="sms-content">
        <div className="sms-header">
          <h2>SMS Promotion</h2>
          <button className="create-campaign-btn">Create Campaign</button>
        </div>

        <div className="promo-top">
          <FaBullhorn className="promo-icon" />
          <h3>Grow Your Business through SMS Promotions</h3>
          <p>
            Want to share festival sale and discount offer with your customer?
            Start an SMS campaign today with myBillBook and make your sale a success
          </p>
        </div>

        <div className="template-card blue-card">
          <div className="template-text">
            <h4>Share festival offer with Your customer</h4>
            <p>Increase your sale this festival season with our Festival SMS Campaign</p>
            <button className="template-btn">Select Template</button>
          </div>
          <div className="template-img-set"></div>
        </div>

        <div className="template-card orange-card">
          <div className="template-text">
            <h4>Share discount Your customer will love</h4>
            <p>Share discount offers with your customers and watch your business grow</p>
            <button className="template-btn">Select Template</button>
          </div>
          <div className="offer-badge">
            <FaTags className="tag-icon" />
            <span>50% OFF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmsPromotion;
