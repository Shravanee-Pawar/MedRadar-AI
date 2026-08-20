import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CustomSelect } from '../components/CustomSelect';
import { InteractiveMap } from '../components/InteractiveMap';
import { StatusBadge } from '../components/StatusBadge';
import { ReadinessScore } from '../components/ReadinessScore';
import { hospitalService } from '../services/hospitalService';
import {
  doctorService
} from '../services/doctorService';
import {
  emergencyService
} from '../services/emergencyService';
import {
  Check,
  Plus,
  RotateCw,
  Droplet,
  Users,
  Flame,
  MapPin,
  Activity,
  ExternalLink,
  AlertCircle,
  GitCompare,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Database,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Hospital, type HospitalResource, type Doctor, type Ambulance, type BloodInventory, type BloodRequest, type TransferRequest, type EmergencyRequest } from '../types';

// ============================================================
// 1. HOSPITAL DASHBOARD PANEL (/hospital/dashboard)
// ============================================================
export const HospitalDashboardPage: React.FC = () => {
  const { currentUser, hospitals, resources } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2'; // Default to Parkar Hospital for demo
  
  const myHosp = hospitals.find(h => h.id === hospitalId);
  const myResources = resources.filter(r => r.hospitalId === hospitalId);

  return (
    <div className="space-y-6">
      {myHosp && (
        <Card className="p-8 border border-white/5 relative overflow-hidden bg-gradient-to-r from-secondary-surface to-primary-bg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-medical-teal/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-medical-teal">Hospital Operations</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${myHosp.verified ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                  {myHosp.verified ? 'Verified Node' : 'Verification Pending'}
                </span>
              </div>
              <h3 className="font-heading font-black text-xl text-primary-text mt-2">{myHosp.name}</h3>
              <p className="text-xs text-muted-text mt-1">{myHosp.address}, {myHosp.city}</p>
            </div>

            <ReadinessScore score={myHosp.readinessScore} />
          </div>
        </Card>
      )}

      {/* Roster fast gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {myResources.slice(0, 3).map((res) => {
          const percentage = Math.round(((res.total - res.available) / res.total) * 100);
          return (
            <Card key={res.id} className="p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider">{res.resourceName}</span>
                  <h4 className="font-heading font-black text-lg text-primary-text mt-1">
                    {res.available} <span className="text-xs text-muted-text font-medium">/ {res.total} Free</span>
                  </h4>
                </div>
                <StatusBadge status={res.status} />
              </div>

              {/* Progress occupancy bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-secondary-text">
                  <span>Occupancy Load</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${percentage > 85 ? 'bg-emergency' : percentage > 50 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 2A. RESOURCE DASHBOARD (/hospital/resources)
// ============================================================
export const HospitalResourcesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, resources } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const myResources = resources.filter(r => r.hospitalId === hospitalId);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-teal/10 border border-medical-teal/20 text-medical-teal flex items-center justify-center">
              <Database size={22} />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">Resource Dashboard</h3>
              <p className="text-xs text-muted-text mt-0.5">
                Overview telemetry of reported hospital bed capacity, respiratory support, and emergency stock.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/hospital/resources?tab=beds')}>
            ICU & Beds →
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/hospital/resources?tab=respiratory')}>
            Ventilators & Oxygen →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myResources.map(res => {
          const isStale = res.status === 'Stale';
          const ratio = Math.round((res.available / Math.max(1, res.total)) * 100);

          return (
            <Card key={res.id} className="p-6 border border-white/5 bg-white/[0.02] space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading font-black text-base text-primary-text">{res.resourceName}</h4>
                  <p className="text-xs text-muted-text mt-0.5">{res.available} Available / {res.total} Total {res.unit || ''}</p>
                </div>
                <StatusBadge status={res.status} />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-text font-bold">
                  <span>Capacity Utilization</span>
                  <span>{100 - ratio}% Occupied</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      res.status === 'Critical' ? 'bg-emergency' : res.status === 'Limited' ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${100 - ratio}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-muted-text font-semibold">
                  {isStale ? `⚠ Stale — ${res.updatedAt}` : `Updated: ${res.updatedAt.includes('T') ? 'Just now' : res.updatedAt}`}
                </span>
                <button
                  onClick={() => {
                    if (res.resourceType.includes('bed')) {
                      navigate('/hospital/resources?tab=beds');
                    } else {
                      navigate('/hospital/resources?tab=respiratory');
                    }
                  }}
                  className="text-medical-teal hover:underline text-xs font-bold cursor-pointer"
                >
                  Manage →
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 2B. ICU & BEDS PAGE (/hospital/resources?tab=beds)
// ============================================================
export const HospitalICUBedsPage: React.FC = () => {
  const { currentUser, resources, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const [editingRes, setEditingRes] = useState<HospitalResource | null>(null);
  const [totalVal, setTotalVal] = useState(0);
  const [occupiedVal, setOccupiedVal] = useState(0);
  const [reservedVal, setReservedVal] = useState(0);
  const [updateReason, setUpdateReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const bedResources = resources.filter(r => r.hospitalId === hospitalId && (r.resourceType.includes('bed') || r.resourceType.includes('capacity')));

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenUpdate = (res: HospitalResource) => {
    setEditingRes(res);
    setTotalVal(res.total);
    setOccupiedVal(res.occupied || Math.max(0, res.total - res.available));
    setReservedVal(res.reserved || 0);
    setUpdateReason('');
  };

  const availableCalc = Math.max(0, totalVal - occupiedVal - reservedVal);
  const isInvalid = (occupiedVal + reservedVal) > totalVal;

  const handleSaveBedUpdate = () => {
    if (!editingRes || isInvalid) return;

    const allResources = db.getResources();
    const ratio = availableCalc / Math.max(1, totalVal);
    const calculatedStatus: HospitalResource['status'] = ratio === 0 ? 'Critical' : ratio <= 0.3 ? 'Limited' : 'Available';

    const updatedList = allResources.map(item => {
      if (item.id === editingRes.id) {
        const historyItem = {
          available: availableCalc,
          total: totalVal,
          timestamp: 'Just now',
          updatedBy: currentUser?.name || 'Hospital Admin',
          reason: updateReason || undefined
        };
        return {
          ...item,
          total: totalVal,
          available: availableCalc,
          occupied: occupiedVal,
          reserved: reservedVal,
          status: calculatedStatus,
          updatedAt: 'Just now',
          updatedBy: currentUser?.name || 'Hospital Admin',
          updateHistory: [historyItem, ...(item.updateHistory || [])]
        };
      }
      return item;
    });

    db.saveResources(updatedList);

    // Recalculate hospital readiness score
    const nextReadiness = hospitalService.calculateReadinessScore(hospitalId, updatedList.filter(r => r.hospitalId === hospitalId));
    const hospitals = db.getHospitals();
    const updatedHospitals = hospitals.map(h => h.id === hospitalId ? { ...h, readinessScore: nextReadiness, updatedAt: 'Just now' } : h);
    db.saveHospitals(updatedHospitals);

    refreshState();
    setEditingRes(null);
    triggerToast(`✓ ${editingRes.resourceName} availability updated successfully. Updated just now.`);
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

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-teal/10 border border-medical-teal/20 text-medical-teal flex items-center justify-center font-black">
              <Database size={22} />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">ICU & Beds</h3>
              <p className="text-xs text-muted-text mt-0.5">
                Monitor and update current bed capacity across hospital units.
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-success bg-success/15 px-3 py-1 rounded-lg border border-success/30">
          🟢 Operational Bed Units
        </span>
      </div>

      {/* Bed Units Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bedResources.map(res => {
          const total = res.total || 20;
          const available = res.available;
          const occupied = res.occupied ?? (total - available);
          const reserved = res.reserved ?? 0;
          const occupancyPct = Math.round((occupied / Math.max(1, total)) * 100);
          const isStale = res.status === 'Stale';

          return (
            <Card key={res.id} className="p-6 border border-white/5 bg-white/[0.02] space-y-5">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-heading font-black text-lg text-primary-text">{res.resourceName}</h4>
                  <p className="text-xs text-muted-text mt-0.5">
                    {isStale ? (
                      <span className="text-warning font-bold">⚠ Stale — Updated {res.updatedAt}</span>
                    ) : (
                      <span>Last updated: {res.updatedAt.includes('T') ? 'Just now' : res.updatedAt}</span>
                    )}
                  </p>
                </div>
                <StatusBadge status={res.status} />
              </div>

              {/* Counter Chips */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-success/10 border border-success/20">
                  <span className="text-[9px] text-muted-text uppercase font-bold block">Available</span>
                  <strong className="text-success font-black text-sm">{available}</strong>
                </div>
                <div className="p-2 rounded-xl bg-warning/10 border border-warning/20">
                  <span className="text-[9px] text-muted-text uppercase font-bold block">Occupied</span>
                  <strong className="text-warning font-black text-sm">{occupied}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] text-muted-text uppercase font-bold block">Reserved</span>
                  <strong className="text-secondary-text font-black text-sm">{reserved}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[9px] text-muted-text uppercase font-bold block">Total</span>
                  <strong className="text-primary-text font-black text-sm">{total}</strong>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-text font-bold">
                  <span>Occupancy Rate</span>
                  <span className="text-primary-text">{occupancyPct}%</span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      occupancyPct > 90 ? 'bg-emergency' : occupancyPct > 70 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => handleOpenUpdate(res)}>
                  Update Availability
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* RECENT RESOURCE UPDATES LOG */}
      <Card className="p-6 border border-white/5 bg-white/[0.02] space-y-4">
        <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wider">Recent Bed Updates</h4>
        <div className="divide-y divide-white/5 text-xs">
          {bedResources.flatMap(r => (r.updateHistory || []).map((h, i) => ({ ...h, name: r.resourceName, key: `${r.id}-${i}` }))).slice(0, 5).map(item => (
            <div key={item.key} className="py-3 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-primary-text">{item.name}</h5>
                <p className="text-[11px] text-muted-text">{item.available} available / {item.total} total {item.reason ? `• ${item.reason}` : ''}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-text block">{item.timestamp}</span>
                <span className="text-[10px] font-semibold text-medical-teal">By: {item.updatedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* UPDATE BED AVAILABILITY MODAL */}
      <AnimatePresence>
        {editingRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/75 backdrop-blur-sm" onClick={() => setEditingRes(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="z-10 w-full max-w-md bg-primary-bg-deep border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div>
                <h4 className="font-heading font-black text-lg text-primary-text">Update {editingRes.resourceName}</h4>
                <p className="text-xs text-muted-text mt-0.5">Adjust capacity telemetry values for this unit.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={totalVal}
                    onChange={(e) => setTotalVal(parseInt(e.target.value) || 0)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Occupied Beds</label>
                    <input
                      type="number"
                      min="0"
                      value={occupiedVal}
                      onChange={(e) => setOccupiedVal(parseInt(e.target.value) || 0)}
                      className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Reserved Beds</label>
                    <input
                      type="number"
                      min="0"
                      value={reservedVal}
                      onChange={(e) => setReservedVal(parseInt(e.target.value) || 0)}
                      className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-muted-text font-bold">Auto-Calculated Available:</span>
                  <strong className="text-success font-black text-sm">{availableCalc} Beds</strong>
                </div>

                {isInvalid && (
                  <p className="text-[11px] text-emergency font-bold bg-emergency/10 border border-emergency/20 p-2.5 rounded-xl">
                    ⚠ Error: Occupied ({occupiedVal}) + Reserved ({reservedVal}) cannot exceed Total Capacity ({totalVal}).
                  </p>
                )}

                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Reason for Update (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Patient discharged from ICU unit"
                    value={updateReason}
                    onChange={(e) => setUpdateReason(e.target.value)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button variant="secondary" onClick={() => setEditingRes(null)}>Cancel</Button>
                <Button variant="primary" disabled={isInvalid} onClick={handleSaveBedUpdate}>Save Bed Availability</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 2C. VENTILATORS & OXYGEN PAGE (/hospital/resources?tab=respiratory)
// ============================================================
export const HospitalVentilatorsOxygenPage: React.FC = () => {
  const { currentUser, resources, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const [editingVent, setEditingVent] = useState<HospitalResource | null>(null);
  const [ventTotal, setVentTotal] = useState(0);
  const [ventInUse, setVentInUse] = useState(0);
  const [ventMaint, setVentMaint] = useState(0);

  const [editingOxy, setEditingOxy] = useState<HospitalResource | null>(null);
  const [oxyTotal, setOxyTotal] = useState(0);
  const [oxyAvail, setOxyAvail] = useState(0);

  const [updateReason, setUpdateReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const ventilatorRes = resources.find(r => r.hospitalId === hospitalId && r.resourceType === 'ventilators');
  const oxygenRes = resources.find(r => r.hospitalId === hospitalId && r.resourceType === 'oxygen_kl');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenVentModal = () => {
    if (!ventilatorRes) return;
    setEditingVent(ventilatorRes);
    setVentTotal(ventilatorRes.total);
    setVentInUse(ventilatorRes.occupied || (ventilatorRes.total - ventilatorRes.available));
    setVentMaint(ventilatorRes.maintenance || 0);
    setUpdateReason('');
  };

  const ventAvailCalc = Math.max(0, ventTotal - ventInUse - ventMaint);
  const isVentInvalid = (ventInUse + ventMaint) > ventTotal;

  const handleSaveVentilatorUpdate = () => {
    if (!ventilatorRes || isVentInvalid) return;

    const allResources = db.getResources();
    const ratio = ventAvailCalc / Math.max(1, ventTotal);
    const calculatedStatus: HospitalResource['status'] = ratio === 0 ? 'Critical' : ratio <= 0.3 ? 'Limited' : 'Available';

    const updatedList = allResources.map(item => {
      if (item.id === ventilatorRes.id) {
        const historyItem = {
          available: ventAvailCalc,
          total: ventTotal,
          timestamp: 'Just now',
          updatedBy: currentUser?.name || 'Hospital Admin',
          reason: updateReason || undefined
        };
        return {
          ...item,
          total: ventTotal,
          available: ventAvailCalc,
          occupied: ventInUse,
          maintenance: ventMaint,
          status: calculatedStatus,
          updatedAt: 'Just now',
          updatedBy: currentUser?.name || 'Hospital Admin',
          updateHistory: [historyItem, ...(item.updateHistory || [])]
        };
      }
      return item;
    });

    db.saveResources(updatedList);
    const nextReadiness = hospitalService.calculateReadinessScore(hospitalId, updatedList.filter(r => r.hospitalId === hospitalId));
    const hospitals = db.getHospitals();
    db.saveHospitals(hospitals.map(h => h.id === hospitalId ? { ...h, readinessScore: nextReadiness, updatedAt: 'Just now' } : h));

    refreshState();
    setEditingVent(null);
    triggerToast('✓ Ventilator availability updated successfully. Updated just now.');
  };

  const handleOpenOxyModal = () => {
    if (!oxygenRes) return;
    setEditingOxy(oxygenRes);
    setOxyTotal(oxygenRes.total);
    setOxyAvail(oxygenRes.available);
    setUpdateReason('');
  };

  const isOxyInvalid = oxyAvail > oxyTotal;

  const handleSaveOxygenUpdate = () => {
    if (!oxygenRes || isOxyInvalid) return;

    const allResources = db.getResources();
    const ratio = oxyAvail / Math.max(1, oxyTotal);
    const calculatedStatus: HospitalResource['status'] = ratio < 0.2 ? 'Critical' : ratio <= 0.5 ? 'Limited' : 'Available';

    const updatedList = allResources.map(item => {
      if (item.id === oxygenRes.id) {
        const historyItem = {
          available: oxyAvail,
          total: oxyTotal,
          timestamp: 'Just now',
          updatedBy: currentUser?.name || 'Hospital Admin',
          reason: updateReason || undefined
        };
        return {
          ...item,
          total: oxyTotal,
          available: oxyAvail,
          occupied: Math.max(0, oxyTotal - oxyAvail),
          status: calculatedStatus,
          updatedAt: 'Just now',
          updatedBy: currentUser?.name || 'Hospital Admin',
          updateHistory: [historyItem, ...(item.updateHistory || [])]
        };
      }
      return item;
    });

    db.saveResources(updatedList);
    const nextReadiness = hospitalService.calculateReadinessScore(hospitalId, updatedList.filter(r => r.hospitalId === hospitalId));
    const hospitals = db.getHospitals();
    db.saveHospitals(hospitals.map(h => h.id === hospitalId ? { ...h, readinessScore: nextReadiness, updatedAt: 'Just now' } : h));

    refreshState();
    setEditingOxy(null);
    triggerToast('✓ Liquid Oxygen capacity updated successfully. Updated just now.');
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

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-teal/10 border border-medical-teal/20 text-medical-teal flex items-center justify-center font-black">
              <Wind size={22} />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">Ventilators & Oxygen</h3>
              <p className="text-xs text-muted-text mt-0.5">
                Monitor critical respiratory-support resources and liquid oxygen capacity.
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-medical-teal bg-medical-teal/15 px-3 py-1 rounded-lg border border-medical-teal/30">
          💨 Critical Respiratory Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VENTILATORS CARD */}
        {ventilatorRes && (
          <Card className="p-6 border border-white/5 bg-white/[0.02] space-y-5">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h4 className="font-heading font-black text-lg text-primary-text">Ventilator Fleet</h4>
                <p className="text-xs text-muted-text mt-0.5">
                  Last updated: {ventilatorRes.updatedAt.includes('T') ? 'Just now' : ventilatorRes.updatedAt}
                </p>
              </div>
              <StatusBadge status={ventilatorRes.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-success/10 border border-success/20">
                <span className="text-[10px] text-muted-text uppercase font-bold block">Available</span>
                <strong className="text-success font-black text-base">{ventilatorRes.available}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/20">
                <span className="text-[10px] text-muted-text uppercase font-bold block">In Use</span>
                <strong className="text-warning font-black text-base">{ventilatorRes.occupied || (ventilatorRes.total - ventilatorRes.available)}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-muted-text uppercase font-bold block">Total</span>
                <strong className="text-primary-text font-black text-base">{ventilatorRes.total}</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleOpenVentModal}>
                Update Availability
              </Button>
            </div>
          </Card>
        )}

        {/* OXYGEN CAPACITY CARD */}
        {oxygenRes && (
          <Card className="p-6 border border-white/5 bg-white/[0.02] space-y-5">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h4 className="font-heading font-black text-lg text-primary-text">Liquid Oxygen Storage</h4>
                <p className="text-xs text-muted-text mt-0.5">
                  Last updated: {oxygenRes.updatedAt.includes('T') ? 'Just now' : oxygenRes.updatedAt}
                </p>
              </div>
              <StatusBadge status={oxygenRes.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-success/10 border border-success/20">
                <span className="text-[10px] text-muted-text uppercase font-bold block">Available</span>
                <strong className="text-success font-black text-base">{oxygenRes.available} KL</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/20">
                <span className="text-[10px] text-muted-text uppercase font-bold block">In Use / Consumed</span>
                <strong className="text-warning font-black text-base">{oxygenRes.total - oxygenRes.available} KL</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-muted-text uppercase font-bold block">Total Capacity</span>
                <strong className="text-primary-text font-black text-base">{oxygenRes.total} KL</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleOpenOxyModal}>
                Update Oxygen Availability
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* RECENT UPDATES LOG */}
      <Card className="p-6 border border-white/5 bg-white/[0.02] space-y-4">
        <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wider">Recent Respiratory & Oxygen Updates</h4>
        <div className="divide-y divide-white/5 text-xs">
          {[ventilatorRes, oxygenRes].filter(Boolean).flatMap(r => (r!.updateHistory || []).map((h, i) => ({ ...h, name: r!.resourceName, unit: r!.unit || '', key: `${r!.id}-${i}` }))).slice(0, 5).map(item => (
            <div key={item.key} className="py-3 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-primary-text">{item.name}</h5>
                <p className="text-[11px] text-muted-text">{item.available} {item.unit} available / {item.total} {item.unit} total {item.reason ? `• ${item.reason}` : ''}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-text block">{item.timestamp}</span>
                <span className="text-[10px] font-semibold text-medical-teal">By: {item.updatedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* VENTILATOR UPDATE MODAL */}
      <AnimatePresence>
        {editingVent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/75 backdrop-blur-sm" onClick={() => setEditingVent(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="z-10 w-full max-w-md bg-primary-bg-deep border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
              <div>
                <h4 className="font-heading font-black text-lg text-primary-text">Update Ventilator Telemetry</h4>
                <p className="text-xs text-muted-text mt-0.5">Specify active ventilator fleet parameters.</p>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Total Ventilators</label>
                  <input type="number" min="1" value={ventTotal} onChange={(e) => setVentTotal(parseInt(e.target.value) || 0)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">In Use</label>
                    <input type="number" min="0" value={ventInUse} onChange={(e) => setVentInUse(parseInt(e.target.value) || 0)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Maintenance</label>
                    <input type="number" min="0" value={ventMaint} onChange={(e) => setVentMaint(parseInt(e.target.value) || 0)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text" />
                  </div>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-muted-text font-bold">Auto-Calculated Available:</span>
                  <strong className="text-success font-black text-sm">{ventAvailCalc} Units</strong>
                </div>
                {isVentInvalid && (
                  <p className="text-[11px] text-emergency font-bold bg-emergency/10 border border-emergency/20 p-2.5 rounded-xl">
                    ⚠ Error: In Use ({ventInUse}) + Maintenance ({ventMaint}) cannot exceed Total ({ventTotal}).
                  </p>
                )}
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Reason for Update (Optional)</label>
                  <input type="text" placeholder="e.g. Unit returned from service" value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button variant="secondary" onClick={() => setEditingVent(null)}>Cancel</Button>
                <Button variant="primary" disabled={isVentInvalid} onClick={handleSaveVentilatorUpdate}>Save Ventilator Status</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OXYGEN UPDATE MODAL */}
      <AnimatePresence>
        {editingOxy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/75 backdrop-blur-sm" onClick={() => setEditingOxy(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="z-10 w-full max-w-md bg-primary-bg-deep border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
              <div>
                <h4 className="font-heading font-black text-lg text-primary-text">Update Liquid Oxygen Storage</h4>
                <p className="text-xs text-muted-text mt-0.5">Specify tank capacity and current available volume in KL.</p>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Total Tank Capacity (KL)</label>
                  <input type="number" min="1" value={oxyTotal} onChange={(e) => setOxyTotal(parseInt(e.target.value) || 0)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Available Quantity (KL)</label>
                  <input type="number" min="0" value={oxyAvail} onChange={(e) => setOxyAvail(parseInt(e.target.value) || 0)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text" />
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-muted-text font-bold">Current Usage:</span>
                  <strong className="text-warning font-black text-sm">{Math.max(0, oxyTotal - oxyAvail)} KL</strong>
                </div>
                {isOxyInvalid && (
                  <p className="text-[11px] text-emergency font-bold bg-emergency/10 border border-emergency/20 p-2.5 rounded-xl">
                    ⚠ Error: Available quantity ({oxyAvail} KL) cannot exceed Total Capacity ({oxyTotal} KL).
                  </p>
                )}
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Reason for Update (Optional)</label>
                  <input type="text" placeholder="e.g. Tank refilled by supplier" value={updateReason} onChange={(e) => setUpdateReason(e.target.value)} className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <Button variant="secondary" onClick={() => setEditingOxy(null)}>Cancel</Button>
                <Button variant="primary" disabled={isOxyInvalid} onClick={handleSaveOxygenUpdate}>Save Oxygen Status</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// MASTER RESOURCES DISPATCHER (/hospital/resources)
// ============================================================
export const HospitalResourcesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const activeTab = searchParams.get('tab') || (location.pathname.includes('/beds') ? 'beds' : location.pathname.includes('/respiratory') ? 'respiratory' : 'dashboard');

  if (activeTab === 'beds') {
    return <HospitalICUBedsPage />;
  }
  if (activeTab === 'respiratory' || activeTab === 'vent') {
    return <HospitalVentilatorsOxygenPage />;
  }
  return <HospitalResourcesDashboardPage />;
};

// ============================================================
// 3. STAFF & DOCTORS ROSTER (/hospital/doctors)
// ============================================================
export const HospitalDoctorsPage: React.FC = () => {
  const { currentUser, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Doc Form State
  const [docName, setDocName] = useState('');
  const [specialty, setSpecialty] = useState('Emergency Medicine');
  const [exp, setExp] = useState(10);
  const [qualification, setQualification] = useState('MBBS, MD');

  const fetchDocs = async () => {
    const list = await doctorService.getDoctorsByHospital(hospitalId);
    setDoctorsList(list);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    await doctorService.addDoctor({
      hospitalId,
      hospitalName: 'Parkar Hospital', // Default for demo
      name: docName,
      specialty,
      departmentId: 'dept-hosp-2-1',
      experienceYears: exp,
      qualification,
      status: 'Available',
      emergencyDuty: true
    });

    setDocName('');
    setShowAddForm(false);
    fetchDocs();
    refreshState();
  };

  const handleToggleDuty = async (docId: string, currentStatus: any, currentDuty: boolean) => {
    await doctorService.updateDoctorRoster(docId, currentStatus, !currentDuty);
    fetchDocs();
    refreshState();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-black text-base text-primary-text">Staff Roster & Duty Logs</h3>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
          <Plus size={14} className="mr-1" /> Add Specialist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctorsList.map(doc => {
          const spec = doc.specialization || doc.specialty;
          const avatar = doc.profileImage || doc.image;
          const statusVal = doc.availabilityStatus || doc.status;
          const exp = doc.experience || `${doc.experienceYears} years`;

          return (
            <Card key={doc.id} className="p-6 border border-white/5 space-y-4">
              <div className="flex items-center gap-4">
                <img src={avatar} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading font-black text-sm text-primary-text truncate">{doc.name}</h4>
                  <span className="text-[10px] text-medical-teal font-bold block truncate">{spec}</span>
                  <span className="text-[9px] text-muted-text block truncate">{doc.qualification} • {exp}</span>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-xs text-secondary-text space-y-2">
                <div className="flex justify-between items-center">
                  <span>Roster Availability:</span>
                  <StatusBadge status={statusVal as any} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Emergency Duty Call (24/7):</span>
                  <button
                    onClick={() => handleToggleDuty(doc.id, statusVal, doc.emergencyDuty)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      doc.emergencyDuty
                        ? 'bg-emergency/15 border-emergency/30 text-emergency'
                        : 'bg-white/5 border-white/10 text-muted-text'
                    }`}
                  >
                    {doc.emergencyDuty ? 'Active Call' : 'Off Duty'}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Specialist Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/70 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
            <motion.form onSubmit={handleAddDoctorSubmit} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 w-full max-w-md bg-secondary-surface border border-white/10 rounded-2xl p-8 shadow-2xl space-y-4 text-left">
              <h3 className="font-heading font-black text-base text-primary-text mb-4">Add Specialist to Roster</h3>
              
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Ajay Patil"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text bg-primary-bg"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Specialization Specialty</label>
                <CustomSelect
                  value={specialty}
                  onChange={(val) => setSpecialty(val)}
                  options={[
                    { value: 'Emergency Medicine', label: 'Emergency Medicine' },
                    { value: 'Cardiology', label: 'Cardiology' },
                    { value: 'Trauma Specialist', label: 'Trauma Specialist' },
                    { value: 'Neurology', label: 'Neurology' },
                    { value: 'Orthopedics', label: 'Orthopedics' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Exp (Years)</label>
                  <input
                    type="number"
                    value={exp}
                    onChange={(e) => setExp(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text bg-primary-bg"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text bg-primary-bg"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Commit Specialist</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 4. AMBULANCE FLEET (/hospital/ambulances)
// ============================================================
export const HospitalAmbulancesPage: React.FC = () => {
  const { currentUser, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const [ambulancesList, setAmbulancesList] = useState<Ambulance[]>([]);
  const [showAddAmb, setShowAddAmb] = useState(false);

  // Form states
  const [ambNo, setAmbNo] = useState('');
  const [ambType, setAmbType] = useState<'Basic Life Support' | 'Advanced Life Support' | 'Patient Transport' | 'Neonatal Ambulance'>('Advanced Life Support');

  const fetchAmbulances = async () => {
    const list = db.getAmbulances().filter(a => a.hospitalId === hospitalId);
    setAmbulancesList(list);
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambNo) return;

    await emergencyService.addAmbulance({
      hospitalId,
      hospitalName: 'Parkar Hospital',
      ambulanceNumber: ambNo,
      type: ambType,
      status: 'Available',
      equipment: ambType === 'Advanced Life Support' ? ['Ventilator', 'Defibrillator', 'Cardiac Monitor', 'Oxygen'] : ['Oxygen', 'First Aid Kit'],
      lastLocation: 'Hospital Base Yard',
      lat: 16.9912,
      lng: 73.3001
    });

    setAmbNo('');
    setShowAddAmb(false);
    fetchAmbulances();
    refreshState();
  };

  const handleToggleStatus = async (ambId: string, currentStatus: any, currentEq: string[]) => {
    const nextStatusMap: Record<string, 'Available' | 'On Trip' | 'At Hospital' | 'Maintenance' | 'Offline'> = {
      'Available': 'On Trip',
      'On Trip': 'Maintenance',
      'Maintenance': 'Available'
    };
    const nextStatus = nextStatusMap[currentStatus] || 'Available';
    await emergencyService.updateAmbulanceStatus(ambId, nextStatus, currentEq);
    fetchAmbulances();
    refreshState();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading font-black text-base text-primary-text">Emergency Ambulance Fleet</h3>
        <Button variant="primary" size="sm" onClick={() => setShowAddAmb(true)}>
          <Plus size={14} className="mr-1" /> Add Ambulance Unit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ambulancesList.map(a => (
          <Card key={a.id} className="p-6 border border-white/5 space-y-4 text-left">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider block">{a.type}</span>
                <h4 className="font-heading font-black text-sm text-primary-text mt-0.5">{a.ambulanceNumber}</h4>
              </div>
              <StatusBadge status={a.status} />
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-xs text-secondary-text space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block text-muted-text">On-Board Life Support</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {a.equipment.map((eq, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-[9px] text-primary-text">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] text-muted-text">Coordination:</span>
                <button
                  onClick={() => handleToggleStatus(a.id, a.status, a.equipment)}
                  className="text-[10px] text-medical-teal font-black hover:underline inline-flex items-center gap-1"
                >
                  <RotateCw size={10} /> Toggle Dispatch Status
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Ambulance modal */}
      <AnimatePresence>
        {showAddAmb && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/70 backdrop-blur-sm" onClick={() => setShowAddAmb(false)} />
            <motion.form onSubmit={handleAddAmbulance} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 w-full max-w-md bg-secondary-surface border border-white/10 rounded-2xl p-8 shadow-2xl space-y-4 text-left">
              <h3 className="font-heading font-black text-base text-primary-text mb-4">Register New Ambulance Unit</h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Registration Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MH-08-AG-5005"
                  value={ambNo}
                  onChange={(e) => setAmbNo(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text bg-primary-bg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Life Support Classification</label>
                <CustomSelect
                  value={ambType}
                  onChange={(val) => setAmbType(val as any)}
                  options={[
                    { value: 'Advanced Life Support', label: 'Advanced Life Support (ALS)' },
                    { value: 'Basic Life Support', label: 'Basic Life Support (BLS)' },
                    { value: 'Patient Transport', label: 'Patient Transport Unit (PTU)' },
                    { value: 'Neonatal Ambulance', label: 'Neonatal Ambulance' }
                  ]}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowAddAmb(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Commit Unit</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 5. HOSPITAL PROFILE PAGE (/hospital/profile)
// ============================================================
export const HospitalProfilePage: React.FC = () => {
  const { currentUser, hospitals, resources, bloodInventory, updateLogs, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';
  const hosp = hospitals.find(h => h.id === hospitalId);
  const myResources = resources.filter(r => r.hospitalId === hospitalId);
  const myBlood = bloodInventory.filter(b => b.hospitalId === hospitalId);
  const myLogs = updateLogs.filter(l => l.hospitalId === hospitalId).slice(0, 5);

  // States for dynamic inventory changes
  const [editingBlood, setEditingBlood] = useState<{ id: string; group: string; units: number } | null>(null);

  const handleUpdateBloodUnits = () => {
    if (!editingBlood) return;
    const allBlood = db.getBloodInventory();
    const updated = allBlood.map(b => {
      if (b.id === editingBlood.id) {
        const status = editingBlood.units === 0 ? 'Critical' : editingBlood.units <= 4 ? 'Limited' : 'Available';
        return {
          ...b,
          unitsAvailable: editingBlood.units,
          status: status as any,
          updatedAt: 'Just now'
        };
      }
      return b;
    });
    db.saveBloodInventory(updated);
    
    // Log the change
    const audits = db.getAuditLogs();
    audits.unshift({
      id: `aud-${Date.now()}`,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Hospital Admin',
      actorRole: 'hospital_admin',
      action: `Modified Blood Inventory for ${editingBlood.group} to ${editingBlood.units} units`,
      entityType: 'BloodInventory',
      entityId: editingBlood.id,
      details: `Updated count to ${editingBlood.units}`,
      timestamp: 'Just now'
    });
    db.saveAuditLogs(audits);

    setEditingBlood(null);
    refreshState();
  };

  if (!hosp) {
    return (
      <Card className="p-8 border border-white/5 text-center text-xs text-muted-text">
        Loading profile credentials...
      </Card>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* 1. Header Banner */}
      <div className="relative h-60 rounded-3xl overflow-hidden border border-white/5 bg-[#0B1220]">
        <img 
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&fit=crop"
          alt={hosp.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${hosp.verified ? 'bg-success/15 text-success border border-success/35' : 'bg-warning/15 text-warning border border-warning/35'}`}>
                {hosp.verified ? '✓ Verified Grid Node' : 'Awaiting Audit'}
              </span>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-secondary-text font-mono">
                REG: {hosp.registrationNumber}
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl md:text-3xl text-primary-text">{hosp.name}</h2>
            <p className="text-xs text-secondary-text">{hosp.address}, {hosp.city}, Maharashtra</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-text uppercase font-bold tracking-wider">Status:</span>
            <StatusBadge status={hosp.emergencyStatus} />
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Deck */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-text">Administrative Quick Actions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Update Resources', icon: Activity, desc: 'Sync telemetry counts', action: () => alert('Redirecting to Resource Monitor...') },
            { label: 'Add Doctor', icon: Users, desc: 'Schedule available shifts', action: () => alert('Redirecting to On-Call Directory...') },
            { label: 'Add Ambulance', icon: Flame, desc: 'Enlist new fleet assets', action: () => alert('Redirecting to Ambulance Roster...') },
            { label: 'Blood Request', icon: Droplet, desc: 'Dispatch reserves request', action: () => alert('Initiating priority blood collection form...') },
            { label: 'Emergency Alerts', icon: AlertCircle, desc: 'Publish grid notifications', action: () => alert('Opening Emergency Alerts composer...') }
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={act.action}
                className="p-4 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-medical-teal/30 rounded-2xl text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-medical-teal/10 text-medical-teal flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={16} />
                </div>
                <h5 className="text-xs font-bold text-primary-text group-hover:text-medical-teal transition-colors">{act.label}</h5>
                <p className="text-[9px] text-muted-text mt-0.5 leading-normal">{act.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top Resource Metric Cards */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-text">Live Resource Readiness Telemetry</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {myResources.map(r => (
            <div key={r.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-text block">{r.resourceName.replace('_', ' ')}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-primary-text">{r.available}</span>
                <span className="text-xs text-muted-text">/ {r.total}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] pt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${r.available === 0 ? 'bg-emergency animate-pulse' : r.available <= 2 ? 'bg-warning' : 'bg-success'}`} />
                <span className="text-secondary-text font-bold">{r.available === 0 ? 'Critical' : r.available <= 2 ? 'Limited' : 'Optimal'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Split Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Blood Bank & Departments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Blood Inventory with inline edit */}
          <Card className="p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-baseline">
              <div>
                <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wide">Emergency Blood Stock Inventory</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Admin access: Modify units count in real time.</p>
              </div>
              <span className="text-[9px] text-medical-teal font-black uppercase tracking-wider">All 8 Blood Groups</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {myBlood.map(b => (
                <button
                  key={b.id}
                  onClick={() => setEditingBlood({ id: b.id, group: b.bloodGroup, units: b.unitsAvailable })}
                  className="p-3 bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-left transition-all"
                >
                  <div>
                    <span className="text-xs font-black text-primary-text block">{b.bloodGroup}</span>
                    <span className="text-[10px] text-muted-text font-bold">{b.unitsAvailable} Units</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${b.unitsAvailable === 0 ? 'bg-emergency' : b.unitsAvailable <= 4 ? 'bg-warning' : 'bg-success'}`} />
                </button>
              ))}
            </div>

            {/* Editing Blood Modal Panel */}
            {editingBlood && (
              <div className="p-4 bg-medical-teal/5 border border-medical-teal/20 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-medical-teal">Modify Group {editingBlood.group} Reserve Units</h5>
                  <button onClick={() => setEditingBlood(null)} className="text-xs text-muted-text hover:text-primary-text">✕</button>
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={editingBlood.units}
                    onChange={(e) => setEditingBlood(prev => prev ? { ...prev, units: parseInt(e.target.value) || 0 } : null)}
                    min="0"
                    className="w-24 px-3 py-1.5 text-xs rounded-lg glass-input text-primary-text"
                  />
                  <Button variant="primary" size="sm" className="text-xs font-bold py-1.5" onClick={handleUpdateBloodUnits}>
                    Save Units Count
                  </Button>
                </div>
              </div>
            )}

            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-muted-text">
              <p>⚠️ <strong>Reported availability</strong> — Confirm availability with provider. Dynamic blood stocks are marked as <strong>Demo / Simulated Data</strong>.</p>
            </div>
          </Card>

          {/* Departments Panel */}
          <Card className="p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-baseline">
              <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wide">Registered Specialist Departments</h4>
              <button onClick={() => alert('View All Departments Roster')} className="text-[9px] text-medical-teal font-black hover:underline uppercase">View All</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Pediatrics', 'Gynecology', 'Emergency Medicine', 'Critical Care', 'Radiology', 'ENT', 'Ophthalmology', 'Pathology'].map(dept => (
                <span key={dept} className="px-3 py-1.5 rounded-lg border border-white/5 bg-[#0F172A] text-[10px] text-secondary-text font-semibold hover:border-medical-teal/20 transition-colors">
                  {dept}
                </span>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column: Information, Recent logs, GPS coordinates */}
        <div className="space-y-6">
          
          {/* Hospital Information Card */}
          <Card className="p-6 border border-white/5 space-y-4">
            <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wide">Hospital Information</h4>
            <div className="space-y-2.5 text-xs text-secondary-text">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Facility Type:</span>
                <strong className="text-primary-text">{hosp.type}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Established Year:</span>
                <strong className="text-primary-text">2014</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>General Capacity:</span>
                <strong className="text-primary-text">120 Beds</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Emergency Services:</span>
                <strong className="text-success">Available 24/7</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Accident & Trauma:</span>
                <strong className="text-success">Level I Facility</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Web Portal:</span>
                <a href="https://medradar.ai" target="_blank" rel="noreferrer" className="text-medical-teal hover:underline inline-flex items-center gap-0.5">
                  Visit site <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </Card>

          {/* Hospital Location Card */}
          <Card className="p-6 border border-white/5 space-y-4">
            <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wide">Hospital Coordinates</h4>
            <div className="space-y-3">
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5 text-[11px] text-secondary-text">
                <div className="flex justify-between">
                  <span>Latitude:</span>
                  <strong className="text-primary-text font-mono">{hosp.lat.toFixed(6)} N</strong>
                </div>
                <div className="flex justify-between">
                  <span>Longitude:</span>
                  <strong className="text-primary-text font-mono">{hosp.lng.toFixed(6)} E</strong>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${hosp.lat},${hosp.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0F172A] hover:bg-white/5 border border-white/10 text-primary-text text-xs rounded-full inline-flex items-center justify-center gap-1.5 py-2.5 font-semibold text-center transition-colors"
              >
                <MapPin size={13} className="text-medical-teal" /> View on Google Maps
              </a>
            </div>
          </Card>

          {/* Recent Resource Updates Feed */}
          <Card className="p-6 border border-white/5 space-y-4">
            <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wide">Recent Roster Updates</h4>
            <div className="space-y-3">
              {myLogs.length === 0 ? (
                <p className="text-[10px] text-muted-text text-center py-4">No recent resource changes logged.</p>
              ) : (
                myLogs.map(l => (
                  <div key={l.id} className="text-[10.5px] border-b border-white/5 pb-2 text-secondary-text space-y-0.5">
                    <p className="font-bold text-primary-text">{l.resourceName.toUpperCase().replace('_', ' ')} updated</p>
                    <p>New capacity: <strong className="text-medical-teal">{l.newValue} units</strong> (Reason: {l.reason})</p>
                    <span className="text-[9px] text-muted-text block">{l.updatedAt}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

// ============================================================
// 6. HOSPITAL DEPARTMENTS (/hospital/departments)
// ============================================================
export const HospitalDepartmentsPage: React.FC = () => {
  const { currentUser } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const [depts, setDepts] = useState<any[]>([]);

  useEffect(() => {
    const list = db.getDepartments().filter(d => d.hospitalId === hospitalId);
    setDepts(list);
  }, []);

  return (
    <Card className="p-8 border border-white/5 text-left">
      <h3 className="font-heading font-black text-base text-primary-text mb-6">Registered Hospital Departments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {depts.map(d => (
          <div key={d.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-primary-text">{d.name}</h4>
              <span className="text-[9px] text-muted-text mt-0.5 block">HOD: {d.headOfDepartment}</span>
            </div>
            <StatusBadge status={d.status} />
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============================================================
// 7. HOSPITAL BLOOD BANK (/hospital/blood)
// ============================================================
export const HospitalBloodPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'update' ? 'update' : 'inventory';

  const { currentUser, hospitals, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';
  const hospital = hospitals.find(h => h.id === hospitalId);
  const hospitalName = hospital?.name || 'Parkar Hospital & Research Institute';

  const ALL_GROUPS: Array<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'> = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const [inventoryMap, setInventoryMap] = useState<Record<string, BloodInventory>>({});
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([]);
  const [selectedGroupModal, setSelectedGroupModal] = useState<BloodInventory | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getStatusForUnits = (units: number): 'Available' | 'Limited' | 'Critical' => {
    if (units <= 0) return 'Critical';
    if (units <= 3) return 'Limited';
    return 'Available';
  };

  const loadBloodData = () => {
    const allBlood = db.getBloodInventory();
    const hospBlood = allBlood.filter(b => b.hospitalId === hospitalId);

    const map: Record<string, BloodInventory> = {};
    ALL_GROUPS.forEach(grp => {
      const existing = hospBlood.find(b => b.bloodGroup === grp);
      if (existing) {
        map[grp] = { ...existing };
      } else {
        map[grp] = {
          id: `blood-${hospitalId}-${grp}`,
          hospitalId,
          hospitalName,
          bloodGroup: grp,
          unitsAvailable: 0,
          unitsReserved: 0,
          status: 'Critical',
          updatedAt: new Date().toISOString(),
          source: 'Hospital Admin'
        };
      }
    });

    setInventoryMap(map);

    const requests = db.getBloodRequests().filter(
      r => r.hospitalId === hospitalId || (r.hospitalName && r.hospitalName.toLowerCase().includes(hospitalName.toLowerCase()))
    );
    setActiveRequests(requests);
  };

  useEffect(() => {
    loadBloodData();
  }, [hospitalId]);

  const handleQuantityChange = (grp: string, delta: number) => {
    setInventoryMap(prev => {
      const current = prev[grp];
      if (!current) return prev;
      const nextUnits = Math.max(0, current.unitsAvailable + delta);
      const nextStatus = getStatusForUnits(nextUnits);
      return {
        ...prev,
        [grp]: {
          ...current,
          unitsAvailable: nextUnits,
          status: nextStatus
        }
      };
    });
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    const now = new Date().toISOString();

    const currentDbList = db.getBloodInventory();
    const updatedItems = ALL_GROUPS.map(grp => {
      const item = inventoryMap[grp];
      return {
        ...item,
        updatedAt: now,
        source: 'Hospital Admin'
      };
    });

    const remainingDbList = currentDbList.filter(b => b.hospitalId !== hospitalId);
    const nextFullList = [...remainingDbList, ...updatedItems];

    db.saveBloodInventory(nextFullList);

    const newMap: Record<string, BloodInventory> = {};
    updatedItems.forEach(item => {
      newMap[item.bloodGroup] = item;
    });
    setInventoryMap(newMap);

    refreshState();

    setIsSaving(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const getRelativeTimeString = (isoString: string) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return '1+ day ago';
  };

  const isDataStale = (isoString: string) => {
    if (!isoString) return false;
    const diffMs = Date.now() - new Date(isoString).getTime();
    return diffMs > 2 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Navigation Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <Droplet className="text-emergency" size={24} />
            <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">BLOOD BANK INVENTORY</h3>
          </div>
          <p className="text-xs text-muted-text mt-1">
            {activeTab === 'update'
              ? "Manage and update the hospital's reported blood availability."
              : "Real-time blood stock inventory telemetry across all 8 blood groups."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap justify-between lg:justify-end">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setSearchParams({ tab: 'inventory' })}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-medical-teal text-primary-bg-deep shadow-md'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Stock Inventory
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'update' })}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'update'
                  ? 'bg-medical-teal text-primary-bg-deep shadow-md'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Update Availability
            </button>
          </div>

          <Button variant="primary" size="md" onClick={handleSaveAvailability} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-success/15 border border-success/30 text-success flex items-center justify-between font-bold text-xs shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Check size={18} />
              <span>✓ Blood inventory updated successfully. Persistent data synchronized.</span>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="text-success hover:opacity-80 text-xs cursor-pointer">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of 8 Blood Groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ALL_GROUPS.map(grp => {
          const item = inventoryMap[grp] || {
            id: `blood-${hospitalId}-${grp}`,
            hospitalId,
            hospitalName,
            bloodGroup: grp,
            unitsAvailable: 0,
            unitsReserved: 0,
            status: 'Critical',
            updatedAt: new Date().toISOString(),
            source: 'Hospital Admin'
          };

          return (
            <Card key={grp} className="p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all bg-white/[0.02]">
              <div>
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-2xl bg-emergency/10 border border-emergency/25 text-emergency flex items-center justify-center font-black text-base shadow-sm">
                    {grp}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-5">
                  <span className="text-[10px] text-muted-text uppercase font-bold tracking-wider">AVAILABLE STOCK</span>
                  <h4 className="font-heading font-black text-2xl text-primary-text mt-0.5">{item.unitsAvailable} Units</h4>
                </div>

                {activeTab === 'update' ? (
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleQuantityChange(grp, -1)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-primary-text font-black text-lg border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                      title="Decrease Availability"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center bg-white/[0.02] border border-white/5 rounded-xl py-2">
                      <span className="text-lg font-heading font-black text-primary-text">{item.unitsAvailable}</span>
                      <span className="text-[10px] text-muted-text ml-1">Units</span>
                    </div>
                    <button
                      onClick={() => handleQuantityChange(grp, 1)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-primary-text font-black text-lg border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                      title="Increase Availability"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-muted-text">Reserved: <strong className="text-warning">{item.unitsReserved || 0} Units</strong></span>
                    <span className="text-muted-text">Total: <strong className="text-primary-text">{(item.unitsAvailable) + (item.unitsReserved || 0)} Units</strong></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                {isDataStale(item.updatedAt) ? (
                  <span className="text-warning font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> Stale data — please update
                  </span>
                ) : (
                  <span className="text-muted-text">Updated: {getRelativeTimeString(item.updatedAt)}</span>
                )}

                <button
                  onClick={() => setSelectedGroupModal(item)}
                  className="text-medical-teal hover:underline font-semibold cursor-pointer"
                >
                  Details
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Blood Requests Section */}
      <div className="mt-10 border-t border-white/5 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-medical-teal" />
            <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wider">ACTIVE BLOOD REQUESTS</h4>
          </div>
          <span className="text-xs font-bold text-medical-teal bg-medical-teal/10 px-3 py-1 rounded-full border border-medical-teal/20">
            {activeRequests.length} Active Request{activeRequests.length !== 1 ? 's' : ''}
          </span>
        </div>

        {activeRequests.length === 0 ? (
          <Card className="p-6 text-center border border-white/5 bg-white/[0.01]">
            <p className="text-xs text-muted-text">No active incoming blood requests for {hospitalName} (Ratnagiri) at this time.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRequests.map(req => (
              <Card key={req.id} className="p-4 border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-emergency/15 text-emergency font-black text-xs flex items-center justify-center border border-emergency/30">
                    {req.bloodGroup}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary-text">{req.unitsRequired} Units</span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-text mt-0.5">{req.patientName} · Ratnagiri</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    alert(`Blood Request Details:\n\nPatient: ${req.patientName}\nGroup: ${req.bloodGroup}\nUnits: ${req.unitsRequired}\nHospital: ${req.hospitalName}\nStatus: ${req.status}`);
                  }}
                >
                  View Request
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Blood Group Detail Modal */}
      {selectedGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary-bg-deep border border-white/10 rounded-2xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emergency/15 border border-emergency/30 text-emergency flex items-center justify-center font-black text-lg">
                  {selectedGroupModal.bloodGroup}
                </span>
                <div>
                  <h4 className="font-heading font-black text-lg text-primary-text">{selectedGroupModal.bloodGroup} Blood Inventory</h4>
                  <p className="text-xs text-muted-text">{hospitalName} · Ratnagiri</p>
                </div>
              </div>
              <StatusBadge status={selectedGroupModal.status} />
            </div>

            <div className="grid grid-cols-3 gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 text-center">
              <div>
                <p className="text-[10px] text-muted-text uppercase font-bold">Available</p>
                <p className="text-lg font-black text-medical-teal mt-0.5">{selectedGroupModal.unitsAvailable} Units</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-text uppercase font-bold">Reserved</p>
                <p className="text-lg font-black text-warning mt-0.5">{selectedGroupModal.unitsReserved || 0} Units</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-text uppercase font-bold">Total</p>
                <p className="text-lg font-black text-primary-text mt-0.5">{(selectedGroupModal.unitsAvailable) + (selectedGroupModal.unitsReserved || 0)} Units</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-secondary-text bg-white/[0.01] p-3 rounded-lg border border-white/5">
              <div className="flex justify-between">
                <span className="text-muted-text">Status:</span>
                <span className="font-bold text-primary-text">{selectedGroupModal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Last Updated:</span>
                <span className="font-medium text-primary-text">{getRelativeTimeString(selectedGroupModal.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Updated By:</span>
                <span className="font-medium text-primary-text">{selectedGroupModal.source || 'Hospital Admin'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setSelectedGroupModal(null);
                  setSearchParams({ tab: 'update' });
                }}
              >
                Edit Availability
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedGroupModal(null)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 8. HOSPITAL EMERGENCY COORDINATION (/hospital/emergency)
// ============================================================
// ============================================================
// 8A. SOS CALLOUTS — INCOMING EMERGENCY ALERTS (/hospital/emergency/sos)
// ============================================================
export const HospitalSOSCalloutsPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshState } = useApp();

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [selectedSOS, setSelectedSOS] = useState<EmergencyRequest | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadEmergencies = () => {
    const list = db.getEmergencyRequests();
    setEmergencies(list);
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateStatus = (id: string, nextStatus: EmergencyRequest['coordinationStatus']) => {
    const list = db.getEmergencyRequests();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = list.map(item => {
      if (item.id === id) {
        const nextTimeline = [
          ...(item.timeline || []),
          { title: `Alert status updated to ${nextStatus}`, timestamp: nowTimeStr }
        ];
        return {
          ...item,
          coordinationStatus: nextStatus,
          hospitalAlertStatus: nextStatus === 'Acknowledged' ? ('acknowledged' as const) : item.hospitalAlertStatus,
          timeline: nextTimeline,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    db.saveEmergencyRequests(updated);
    setEmergencies(updated);

    if (selectedSOS?.id === id) {
      const cur = updated.find(i => i.id === id);
      if (cur) setSelectedSOS(cur);
    }

    refreshState();
    triggerToast(`✓ SOS ${id} marked as "${nextStatus}".`);
  };

  const filteredEmergencies = emergencies.filter(req => {
    const matchesPriority = priorityFilter === 'All' || req.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || (req.coordinationStatus || 'New') === statusFilter;
    const matchesType = typeFilter === 'All' || req.emergencyType.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesPriority && matchesStatus && matchesType;
  });

  const activeCalloutsCount = emergencies.filter(req => (req.coordinationStatus || 'New') !== 'Closed').length;

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-xl bg-emergency/15 border border-emergency/30 text-emergency flex items-center justify-between font-bold text-xs shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Check size={18} />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-emergency hover:opacity-80 text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency/15 border border-emergency/30 text-emergency flex items-center justify-center font-black animate-pulse">
              <Flame size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">SOS Callouts</h3>
                <span className="text-[11px] font-bold bg-emergency/15 text-emergency border border-emergency/30 px-3 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                  🔴 {activeCalloutsCount} Active Callouts
                </span>
              </div>
              <p className="text-xs text-muted-text mt-0.5">
                Incoming emergency alerts requiring immediate hospital attention and triage preparation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadEmergencies}>
            <RotateCw size={14} className="mr-1.5" /> Refresh Inbox
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <Filter size={14} />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-primary-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary-text focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">🔴 Critical</option>
              <option value="Urgent">🟡 Urgent</option>
              <option value="Routine">🔵 Routine</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span>Alert Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-primary-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary-text focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">🔴 New</option>
              <option value="Acknowledged">🟡 Acknowledged</option>
              <option value="Preparing">🔵 Preparing</option>
              <option value="Ready">🟢 Ready</option>
              <option value="Closed">⚪ Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span>Emergency Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-primary-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary-text focus:outline-none"
            >
              <option value="All">All Emergency Types</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Chest Pain">Cardiac / Chest Pain</option>
              <option value="Stroke">Stroke / Neurological</option>
              <option value="Breathing">Breathing Emergency</option>
              <option value="Pediatric">Pediatric Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* SOS Callout Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmergencies.map(req => {
          const status = req.coordinationStatus || 'New';
          const isCritical = (req.priority || 'Critical') === 'Critical';

          return (
            <Card
              key={req.id}
              className={`p-5 border flex flex-col justify-between transition-all ${
                status === 'New'
                  ? 'border-emergency/50 bg-emergency/[0.04] shadow-xl shadow-emergency/5'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider border ${
                    isCritical ? 'bg-emergency/20 text-emergency border-emergency/40' : 'bg-warning/20 text-warning border-warning/40'
                  }`}>
                    {req.priority || 'Critical'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-primary-text">
                    Status: {status}
                  </span>
                </div>

                <div>
                  <h4 className="font-heading font-black text-base text-primary-text">{req.emergencyType}</h4>
                  <p className="text-xs text-secondary-text mt-1 flex items-center gap-1">
                    <MapPin size={13} className="text-emergency shrink-0" />
                    <span className="truncate">{req.location}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                  <p className="text-[10px] text-muted-text font-bold uppercase tracking-wider">Required Resources:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {req.requiredResources.map((res: string) => (
                      <span key={res} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-primary-text font-bold">
                        ✓ {res}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-secondary-text border-t border-white/5 pt-3">
                  <div>
                    <span className="text-muted-text block text-[9.5px] font-bold uppercase">Estimated ETA:</span>
                    <strong className="text-emergency text-sm font-black">~{req.ambulanceEtaMin || 8} minutes</strong>
                  </div>
                  <div>
                    <span className="text-muted-text block text-[9.5px] font-bold uppercase">Alert Time:</span>
                    <span className="font-semibold text-primary-text">{req.hospitalAlertTime || 'Just now'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedSOS(req)}>
                  View Alert
                </Button>
                {status === 'New' && (
                  <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(req.id, 'Acknowledged')}>
                    Acknowledge
                  </Button>
                )}
                {status !== 'New' && (
                  <Button size="sm" variant="primary" onClick={() => navigate('/hospital/emergency/coordination')}>
                    Open Coordination →
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredEmergencies.length === 0 && (
        <Card className="p-12 text-center text-xs text-muted-text border border-white/5 space-y-2">
          <AlertCircle size={24} className="mx-auto text-muted-text" />
          <h4 className="font-bold text-sm text-primary-text">No Emergency Callouts Found</h4>
          <p className="text-secondary-text">Monitoring Ratnagiri district emergency dispatch grid.</p>
        </Card>
      )}

      {/* SOS ALERT DETAIL DRAWER */}
      {selectedSOS && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="bg-primary-bg-deep border-l border-white/10 w-full max-w-lg h-full p-6 text-left space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-black text-xl text-primary-text">{selectedSOS.id}</h4>
                    <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase bg-emergency/20 text-emergency border border-emergency/30">
                      {selectedSOS.priority || 'Critical'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-text mt-0.5">Patient Reference: <strong className="text-medical-teal">{selectedSOS.patientReference || 'P-4821'}</strong></p>
                </div>
                <button onClick={() => setSelectedSOS(null)} className="text-muted-text hover:text-primary-text text-lg p-1 cursor-pointer">✕</button>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Emergency Type:</span>
                  <span className="font-bold text-primary-text">{selectedSOS.emergencyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Pickup Location:</span>
                  <span className="font-semibold text-primary-text">{selectedSOS.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Estimated ETA:</span>
                  <span className="font-black text-emergency">~{selectedSOS.ambulanceEtaMin || 8} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Status:</span>
                  <span className="font-bold text-medical-teal">{selectedSOS.coordinationStatus || 'New'}</span>
                </div>
              </div>

              {/* Resource Matching Telemetry */}
              <div className="p-4 rounded-xl bg-medical-teal/5 border border-medical-teal/20 text-xs space-y-2">
                <p className="font-extrabold text-medical-teal uppercase tracking-wider">Hospital Resource Match Telemetry</p>
                <div className="space-y-1 text-secondary-text">
                  <p className="flex items-center gap-1.5"><span className="text-success font-bold">✓</span> ICU Bed Available (Civil / Parkar Facility)</p>
                  <p className="flex items-center gap-1.5"><span className="text-success font-bold">✓</span> Trauma Specialist On Duty (Dr. Vivek Parkar)</p>
                  <p className="flex items-center gap-1.5"><span className="text-success font-bold">✓</span> Ventilator Unit Ready</p>
                  <p className="flex items-center gap-1.5"><span className="text-success font-bold">✓</span> ALS Ambulance Dispatched ({selectedSOS.ambulanceNumber || 'MH-08-BG-2001'})</p>
                </div>
              </div>

              {/* Workflow Actions */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Update Alert Workflow State</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selectedSOS.coordinationStatus === 'Acknowledged' ? 'primary' : 'secondary'}
                    onClick={() => handleUpdateStatus(selectedSOS.id, 'Acknowledged')}
                  >
                    Acknowledge Alert
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedSOS.coordinationStatus === 'Preparing' ? 'primary' : 'secondary'}
                    onClick={() => handleUpdateStatus(selectedSOS.id, 'Preparing')}
                  >
                    Prepare Resources
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setSelectedSOS(null);
                  navigate('/hospital/emergency/coordination');
                }}
              >
                Open Emergency Coordination Workspace →
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 8B. EMERGENCY COORDINATION — RESPONSE WORKSPACE (/hospital/emergency/coordination)
// ============================================================
export const HospitalEmergencyCoordinationPage: React.FC = () => {
  const { currentUser, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2';

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [selectedCoordCase, setSelectedCoordCase] = useState<EmergencyRequest | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Assignment Drawer State
  const [assignedDoctor, setAssignedDoctor] = useState<string>('');
  const [assignedAmbulance, setAssignedAmbulance] = useState<string>('');
  const [assignedIcu, setAssignedIcu] = useState<string>('Bed #4');
  const [assignedVent, setAssignedVent] = useState<string>('Ventilator #2');
  const [assignedBed, setAssignedBed] = useState<string>('Emergency Bay #2');

  const loadEmergencies = () => {
    const list = db.getEmergencyRequests();
    setEmergencies(list);
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const hospitalDoctors = db.getDoctors().filter(d => d.hospitalId === hospitalId || d.availabilityStatus === 'Available');
  const hospitalAmbulances = db.getAmbulances().filter(a => a.hospitalId === hospitalId || a.status === 'Available');

  const activeCases = emergencies.filter(e => e.coordinationStatus !== 'Closed');
  const preparingCount = emergencies.filter(e => e.coordinationStatus === 'Preparing').length;
  const criticalCount = emergencies.filter(e => e.priority === 'Critical' && e.coordinationStatus !== 'Closed').length;
  const readyCount = emergencies.filter(e => e.coordinationStatus === 'Ready').length;

  const handleOpenManageResources = (req: EmergencyRequest) => {
    setSelectedCoordCase(req);
    setAssignedDoctor(req.assignedDoctorName || hospitalDoctors[0]?.name || 'Dr. Vivek Parkar');
    setAssignedAmbulance(req.ambulanceNumber || hospitalAmbulances[0]?.ambulanceNumber || 'MH-08-BG-2001 (ALS)');
    setAssignedIcu(req.assignedIcuBed || 'Bed #4');
    setAssignedVent(req.assignedVentilator || 'Ventilator #2');
    setAssignedBed(req.assignedEmergencyBed || 'Emergency Bay #2');
  };

  const handleSaveResourceAssignment = () => {
    if (!selectedCoordCase) return;

    const list = db.getEmergencyRequests();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = list.map(item => {
      if (item.id === selectedCoordCase.id) {
        const nextTimeline = [
          ...(item.timeline || []),
          { title: 'Emergency resources & specialist assigned', timestamp: nowTimeStr, note: `Assigned: ${assignedDoctor}, ${assignedIcu}` }
        ];
        return {
          ...item,
          assignedDoctorName: assignedDoctor,
          assignedIcuBed: assignedIcu,
          assignedVentilator: assignedVent,
          assignedEmergencyBed: assignedBed,
          ambulanceNumber: assignedAmbulance,
          coordinationStatus: 'Preparing' as const,
          timeline: nextTimeline,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    db.saveEmergencyRequests(updated);
    setEmergencies(updated);

    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: hospitalId,
      type: 'Resource',
      title: `👨‍⚕️ Specialist & Resources Assigned for ${selectedCoordCase.id}`,
      description: `${assignedDoctor} assigned. ${assignedIcu} and ${assignedVent} reserved for patient arrival.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: false
    });
    db.saveNotifications(notifications);

    refreshState();
    setSelectedCoordCase(null);
    triggerToast(`✓ Resources & Doctor assigned to ${selectedCoordCase.id}.`);
  };

  const handleMarkHospitalReady = (req: EmergencyRequest) => {
    const list = db.getEmergencyRequests();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = list.map(item => {
      if (item.id === req.id) {
        const nextTimeline = [
          ...(item.timeline || []),
          { title: 'Hospital marked Ready for patient arrival', timestamp: nowTimeStr, note: 'All triage resources, ICU bed & specialist prepped.' }
        ];
        return {
          ...item,
          coordinationStatus: 'Ready' as const,
          timeline: nextTimeline,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    db.saveEmergencyRequests(updated);
    setEmergencies(updated);

    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: hospitalId,
      type: 'Hospital',
      title: `🏥 Emergency Resources Prepared (${req.id})`,
      description: `Hospital team confirmed ready for patient arrival (${req.emergencyType}). ETA ~${req.ambulanceEtaMin || 8} min.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: true
    });
    db.saveNotifications(notifications);

    refreshState();
    triggerToast(`🟢 Hospital marked Ready for ${req.id} arrival!`);
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Banner */}
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

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-teal/10 border border-medical-teal/20 text-medical-teal flex items-center justify-center">
              <Activity size={22} />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">Emergency Coordination</h3>
              <p className="text-xs text-muted-text mt-0.5">
                Operational workspace to prepare ICU wards, ventilators, and specialist staff for incoming cases.
              </p>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={loadEmergencies}>
          <RotateCw size={14} className="mr-1.5" /> Refresh Telemetry
        </Button>
      </div>

      {/* Top 4 Statistics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-primary-text flex items-center justify-center font-black">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">ACTIVE CASES</p>
            <h4 className="font-heading font-black text-2xl text-primary-text mt-0.5">{activeCases.length}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center font-black">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">PREPARING</p>
            <h4 className="font-heading font-black text-2xl text-warning mt-0.5">{preparingCount}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emergency/10 border border-emergency/20 text-emergency flex items-center justify-center font-black">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">CRITICAL CASES</p>
            <h4 className="font-heading font-black text-2xl text-emergency mt-0.5">{criticalCount}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-success/10 border border-success/20 text-success flex items-center justify-center font-black">
            <Check size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">READY FOR ARRIVAL</p>
            <h4 className="font-heading font-black text-2xl text-success mt-0.5">{readyCount}</h4>
          </div>
        </Card>
      </div>

      {/* Active Emergency Coordination Cases */}
      <div className="space-y-6">
        <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wider">ACTIVE EMERGENCY RESPONSE MATRIX</h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCases.map(req => {
            const isReady = req.coordinationStatus === 'Ready';

            return (
              <Card key={req.id} className="p-6 border border-white/5 bg-white/[0.02] space-y-5">
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-lg text-primary-text">{req.id}</span>
                      <span className="text-xs font-bold text-emergency bg-emergency/15 px-2.5 py-0.5 rounded border border-emergency/30">
                        {req.priority || 'Critical'}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-secondary-text mt-1">{req.emergencyType}</h5>
                    <p className="text-xs text-muted-text">Patient Ref: <strong className="text-medical-teal">{req.patientReference || 'P-4821'}</strong></p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-text uppercase font-bold block">Estimated Arrival</span>
                    <strong className="text-emergency font-black text-base">~{req.ambulanceEtaMin || 8} min</strong>
                  </div>
                </div>

                {/* Resource Assignment Status Checklist */}
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] text-muted-text uppercase font-bold">Assigned Hospital Resources:</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <span className="text-secondary-text">ICU Bed:</span>
                      <span className="font-bold text-success">🟢 {req.assignedIcuBed || 'Bed #4'}</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <span className="text-secondary-text">Specialist:</span>
                      <span className="font-bold text-success truncate max-w-[120px]">🟢 {req.assignedDoctorName || 'Dr. Vivek Parkar'}</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <span className="text-secondary-text">Ventilator:</span>
                      <span className="font-bold text-success">🟢 {req.assignedVentilator || 'Ventilator #2'}</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                      <span className="text-secondary-text">Emergency Bay:</span>
                      <span className="font-bold text-warning">🟡 {req.assignedEmergencyBed || 'Preparing Bay #2'}</span>
                    </div>
                  </div>
                </div>

                {/* Coordination Timeline */}
                {req.timeline && req.timeline.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-muted-text uppercase mb-2">Preparation Timeline:</p>
                    <div className="space-y-1.5 text-[11px]">
                      {req.timeline.slice(-3).map((tl: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-muted-text">
                          <span>✓ {tl.title}</span>
                          <span className="font-mono text-[10px]">{tl.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-3">
                  <Button size="sm" variant="secondary" onClick={() => handleOpenManageResources(req)}>
                    Manage Resources
                  </Button>
                  {isReady ? (
                    <span className="px-3 py-1.5 rounded-xl bg-success/15 text-success border border-success/30 text-xs font-black flex items-center gap-1">
                      ✓ Hospital Ready for Arrival
                    </span>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => handleMarkHospitalReady(req)}>
                      Mark Hospital Ready
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* RESOURCE ASSIGNMENT DRAWER */}
      {selectedCoordCase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="bg-primary-bg-deep border-l border-white/10 w-full max-w-lg h-full p-6 text-left space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-heading font-black text-xl text-primary-text">Manage Emergency Resources</h4>
                  <p className="text-xs text-muted-text">Case {selectedCoordCase.id} · {selectedCoordCase.emergencyType}</p>
                </div>
                <button onClick={() => setSelectedCoordCase(null)} className="text-muted-text hover:text-primary-text text-lg p-1 cursor-pointer">✕</button>
              </div>

              {/* Resource Assignment Form */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Assign Specialist Doctor</label>
                  <select
                    value={assignedDoctor}
                    onChange={(e) => setAssignedDoctor(e.target.value)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text font-bold"
                  >
                    {hospitalDoctors.map(d => (
                      <option key={d.id} value={`${d.name} (${d.specialty})`}>
                        {d.name} — {d.specialty} ({d.availabilityStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Assign ICU Bed Unit</label>
                  <select
                    value={assignedIcu}
                    onChange={(e) => setAssignedIcu(e.target.value)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text"
                  >
                    <option value="ICU Bed #1">ICU Bed #1 (Available)</option>
                    <option value="ICU Bed #2">ICU Bed #2 (Available)</option>
                    <option value="ICU Bed #4">ICU Bed #4 (Reserved)</option>
                    <option value="ICU Bed #6">ICU Bed #6 (Available)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Assign Ventilator Unit</label>
                  <select
                    value={assignedVent}
                    onChange={(e) => setAssignedVent(e.target.value)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text"
                  >
                    <option value="Ventilator #1">Ventilator #1 (ALS)</option>
                    <option value="Ventilator #2">Ventilator #2 (Prepped)</option>
                    <option value="Ventilator #3">Ventilator #3 (Standby)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Assign Ambulance Fleet Unit</label>
                  <select
                    value={assignedAmbulance}
                    onChange={(e) => setAssignedAmbulance(e.target.value)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text font-mono"
                  >
                    {hospitalAmbulances.map(a => (
                      <option key={a.id} value={`${a.ambulanceNumber} (${a.type})`}>
                        {a.ambulanceNumber} ({a.type}) — Status: {a.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-text uppercase block mb-1">Assign Emergency Bay Bed</label>
                  <input
                    type="text"
                    value={assignedBed}
                    onChange={(e) => setAssignedBed(e.target.value)}
                    className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <Button variant="primary" className="w-full" onClick={handleSaveResourceAssignment}>
                Save Resource Assignments
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setSelectedCoordCase(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MASTER EMERGENCY DISPATCHER (/hospital/emergency)
// ============================================================
export const HospitalEmergencyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const isCoordination =
    location.pathname.includes('/coordination') ||
    searchParams.get('tab') === 'coordination';

  return isCoordination ? (
    <HospitalEmergencyCoordinationPage />
  ) : (
    <HospitalSOSCalloutsPage />
  );
};

// ============================================================
// 9. HOSPITAL TRANSFERS (/hospital/transfers)
// ============================================================
export const HospitalTransfersPage: React.FC = () => {
  const { currentUser, hospitals, refreshState } = useApp();
  const hospitalId = currentUser?.hospitalId || 'hosp-2'; // Default to Parkar Hospital for demo
  const currentHospital = hospitals.find(h => h.id === hospitalId) || hospitals[1] || hospitals[0];

  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modals & Drawers state
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState<TransferRequest | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<TransferRequest | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Transfer Form State
  const [step, setStep] = useState<number>(1);
  const [patientRef, setPatientRef] = useState<string>('');
  const [priority, setPriority] = useState<'Critical' | 'Urgent' | 'Routine'>('Critical');
  const [department, setDepartment] = useState<string>('ICU / Critical Care');
  const [specialist, setSpecialist] = useState<string>('Neurology');
  const [selectedResources, setSelectedResources] = useState<string[]>(['ICU Bed', 'Ventilator']);
  const [bloodRequired, setBloodRequired] = useState<boolean>(false);
  const [bloodGroup, setBloodGroup] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O-');
  const [bloodUnits, setBloodUnits] = useState<number>(2);
  const [selectedReceivingHospital, setSelectedReceivingHospital] = useState<Hospital | null>(null);

  // Action Modals State
  const [rejectReason, setRejectReason] = useState<string>('Emergency department overloaded');
  const [infoText, setInfoText] = useState<string>('');

  const loadTransfers = () => {
    const list = db.getTransfers();
    setTransfers(list);
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenNewModal = () => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setPatientRef(`P-${randNum}`);
    setPriority('Critical');
    setDepartment('ICU / Critical Care');
    setSpecialist('Neurology');
    setSelectedResources(['ICU Bed', 'Ventilator']);
    setBloodRequired(false);
    setBloodGroup('O-');
    setBloodUnits(2);
    setSelectedReceivingHospital(null);
    setStep(1);
    setShowNewModal(true);
  };

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch =
      t.patientReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sendingHospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receivingHospitalName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Overview Counts
  const totalCount = transfers.length;
  const pendingCount = transfers.filter(t => t.status === 'Pending').length;
  const acceptedCount = transfers.filter(t => t.status === 'Accepted').length;
  const inTransitCount = transfers.filter(t => t.status === 'In Transit' || t.status === 'Preparing').length;

  // Incoming Transfers targeted at current logged-in hospital
  const incomingTransfers = transfers.filter(
    t => (t.receivingHospitalId === hospitalId || t.receivingHospitalName.toLowerCase().includes(currentHospital.name.toLowerCase())) &&
      (t.status === 'Pending' || t.status === 'Accepted' || t.status === 'Preparing' || t.status === 'In Transit')
  );

  // Compute Hospital Recommendations for Step 3
  const getRecommendedHospitals = () => {
    const candidateHospitals = hospitals.filter(h => h.id !== hospitalId && h.verified);
    const allResources = db.getResources();
    const allDoctors = db.getDoctors();
    const allBlood = db.getBloodInventory();

    return candidateHospitals.map(h => {
      const hospRes = allResources.filter(r => r.hospitalId === h.id);
      const icuRes = hospRes.find(r => r.resourceType === 'icu_beds');
      const ventRes = hospRes.find(r => r.resourceType === 'ventilators');

      const icuAvail = icuRes ? icuRes.available : Math.floor(Math.random() * 5 + 1);
      const ventAvail = ventRes ? ventRes.available : Math.floor(Math.random() * 3);

      const hasDoctor = allDoctors.some(d => d.hospitalId === h.id && (
        (d.specialization && d.specialization.toLowerCase().includes(specialist.toLowerCase())) ||
        (d.specialty && d.specialty.toLowerCase().includes(specialist.toLowerCase()))
      ));

      let bloodMatchCount = 0;
      if (bloodRequired) {
        const b = allBlood.find(inv => inv.hospitalId === h.id && inv.bloodGroup === bloodGroup);
        bloodMatchCount = b ? b.unitsAvailable : 0;
      }

      const matchReasons: string[] = [];
      if (icuAvail > 0) matchReasons.push(`ICU Bed Available (${icuAvail} beds)`);
      if (hasDoctor) matchReasons.push(`Specialist Coverage (${specialist})`);
      if (ventAvail > 0) matchReasons.push(`Ventilator Capacity (${ventAvail} units)`);
      if (h.verified) matchReasons.push('Verified District Facility');
      if (bloodRequired && bloodMatchCount >= bloodUnits) matchReasons.push(`Blood Stock Reported (${bloodGroup}: ${bloodMatchCount} units)`);
      matchReasons.push(`Distance (${h.distanceFromUserKm.toFixed(1)} km)`);

      return {
        hospital: h,
        icuAvail,
        ventAvail,
        hasDoctor,
        bloodMatchCount,
        readinessScore: h.readinessScore || 85,
        matchReasons
      };
    }).sort((a, b) => b.readinessScore - a.readinessScore);
  };

  const handleSubmitTransfer = () => {
    if (!selectedReceivingHospital) return;

    const newId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowISO = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTransfer: TransferRequest = {
      id: newId,
      patientReference: patientRef || 'P-4821',
      sendingHospitalId: currentHospital.id,
      sendingHospitalName: currentHospital.name,
      receivingHospitalId: selectedReceivingHospital.id,
      receivingHospitalName: selectedReceivingHospital.name,
      priority,
      requiredDepartment: department,
      requiredSpecialist: specialist,
      requiredResources: selectedResources,
      bloodRequirement: bloodRequired ? { bloodGroup, units: bloodUnits } : undefined,
      status: 'Pending',
      timeline: [
        { title: 'Transfer request created', timestamp: nowTimeStr, note: `Initiated by ${currentHospital.name}` },
        { title: 'Hospital recommendation generated', timestamp: nowTimeStr, note: `${selectedReceivingHospital.name} selected` },
        { title: 'Transfer request sent', timestamp: nowTimeStr, note: 'Awaiting receiving hospital confirmation' }
      ],
      createdAt: nowISO,
      updatedAt: nowISO
    };

    const updatedList = [newTransfer, ...transfers];
    db.saveTransfers(updatedList);
    setTransfers(updatedList);

    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: selectedReceivingHospital.id,
      type: 'Transfer',
      title: `🚨 Incoming Transfer Request (${priority})`,
      description: `${currentHospital.name} has requested a ${priority} patient transfer (${newTransfer.patientReference}) for ${selectedResources.join(', ')}.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: priority === 'Critical'
    });
    db.saveNotifications(notifications);

    refreshState();
    setShowNewModal(false);
    triggerToast(`✓ Transfer request ${newId} sent successfully to ${selectedReceivingHospital.name}.`);
  };

  const handleAdvanceStatus = (nextStatus: TransferRequest['status']) => {
    if (!selectedTransfer) return;

    const nowISO = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nextTimeline = [
      ...selectedTransfer.timeline,
      { title: `Status updated to ${nextStatus}`, timestamp: nowTimeStr, note: `Updated by ${currentHospital.name}` }
    ];

    const updatedItem = {
      ...selectedTransfer,
      status: nextStatus,
      timeline: nextTimeline,
      updatedAt: nowISO
    };

    const updatedList = transfers.map(t => t.id === selectedTransfer.id ? updatedItem : t);
    db.saveTransfers(updatedList);
    setTransfers(updatedList);
    setSelectedTransfer(updatedItem);

    refreshState();
    triggerToast(`✓ Transfer ${selectedTransfer.id} status updated to "${nextStatus}".`);
  };

  const handleAcceptTransfer = (transfer: TransferRequest) => {
    const nowISO = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedItem: TransferRequest = {
      ...transfer,
      status: 'Accepted',
      timeline: [
        ...transfer.timeline,
        { title: 'Receiving hospital accepted request', timestamp: nowTimeStr, note: `Accepted by ${currentHospital.name}` }
      ],
      updatedAt: nowISO
    };

    const updatedList = transfers.map(t => t.id === transfer.id ? updatedItem : t);
    db.saveTransfers(updatedList);
    setTransfers(updatedList);

    if (selectedTransfer?.id === transfer.id) {
      setSelectedTransfer(updatedItem);
    }

    refreshState();
    triggerToast(`✓ Transfer request ${transfer.id} accepted.`);
  };

  const handleConfirmRejection = () => {
    if (!showRejectModal) return;
    const nowISO = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedItem: TransferRequest = {
      ...showRejectModal,
      status: 'Rejected',
      rejectionReason: rejectReason,
      timeline: [
        ...showRejectModal.timeline,
        { title: 'Transfer request rejected', timestamp: nowTimeStr, note: `Reason: ${rejectReason}` }
      ],
      updatedAt: nowISO
    };

    const updatedList = transfers.map(t => t.id === showRejectModal.id ? updatedItem : t);
    db.saveTransfers(updatedList);
    setTransfers(updatedList);

    if (selectedTransfer?.id === showRejectModal.id) {
      setSelectedTransfer(updatedItem);
    }

    setShowRejectModal(null);
    refreshState();
    triggerToast(`Transfer request ${showRejectModal.id} rejected.`);
  };

  const handleSendInfoRequest = () => {
    if (!showInfoModal) return;
    const nowISO = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedItem: TransferRequest = {
      ...showInfoModal,
      infoRequested: infoText || 'Additional clinical information requested.',
      timeline: [
        ...showInfoModal.timeline,
        { title: 'Additional information requested', timestamp: nowTimeStr, note: infoText || 'Clinical details requested' }
      ],
      updatedAt: nowISO
    };

    const updatedList = transfers.map(t => t.id === showInfoModal.id ? updatedItem : t);
    db.saveTransfers(updatedList);
    setTransfers(updatedList);

    if (selectedTransfer?.id === showInfoModal.id) {
      setSelectedTransfer(updatedItem);
    }

    setShowInfoModal(null);
    setInfoText('');
    refreshState();
    triggerToast(`Information request sent for ${showInfoModal.id}.`);
  };

  const handleAssignAmbulance = (amb: Ambulance) => {
    if (!selectedTransfer) return;
    const nowISO = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedItem: TransferRequest = {
      ...selectedTransfer,
      assignedAmbulanceId: amb.id,
      assignedAmbulanceNumber: `${amb.ambulanceNumber} (${amb.type})`,
      timeline: [
        ...selectedTransfer.timeline,
        { title: 'Ambulance assigned', timestamp: nowTimeStr, note: `${amb.ambulanceNumber} (${amb.type}) assigned` }
      ],
      updatedAt: nowISO
    };

    const updatedList = transfers.map(t => t.id === selectedTransfer.id ? updatedItem : t);
    db.saveTransfers(updatedList);
    setTransfers(updatedList);
    setSelectedTransfer(updatedItem);

    refreshState();
    triggerToast(`Ambulance ${amb.ambulanceNumber} assigned to ${selectedTransfer.id}.`);
  };

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-emergency/15 text-emergency border-emergency/30 font-black';
      case 'Urgent': return 'bg-warning/15 text-warning border-warning/30 font-bold';
      default: return 'bg-info/15 text-info border-info/30 font-semibold';
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case 'Accepted': return 'bg-success/15 text-success border-success/30';
      case 'Pending': return 'bg-warning/15 text-warning border-warning/30';
      case 'In Transit': return 'bg-info/15 text-info border-info/30';
      case 'Preparing': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Completed': return 'bg-medical-teal/15 text-medical-teal border-medical-teal/30';
      case 'Rejected': return 'bg-emergency/15 text-emergency border-emergency/30';
      case 'Cancelled': return 'bg-white/5 text-muted-text border-white/10';
      default: return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  const hospitalAmbulances = db.getAmbulances().filter(a => a.hospitalId === hospitalId || a.status === 'Available');

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Banner */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 rounded-xl bg-medical-teal/15 border border-medical-teal/30 text-medical-teal flex items-center justify-between font-bold text-xs shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Check size={18} />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-medical-teal hover:opacity-80 text-xs cursor-pointer">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-teal/10 border border-medical-teal/20 text-medical-teal flex items-center justify-center">
              <GitCompare size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-xl text-primary-text uppercase tracking-tight">Hospital Transfers</h3>
                <span className="text-[10px] font-bold bg-medical-teal/10 text-medical-teal border border-medical-teal/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  PHASE 2 • SIMULATED NETWORK
                </span>
              </div>
              <p className="text-xs text-muted-text mt-0.5">
                Coordinate critical patient transfers with verified hospitals based on current resource availability.
              </p>
            </div>
          </div>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenNewModal}>
          <Plus size={16} className="mr-1.5" /> New Transfer Request
        </Button>
      </div>

      {/* Summary Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-primary-text flex items-center justify-center font-black">
            <GitCompare size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">Total Transfers</p>
            <h4 className="font-heading font-black text-2xl text-primary-text mt-0.5">{totalCount}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center font-black">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">Pending</p>
            <h4 className="font-heading font-black text-2xl text-warning mt-0.5">{pendingCount}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-success/10 border border-success/20 text-success flex items-center justify-center font-black">
            <Check size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">Accepted</p>
            <h4 className="font-heading font-black text-2xl text-success mt-0.5">{acceptedCount}</h4>
          </div>
        </Card>

        <Card className="p-5 border border-white/5 bg-white/[0.02] flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-info/10 border border-info/20 text-info flex items-center justify-center font-black">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] text-muted-text uppercase font-extrabold tracking-wider">In Transit</p>
            <h4 className="font-heading font-black text-2xl text-info mt-0.5">{inTransitCount}</h4>
          </div>
        </Card>
      </div>

      {/* Incoming Requests Banner (For Receiving Hospital) */}
      {incomingTransfers.length > 0 && (
        <Card className="p-5 border border-emergency/30 bg-emergency/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emergency font-black text-sm uppercase tracking-wider">
              <Flame size={18} className="animate-pulse" />
              <span>🚨 INCOMING TRANSFER REQUESTS ({incomingTransfers.length})</span>
            </div>
            <span className="text-[10px] text-muted-text">Requires Facility Review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingTransfers.map(inc => (
              <div key={inc.id} className="p-3.5 bg-primary-bg-deep border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary-text">{inc.id}</span>
                    <span className="text-[9px] font-bold text-emergency bg-emergency/15 px-2 py-0.5 rounded border border-emergency/25">
                      {inc.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary-text mt-0.5">
                    From: <strong>{inc.sendingHospitalName}</strong>
                  </p>
                  <p className="text-[10.5px] text-muted-text">Req: {inc.requiredResources.join(', ')}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="primary" onClick={() => handleAcceptTransfer(inc)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowInfoModal(inc)}>
                    Request Info
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowRejectModal(inc)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            type="text"
            placeholder="Search Patient Ref or Hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-primary-bg border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-primary-text placeholder:text-muted-text focus:outline-none focus:border-medical-teal/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <Filter size={14} />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-primary-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary-text focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-primary-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary-text focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Urgent">Urgent</option>
              <option value="Routine">Routine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transfers Data Table */}
      <Card className="border border-white/5 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-muted-text font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Transfer ID</th>
                <th className="py-3.5 px-4">Patient Ref</th>
                <th className="py-3.5 px-4">From Hospital</th>
                <th className="py-3.5 px-4">Receiving Hospital</th>
                <th className="py-3.5 px-4">Required Resource</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-secondary-text">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-text">
                    No hospital transfer records found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-text">{t.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-medical-teal">{t.patientReference}</td>
                    <td className="py-3.5 px-4 max-w-[160px] truncate">{t.sendingHospitalName}</td>
                    <td className="py-3.5 px-4 max-w-[180px] truncate font-medium text-primary-text">{t.receivingHospitalName}</td>
                    <td className="py-3.5 px-4 max-w-[180px] truncate">{t.requiredResources.join(', ')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${getPriorityBadgeClass(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedTransfer(t)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW TRANSFER REQUEST MULTI-STEP MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary-bg-deep border border-white/10 rounded-2xl max-w-2xl w-full p-6 text-left space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h4 className="font-heading font-black text-lg text-primary-text">Create Hospital Transfer Request</h4>
                <p className="text-xs text-muted-text">Step {step} of 4 — Emergency Resource Matchmaking</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-muted-text hover:text-primary-text text-sm p-1">✕</button>
            </div>

            {/* STEP 1: REQUIREMENT */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-text uppercase">Patient Reference ID</label>
                    <input
                      type="text"
                      value={patientRef}
                      onChange={(e) => setPatientRef(e.target.value)}
                      className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text mt-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-text uppercase">Transfer Priority</label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text mt-1 font-bold"
                    >
                      <option value="Critical">🔴 Critical (Immediate)</option>
                      <option value="Urgent">🟡 Urgent (within 2h)</option>
                      <option value="Routine">🔵 Routine (scheduled)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-text uppercase">Required Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text mt-1"
                    >
                      <option value="ICU / Critical Care">ICU / Critical Care</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Trauma & General Surgery">Trauma & General Surgery</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-text uppercase">Required Specialist Coverage</label>
                    <select
                      value={specialist}
                      onChange={(e) => setSpecialist(e.target.value)}
                      className="w-full bg-primary-bg border border-white/10 rounded-xl px-3.5 py-2 text-xs text-primary-text mt-1"
                    >
                      <option value="Neurology">Neurologist</option>
                      <option value="Critical Care">Critical Care Specialist</option>
                      <option value="Cardiology">Cardiologist</option>
                      <option value="General Surgery">Trauma Surgeon</option>
                      <option value="Pulmonology">Pulmonologist</option>
                      <option value="Pediatrics">Pediatrician</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-text uppercase block mb-2">Required Hospital Resources</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['ICU Bed', 'Ventilator', 'Operating Theatre', 'Oxygen', 'Blood'].map(res => (
                      <label key={res} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 text-xs text-primary-text font-medium">
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(res)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources([...selectedResources, res]);
                            } else {
                              setSelectedResources(selectedResources.filter(r => r !== res));
                            }
                          }}
                          className="accent-medical-teal"
                        />
                        <span>{res}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Blood Requirement Optional Toggle */}
                <div className="pt-2 border-t border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-primary-text">
                    <input
                      type="checkbox"
                      checked={bloodRequired}
                      onChange={(e) => setBloodRequired(e.target.checked)}
                      className="accent-emergency"
                    />
                    <Droplet size={14} className="text-emergency" />
                    <span>Include Blood Group Requirement</span>
                  </label>

                  {bloodRequired && (
                    <div className="grid grid-cols-2 gap-4 mt-3 pl-6">
                      <div>
                        <label className="text-[10px] font-bold text-muted-text uppercase">Blood Group</label>
                        <select
                          value={bloodGroup}
                          onChange={(e: any) => setBloodGroup(e.target.value)}
                          className="w-full bg-primary-bg border border-white/10 rounded-xl px-3 py-1.5 text-xs text-primary-text mt-1 font-bold"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-text uppercase">Required Units</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={bloodUnits}
                          onChange={(e) => setBloodUnits(Number(e.target.value))}
                          className="w-full bg-primary-bg border border-white/10 rounded-xl px-3 py-1.5 text-xs text-primary-text mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setShowNewModal(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setStep(2)}>Next: Verify Hospital →</Button>
                </div>
              </div>
            )}

            {/* STEP 2: SENDING HOSPITAL */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider">Sending Facility (Your Hospital)</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-black text-lg text-primary-text">{currentHospital.name}</h4>
                      <p className="text-xs text-muted-text">{currentHospital.address}, {currentHospital.city}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified Facility
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5 text-center">
                    <div className="p-2 bg-white/[0.02] rounded-xl">
                      <p className="text-[9px] text-muted-text uppercase font-bold">Registration</p>
                      <p className="text-xs font-mono font-bold text-primary-text mt-0.5">{currentHospital.registrationNumber}</p>
                    </div>
                    <div className="p-2 bg-white/[0.02] rounded-xl">
                      <p className="text-[9px] text-muted-text uppercase font-bold">Emergency Status</p>
                      <p className="text-xs font-bold text-success mt-0.5">{currentHospital.emergencyStatus}</p>
                    </div>
                    <div className="p-2 bg-white/[0.02] rounded-xl">
                      <p className="text-[9px] text-muted-text uppercase font-bold">Readiness Score</p>
                      <p className="text-xs font-black text-medical-teal mt-0.5">{currentHospital.readinessScore}/100</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                  <Button variant="primary" onClick={() => setStep(3)}>Next: Match Hospitals →</Button>
                </div>
              </div>
            )}

            {/* STEP 3: SEARCH & RECOMMEND RECEIVING HOSPITAL */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h5 className="font-heading font-black text-sm text-primary-text uppercase tracking-wider">RECOMMENDED RECEIVING HOSPITALS (RATNAGIRI GRID)</h5>
                  <p className="text-xs text-muted-text mt-0.5">Ranked by MedRadar explainable resource availability telemetry.</p>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {getRecommendedHospitals().map((rec, idx) => (
                    <Card
                      key={rec.hospital.id}
                      className={`p-4 border transition-all cursor-pointer ${
                        selectedReceivingHospital?.id === rec.hospital.id
                          ? 'border-medical-teal bg-medical-teal/10 shadow-lg'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                      }`}
                      onClick={() => setSelectedReceivingHospital(rec.hospital)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-medical-teal/15 text-medical-teal flex items-center justify-center font-black text-xs">
                            #{idx + 1}
                          </span>
                          <div>
                            <h5 className="font-heading font-black text-sm text-primary-text">{rec.hospital.name}</h5>
                            <p className="text-[11px] text-muted-text">{rec.hospital.city} · {rec.hospital.distanceFromUserKm.toFixed(1)} km away</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-medical-teal/10 border border-medical-teal/20 text-medical-teal font-black text-xs">
                          {rec.readinessScore}% Match
                        </span>
                      </div>

                      {/* EXPLAINABLE RECOMMENDATION CARD */}
                      <div className="mt-3 p-3 rounded-xl bg-primary-bg-deep/80 border border-white/5 text-xs space-y-1.5">
                        <p className="text-[10px] font-extrabold text-medical-teal uppercase tracking-wider flex items-center gap-1">
                          <Check size={12} /> WHY THIS HOSPITAL?
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-secondary-text">
                          {rec.matchReasons.map(r => (
                            <span key={r} className="flex items-center gap-1">
                              <span className="text-success font-bold">✓</span> {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant={selectedReceivingHospital?.id === rec.hospital.id ? 'primary' : 'secondary'}
                        >
                          {selectedReceivingHospital?.id === rec.hospital.id ? '✓ Selected' : 'Select Hospital'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
                  <Button
                    variant="primary"
                    disabled={!selectedReceivingHospital}
                    onClick={() => setStep(4)}
                  >
                    Next: Review & Send →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SEND */}
            {step === 4 && selectedReceivingHospital && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-muted-text font-bold uppercase">Transfer Summary</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${getPriorityBadgeClass(priority)}`}>
                      {priority} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-text font-bold">From Hospital:</p>
                      <p className="font-bold text-primary-text text-sm mt-0.5">{currentHospital.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-text font-bold">To Receiving Hospital:</p>
                      <p className="font-bold text-medical-teal text-sm mt-0.5">{selectedReceivingHospital.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                    <div>
                      <p className="text-muted-text font-bold">Patient Reference:</p>
                      <p className="font-mono font-bold text-primary-text mt-0.5">{patientRef}</p>
                    </div>
                    <div>
                      <p className="text-muted-text font-bold">Required Resources:</p>
                      <p className="font-semibold text-primary-text mt-0.5">{selectedResources.join(', ')}</p>
                    </div>
                  </div>

                  {bloodRequired && (
                    <div className="p-2.5 rounded-xl bg-emergency/10 border border-emergency/20 text-emergency flex items-center justify-between font-bold">
                      <span>Blood Requirement: {bloodGroup} ({bloodUnits} Units)</span>
                      <span className="text-[10px] text-muted-text">Provider-reported stock confirmed</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" onClick={() => setStep(3)}>← Back</Button>
                  <Button variant="primary" onClick={handleSubmitTransfer}>
                    Send Transfer Request
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* DETAIL RIGHT-SIDE DRAWER */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-primary-bg-deep border-l border-white/10 w-full max-w-xl h-full p-6 text-left space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-black text-xl text-primary-text">{selectedTransfer.id}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedTransfer.status)}`}>
                      {selectedTransfer.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-text mt-0.5">Patient Reference: <strong className="text-medical-teal">{selectedTransfer.patientReference}</strong></p>
                </div>
                <button onClick={() => setSelectedTransfer(null)} className="text-muted-text hover:text-primary-text text-lg p-1">✕</button>
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-[10px] text-muted-text uppercase font-bold">Sending Hospital</p>
                  <p className="font-bold text-primary-text mt-1">{selectedTransfer.sendingHospitalName}</p>
                </div>

                <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-[10px] text-muted-text uppercase font-bold">Receiving Hospital</p>
                  <p className="font-bold text-medical-teal mt-1">{selectedTransfer.receivingHospitalName}</p>
                </div>
              </div>

              {/* Required Resources */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getPriorityBadgeClass(selectedTransfer.priority)}`}>
                    {selectedTransfer.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Department & Specialist:</span>
                  <span className="font-semibold text-primary-text">{selectedTransfer.requiredDepartment} · {selectedTransfer.requiredSpecialist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text font-bold">Required Resources:</span>
                  <span className="font-semibold text-primary-text">{selectedTransfer.requiredResources.join(', ')}</span>
                </div>
                {selectedTransfer.bloodRequirement && (
                  <div className="flex justify-between text-emergency pt-1 border-t border-white/5 font-bold">
                    <span>Blood Requirement:</span>
                    <span>{selectedTransfer.bloodRequirement.bloodGroup} ({selectedTransfer.bloodRequirement.units} Units)</span>
                  </div>
                )}
                {selectedTransfer.assignedAmbulanceNumber && (
                  <div className="flex justify-between text-info pt-1 border-t border-white/5 font-bold">
                    <span>Assigned Ambulance:</span>
                    <span>{selectedTransfer.assignedAmbulanceNumber}</span>
                  </div>
                )}
              </div>

              {/* REJECTION OR INFO REQUEST ALERTS */}
              {selectedTransfer.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-emergency/15 border border-emergency/30 text-emergency text-xs space-y-1">
                  <p className="font-black uppercase">Rejection Reason:</p>
                  <p className="font-semibold">{selectedTransfer.rejectionReason}</p>
                </div>
              )}

              {/* TIMELINE COMPONENT */}
              <div>
                <h5 className="font-heading font-black text-xs text-primary-text uppercase tracking-wider mb-3">TRANSFER TELEMETRY TIMELINE</h5>
                <div className="space-y-3 pl-2 border-l-2 border-medical-teal/30 text-xs">
                  {selectedTransfer.timeline.map((stepItem, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-medical-teal shadow-md shadow-medical-teal/50" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary-text">{stepItem.title}</span>
                        <span className="text-[10px] text-muted-text font-mono">{stepItem.timestamp}</span>
                      </div>
                      {stepItem.note && <p className="text-[11px] text-muted-text">{stepItem.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* AMBULANCE FLEET INTEGRATION */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary-text flex items-center gap-1.5">
                    <Activity size={16} className="text-medical-teal" /> Ambulance Fleet Assignment
                  </span>
                  <span className="text-[10px] text-muted-text">Ratnagiri Fleet</span>
                </div>

                {selectedTransfer.assignedAmbulanceNumber ? (
                  <p className="text-xs font-bold text-info">Assigned: {selectedTransfer.assignedAmbulanceNumber}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      id="ambulanceSelect"
                      className="bg-primary-bg border border-white/10 rounded-xl px-3 py-1.5 text-xs text-primary-text flex-1"
                    >
                      {hospitalAmbulances.map(a => (
                        <option key={a.id} value={a.id}>{a.ambulanceNumber} ({a.type})</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const sel = (document.getElementById('ambulanceSelect') as HTMLSelectElement)?.value;
                        const targetAmb = hospitalAmbulances.find(a => a.id === sel) || hospitalAmbulances[0];
                        if (targetAmb) handleAssignAmbulance(targetAmb);
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* INTERACTIVE WORKFLOW CONTROL BUTTONS */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[10px] text-muted-text font-extrabold uppercase tracking-widest block text-center">
                SIMULATED WORKFLOW CONTROLS
              </span>

              <div className="grid grid-cols-2 gap-2">
                {selectedTransfer.status === 'Pending' && (
                  <Button variant="primary" size="sm" onClick={() => handleAcceptTransfer(selectedTransfer)}>
                    Accept Transfer
                  </Button>
                )}
                {selectedTransfer.status === 'Accepted' && (
                  <Button variant="primary" size="sm" onClick={() => handleAdvanceStatus('Preparing')}>
                    Mark as Preparing
                  </Button>
                )}
                {selectedTransfer.status === 'Preparing' && (
                  <Button variant="primary" size="sm" onClick={() => handleAdvanceStatus('In Transit')}>
                    Mark as In Transit
                  </Button>
                )}
                {selectedTransfer.status === 'In Transit' && (
                  <Button variant="primary" size="sm" onClick={() => handleAdvanceStatus('Received')}>
                    Mark as Received
                  </Button>
                )}
                {selectedTransfer.status === 'Received' && (
                  <Button variant="primary" size="sm" onClick={() => handleAdvanceStatus('Completed')}>
                    Complete Transfer
                  </Button>
                )}

                <Button variant="secondary" size="sm" onClick={() => setSelectedTransfer(null)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary-bg-deep border border-white/10 rounded-2xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl"
          >
            <h4 className="font-heading font-black text-lg text-primary-text">Reason for Rejection</h4>
            <p className="text-xs text-muted-text">Select reason for rejecting transfer {showRejectModal.id}:</p>

            <div className="space-y-2 text-xs">
              {[
                'Emergency department overloaded',
                'No ICU capacity',
                'Specialist unavailable',
                'Required equipment offline',
                'Other operational constraint'
              ].map(reason => (
                <label key={reason} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 text-primary-text">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="accent-emergency"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <Button variant="secondary" onClick={() => setShowRejectModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmRejection}>Confirm Rejection</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* REQUEST MORE INFO MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary-bg-deep border border-white/10 rounded-2xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl"
          >
            <h4 className="font-heading font-black text-lg text-primary-text">Request Additional Information</h4>
            <p className="text-xs text-muted-text">Specify details required before accepting transfer {showInfoModal.id}:</p>
            <textarea
              value={infoText}
              onChange={(e) => setInfoText(e.target.value)}
              placeholder="e.g. Please provide current ventilator FiO2 parameter and ABG lab report."
              className="w-full bg-primary-bg border border-white/10 rounded-xl p-3 text-xs text-primary-text placeholder:text-muted-text focus:outline-none h-24"
            />
            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <Button variant="secondary" onClick={() => setShowInfoModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSendInfoRequest}>Send Request</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 10. HOSPITAL MAP (/hospital/map)
// ============================================================
export const HospitalMapPage: React.FC = () => {
  return (
    <Card className="p-6 border border-white/5 space-y-4">
      <div>
        <h3 className="font-heading font-black text-sm text-primary-text">Operational Map Grid</h3>
        <p className="text-xs text-muted-text">Regional coordinate vectors mapping your ambulances.</p>
      </div>
      <div className="w-full h-[320px] rounded-xl overflow-hidden border border-white/5">
        <InteractiveMap filterType="ambulance" />
      </div>
    </Card>
  );
};

// ============================================================
// 12. HOSPITAL NOTIFICATIONS (/hospital/notifications)
// ============================================================
export const HospitalNotificationsPage: React.FC = () => {
  const { notifications, refreshState } = useApp();

  const handleMarkRead = (id: string) => {
    const list = db.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    db.saveNotifications(updated);
    refreshState();
  };

  return (
    <Card className="p-8 border border-white/5 text-left">
      <h3 className="font-heading font-black text-base text-primary-text mb-6">Alert Notifications Feed</h3>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 border rounded-xl flex justify-between items-start ${n.isRead ? 'bg-white/[0.01] border-white/5' : 'bg-medical-teal/5 border-medical-teal/20'}`}>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-primary-text">{n.title}</h5>
              <p className="text-xs text-secondary-text leading-normal">{n.description}</p>
              <span className="text-[10px] text-muted-text block">{n.timestamp}</span>
            </div>
            {!n.isRead && (
              <Button variant="outline" size="sm" className="text-[10px] py-1 px-2.5" onClick={() => handleMarkRead(n.id)}>
                Dismiss
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
