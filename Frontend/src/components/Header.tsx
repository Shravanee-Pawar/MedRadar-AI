import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { Bell, Search, User, Flame, Activity, Users, Droplet, Truck, Building2, GitCompare, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  onSearchChange?: (val: string) => void;
  openSOSModal?: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onSearchChange,
  openSOSModal,
  onProfileClick
}) => {
  const navigate = useNavigate();
  const { currentUser, notifications, markNotificationRead, clearAllNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isHospitalAdmin = currentUser?.role === 'hospital_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const unreadNotifs = notifications.filter(n => !n.isRead);
  const hasUnreadCritical = unreadNotifs.some(n => n.isCritical);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearchChange) onSearchChange(val);
  };

  // 1. Internal Hospital Operations Search Results
  const getHospitalSearchResults = () => {
    if (!searchValue.trim()) return [];
    const q = searchValue.toLowerCase().trim();
    const results: Array<{
      category: string;
      icon: any;
      id: string;
      title: string;
      subtitle: string;
      link: string;
    }> = [];

    // Doctors
    db.getDoctors()
      .filter(d => d.hospitalId === hospitalId || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
      .filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(d => {
        results.push({
          category: 'Doctors',
          icon: Users,
          id: d.id,
          title: d.name,
          subtitle: `${d.specialty} • ${d.availabilityStatus || d.status}`,
          link: '/hospital/doctors'
        });
      });

    // Resources
    db.getResources()
      .filter(r => r.hospitalId === hospitalId || r.resourceName.toLowerCase().includes(q) || r.status.toLowerCase().includes(q))
      .filter(r => r.resourceName.toLowerCase().includes(q) || r.status.toLowerCase().includes(q) || 'icu'.includes(q) || 'ventilator'.includes(q))
      .slice(0, 3)
      .forEach(r => {
        results.push({
          category: 'Resources',
          icon: Activity,
          id: r.id,
          title: r.resourceName,
          subtitle: `${r.available} free / ${r.total} total (${r.status})`,
          link: '/hospital/resources'
        });
      });

    // Emergency Requests
    db.getEmergencyRequests()
      .filter(e => e.id.toLowerCase().includes(q) || e.emergencyType.toLowerCase().includes(q) || (e.priority && e.priority.toLowerCase().includes(q)) || (e.patientReference && e.patientReference.toLowerCase().includes(q)))
      .slice(0, 3)
      .forEach(e => {
        results.push({
          category: 'Emergency Requests',
          icon: Flame,
          id: e.id,
          title: `${e.id} — ${e.emergencyType}`,
          subtitle: `Priority: ${e.priority || 'Critical'} • Ref: ${e.patientReference || 'P-4821'}`,
          link: '/hospital/emergency/sos'
        });
      });

    // Blood Inventory
    db.getBloodInventory()
      .filter(b => b.hospitalId === hospitalId || b.bloodGroup.toLowerCase().includes(q) || b.status.toLowerCase().includes(q))
      .filter(b => b.bloodGroup.toLowerCase().includes(q) || b.status.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(b => {
        results.push({
          category: 'Blood Inventory',
          icon: Droplet,
          id: b.id,
          title: `Blood Group ${b.bloodGroup}`,
          subtitle: `${b.unitsAvailable} units available (${b.status})`,
          link: '/hospital/blood?tab=inventory'
        });
      });

    // Ambulances
    db.getAmbulances()
      .filter(a => a.hospitalId === hospitalId || a.ambulanceNumber.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.status.toLowerCase().includes(q))
      .filter(a => a.ambulanceNumber.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.status.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(a => {
        results.push({
          category: 'Ambulances',
          icon: Truck,
          id: a.id,
          title: a.ambulanceNumber,
          subtitle: `${a.type} • Status: ${a.status}`,
          link: '/hospital/ambulances'
        });
      });

    // Departments
    db.getDepartments()
      .filter(dep => dep.hospitalId === hospitalId || dep.name.toLowerCase().includes(q))
      .filter(dep => dep.name.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(dep => {
        results.push({
          category: 'Departments',
          icon: Building2,
          id: dep.id,
          title: dep.name,
          subtitle: `Status: ${dep.status}`,
          link: '/hospital/departments'
        });
      });

    // Transfers
    db.getTransfers()
      .filter(t => t.id.toLowerCase().includes(q) || t.sendingHospitalName.toLowerCase().includes(q) || t.receivingHospitalName.toLowerCase().includes(q) || t.status.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(t => {
        results.push({
          category: 'Transfers',
          icon: GitCompare,
          id: t.id,
          title: `${t.id} Transfer Request`,
          subtitle: `From: ${t.sendingHospitalName} • Status: ${t.status}`,
          link: '/hospital/transfers'
        });
      });

    return results;
  };

  // 2. Super Admin System-Wide Search Results
  const getSuperAdminSearchResults = () => {
    if (!searchValue.trim()) return [];
    const q = searchValue.toLowerCase().trim();
    const results: Array<{
      category: string;
      icon: any;
      id: string;
      title: string;
      subtitle: string;
      link: string;
    }> = [];

    // 1. Hospitals
    db.getHospitals()
      .filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.registrationNumber.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(h => {
        results.push({
          category: 'Hospitals',
          icon: Building2,
          id: h.id,
          title: h.name,
          subtitle: `${h.address}, ${h.city} • ${h.verified ? 'Verified Node' : 'Unverified'} • Score: ${h.readinessScore}%`,
          link: '/admin/hospitals'
        });
      });

    // 2. Resources
    const hospitalsList = db.getHospitals();
    db.getResources()
      .filter(r => r.resourceName.toLowerCase().includes(q) || r.status.toLowerCase().includes(q) || 'icu'.includes(q) || 'ventilator'.includes(q) || 'beds'.includes(q) || 'oxygen'.includes(q))
      .slice(0, 3)
      .forEach(r => {
        const hosp = hospitalsList.find(h => h.id === r.hospitalId);
        results.push({
          category: 'Resources',
          icon: Activity,
          id: r.id,
          title: `${r.resourceName} (${hosp?.name || 'Facility'})`,
          subtitle: `${r.available} free / ${r.total} total ${r.unit || ''} • Status: ${r.status}`,
          link: '/admin/resources'
        });
      });

    // 3. Users
    db.getUsers()
      .filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(u => {
        results.push({
          category: 'Users',
          icon: Users,
          id: u.id,
          title: u.name,
          subtitle: `${u.email} • Role: ${u.role.replace('_', ' ')}`,
          link: '/admin/users'
        });
      });

    // 4. Emergency Requests
    db.getEmergencyRequests()
      .filter(e => e.id.toLowerCase().includes(q) || e.emergencyType.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.patientName.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(e => {
        results.push({
          category: 'Emergency Requests',
          icon: Flame,
          id: e.id,
          title: `${e.id} — ${e.emergencyType}`,
          subtitle: `Location: ${e.location} • Patient: ${e.patientName} • Status: ${e.status}`,
          link: '/admin/emergency'
        });
      });

    // 5. Blood Demands
    db.getBloodRequests()
      .filter(b => b.id.toLowerCase().includes(q) || b.bloodGroup.toLowerCase().includes(q) || b.hospitalName.toLowerCase().includes(q) || b.patientName.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(b => {
        results.push({
          category: 'Blood Demands',
          icon: Droplet,
          id: b.id,
          title: `Blood Group ${b.bloodGroup} (${b.unitsRequired} Units)`,
          subtitle: `Facility: ${b.hospitalName} • Patient: ${b.patientName} • Status: ${b.status}`,
          link: '/admin/blood'
        });
      });

    // 6. Audit Records
    db.getAuditLogs()
      .filter(a => a.action.toLowerCase().includes(q) || a.actorName.toLowerCase().includes(q) || a.details.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(a => {
        results.push({
          category: 'Audit Records',
          icon: FileCode,
          id: a.id,
          title: a.action,
          subtitle: `Operator: ${a.actorName} • ${a.details}`,
          link: '/admin/audit-logs'
        });
      });

    return results;
  };

  // 3. Patient / User Search Results
  const getUserSearchResults = () => {
    if (!searchValue.trim()) return [];
    const q = searchValue.toLowerCase().trim();
    const results: Array<{
      category: string;
      icon: any;
      id: string;
      title: string;
      subtitle: string;
      link: string;
    }> = [];

    // Hospitals
    db.getHospitals()
      .filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || h.type.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(h => {
        results.push({
          category: 'Hospitals',
          icon: Building2,
          id: h.id,
          title: h.name,
          subtitle: `${h.address}, ${h.city} • Readiness: ${h.readinessScore}% (${h.emergencyStatus})`,
          link: '/user/hospitals'
        });
      });

    // Specialists
    db.getDoctors()
      .filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || (d.qualification && d.qualification.toLowerCase().includes(q)) || d.hospitalName.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(d => {
        results.push({
          category: 'Specialists',
          icon: Users,
          id: d.id,
          title: d.name,
          subtitle: `${d.specialty} • ${d.hospitalName} (${d.availabilityStatus || d.status})`,
          link: '/user/specialists'
        });
      });

    // Blood Bank Inventory
    db.getBloodInventory()
      .filter(b => b.bloodGroup.toLowerCase().includes(q) || b.hospitalName.toLowerCase().includes(q) || b.status.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(b => {
        results.push({
          category: 'Blood Inventory',
          icon: Droplet,
          id: b.id,
          title: `Blood Group ${b.bloodGroup} — ${b.hospitalName}`,
          subtitle: `${b.unitsAvailable} units available (${b.status})`,
          link: '/user/blood'
        });
      });

    // Emergency Services
    db.getEmergencyRequests()
      .filter(e => e.id.toLowerCase().includes(q) || e.emergencyType.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(e => {
        results.push({
          category: 'Emergency SOS',
          icon: Flame,
          id: e.id,
          title: `${e.id} — ${e.emergencyType}`,
          subtitle: `Location: ${e.location} • Status: ${e.status}`,
          link: '/user/emergency'
        });
      });

    return results;
  };

  const searchResults = isSuperAdmin ? getSuperAdminSearchResults() : isHospitalAdmin ? getHospitalSearchResults() : getUserSearchResults();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-white/5 bg-primary-bg/50 backdrop-blur-md sticky top-0 z-20">
      {/* Title / Path */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-heading text-primary-text flex items-center gap-2">
          {title}
        </h2>
        <span className="text-[10px] text-muted-text uppercase tracking-widest font-semibold block mt-0.5">MedRadar AI Grid Network</span>
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-text">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder={isHospitalAdmin ? "Search doctors, resources, requests..." : isSuperAdmin ? "Search hospitals, resources, users, requests..." : "Search hospitals, blood, specialists..."}
              value={searchValue}
              onFocus={() => setIsSearchOpen(true)}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full glass-input text-primary-text focus:outline-none focus:border-medical-teal/50"
            />

            {/* Interactive Operational Search Popover for All Portals */}
            {isSearchOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSearchOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 mt-2 z-30 bg-primary-bg-deep border border-white/10 rounded-2xl shadow-2xl p-4 text-left space-y-3 max-h-96 overflow-y-auto"
                >
                  {!searchValue.trim() ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">
                          {isSuperAdmin ? "SUPER ADMIN QUICK SEARCH" : isHospitalAdmin ? "INTERNAL OPERATIONS QUICK SEARCH" : "PATIENT QUICK SEARCH"}
                        </span>
                        <span className="text-[9px] text-medical-teal font-bold">
                          {isSuperAdmin ? "Control Center" : isHospitalAdmin ? "Hospital Admin Portal" : "Patient Portal"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {(isSuperAdmin ? [
                          { label: '🏥 Hospitals', path: '/admin/hospitals' },
                          { label: '📦 Resources', path: '/admin/resources' },
                          { label: '👥 Users', path: '/admin/users' },
                          { label: '🚨 Emergency Requests', path: '/admin/emergency' },
                          { label: '🩸 Blood Demands', path: '/admin/blood' },
                          { label: '📑 Audit Compliance', path: '/admin/audit-logs' }
                        ] : isHospitalAdmin ? [
                          { label: '👨‍⚕️ Doctors', path: '/hospital/doctors' },
                          { label: '📦 Resources', path: '/hospital/resources' },
                          { label: '🚨 Emergency Requests', path: '/hospital/emergency/sos' },
                          { label: '🩸 Blood Inventory', path: '/hospital/blood?tab=inventory' },
                          { label: '🚑 Ambulances', path: '/hospital/ambulances' },
                          { label: '🏥 Departments', path: '/hospital/departments' },
                          { label: '🔔 Notifications', path: '/hospital/notifications' },
                          { label: '🔄 Transfers', path: '/hospital/transfers' }
                        ] : [
                          { label: '🚨 Emergency SOS', path: '/user/emergency' },
                          { label: '🏥 Hospital Directory', path: '/user/hospitals' },
                          { label: '👨‍⚕️ Specialists', path: '/user/specialists' },
                          { label: '🩸 Blood Banks', path: '/user/blood' },
                          { label: '📍 Resource Map', path: '/user/map' },
                          { label: '⭐ Saved Hospitals', path: '/user/saved-resources' }
                        ]).map(item => (
                          <button
                            key={item.label}
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(item.path);
                            }}
                            className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 text-left text-primary-text text-[11px] font-semibold transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <span className="text-muted-text text-[10px]">→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">
                          SEARCH RESULTS ({searchResults.length})
                        </span>
                        <span className="text-[9.5px] text-secondary-text">Query: "{searchValue}"</span>
                      </div>

                      {searchResults.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-text">
                          {isSuperAdmin
                            ? "No matching hospitals, resources, users, or requests found."
                            : isHospitalAdmin
                            ? "No matching internal hospital resources, doctors, or requests found."
                            : "No matching hospitals, specialists, or blood resources found."}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {searchResults.map(res => {
                            const IconComponent = res.icon;
                            return (
                              <div
                                key={`${res.category}-${res.id}`}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  navigate(res.link);
                                }}
                                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-medical-teal/10 border border-white/5 hover:border-medical-teal/30 cursor-pointer transition-all flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-medical-teal shrink-0">
                                  <IconComponent size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-xs text-primary-text truncate">{res.title}</h5>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-muted-text uppercase">
                                      {res.category}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-muted-text mt-0.5 truncate">{res.subtitle}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* Notifications Hub */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/5 text-secondary-text hover:text-primary-text transition-all focus:outline-none cursor-pointer"
          >
            <Bell size={16} />
            {unreadNotifs.length > 0 && (
              <span className={`absolute top-0 right-0 flex h-3.5 w-3.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasUnreadCritical ? 'bg-emergency' : 'bg-medical-teal'}`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 items-center justify-center text-[7px] font-bold text-primary-bg-deep ${hasUnreadCritical ? 'bg-emergency' : 'bg-medical-teal'}`}>
                  {unreadNotifs.length}
                </span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 md:w-96 z-20 glass-card rounded-[20px] shadow-2xl p-4 overflow-hidden border border-white/10"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
                    <h4 className="font-heading font-bold text-xs text-primary-text">Operational Notifications</h4>
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-medical-teal hover:underline font-semibold cursor-pointer"
                    >
                      Clear/Mark All Read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-text">
                        No active alerts in this sector.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            n.isRead
                              ? 'bg-white/[0.01] border-white/5 opacity-55 hover:opacity-90'
                              : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06] shadow-sm'
                          }`}
                        >
                          <div className="mt-0.5">
                            {n.type === 'Emergency' ? (
                              <span className="text-emergency">🚨</span>
                            ) : n.type === 'Blood' ? (
                              <span className="text-info">🩸</span>
                            ) : n.type === 'Stale Data' ? (
                              <span className="text-warning">⚠️</span>
                            ) : (
                              <span className="text-medical-teal">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1">
                              <p className={`font-bold truncate ${n.isCritical && !n.isRead ? 'text-emergency' : 'text-primary-text'}`}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${n.isCritical ? 'bg-emergency' : 'bg-medical-teal'}`} />
                              )}
                            </div>
                            <p className="text-[11px] text-secondary-text mt-0.5 leading-relaxed">{n.description}</p>
                            <span className="text-[9px] text-muted-text mt-1 block">{n.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Info / Profile avatar */}
        {onProfileClick && (
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 border border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-full px-3.5 py-1.5 text-xs text-secondary-text hover:text-primary-text transition-all focus:outline-none cursor-pointer"
          >
            <User size={14} className="text-medical-teal" />
            <span className="font-semibold">{currentUser?.name.split(' ')[0] || 'Profile'}</span>
          </button>
        )}

        {/* SOS Action Button (Only visible for Patient dashboard) */}
        {openSOSModal && (
          <button
            onClick={openSOSModal}
            className="flex items-center gap-2 bg-emergency hover:bg-emergency-dark text-primary-text text-xs font-extrabold px-5 py-2.5 rounded-full pulse-emergency shadow-lg shadow-emergency/20 transition-all border border-emergency-dark/30 cursor-pointer"
          >
            <Flame size={14} className="fill-current animate-bounce" />
            <span>EMERGENCY SOS</span>
          </button>
        )}
      </div>
    </header>
  );
};
