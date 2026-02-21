import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../smsMarketing.css";
import { FiSend, FiMessageSquare, FiUsers, FiTrendingUp } from "react-icons/fi";
import { getCustomersByBusinessId } from "../../services/api";
import "bootstrap-icons/font/bootstrap-icons.css";

function SmsPromotion() {
  const navigate = useNavigate();

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [smsCategory, setSmsCategory] = useState("");
  const [selectedMessageOption, setSelectedMessageOption] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Template Data
  const CATEGORY_TEMPLATES = {
    festival: [
      { id: "fest1", text: "🎉 Festival Special! Get 30% OFF on all products. Valid till 31st Oct. Visit us today! - MyBillBook" },
      { id: "fest2", text: "✨ Happy Holidays! Season's greetings from MyBillBook. Enjoy exclusive discounts this week!" },
      { id: "fest3", text: "🏮 Diwali Celebration! Special gift on every purchase above ₹5000. Shop now! - MyBillBook" }
    ],
    payment: [
      { id: "pay1", text: "Dear Customer, Your invoice of ₹[Amount] is due. Please clear payment at the earliest. - MyBillBook" },
      { id: "pay2", text: "Friendly reminder: Payment for your recent purchase is pending. Please pay by the due date. Thanks!" },
      { id: "pay3", text: "Payment request: An amount of ₹[Amount] is outstanding on your account. Please settle soon." }
    ],
    product: [
      { id: "prod1", text: "🚀 New Arrival! Check out our latest collection. First 50 customers get 20% OFF. Shop now! - MyBillBook" },
      { id: "prod2", text: "Fashion Alert! Our new summer collection is here. Visit our store to explore the trends." },
      { id: "prod3", text: "Exclusive Launch! We're excited to introduce our new premium line. Limited stock available!" }
    ],
    thanks: [
      { id: "thx1", text: "Thank you for your purchase! We appreciate your business. Visit again for exclusive offers. - MyBillBook" },
      { id: "thx2", text: "We love having you as a customer! Thanks for choosing MyBillBook. Here's a 10% discount for next time." },
      { id: "thx3", text: "Heartfelt thanks for your support. Your feedback helps us grow. Tell us about your experience!" }
    ]
  };

  // Group & Selection State
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem("sms_groups");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [groupSubMode, setGroupSubMode] = useState("select"); // 'select' or 'create'
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Constants
  const MAX_CHARS = 160;

  useEffect(() => {
    if (showModal && (audience === "all" || audience === "individual" || (audience === "groups" && groupSubMode === "create"))) {
      fetchCustomers();
    }
  }, [showModal, audience, groupSubMode]);

  useEffect(() => {
    localStorage.setItem("sms_groups", JSON.stringify(groups));
  }, [groups]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const businessId = localStorage.getItem("userBusinessId");
      if (businessId) {
        const data = await getCustomersByBusinessId(businessId);
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleTemplateSelect = (templateType) => {
    const templates = {
      payment: "Dear Customer, Your invoice of ₹[Amount] is due. Please clear payment at the earliest. - MyBillBook",
      festival: "🎉 Festival Special! Get 30% OFF on all products. Valid till 31st Oct. Visit us today! - MyBillBook",
      product: "🚀 New Arrival! Check out our latest collection. First 50 customers get 20% OFF. Shop now! - MyBillBook",
      thanks: "Thank you for your purchase! We appreciate your business. Visit again for exclusive offers. - MyBillBook"
    };

    const categories = {
      payment: "payment",
      festival: "festival",
      product: "product",
      thanks: "thanks"
    };

    setSmsCategory(categories[templateType] || "");
    setCampaignTitle(templateType.charAt(0).toUpperCase() + templateType.slice(1) + " Campaign");
    setMessage(templates[templateType] || "");
    setShowModal(true);
  };

  const handleCategoryChange = (category) => {
    setSmsCategory(category);
    setSelectedMessageOption(""); // Reset message choice
    setMessage(""); // Clear message until option is picked

    // Set default title
    const titleMap = {
      payment: "Payment Reminder",
      festival: "Festival Offer",
      product: "Product Launch",
      thanks: "Thank You Message"
    };
    if (category) {
      setCampaignTitle(titleMap[category] + " Campaign");
    }
  };

  const handleMessageOptionChange = (optionId) => {
    setSelectedMessageOption(optionId);
    if (optionId === "custom") {
      setMessage("");
    } else {
      const categoryTemplates = CATEGORY_TEMPLATES[smsCategory] || [];
      const selected = categoryTemplates.find(t => t.id === optionId);
      if (selected) {
        setMessage(selected.text);
      }
    }
  };

  const insertPlaceholder = (placeholder) => {
    setMessage(prev => prev + ` {${placeholder}}`);
  };

  const getSmsCredits = () => {
    return Math.ceil(message.length / MAX_CHARS) || 1;
  };

  const toggleCustomerSelection = (id) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSaveGroup = () => {
    if (!newGroupName.trim() || selectedCustomerIds.length === 0) {
      alert("Please enter a group name and select at least one customer.");
      return;
    }
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      memberIds: [...selectedCustomerIds]
    };
    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setSelectedCustomerIds([]);
    setGroupSubMode("select");
    setSelectedGroupId(newGroup.id);
  };

  const getTargetCount = () => {
    if (audience === "all") return customers.length;
    if (audience === "individual") return selectedCustomerIds.length;
    if (audience === "groups") {
      const group = groups.find(g => g.id === selectedGroupId);
      return group ? group.memberIds.length : 0;
    }
    return 0;
  };

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
              <button className="btn btn-primary btn-sm" onClick={() => {
                setCampaignTitle("");
                setMessage("");
                setShowModal(true);
              }}>
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
                <button className="template-btn" onClick={() => handleTemplateSelect('payment')}>
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
                <button className="template-btn" onClick={() => handleTemplateSelect('festival')}>
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
                <button className="template-btn" onClick={() => handleTemplateSelect('product')}>
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
                <button className="template-btn" onClick={() => handleTemplateSelect('thanks')}>
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

      {/* Campaign Creation Modal */}
      {showModal && (
        <div className="sms-modal-overlay">
          <div className="sms-modal-container">
            <div className="sms-modal-header">
              <h3><i className="bi bi-megaphone-fill"></i> Create SMS Campaign</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <div className="sms-modal-body">
              <div className="modal-columns">
                {/* Left Column: Form */}
                <div className="form-column">
                  <div className="form-group-custom">
                    <label>SMS Category</label>
                    <select
                      className="form-control-custom"
                      value={smsCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="">-- Select Category --</option>
                      <option value="festival">Festival Offer</option>
                      <option value="payment">Payment Reminder</option>
                      <option value="product">New Product Launch</option>
                      <option value="thanks">Thank You Message</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Campaign Title</label>
                    <input
                      type="text"
                      placeholder={smsCategory ? "e.g. Diwali Sale 2024" : "Select a category first..."}
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      disabled={!smsCategory}
                      style={{ opacity: smsCategory ? 1 : 0.6, cursor: smsCategory ? 'text' : 'not-allowed' }}
                    />
                  </div>

                  {smsCategory && (
                    <div className="form-group-custom">
                      <label>Message Template</label>
                      <select
                        className="form-control-custom"
                        value={selectedMessageOption}
                        onChange={(e) => handleMessageOptionChange(e.target.value)}
                      >
                        <option value="">-- Choose Template --</option>
                        {CATEGORY_TEMPLATES[smsCategory].map(tmpl => (
                          <option key={tmpl.id} value={tmpl.id}>
                            {tmpl.text.substring(0, 50)}...
                          </option>
                        ))}
                        <option value="custom">✍️ Custom Message (Type your own)</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group-custom">
                    <label>Target Audience</label>
                    <div className="audience-selector">
                      <button
                        className={audience === 'all' ? 'active' : ''}
                        onClick={() => setAudience('all')}
                      >
                        <i className="bi bi-people"></i> All Customers
                      </button>
                      <button
                        className={audience === 'groups' ? 'active' : ''}
                        onClick={() => setAudience('groups')}
                      >
                        <i className="bi bi-collection"></i> Groups
                      </button>
                      <button
                        className={audience === 'individual' ? 'active' : ''}
                        onClick={() => setAudience('individual')}
                      >
                        <i className="bi bi-person"></i> Selective
                      </button>
                    </div>
                  </div>

                  {audience === 'all' && (
                    <div className="form-group-custom">
                      <div className="label-with-hint">
                        <label>Customer List ({customers.length})</label>
                      </div>
                      <div className="modal-customer-table-container">
                        <table className="modal-customer-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Mobile</th>
                              <th>City</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingCustomers ? (
                              <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                            ) : customers.length === 0 ? (
                              <tr><td colSpan="4" className="text-center">No customers found</td></tr>
                            ) : (
                              customers.map((c, idx) => (
                                <tr key={c.id || idx}>
                                  <td>{c.id}</td>
                                  <td>{c.name}</td>
                                  <td>{c.phone}</td>
                                  <td>{c.city || "-"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {audience === 'groups' && (
                    <div className="form-group-custom">
                      <div className="group-sub-nav">
                        <button
                          className={groupSubMode === 'select' ? 'active' : ''}
                          onClick={() => setGroupSubMode('select')}
                        >Select Group</button>
                        <button
                          className={groupSubMode === 'create' ? 'active' : ''}
                          onClick={() => {
                            setGroupSubMode('create');
                            setSelectedCustomerIds([]);
                          }}
                        >Create Group</button>
                      </div>

                      {groupSubMode === 'select' ? (
                        <div className="group-select-area">
                          <label>Choose a Group</label>
                          <select
                            className="form-control"
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                          >
                            <option value="">-- Select Group --</option>
                            {groups.map(g => (
                              <option key={g.id} value={g.id}>{g.name} ({g.memberIds.length} members)</option>
                            ))}
                          </select>
                          {groups.length === 0 && <p className="small-hint">No groups created yet. Click "Create Group" to start.</p>}
                        </div>
                      ) : (
                        <div className="group-create-area">
                          <div className="form-group-custom">
                            <label>New Group Name</label>
                            <div className="input-with-btn">
                              <input
                                type="text"
                                placeholder="Group name..."
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                              />
                              <button className="btn-save-group" onClick={handleSaveGroup}>
                                <i className="bi bi-check-lg"></i> Save
                              </button>
                            </div>
                          </div>

                          <label>Select Members ({selectedCustomerIds.length})</label>
                          <div className="modal-customer-table-container mini-table">
                            <table className="modal-customer-table">
                              <thead>
                                <tr>
                                  <th>Select</th>
                                  <th>Name</th>
                                  <th>Mobile</th>
                                </tr>
                              </thead>
                              <tbody>
                                {loadingCustomers ? (
                                  <tr><td colSpan="3" className="text-center">Loading...</td></tr>
                                ) : (
                                  customers.map((c) => (
                                    <tr key={c.id} onClick={() => toggleCustomerSelection(c.id)} className="clickable-row">
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={selectedCustomerIds.includes(c.id)}
                                          onChange={() => { }} // Controlled by row click
                                        />
                                      </td>
                                      <td>{c.name}</td>
                                      <td>{c.phone}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {audience === 'individual' && (
                    <div className="form-group-custom">
                      <div className="label-with-hint">
                        <label>Select Recipients ({selectedCustomerIds.length})</label>
                        <span className="char-counter">
                          {selectedCustomerIds.length > 0 ? "Manually Selected" : "Please select customers"}
                        </span>
                      </div>
                      <div className="modal-customer-table-container">
                        <table className="modal-customer-table">
                          <thead>
                            <tr>
                              <th>Select</th>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Mobile</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingCustomers ? (
                              <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                            ) : (
                              customers.map((c) => (
                                <tr key={c.id} onClick={() => toggleCustomerSelection(c.id)} className="clickable-row">
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedCustomerIds.includes(c.id)}
                                      onChange={() => { }} // Controlled by row click
                                    />
                                  </td>
                                  <td>{c.id}</td>
                                  <td>{c.name}</td>
                                  <td>{c.phone}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="form-group-custom">
                    <div className="label-with-hint">
                      <label>Compose Message</label>
                      <span className="char-counter">
                        {message.length} chars {/* | <strong>{getSmsCredits()} Credits</strong> */}
                      </span>
                    </div>
                    <textarea
                      rows="5"
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>

                    <div className="placeholders-bar">
                      <span>Insert:</span>
                      <button onClick={() => insertPlaceholder('Customer Name')}>[Name]</button>
                      <button onClick={() => insertPlaceholder('Invoice ID')}>[Invoice No]</button>
                      <button onClick={() => insertPlaceholder('Due Date')}>[Date]</button>
                      <button onClick={() => insertPlaceholder('Due Amount')}>[Amount]</button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Preview */}
                <div className="preview-column">
                  <label className="preview-label">Live Mobile Preview</label>
                  <div className="phone-mockup">
                    <div className="phone-screen">
                      <div className="status-bar">
                        <span>9:41</span>
                        <div className="status-icons">
                          <i className="bi bi-reception-4"></i>
                          <i className="bi bi-wifi"></i>
                          <i className="bi bi-battery-full"></i>
                        </div>
                      </div>
                      <div className="chat-header">
                        <i className="bi bi-chevron-left"></i>
                        <span className="sender-id">TSAR IT BILLING BOOK</span>
                        <i className="bi bi-info-circle"></i>
                      </div>
                      <div className="chat-body" style={{ background: '#e5e7eb', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="message-bubble">
                          {message || "Your message will appear here..."}
                          <span className="msg-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {audience && (
                          <div className="recipient-tag" style={{ alignSelf: 'center', background: '#3e4e96', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', marginTop: '10px' }}>
                            To: {getTargetCount()} Recipients ({audience.toUpperCase()})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div> {/* End modal-columns */}
            </div> {/* End sms-modal-body */}

            <div className="sms-modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-send" onClick={() => {
                alert("Campaign Created Successfully!");
                setShowModal(false);
              }}>
                <i className="bi bi-send-fill"></i> Send Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SmsPromotion;
