import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AnimatePresence, motion } from 'framer-motion';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  // Derive page titles based on current path
  const getPageTitle = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Grid Panel';
    const sub = segments[1];
    
    // Mapping keys to clean display headers
    const map: Record<string, string> = {
      dashboard: 'Control Panel',
      emergency: 'Emergency SOS Response',
      hospitals: 'Hospitals',
      blood: 'Blood Finder',
      specialists: 'Specialist Directory',
      map: 'Resource Map',
      notifications: 'Notifications',
      settings: 'Settings',
      profile: 'Portal Profile',
      'saved-resources': 'Saved Resources',
      monitoring: 'Resource Telemetry Monitor',
      verification: 'Facility Auditing Queue',
      analytics: 'Analytics & Regional Intelligence',
      audit: 'Platform Audit Trail'
    };

    return map[sub] || 'Health Grid Center';
  };

  const pageTitle = getPageTitle(location.pathname);

  const handleSOSModalTrigger = () => {
    navigate('/user/emergency');
  };

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text flex">
      {/* Dynamic Sidebar Shell */}
      <Sidebar activeTab={location.pathname} setActiveTab={(tab) => navigate(tab)} />

      {/* Main Workspace Scaffolding */}
      <div className="flex-1 flex flex-col min-h-screen pl-20 md:pl-72 transition-all duration-300">
        <Header
          title={pageTitle}
          onSearchChange={(val) => {
            // Broadcast searches globally
            console.log(`Global search value: ${val}`);
          }}
          openSOSModal={currentUser?.role === 'patient' ? handleSOSModalTrigger : undefined}
          onProfileClick={() => navigate(`/${currentUser?.role === 'patient' ? 'user' : currentUser?.role === 'hospital_admin' ? 'hospital' : 'admin'}/profile`)}
        />

        {/* Content view with route transitions */}
        <main className="flex-grow p-6 md:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
