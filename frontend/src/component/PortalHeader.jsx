import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  BsSearch, 
  BsPlusCircleFill, 
  BsBellFill, 
  BsPersonCircle, 
  BsGear, 
  BsBoxArrowRight, 
  BsBuildings, 
  BsFileEarmarkPlus,
  BsCartPlus,
  BsPersonPlus,
  BsShop,
  BsClockHistory,
  BsCheck2All,
  BsList,
  BsInfoCircleFill
} from 'react-icons/bs';
import { getPortalNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';

export default function PortalHeader({ onToggleSidebar, onOpenSearch, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const quickCreateRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // User Info from LocalStorage
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    storedUser = {};
  }
  const businessName = storedUser.businessName || '';
  const ownerName = storedUser.ownerName || '';
  const userEmail = storedUser.email || '';
  const userId = localStorage.getItem('userId') || storedUser.userId || '';
  const userBusinessId = localStorage.getItem('userBusinessId') || storedUser.userBusinessId || '';
  const companyLogo = localStorage.getItem('companyLogo') || '';
  const userProfileImage = localStorage.getItem('userProfileImage') || '';

  const loadNotifications = async () => {
    try {
      const data = await getPortalNotifications(userId, userBusinessId);
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s for live alerts
    return () => clearInterval(interval);
  }, [userId, userBusinessId]);

  useEffect(() => {
    // Update clock every minute (we only show hours:minutes, no need for 1s interval)
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target)) setShowQuickCreate(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(userId, userBusinessId);
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.unread) {
      try {
        await markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (onOpenSearch) {
      onOpenSearch();
    } else if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="portal-top-header">
      <div className="portal-header-left">
        {/* Mobile Toggle — uses BsList React icon (Font Awesome is not installed) */}
        <button className="portal-mobile-toggle" onClick={onToggleSidebar} title="Toggle Menu">
          <BsList style={{ fontSize: '1.4rem' }} />
        </button>

        {/* Global Search Bar */}
        <form className="portal-search-form" onSubmit={handleGlobalSearch}>
          <BsSearch className="portal-search-icon" />
          <input 
            type="text" 
            placeholder="Search invoices, products, customers... (Ctrl + K)" 
            value={searchQuery}
            onClick={() => onOpenSearch && onOpenSearch()}
            onChange={(e) => setSearchQuery(e.target.value)}
            readOnly={!!onOpenSearch}
            style={{ cursor: onOpenSearch ? 'pointer' : 'text' }}
          />
        </form>
      </div>

      <div className="portal-header-right">
        {/* Live System Time & Status */}
        <div className="portal-system-status d-none d-lg-flex">
          <span className="live-pulse-dot"></span>
          <span className="system-text">Live • {currentTime}</span>
        </div>

        {/* Quick Create Dropdown */}
        <div className="portal-dropdown-wrap" ref={quickCreateRef}>
          <button 
            className="btn-portal-quick-create"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
          >
            <BsPlusCircleFill />
            <span className="d-none d-sm-inline">Quick Create</span>
          </button>

          {showQuickCreate && (
            <div className="portal-dropdown-menu quick-create-menu animate-fade-in">
              <div className="dropdown-menu-header">Quick Actions</div>
              <Link to="/create-invoice" className="quick-item" onClick={() => setShowQuickCreate(false)}>
                <BsFileEarmarkPlus className="text-primary" /> Create Sales Invoice
              </Link>
              <Link to="/create-purchase-invoice" className="quick-item" onClick={() => setShowQuickCreate(false)}>
                <BsCartPlus className="text-success" /> Add Purchase Bill
              </Link>
              <Link to="/parties" className="quick-item" onClick={() => setShowQuickCreate(false)}>
                <BsPersonPlus className="text-warning" /> New Customer / Party
              </Link>
              <Link to="/inventory" className="quick-item" onClick={() => setShowQuickCreate(false)}>
                <BsBuildings className="text-info" /> Add Inventory Item
              </Link>
              <Link to="/pos-billing" className="quick-item" onClick={() => setShowQuickCreate(false)}>
                <BsShop className="text-danger" /> Open POS Terminal
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="portal-dropdown-wrap" ref={notifRef}>
          <button 
            className="portal-icon-btn position-relative" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <BsBellFill />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="notif-badge">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="portal-dropdown-menu notifications-menu animate-fade-in" style={{ width: "320px", maxHeight: "400px", overflowY: "auto" }}>
              <div className="dropdown-menu-header d-flex justify-content-between align-items-center">
                <span>Notifications ({notifications.length})</span>
                {notifications.some(n => n.unread) && (
                  <span 
                    className="mark-read cursor-pointer" 
                    onClick={handleMarkAllRead} 
                    style={{ cursor: "pointer", fontSize: "11px" }}
                  >
                    <BsCheck2All /> Mark all read
                  </span>
                )}
              </div>
              <div className="notif-list">
                {notifications.map((notif, idx) => (
                  <div 
                    key={notif.id || idx} 
                    className={`notif-item ${notif.unread ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                    style={{ cursor: "pointer" }}
                  >
                    {notif.unread && <div className="notif-dot"></div>}
                    <div className="notif-text">
                      <p className="mb-1 text-dark" style={{ fontSize: "13px" }}>
                        {notif.title && <strong className="d-block text-primary">{notif.title}</strong>}
                        {notif.message}
                      </p>
                      <span className="notif-time text-muted" style={{ fontSize: "11px" }}>
                        <BsClockHistory className="me-1" />
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="p-4 text-center text-muted small">
                    <BsBellFill className="mb-2 text-secondary fs-4" />
                    <div>No new notifications.</div>
                    <div className="text-secondary" style={{ fontSize: "11px" }}>You are all caught up!</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="portal-dropdown-wrap" ref={profileRef}>
          <button 
            className="portal-profile-trigger" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {userProfileImage ? (
              <img 
                src={userProfileImage} 
                alt={ownerName} 
                className="avatar-badge rounded-circle" 
                style={{ width: '38px', height: '38px', objectFit: 'cover' }} 
              />
            ) : (
              <div className="avatar-badge">{ownerName.charAt(0).toUpperCase()}</div>
            )}
            <div className="profile-text-block d-none d-md-block">
              <div className="profile-user-name">{ownerName}</div>
              <div className="profile-business-sub d-flex align-items-center gap-1">
                {companyLogo && (
                  <img src={companyLogo} alt="logo" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                )}
                <span>{businessName}</span>
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="portal-dropdown-menu profile-menu animate-fade-in">
              <div className="profile-menu-header">
                <div className="menu-user-name">{ownerName}</div>
                <div className="menu-user-email">{userEmail}</div>
                <span className="menu-business-pill">{businessName}</span>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/business-settings" className="menu-link" onClick={() => setShowProfileMenu(false)}>
                <BsBuildings className="me-2" /> Business Profile & GST
              </Link>
              <Link to="/settings" className="menu-link" onClick={() => setShowProfileMenu(false)}>
                <BsGear className="me-2" /> System Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button className="menu-link logout-btn text-danger" onClick={handleLogout}>
                <BsBoxArrowRight className="me-2" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
