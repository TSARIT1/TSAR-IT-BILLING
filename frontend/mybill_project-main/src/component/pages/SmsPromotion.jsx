import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../smsMarketing.css";
import { FiSend, FiMessageSquare, FiUsers, FiTrendingUp } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";

function SmsPromotion() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content sms-marketing-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="sms-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-chat-dots"></i> SMS Marketing
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Reach customers instantly with promotional SMS campaigns
              </p>
            </div>

            <div className="header-actions">
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-graph-up"></i> View Analytics
              </button>
              <button className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle"></i> Create Campaign
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="sms-summary-cards">
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-send"></i>
              </div>
              <div className="card-content">
                <h4>SMS Sent</h4>
                <p className="amount">0</p>
                <span className="subtitle">This Month</span>
              </div>
            </div>

            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="card-content">
                <h4>Delivered</h4>
                <p className="amount">0</p>
                <span className="subtitle">100% Success Rate</span>
              </div>
            </div>

            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="card-content">
                <h4>Total Customers</h4>
                <p className="amount">0</p>
                <span className="subtitle">Active Contacts</span>
              </div>
            </div>

            <div className="summary-card purple">
              <div className="card-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div className="card-content">
                <h4>Engagement</h4>
                <p className="amount">0%</p>
                <span className="subtitle">Response Rate</span>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="promo-banner">
            <div className="banner-content">
              <div className="banner-icon">
                <i className="bi bi-megaphone"></i>
              </div>
              <div className="banner-text">
                <h3>Grow Your Business through SMS Marketing</h3>
                <p>Share payment reminders, festival offers, and discount promotions with your customers. Start an SMS campaign today and boost your sales!</p>
              </div>
            </div>
          </div>

          {/* Campaign Templates */}
          <div className="templates-section">
            <h3 className="section-title">
              <i className="bi bi-layout-text-window"></i> SMS Campaign Templates
            </h3>
            <p className="section-subtitle">Choose from pre-designed templates for your billing and marketing needs</p>

            <div className="templates-grid">

              {/* Payment Reminder Template */}
              <div className="template-card blue-card">
                <div className="template-header">
                  <div className="template-icon">
                    <i className="bi bi-receipt"></i>
                  </div>
                  <span className="template-badge">Most Popular</span>
                </div>
                <div className="template-content">
                  <h4>Payment Reminder</h4>
                  <p>Send automated payment reminders to customers with pending invoices</p>
                  <div className="template-preview">
                    <i className="bi bi-chat-left-quote"></i>
                    <span>Dear Customer, Your invoice #INV001 of ₹5,000 is due. Please clear payment at the earliest. - MyBillBook</span>
                  </div>
                  <ul className="template-features">
                    <li><i className="bi bi-check2"></i> Automated reminders</li>
                    <li><i className="bi bi-check2"></i> Custom invoice details</li>
                    <li><i className="bi bi-check2"></i> Professional tone</li>
                  </ul>
                </div>
                <button className="template-btn">
                  <i className="bi bi-cursor"></i> Select Template
                </button>
              </div>

              {/* Festival Offer Template */}
              <div className="template-card orange-card">
                <div className="template-header">
                  <div className="template-icon">
                    <i className="bi bi-gift"></i>
                  </div>
                  <span className="template-badge trending">Trending</span>
                </div>
                <div className="template-content">
                  <h4>Festival Offer Campaign</h4>
                  <p>Increase sales during festival season with special offers and discounts</p>
                  <div className="template-preview">
                    <i className="bi bi-chat-left-quote"></i>
                    <span>🎉 Diwali Special! Get 30% OFF on all products. Valid till 31st Oct. Visit us today! - MyBillBook</span>
                  </div>
                  <ul className="template-features">
                    <li><i className="bi bi-check2"></i> Festival-themed messages</li>
                    <li><i className="bi bi-check2"></i> Discount highlights</li>
                    <li><i className="bi bi-check2"></i> Urgency creation</li>
                  </ul>
                </div>
                <button className="template-btn">
                  <i className="bi bi-cursor"></i> Select Template
                </button>
              </div>

              {/* New Product Launch Template */}
              <div className="template-card green-card">
                <div className="template-header">
                  <div className="template-icon">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <span className="template-badge new">New</span>
                </div>
                <div className="template-content">
                  <h4>New Product Launch</h4>
                  <p>Announce new products or services to your customer base effectively</p>
                  <div className="template-preview">
                    <i className="bi bi-chat-left-quote"></i>
                    <span>🚀 New Arrival! Check out our latest collection. First 50 customers get 20% OFF. Shop now! - MyBillBook</span>
                  </div>
                  <ul className="template-features">
                    <li><i className="bi bi-check2"></i> Product highlights</li>
                    <li><i className="bi bi-check2"></i> Limited-time offers</li>
                    <li><i className="bi bi-check2"></i> Call-to-action</li>
                  </ul>
                </div>
                <button className="template-btn">
                  <i className="bi bi-cursor"></i> Select Template
                </button>
              </div>

              {/* Thank You Message Template */}
              <div className="template-card purple-card">
                <div className="template-header">
                  <div className="template-icon">
                    <i className="bi bi-heart"></i>
                  </div>
                </div>
                <div className="template-content">
                  <h4>Thank You Message</h4>
                  <p>Show appreciation to customers after purchase and build loyalty</p>
                  <div className="template-preview">
                    <i className="bi bi-chat-left-quote"></i>
                    <span>Thank you for your purchase! We appreciate your business. Visit again for exclusive offers. - MyBillBook</span>
                  </div>
                  <ul className="template-features">
                    <li><i className="bi bi-check2"></i> Customer appreciation</li>
                    <li><i className="bi bi-check2"></i> Loyalty building</li>
                    <li><i className="bi bi-check2"></i> Repeat business</li>
                  </ul>
                </div>
                <button className="template-btn">
                  <i className="bi bi-cursor"></i> Select Template
                </button>
              </div>

            </div>
          </div>

          {/* Benefits Section */}
          <div className="benefits-section">
            <h3 className="section-title">
              <i className="bi bi-star"></i> Why Use SMS Marketing for Your Business?
            </h3>

            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon blue">
                  <i className="bi bi-lightning"></i>
                </div>
                <h4>Instant Delivery</h4>
                <p>Messages delivered within seconds, ensuring timely communication with customers</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon orange">
                  <i className="bi bi-eye"></i>
                </div>
                <h4>High Open Rate</h4>
                <p>98% of SMS messages are read within 3 minutes of delivery</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon green">
                  <i className="bi bi-wallet2"></i>
                </div>
                <h4>Cost-Effective</h4>
                <p>Affordable marketing solution perfect for small businesses and enterprises</p>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon purple">
                  <i className="bi bi-graph-up"></i>
                </div>
                <h4>Better ROI</h4>
                <p>Track campaign performance and measure return on investment easily</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default SmsPromotion;
