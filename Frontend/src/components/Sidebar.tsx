import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Building2,
  Droplet,
  UserCheck,
  Map,
  Bell,
  Settings,
  Bookmark,
  LogOut,
  User,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  LineChart,
  FileCode,
  ChevronDown,
  GitCompare,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

interface SubMenuItem {
  label: string;
  path: string;
}

interface SidebarTab {
  id: string;
  label: string;
  icon: any;
  path: string;
  isCritical?: boolean;
  badge?: number;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { currentUser, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    emergency: true,
    hospitals: false,
    resources: false,
    blood: false,
    specialists: false
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleSubMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 1. Patient Portal Sidebar
  const patientTabs: SidebarTab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: Flame,
      path: '/user/emergency',
      isCritical: true,
      subItems: [
        { label: 'Emergency SOS', path: '/user/emergency' },
        { label: 'My Emergency Requests', path: '/user/emergency?tab=requests' },
        { label: 'Emergency History', path: '/user/emergency?tab=history' }
      ]
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building2,
      path: '/user/hospitals',
      subItems: [
        { label: 'Find Hospitals', path: '/user/hospitals' },
        { label: 'Nearby Hospitals', path: '/user/hospitals?tab=nearby' },
        { label: 'Compare Hospitals', path: '/user/hospitals/compare' },
        { label: 'Saved Hospitals', path: '/user/hospitals?tab=saved' }
      ]
    },
    {
      id: 'blood',
      label: 'Blood',
      icon: Droplet,
      path: '/user/blood',
      subItems: [
        { label: 'Find Blood', path: '/user/blood' },
        { label: 'Blood Requests', path: '/user/blood?tab=requests' },
        { label: 'Request History', path: '/user/blood?tab=history' }
      ]
    },
    {
      id: 'specialists',
      label: 'Specialists',
      icon: User,
      path: '/user/specialists',
      subItems: [
        { label: 'Find Specialists', path: '/user/specialists' },
        { label: 'Doctors', path: '/user/specialists?tab=doctors' },
        { label: 'Departments', path: '/user/specialists?tab=departments' }
      ]
    },
    { id: 'map', label: 'Resource Map', icon: Map, path: '/user/map' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/user/notifications', badge: unreadCount },
    { id: 'saved-resources', label: 'Saved Resources', icon: Bookmark, path: '/user/saved-resources' },
    { id: 'profile', label: 'Portal Profile', icon: User, path: '/user/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/user/settings' }
  ];

