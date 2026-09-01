import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import PortalHeader from './PortalHeader';
import GlobalSearchModal from './GlobalSearchModal';
import AIAssistantWidget from './AIAssistantWidget';
import './dashboard.css';

export default function PortalLayout({ children, title }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="portal-master-layout">
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="portal-stage-wrapper">
        {/* Top Header */}
        <PortalHeader 
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          onOpenSearch={() => setSearchModalOpen(true)}
          title={title}
        />

        {/* Dynamic Page Children */}
        <main className="portal-page-body animate-fade-in">
          {children}
        </main>
      </div>

      {/* Global Omnibar Modal */}
      <GlobalSearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />

      {/* Floating AI Business Assistant */}
      <AIAssistantWidget />
    </div>
  );
}
