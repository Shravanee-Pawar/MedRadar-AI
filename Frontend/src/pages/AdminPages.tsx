import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { InteractiveMap } from '../components/InteractiveMap';
import { resourceService } from '../services/resourceService';
import { hospitalService } from '../services/hospitalService';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Building2,
  AlertTriangle,
  UserCheck,
  Send,
  Check,
  FileCode,
  Flame,
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Hospital, type HospitalResource } from '../types';

// Chart seed datasets representing Ratnagiri District regional trends
const resourceTrendData = [
  { time: '00:00', icuPressure: 45, emergencies: 2, bloodDemand: 12 },
  { time: '04:00', icuPressure: 52, emergencies: 1, bloodDemand: 8 },
  { time: '08:00', icuPressure: 78, emergencies: 6, bloodDemand: 25 },
  { time: '12:00', icuPressure: 88, emergencies: 9, bloodDemand: 34 },
  { time: '16:00', icuPressure: 92, emergencies: 11, bloodDemand: 41 },
  { time: '20:00', icuPressure: 64, emergencies: 5, bloodDemand: 19 }
];

// Seed Regional Emergency Alerts (distinct from individual SOS requests)
const initialRegionalAlerts = [
  {
    id: 'alt-101',
    title: 'ICU Beds Capacity Warning',
    facilityName: 'Parkar Hospital & Research Centre',
    description: 'ICU ward occupancy reached 95% load capacity (19/20 beds in use). Prepare diversion protocols if necessary.',
    urgency: 'Critical' as const,
    timestamp: '10 min ago',
    acknowledged: false
  },
  {
    id: 'alt-102',
    title: 'Liquid Oxygen Reserve Deficit',
    facilityName: 'Civil Hospital Ratnagiri',
    description: 'Liquid oxygen storage level fell below 2.0 KL safety threshold (current: 1.5 KL). Supplier dispatch requested.',
    urgency: 'Critical' as const,
    timestamp: '25 min ago',
    acknowledged: false
  },
  {
    id: 'alt-103',
    title: 'Mass Casualty Incident Alert',
    facilityName: 'Chiplun Sub-District Hospital',
    description: 'Multi-vehicle collision reported on NH-66 highway. 4 trauma patients dispatched needing ICU beds.',
    urgency: 'Warning' as const,
    timestamp: '45 min ago',
    acknowledged: true
  },
  {
    id: 'alt-104',
    title: 'Ambulance Fleet Standby Low',
    facilityName: 'Lifecare Hospital Ratnagiri',
    description: 'Sector 2 emergency response grid has only 1 available ALS unit on standby.',
    urgency: 'Warning' as const,
    timestamp: '1 hour ago',
    acknowledged: true
  },
  {
    id: 'alt-105',
    title: 'Node Telemetry Synchronized',
    facilityName: 'Sub-district Hospital Khed',
    description: 'All 8 resource indicators re-validated and synchronized with central command.',
    urgency: 'Info' as const,
    timestamp: '2 hours ago',
    acknowledged: true
  }
];