  // 2. Hospital Portal Sidebar
  const hospitalAdminTabs: SidebarTab[] = [
    { id: 'dashboard', label: 'Resource Readiness', icon: LayoutDashboard, path: '/hospital/dashboard' },
    {
      id: 'profile',
      label: 'Hospital Profile',
      icon: Building2,
      path: '/hospital/profile',
      subItems: [
        { label: 'Facility Profile', path: '/hospital/profile' },
        { label: 'Verification Status', path: '/hospital/profile?tab=verification' },
        { label: 'Registered Departments', path: '/hospital/departments' }
      ]
    },
    {
      id: 'resources',
      label: 'Resources stock',
      icon: Database,
      path: '/hospital/resources',
      subItems: [
        { label: 'Resource Dashboard', path: '/hospital/resources' },
        { label: 'ICU & Beds', path: '/hospital/resources?tab=beds' },
        { label: 'Ventilators & Oxygen', path: '/hospital/resources?tab=respiratory' }
      ]
    },
    {
      id: 'doctors',
      label: 'Doctor Roster',
      icon: UserCheck,
      path: '/hospital/doctors',
      subItems: [
        { label: 'All Doctors', path: '/hospital/doctors' },
        { label: 'Add Specialist', path: '/hospital/doctors?tab=add' }
      ]
    },
    {
      id: 'blood',
      label: 'Blood Bank',
      icon: Droplet,
      path: '/hospital/blood',
      subItems: [
        { label: 'Stock Inventory', path: '/hospital/blood?tab=inventory' },
        { label: 'Update Availability', path: '/hospital/blood?tab=update' }
      ]
    },
    {
      id: 'ambulances',
      label: 'Ambulance Fleet',
      icon: Activity,
      path: '/hospital/ambulances',
      subItems: [
        { label: 'All Ambulances', path: '/hospital/ambulances' },
        { label: 'Add Ambulance', path: '/hospital/ambulances?tab=add' }
      ]
    },
    {
      id: 'emergency',
      label: 'Emergency Alert',
      icon: Flame,
      path: '/hospital/emergency/sos',
      subItems: [
        { label: 'SOS Callouts', path: '/hospital/emergency/sos' },
        { label: 'Emergency Coordination', path: '/hospital/emergency/coordination' }
      ]
    },
    { id: 'transfers', label: 'Hospital Transfers', icon: GitCompare, path: '/hospital/transfers' },
    { id: 'map', label: 'Resource Map', icon: Map, path: '/hospital/map' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/hospital/notifications', badge: unreadCount }
  ];

  // 3. Super Admin Sidebar
  const superAdminTabs: SidebarTab[] = [
    { id: 'dashboard', label: 'Control Center', icon: Shield, path: '/admin/dashboard' },
    {
      id: 'hospitals',
      label: 'Hospitals Grid',
      icon: Building2,
      path: '/admin/hospitals',
      subItems: [
        { label: 'All Hospitals', path: '/admin/hospitals' },
        { label: 'Pending Audits', path: '/admin/hospitals?tab=pending' }
      ]
    },
    {
      id: 'resources',
      label: 'Resource Monitor',
      icon: Database,
      path: '/admin/resources',
      subItems: [
        { label: 'Resource Monitoring', path: '/admin/resources' },
        { label: 'Stale Data Queue', path: '/admin/resources?tab=stale' }
      ]
    },
    {
      id: 'emergency',
      label: 'Emergency Response',
      icon: Flame,
      path: '/admin/emergency',
      subItems: [
        { label: 'Active Requests', path: '/admin/emergency' },
        { label: 'Emergency Alerts', path: '/admin/emergency?tab=alerts' }
      ]
    },
    { id: 'blood', label: 'Blood Demands', icon: Droplet, path: '/admin/blood' },
    { id: 'analytics', label: 'Analytics Center', icon: LineChart, path: '/admin/regional-intelligence' },
    { id: 'users', label: 'Users Directory', icon: Users, path: '/admin/users' },
    { id: 'audit', label: 'Audit Compliance', icon: FileCode, path: '/admin/audit-logs' }
  ];

  const getTabs = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'hospital_admin') return hospitalAdminTabs;
    if (currentUser.role === 'super_admin') return superAdminTabs;
    return patientTabs;
  };

  const navTabs = getTabs();

  useEffect(() => {
    const currentTab = navTabs.find(tab => location.pathname === tab.path || location.pathname.startsWith(tab.path + '/'));
    if (currentTab) {
      setExpandedMenus(prev => ({
        ...prev,
        [currentTab.id]: true
      }));
    }
  }, [location.pathname]);

  const handleTabClick = (tab: SidebarTab) => {
    if (tab.subItems && tab.subItems.length > 0) {
      setExpandedMenus(prev => ({
        ...prev,
        [tab.id]: true
      }));
    }
    navigate(tab.path);
  };

  return (
    <div
      className={`glass-panel fixed top-0 left-0 h-screen z-30 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64 md:w-72'
      }`}
    >
      {/* Header Logo */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center bg-medical-teal/10 w-9 h-9 rounded-xl border border-medical-teal/20 text-medical-teal shadow-md shadow-medical-teal/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className="opacity-10" />
                <path d="M4 12h3l2-4 3 8 2-6 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xs text-primary-text tracking-wider leading-none">
                MEDRADAR <span className="text-medical-teal">AI</span>
              </h1>
              <span className="text-[8.5px] text-muted-text uppercase tracking-widest font-semibold block mt-0.5">Command Pulse</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto text-medical-teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12h3l2-4 3 8 2-6 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-text hover:text-primary-text p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 hidden md:block"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 py-5 space-y-1 overflow-y-auto">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          const hasSubItems = tab.subItems && tab.subItems.length > 0;
          const isExpanded = expandedMenus[tab.id];

          return (
            <div key={tab.id} className="space-y-1">
              <button
                onClick={() => handleTabClick(tab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-medical-teal to-medical-teal-dark text-primary-bg-deep shadow-md font-bold'
                    : tab.isCritical
                    ? 'text-emergency border border-emergency/25 bg-emergency/5 hover:bg-emergency/15'
                    : 'text-secondary-text hover:text-primary-text hover:bg-white/[0.02]'
                }`}
              >
                <Icon
                  size={16}
                  className={`flex-shrink-0 ${tab.isCritical && !isActive ? 'animate-pulse' : ''}`}
                />
                
                {!collapsed && <span className="flex-1 text-left truncate">{tab.label}</span>}

                {!collapsed && tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${isActive ? 'bg-primary-bg-deep text-medical-teal' : 'bg-emergency text-primary-text'}`}>
                    {tab.badge}
                  </span>
                )}

                {hasSubItems && !collapsed && (
                  <ChevronDown
                    size={12}
                    className={`text-muted-text transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    onClick={(e) => toggleSubMenu(tab.id, e)}
                  />
                )}
              </button>

              {/* Subitems lists */}
              <AnimatePresence>
                {hasSubItems && isExpanded && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-7 space-y-1"
                  >
                    {tab.subItems?.map((sub) => {
                      const currentFullPath = location.pathname + location.search;
                      let isSubActive = currentFullPath === sub.path;
                      if (currentUser?.role === 'super_admin') {
                        if (tab.id === 'hospitals') {
                          if ((!location.search || location.search === '?tab=all') && sub.path === '/admin/hospitals') {
                            isSubActive = true;
                          } else if (location.search.includes('pending') && sub.path.includes('pending')) {
                            isSubActive = true;
                          }
                        } else if (tab.id === 'resources') {
                          if ((!location.search || location.search === '?tab=monitoring') && sub.path === '/admin/resources') {
                            isSubActive = true;
                          } else if (location.search.includes('stale') && sub.path.includes('stale')) {
                            isSubActive = true;
                          }
                        } else if (tab.id === 'emergency') {
                          if ((!location.search || location.search === '?tab=active') && sub.path === '/admin/emergency') {
                            isSubActive = true;
                          } else if (location.search.includes('alerts') && sub.path.includes('alerts')) {
                            isSubActive = true;
                          }
                        }
                      } else if (tab.id === 'blood') {
                        if ((!location.search || location.search === '?tab=inventory') && sub.path.includes('tab=inventory')) {
                          isSubActive = true;
                        } else if (location.search === '?tab=update' && sub.path.includes('tab=update')) {
                          isSubActive = true;
                        }
                      } else if (tab.id === 'emergency') {
                        if ((location.pathname === '/hospital/emergency/sos' || (location.pathname === '/hospital/emergency' && !location.search.includes('coordination'))) && sub.path.includes('sos')) {
                          isSubActive = true;
                        } else if ((location.pathname === '/hospital/emergency/coordination' || location.search.includes('coordination')) && sub.path.includes('coordination')) {
                          isSubActive = true;
                        }
                      } else if (tab.id === 'resources') {
                        if ((!location.search || location.search === '?tab=dashboard') && sub.path === '/hospital/resources') {
                          isSubActive = true;
                        } else if (location.search.includes('beds') && sub.path.includes('beds')) {
                          isSubActive = true;
                        } else if ((location.search.includes('respiratory') || location.search.includes('vent')) && (sub.path.includes('respiratory') || sub.path.includes('vent'))) {
                          isSubActive = true;
                        }
                      }
                      return (
                        <button
                          key={sub.path}
                          onClick={() => navigate(sub.path)}
                          className={`w-full text-left py-2 px-3 rounded-xl text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                            isSubActive
                              ? 'text-medical-teal font-bold bg-medical-teal/15 border border-medical-teal/25 shadow-sm'
                              : 'text-secondary-text hover:text-primary-text hover:bg-white/[0.05]'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-white/5">
        {!collapsed && currentUser && (
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl mb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-medical-teal/15 border border-medical-teal/30 flex items-center justify-center font-bold text-xs text-medical-teal uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary-text truncate">{currentUser.name}</p>
              <p className="text-[9px] text-muted-text truncate capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/5 text-[11px] text-muted-text hover:text-emergency hover:bg-emergency/5 hover:border-emergency/15 transition-all font-bold"
        >
          <LogOut size={14} />
          {!collapsed && <span>Exit Portal</span>}
        </button>
      </div>
    </div>
  );
};
