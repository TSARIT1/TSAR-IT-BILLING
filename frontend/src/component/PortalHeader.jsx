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
  BsInfoCircleFill,
  BsSliders,
  BsCashCoin,
  BsExclamationTriangleFill,
  BsMegaphoneFill,
  BsArrowRightShort,
} from 'react-icons/bs';
import { getPortalNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';
import { playNotificationSound } from '../utils/soundUtil';
import NotificationToastContainer from './NotificationToastContainer';
import NotificationSettingsModal from './NotificationSettingsModal';

export default function PortalHeader({ onToggleSidebar, onOpenSearch, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
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
    const interval = setInterval(loadNotifications, 45000); // Polling backup
    return () => clearInterval(interval);
  }, [userId, userBusinessId]);

  // Real-Time SSE (Server-Sent Events) Stream with audio chime & toast popups
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const baseUrl = process.env.REACT_APP_API_URL !== undefined
      ? process.env.REACT_APP_API_URL
      : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8081' : '');

    const streamUrl = `${baseUrl}/api/notifications/stream?businessId=${encodeURIComponent(userBusinessId || '')}&userId=${encodeURIComponent(userId || '')}&token=${encodeURIComponent(token)}`;

    let eventSource = null;
    try {
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener('notification', (e) => {
        try {
          const notif = JSON.parse(e.data);
          const soundOk = localStorage.getItem('notif_sound_enabled') !== 'false';
          const popupOk = localStorage.getItem('notif_popup_enabled') !== 'false';

          // 1. Play crystal audio chime
          if (soundOk) {
            playNotificationSound(notif.type || notif.category);
          }

          // 2. Display interactive Toast Popup
          if (popupOk) {
            const toastId = notif.id || ('t-' + Date.now());
            setToasts((prev) => [
              {
                id: toastId,
                title: notif.title || 'Notification',
                message: notif.message,
                type: notif.type || 'INFO',
                category: notif.category || 'GENERAL',
                amount: notif.amount,
                actionUrl: notif.actionUrl,
              },
              ...prev.filter((t) => t.id !== toastId).slice(0, 4),
            ]);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 6000);
          }

          // 3. Add to dropdown notifications list
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === notif.id);
            if (exists) return prev;
            return [
              {
                id: notif.id || ('n-' + Date.now()),
                title: notif.title,
                message: notif.message,
                type: notif.type,
                category: notif.category,
                amount: notif.amount,
                actionUrl: notif.actionUrl,
                unread: true,
                timestamp: notif.createdAt || new Date().toISOString(),
              },
              ...prev,
            ];
          });
        } catch (err) {
          console.error('Error handling SSE notification:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.debug('SSE connection state change:', err);
      };
    } catch (e) {
      console.warn('SSE EventSource setup error:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userBusinessId, userId]);

  useEffect(() => {
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
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.unread) {
      try {
        await markNotificationRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)));
      } catch (e) {
        console.error(e);
      }
    }
    if (notif.actionUrl) {
      setShowNotifications(false);
      navigate(notif.actionUrl);
    }
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TRANSACTIONS') {
      return (
        n.category === 'SALE' ||
        n.category === 'PAYMENT' ||
        n.category === 'INVOICE' ||
        n.category === 'EXPENSE' ||
        n.type === 'TRANSACTION'
      );
    }
    if (activeFilter === 'ALERTS') {
      return n.type === 'WARNING' || n.type === 'DANGER' || n.category === 'INVENTORY';
    }
    if (activeFilter === 'ANNOUNCEMENTS') {
      return (
        n.type === 'ANNOUNCEMENT' ||
        n.category === 'ANNOUNCEMENT' ||
        n.category === 'SYSTEM' ||
        n.type === 'INFO'
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header className="portal-top-header">
        <div className="portal-header-left">
          {/* Mobile Toggle */}
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

          {/* Notifications Bell & Dropdown */}
          <div className="portal-dropdown-wrap" ref={notifRef}>
            <button 
              className={`portal-icon-btn position-relative ${unreadCount > 0 ? 'has-unread' : ''}`} 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <BsBellFill />
              {unreadCount > 0 && (
                <span className="notif-badge animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="portal-dropdown-menu notifications-menu animate-fade-in" style={{ width: "360px", maxHeight: "480px", display: "flex", flexDirection: "column" }}>
                <div className="dropdown-menu-header d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="badge bg-primary rounded-pill" style={{ fontSize: "10px" }}>{unreadCount} new</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {unreadCount > 0 && (
                      <span 
                        className="mark-read cursor-pointer text-primary" 
                        onClick={handleMarkAllRead} 
                        style={{ cursor: "pointer", fontSize: "11px" }}
                        title="Mark all as read"
                      >
                        <BsCheck2All /> Mark read
                      </span>
                    )}
                    <button
                      className="btn btn-sm btn-link text-secondary p-0 ms-1"
                      onClick={() => {
                        setShowNotifications(false);
                        setShowSettingsModal(true);
                      }}
                      title="Notification Settings"
                    >
                      <BsSliders style={{ fontSize: "14px" }} />
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="d-flex gap-1 p-2 bg-light border-bottom overflow-x-auto" style={{ fontSize: "11px" }}>
                  <button
                    className={`btn btn-sm py-1 px-2 ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: "11px", borderRadius: "14px" }}
                    onClick={() => setActiveFilter('ALL')}
                  >
                    All
                  </button>
                  <button
                    className={`btn btn-sm py-1 px-2 ${activeFilter === 'TRANSACTIONS' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: "11px", borderRadius: "14px" }}
                    onClick={() => setActiveFilter('TRANSACTIONS')}
                  >
                    Transactions
                  </button>
                  <button
                    className={`btn btn-sm py-1 px-2 ${activeFilter === 'ALERTS' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: "11px", borderRadius: "14px" }}
                    onClick={() => setActiveFilter('ALERTS')}
                  >
                    Alerts
                  </button>
                  <button
                    className={`btn btn-sm py-1 px-2 ${activeFilter === 'ANNOUNCEMENTS' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: "11px", borderRadius: "14px" }}
                    onClick={() => setActiveFilter('ANNOUNCEMENTS')}
                  >
                    Announcements
                  </button>
                </div>

                <div className="notif-list" style={{ overflowY: "auto", flex: 1, maxHeight: "360px" }}>
                  {filteredNotifications.map((notif, idx) => (
                    <div 
                      key={notif.id || idx} 
                      className={`notif-item p-2 border-bottom position-relative ${notif.unread ? 'unread bg-light-primary' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                      style={{ cursor: "pointer", transition: "background 0.15s" }}
                    >
                      <div className="d-flex gap-2 align-items-start">
                        <div className="mt-1">
                          {notif.category === 'SALE' || notif.category === 'PAYMENT' ? (
                            <span className="badge bg-success-subtle text-success p-1 rounded-circle"><BsCashCoin /></span>
                          ) : notif.type === 'WARNING' || notif.type === 'DANGER' || notif.category === 'INVENTORY' ? (
                            <span className="badge bg-warning-subtle text-warning p-1 rounded-circle"><BsExclamationTriangleFill /></span>
                          ) : notif.type === 'ANNOUNCEMENT' ? (
                            <span className="badge bg-info-subtle text-info p-1 rounded-circle"><BsMegaphoneFill /></span>
                          ) : (
                            <span className="badge bg-primary-subtle text-primary p-1 rounded-circle"><BsBellFill /></span>
                          )}
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex justify-content-between align-items-baseline">
                            <strong className="text-dark d-block text-truncate" style={{ fontSize: "12.5px" }}>
                              {notif.title || 'Update'}
                            </strong>
                            <span className="text-muted" style={{ fontSize: "10.5px", whiteSpace: "nowrap" }}>
                              {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>
                          </div>
                          <p className="mb-1 text-secondary" style={{ fontSize: "12px", lineHeight: "1.35", wordBreak: "break-word" }}>
                            {notif.message}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            {notif.amount && notif.amount > 0 ? (
                              <span className="badge bg-success text-white" style={{ fontSize: "10px" }}>
                                ₹{Number(notif.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            ) : <span></span>}
                            {notif.actionUrl && (
                              <span className="text-primary small d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                                View <BsArrowRightShort />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredNotifications.length === 0 && (
                    <div className="p-4 text-center text-muted small">
                      <BsBellFill className="mb-2 text-secondary fs-4" />
                      <div>No notifications in this tab.</div>
                      <div className="text-secondary" style={{ fontSize: "11px" }}>You are all caught up!</div>
                    </div>
                  )}
                </div>

                <div className="p-2 border-top bg-light text-center">
                  <button
                    className="btn btn-sm btn-link text-decoration-none text-muted"
                    style={{ fontSize: "12px" }}
                    onClick={() => {
                      setShowNotifications(false);
                      setShowSettingsModal(true);
                    }}
                  >
                    <BsSliders className="me-1" /> Configure notification preferences
                  </button>
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
                <button 
                  className="menu-link w-100 text-start border-0 bg-transparent" 
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowSettingsModal(true);
                  }}
                >
                  <BsSliders className="me-2 text-primary" /> Notification Settings
                </button>
                <div className="dropdown-divider"></div>
                <button className="menu-link logout-btn text-danger" onClick={handleLogout}>
                  <BsBoxArrowRight className="me-2" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Real-Time Floating Toast Popups */}
      <NotificationToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onRead={handleNotificationClick}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        businessId={userBusinessId}
        userId={userId}
      />
    </>
  );
}
