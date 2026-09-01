import React, { useState } from 'react';
import { 
  BsStars, 
  BsX, 
  BsSendFill, 
  BsGraphUpArrow, 
  BsBoxSeam, 
  BsPeopleFill, 
  BsBank, 
  BsArrowRight,
  BsRobot
} from 'react-icons/bs';
import { askAiAssistant } from '../services/api';
import { Link } from 'react-router-dom';

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am RAKI AI, your intelligent business copilot. How can I help you analyze your revenue, stock, receivables, or GST liability today?',
      metrics: null,
      actionLink: null
    }
  ]);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('userId');

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await askAiAssistant(q, userId);
      const aiMsg = {
        sender: 'ai',
        text: res.answer || 'Analysis complete.',
        metrics: res.metrics || null,
        data: res.data || null,
        actionLink: res.actionLink || null
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I encountered an issue analyzing your data. Please try again.',
        metrics: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Spark Trigger */}
      <button 
        className="ai-assistant-floating-btn shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        title="RAKI AI Business Copilot"
      >
        <BsStars className="ai-icon-sparkle" />
        <span className="d-none d-md-inline fw-bold">RAKI AI</span>
      </button>

      {/* Slide-in Chat Drawer */}
      {isOpen && (
        <div className="ai-drawer-container shadow-lg animate-fade-in">
          {/* Header */}
          <div className="ai-drawer-header">
            <div className="d-flex align-items-center gap-2">
              <div className="ai-header-badge"><BsRobot /></div>
              <div>
                <h6 className="mb-0 text-white fw-bold">RAKI AI Copilot</h6>
                <span className="small text-white-50">Enterprise Business Intelligence</span>
              </div>
            </div>
            <button className="btn-close-ai" onClick={() => setIsOpen(false)}>
              <BsX size={22} />
            </button>
          </div>

          {/* Quick Questions Chips */}
          <div className="ai-quick-chips">
            <button onClick={() => handleSend("What are my total sales?")}>📈 Total Sales</button>
            <button onClick={() => handleSend("Which items are low on stock?")}>📦 Low Stock</button>
            <button onClick={() => handleSend("Who are our top customers?")}>👥 Top Customers</button>
            <button onClick={() => handleSend("How much GST do we owe?")}>🏛️ GST Liability</button>
            <button onClick={() => handleSend("Show Profit and Loss")}>💰 Net Profit</button>
          </div>

          {/* Messages Body */}
          <div className="ai-messages-body">
            {messages.map((m, idx) => (
              <div key={idx} className={`ai-message-row ${m.sender}`}>
                <div className="ai-message-bubble">
                  <p className="mb-1">{m.text}</p>

                  {/* Metrics Badge */}
                  {m.metrics && (
                    <div className="ai-metrics-card">
                      {Object.entries(m.metrics).map(([k, v], i) => (
                        <div key={i} className="metric-line">
                          <span className="text-muted small">{k}:</span>
                          <strong>{typeof v === 'number' ? `₹ ${v.toLocaleString('en-IN')}` : v}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data list if any */}
                  {Array.isArray(m.data) && m.data.length > 0 && (
                    <div className="ai-data-list">
                      {m.data.map((item, dIdx) => (
                        <div key={dIdx} className="ai-data-item">
                          <span>{item.name || item.productName || JSON.stringify(item)}</span>
                          {item.currentStock !== undefined && <span className="badge bg-danger">{item.currentStock} left</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Link */}
                  {m.actionLink && (
                    <Link to={m.actionLink} className="ai-action-btn" onClick={() => setIsOpen(false)}>
                      Open in Portal <BsArrowRight />
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message-row ai">
                <div className="ai-message-bubble text-muted small">
                  Analyzing business database... ⏳
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form className="ai-drawer-footer" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
              type="text"
              placeholder="Ask anything about your business..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
            <button type="submit" disabled={loading || !inputQuery.trim()}>
              <BsSendFill />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