// ============================================================
// 1. ADMIN DASHBOARD CONTROL CENTER (/admin/dashboard)
// ============================================================
export const AdminDashboardPage: React.FC = () => {
  const { hospitals, resources, emergencyRequests, notifications } = useApp();

  const totalHospitals = hospitals.length;
  const pendingHospitals = hospitals.filter(h => !h.verified).length;
  const activeSOS = emergencyRequests.filter(r => r.status !== 'Resolved').length;

  const staleResources = resources.filter(res =>
    res.updatedAt.includes('hours') || res.updatedAt.includes('day') || res.status === 'Stale'
  );

  return (
    <div className="space-y-6 text-left">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Facilities', val: totalHospitals, icon: Building2, color: 'text-info-blue bg-info-blue/5' },
          { label: 'Pending Audits', val: pendingHospitals, icon: UserCheck, color: 'text-warning bg-warning/5' },
          { label: 'Active Emergency Calls', val: activeSOS, icon: Flame, color: 'text-emergency bg-emergency/5' },
          { label: 'Stale Data Queue', val: staleResources.length, icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/5' }
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="p-5 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-text uppercase font-bold tracking-wider">{m.label}</span>
                <h4 className="font-heading font-black text-xl text-primary-text mt-1">{m.val}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${m.color}`}>
                <Icon size={16} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Embedded Resource Map */}
        <Card className="lg:col-span-2 p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading font-black text-sm text-primary-text uppercase tracking-tight">Ratnagiri Regional Resource Map</h3>
              <p className="text-xs text-muted-text mt-0.5">Live coordinate plotting across verified clinics, ambulances, and emergency calls.</p>
            </div>
            <span className="text-[9px] uppercase font-bold text-medical-teal border border-medical-teal/30 bg-medical-teal/5 px-2.5 py-1 rounded-md">
              Sector: RATNAGIRI
            </span>
          </div>

          <div className="w-full h-[340px] rounded-xl overflow-hidden border border-white/5 relative">
            <InteractiveMap filterType="all" />
          </div>
        </Card>

        {/* Command Activity Stream */}
        <Card className="p-6 border border-white/5 space-y-4">
          <h3 className="font-heading font-black text-sm text-primary-text uppercase tracking-tight">Command Activity Feed</h3>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {notifications.slice(0, 6).map((n) => (
              <div key={n.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-start gap-3">
                <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.isCritical ? 'bg-emergency animate-pulse' : 'bg-medical-teal'}`} />
                <div>
                  <h5 className="text-[11px] font-bold text-primary-text">{n.title}</h5>
                  <p className="text-[10px] text-muted-text mt-0.5 leading-normal">{n.description}</p>
                  <span className="text-[9px] text-muted-text/70 mt-1 block">{n.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================
// 2. HOSPITALS GRID & PENDING AUDITS (/admin/hospitals)
// ============================================================
export const AdminHospitalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'pending' ? 'pending' : 'all';

  const { hospitals, refreshState } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Hospital | null>(null);

  const pendingList = hospitals.filter(h => !h.verified);
  const allList = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await hospitalService.verifyHospital(id, action);
    setSelectedReview(null);
    refreshState();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Subtab Bar */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2">
          <button
            onClick={() => setSearchParams({ tab: 'all' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-medical-teal/15 text-medical-teal border border-medical-teal/30 shadow-sm'
                : 'text-secondary-text hover:bg-white/5'
            }`}
          >
            🏥 All Network Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'pending' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-warning/15 text-warning border border-warning/30 shadow-sm'
                : 'text-secondary-text hover:bg-white/5'
            }`}
          >
            ⏳ Pending Audits
            {pendingList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-warning text-primary-bg-deep text-[10px] font-black">
                {pendingList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              placeholder="Filter facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-primary-bg border border-white/10 rounded-xl text-primary-text"
            />
          </div>
        )}
      </div>

      {activeTab === 'pending' ? (
        /* PENDING AUDITS QUEUE */
        <Card className="p-6 border border-white/5 space-y-4">
          <div>
            <h3 className="font-heading font-black text-base text-primary-text">Facility Registration Audit Queue</h3>
            <p className="text-xs text-muted-text mt-0.5">Review credential dossiers for new healthcare providers requesting network verification.</p>
          </div>

          {pendingList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-text bg-white/[0.01] rounded-xl border border-white/5">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-success opacity-80" />
              All facility nodes are verified. No pending registration dossiers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-secondary-text font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3">Facility Name</th>
                    <th className="py-3">Address & Sector</th>
                    <th className="py-3">License Reg Code</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingList.map(h => (
                    <tr key={h.id} className="hover:bg-white/[0.01]">
                      <td className="py-4 font-bold text-primary-text">{h.name}</td>
                      <td className="py-4 text-secondary-text">{h.address}, {h.city}</td>
                      <td className="py-4 text-muted-text font-mono">{h.registrationNumber}</td>
                      <td className="py-4 text-right space-x-2">
                        <Button variant="outline" size="sm" className="text-[10px] py-1.5" onClick={() => setSelectedReview(h)}>
                          Audit Dossier
                        </Button>
                        <Button variant="primary" size="sm" className="text-[10px] py-1.5" onClick={() => handleAction(h.id, 'approve')}>
                          Approve Node
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        /* ALL HOSPITALS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allList.map(h => (
            <Card key={h.id} className="p-6 border border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-heading font-black text-base text-primary-text">{h.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black flex-shrink-0 ${h.verified ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                    {h.verified ? 'Verified Node' : 'Verification Pending'}
                  </span>
                </div>
                <p className="text-xs text-muted-text">{h.address}, {h.city}</p>
                <div className="text-[11px] font-mono text-muted-text">Reg Code: {h.registrationNumber}</div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-text uppercase font-bold">Readiness:</span>
                  <strong className="text-xs font-black text-medical-teal">{h.readinessScore}%</strong>
                </div>
                <StatusBadge status={h.emergencyStatus} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dossier Overlay */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/75 backdrop-blur-sm" onClick={() => setSelectedReview(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="z-10 w-full max-w-lg bg-primary-bg-deep border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
              <div>
                <h3 className="font-heading font-black text-base text-primary-text">Auditing Facility Credentials</h3>
                <p className="text-xs text-muted-text mt-0.5">Review license registration details and GPS coordinates prior to node activation.</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2.5 text-xs text-secondary-text">
                <div className="flex justify-between"><span>Facility Name:</span><strong className="text-primary-text">{selectedReview.name}</strong></div>
                <div className="flex justify-between"><span>Registration Code:</span><strong className="text-primary-text font-mono">{selectedReview.registrationNumber}</strong></div>
                <div className="flex justify-between"><span>Address:</span><strong className="text-primary-text">{selectedReview.address}, {selectedReview.city}</strong></div>
                <div className="flex justify-between"><span>Contact:</span><strong className="text-primary-text">{selectedReview.phone}</strong></div>
                <div className="flex justify-between"><span>GPS Lock:</span><strong className="text-primary-text font-mono">{selectedReview.lat}, {selectedReview.lng}</strong></div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-white/5">
                <Button variant="secondary" size="sm" onClick={() => handleAction(selectedReview.id, 'reject')} className="border-emergency/30 text-emergency hover:bg-emergency/5">
                  Reject & Suspend
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleAction(selectedReview.id, 'approve')}>
                  Approve Verification Node
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 3. RESOURCE MONITOR & STALE DATA QUEUE (/admin/resources)
// ============================================================
export const AdminResourcesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'stale' ? 'stale' : 'monitoring';

  const { resources, hospitals, refreshState } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [pingedList, setPingedList] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const staleList = resources.filter(res =>
    res.updatedAt.includes('hours') || res.updatedAt.includes('day') || res.status === 'Stale'
  );

  const filteredResources = resources.filter(res => {
    const hosp = hospitals.find(h => h.id === res.hospitalId);
    return (
      res.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hosp && hosp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDispatchPing = async (res: HospitalResource) => {
    const hosp = hospitals.find(h => h.id === res.hospitalId);
    await resourceService.sendStaleReminder(res.hospitalId, res.resourceName);

    // Update resource in db
    const allRes = db.getResources();
    const updatedRes = allRes.map(item => {
      if (item.id === res.id) {
        return {
          ...item,
          status: item.available > 0 ? ('Available' as const) : ('Limited' as const),
          updatedAt: 'Just now',
          updatedBy: 'Super Admin Ping'
        };
      }
      return item;
    });

    db.saveResources(updatedRes);
    setPingedList(prev => [...prev, res.id]);
    refreshState();
    triggerToast(`✓ Dispatch Ping sent to ${hosp?.name || 'facility'}. Telemetry updated just now.`);
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-xl bg-medical-teal/15 border border-medical-teal/30 text-medical-teal flex items-center justify-between font-bold text-xs shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Check size={18} />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-medical-teal hover:opacity-80 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtab Bar */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2">
          <button
            onClick={() => setSearchParams({ tab: 'monitoring' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'monitoring'
                ? 'bg-medical-teal/15 text-medical-teal border border-medical-teal/30 shadow-sm'
                : 'text-secondary-text hover:bg-white/5'
            }`}
          >
            📊 Resource Monitoring ({resources.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'stale' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stale'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-secondary-text hover:bg-white/5'
            }`}
          >
            ⚠️ Stale Data Queue
            {staleList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-primary-bg-deep text-[10px] font-black">
                {staleList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'monitoring' && (
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              placeholder="Search resource stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-primary-bg border border-white/10 rounded-xl text-primary-text"
            />
          </div>
        )}
      </div>

      {activeTab === 'stale' ? (
        /* STALE DATA QUEUE */
        <Card className="p-6 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-black text-base text-primary-text">Stale Telemetry Queue</h3>
              <p className="text-xs text-muted-text mt-0.5">Resources requiring verification due to outdated status updates.</p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
              ⚠ Action Required ({staleList.length})
            </span>
          </div>

          {staleList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-text bg-white/[0.01] rounded-xl border border-white/5">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-success opacity-80" />
              All network resource feeds are fresh and synchronized.
            </div>
          ) : (
            <div className="space-y-3">
              {staleList.map(res => {
                const hosp = hospitals.find(h => h.id === res.hospitalId);
                const isPinged = pingedList.includes(res.id);

                return (
                  <div key={res.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-primary-text">{hosp?.name || 'Regional Facility'}</h4>
                      <p className="text-[11px] text-muted-text mt-0.5">
                        {res.resourceName} • Available: <strong className="text-primary-text">{res.available} / {res.total} {res.unit || ''}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        ⚠ Stale — Updated {res.updatedAt}
                      </span>
                      <Button
                        variant={isPinged ? 'secondary' : 'primary'}
                        size="sm"
                        className="text-[10px] py-1.5"
                        disabled={isPinged}
                        onClick={() => handleDispatchPing(res)}
                      >
                        {isPinged ? (
                          <span className="flex items-center gap-1"><Check size={12} /> Dispatch Ping Sent</span>
                        ) : (
                          <span className="flex items-center gap-1"><Send size={12} /> Dispatch Ping</span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : (
        /* RESOURCE MONITORING GRID */
        <Card className="p-6 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-black text-base text-primary-text">Network-Wide Resource Stock</h3>
              <p className="text-xs text-muted-text mt-0.5">Live operational availability across all verified regional facilities.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(res => {
              const hosp = hospitals.find(h => h.id === res.hospitalId);
              const ratio = Math.round((res.available / Math.max(1, res.total)) * 100);

              return (
                <div key={res.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-primary-text">{res.resourceName}</h4>
                      <p className="text-[10px] text-muted-text mt-0.5">{hosp?.name}</p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-text">
                      <span>Available: <strong className="text-primary-text">{res.available} {res.unit || ''}</strong></span>
                      <span>Total: {res.total}</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${res.status === 'Critical' ? 'bg-emergency' : res.status === 'Limited' ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[9.5px] text-muted-text/80 flex items-center justify-between pt-1 border-t border-white/5">
                    <span>Updated: {res.updatedAt}</span>
                    <span>By: {res.updatedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================
// 4. EMERGENCY RESPONSE (/admin/emergency)
// ============================================================
export const AdminEmergencyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'alerts' ? 'alerts' : 'active';

  const { emergencyRequests } = useApp();
  const [alerts, setAlerts] = useState(initialRegionalAlerts);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Subtab Bar */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2">
          <button
            onClick={() => setSearchParams({ tab: 'active' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emergency/15 text-emergency border border-emergency/30 shadow-sm'
                : 'text-secondary-text hover:bg-white/5'
            }`}
          >
            🚨 Active SOS Requests ({emergencyRequests.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'alerts' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-warning/15 text-warning border border-warning/30 shadow-sm'
                : 'text-secondary-text hover:bg-white/5'
            }`}
          >
            🔔 Emergency Alerts ({alerts.filter(a => !a.acknowledged).length} New)
          </button>
        </div>
      </div>

      {activeTab === 'alerts' ? (
        /* EMERGENCY ALERTS VIEW (DISTINCT SYSTEM ALERTS DATA) */
        <Card className="p-6 border border-white/5 space-y-4">
          <div>
            <h3 className="font-heading font-black text-base text-primary-text">Regional System Emergency Alerts</h3>
            <p className="text-xs text-muted-text mt-0.5">High-priority regional capacity warnings and emergency escalations requiring command oversight.</p>
          </div>

          <div className="space-y-3">
            {alerts.map(alt => (
              <div key={alt.id} className={`p-4 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                alt.urgency === 'Critical' ? 'bg-emergency/5 border-emergency/25' : alt.urgency === 'Warning' ? 'bg-warning/5 border-warning/25' : 'bg-white/[0.01] border-white/5'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      alt.urgency === 'Critical' ? 'bg-emergency text-white' : alt.urgency === 'Warning' ? 'bg-warning text-primary-bg-deep' : 'bg-medical-teal/20 text-medical-teal'
                    }`}>
                      {alt.urgency}
                    </span>
                    <h4 className="text-xs font-bold text-primary-text">{alt.title}</h4>
                    <span className="text-[10px] text-muted-text">• {alt.facilityName}</span>
                  </div>
                  <p className="text-xs text-secondary-text leading-normal">{alt.description}</p>
                  <span className="text-[9.5px] text-muted-text block">{alt.timestamp}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {alt.acknowledged ? (
                    <span className="text-[10px] font-bold text-success bg-success/15 px-3 py-1 rounded-lg border border-success/30 flex items-center gap-1">
                      <Check size={12} /> Acknowledged
                    </span>
                  ) : (
                    <Button variant="primary" size="sm" className="text-[10px] py-1.5" onClick={() => handleAcknowledge(alt.id)}>
                      Acknowledge Alert
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        /* ACTIVE REQUESTS VIEW */
        <Card className="p-6 border border-white/5 space-y-4">
          <div>
            <h3 className="font-heading font-black text-base text-primary-text">Active Emergency Callout Registry</h3>
            <p className="text-xs text-muted-text mt-0.5">Live emergency dispatch calls submitted across Ratnagiri network facilities.</p>
          </div>

          <div className="space-y-3">
            {emergencyRequests.map(req => (
              <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-medical-teal">{req.id}</span>
                    <h4 className="text-xs font-bold text-primary-text">{req.emergencyType}</h4>
                  </div>
                  <p className="text-[11px] text-muted-text mt-1">
                    Location: <strong className="text-primary-text">{req.location}</strong> • Patient: {req.patientName} (Ref: {req.patientReference || 'P-401'})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    req.priority === 'Critical' ? 'bg-emergency/20 text-emergency border border-emergency/30' : 'bg-warning/20 text-warning border border-warning/30'
                  }`}>
                    {req.priority || 'Critical'}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================
// 5. ADMIN BLOOD REQUESTS (/admin/blood)
// ============================================================
export const AdminBloodPage: React.FC = () => {
  const { bloodRequests, refreshState } = useApp();

  const handleApprove = (id: string) => {
    const list = db.getBloodRequests();
    const updated = list.map(b => b.id === id ? { ...b, status: 'Approved' as const } : b);
    db.saveBloodRequests(updated);
    refreshState();
  };

  return (
    <Card className="p-8 border border-white/5 text-left space-y-6">
      <div>
        <h3 className="font-heading font-black text-base text-primary-text">Emergency Blood Demands & Allocations</h3>
        <p className="text-xs text-muted-text mt-0.5">Audit regional blood bank reservation holds across network facilities.</p>
      </div>

      <div className="space-y-3">
        {bloodRequests.map(req => (
          <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emergency/15 text-emergency font-black text-[11px] rounded border border-emergency/30">
                  {req.bloodGroup}
                </span>
                <h4 className="font-bold text-primary-text">{req.unitsRequired} Units Required</h4>
              </div>
              <p className="text-[11px] text-muted-text mt-1">Facility: {req.hospitalName} • Patient: {req.patientName}</p>
            </div>

            <div className="flex items-center gap-4">
              <StatusBadge status={req.status} />
              {req.status === 'Pending' && (
                <Button variant="primary" size="sm" className="text-[10px] py-1 px-3" onClick={() => handleApprove(req.id)}>
                  Release Hold
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============================================================
// 6. REGIONAL INTELLIGENCE (/admin/regional-intelligence)
// ============================================================
export const AdminRegionalIntelligencePage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="font-heading font-black text-lg text-primary-text">Analytics Center & Regional Telemetry</h3>
        <p className="text-xs text-muted-text mt-0.5">Aggregate performance metrics and resource utilization curves across Ratnagiri District.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-white/5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-primary-text uppercase tracking-tight">ICU Pressure Indices</h4>
            <p className="text-[10px] text-muted-text">Peak critical ward occupancy loads over 24h cycle</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resourceTrendData}>
                <defs>
                  <linearGradient id="icuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55E0C1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#55E0C1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#162238', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="icuPressure" stroke="#55E0C1" fillOpacity={1} fill="url(#icuGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border border-white/5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-primary-text uppercase tracking-tight">Surge SOS Call Volume</h4>
            <p className="text-[10px] text-muted-text">Live emergency callout trigger frequencies</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resourceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#162238', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Line type="monotone" dataKey="emergencies" stroke="#FF6B6B" strokeWidth={3} dot={{ fill: '#FF6B6B', strokeWidth: 1 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border border-white/5 col-span-full space-y-4">
          <div>
            <h4 className="text-xs font-bold text-primary-text uppercase tracking-tight">Blood Demands & Inventory Reserving Rates</h4>
            <p className="text-[10px] text-muted-text">Dynamic search reserve triggers by group</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#162238', borderColor: 'rgba(255,255,255,0.08)' }} />
                <Bar dataKey="bloodDemand" fill="#60A5FA" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================
// 7. AUDIT LOGS DATA TABLE (/admin/audit-logs)
// ============================================================
export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <Card className="p-8 border border-white/5 text-left space-y-6">
      <div className="flex items-center gap-2">
        <FileCode size={20} className="text-medical-teal" />
        <div>
          <h3 className="font-heading font-black text-base text-primary-text">Compliance Audit Trail</h3>
          <p className="text-xs text-muted-text mt-0.5">Immutable event history auditing all command operations.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-secondary-text font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3">Timestamp</th>
              <th className="py-3">Operator</th>
              <th className="py-3">Action Logged</th>
              <th className="py-3">Sector Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.01]">
                <td className="py-3 text-muted-text font-mono text-[11px]">
                  {log.timestamp.includes('T') ? log.timestamp.split('T')[1].substring(0, 8) : log.timestamp}
                </td>
                <td className="py-3 font-bold text-primary-text">{log.actorName}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5 font-semibold text-[10px] text-secondary-text">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 text-muted-text">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ============================================================
// 8. ADMIN USERS DIRECTORY (/admin/users)
// ============================================================
export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  return (
    <Card className="p-8 border border-white/5 text-left space-y-6">
      <div>
        <h3 className="font-heading font-black text-base text-primary-text">User Accounts Directory</h3>
        <p className="text-xs text-muted-text mt-0.5">Authorized system operators, hospital administrators, and registered patient accounts.</p>
      </div>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
            <div>
              <h4 className="font-bold text-primary-text">{u.name}</h4>
              <span className="text-[11px] text-muted-text">{u.email}</span>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
              u.role === 'super_admin' ? 'bg-emergency/15 text-emergency border border-emergency/30' : u.role === 'hospital_admin' ? 'bg-medical-teal/15 text-medical-teal border border-medical-teal/30' : 'bg-white/5 text-secondary-text border border-white/10'
            }`}>
              {u.role.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
