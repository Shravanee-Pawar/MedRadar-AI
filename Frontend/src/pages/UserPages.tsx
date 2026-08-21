import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { FreshnessIndicator } from '../components/FreshnessIndicator';
import { ReadinessScore } from '../components/ReadinessScore';
import { AIRecommendationLoader } from '../components/AIRecommendationLoader';
import {
  emergencyService
} from '../services/emergencyService';
import {
  hospitalService
} from '../services/hospitalService';
import {
  bloodService
} from '../services/bloodService';
import {
  doctorService
} from '../services/doctorService';
import {
  Building2,
  Droplet,
  User as UserIcon,
  Flame,
  Search,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  MapPin,
  Activity,
  Phone,
  ArrowLeft,
  Star,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Hospital, type Doctor, type Ambulance, type EmergencyRequest } from '../types';
import { CustomSelect } from '../components/CustomSelect';

// ============================================================
// 0. USER DASHBOARD PAGE (/user/dashboard)
// ============================================================
export const UserDashboardPage: React.FC = () => {
  const { currentUser, hospitals, doctors, emergencyRequests } = useApp();
  const navigate = useNavigate();

  const [emergencyType, setEmergencyType] = useState<'Road Accident' | 'Chest Pain' | 'Stroke' | 'Breathing Emergency' | 'Burns' | 'Pregnancy Emergency' | 'Pediatric Emergency' | 'Other'>('Road Accident');
  const [location, setLocation] = useState('Ratnagiri');
  const [requiredResources, setRequiredResources] = useState<string[]>(['icu_beds', 'ventilators', 'specialist']);
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const activeSOS = emergencyRequests.filter(r => r.status !== 'Resolved').length;

  const handleToggleRes = (id: string) => {
    setRequiredResources(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-secondary-surface to-primary-bg p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-medical-teal/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="font-heading font-black text-xl text-primary-text">
            Good evening, {currentUser?.name || 'MedRadar Operator'}
          </h2>
          <p className="text-xs text-muted-text mt-1.5">
            Identify verified emergency capacity across Ratnagiri District.
          </p>
        </div>
        <Button variant="emergency" size="sm" onClick={() => navigate('/user/emergency')}>
          🚨 Trigger Emergency SOS
        </Button>
      </div>

      {/* Grid metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Nearby Hospitals', val: hospitals.filter(h => h.verified).length, icon: Building2, path: '/user/hospitals' },
          { label: 'Blood Availability', val: 'Available', icon: Droplet, path: '/user/blood' },
          { label: 'Active Specialists', val: doctors.filter(d => d.status === 'Available').length, icon: UserIcon, path: '/user/specialists' },
          { label: 'My Active SOS', val: activeSOS, icon: 'Flame', path: '/user/emergency?tab=requests' }
        ].map((m, i) => {
          const Icon = m.label === 'Nearby Hospitals' ? Building2 : m.label === 'Blood Availability' ? Droplet : m.label === 'Active Specialists' ? UserIcon : Flame;
          return (
            <Card
              key={i}
              className="p-5 border border-white/5 hover:border-medical-teal/30 hover:bg-white/[0.01] cursor-pointer transition-all flex items-center justify-between"
              onClick={() => navigate(m.path)}
            >
              <div>
                <span className="text-[10px] text-muted-text uppercase font-bold tracking-wider">{m.label}</span>
                <h4 className="font-heading font-black text-base text-primary-text mt-1">{m.val}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center text-medical-teal bg-medical-teal/5">
                <Icon size={15} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Emergency Resource Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 border border-white/5 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-medical-teal bg-medical-teal/10 px-2 py-0.5 rounded border border-medical-teal/20">
              AI Core
            </span>
            <h3 className="font-heading font-black text-sm text-primary-text">AI Emergency Resource Matching</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Incident Type</label>
                <CustomSelect
                  value={emergencyType}
                  onChange={(val) => setEmergencyType(val as any)}
                  options={[
                    { value: 'Road Accident', label: 'Road Accident' },
                    { value: 'Chest Pain', label: 'Chest Pain' },
                    { value: 'Stroke', label: 'Stroke' }
                  ]}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Target Geography</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text bg-secondary-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Select Resource Constraints</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'icu_beds', label: 'ICU Beds' },
                  { id: 'ventilators', label: 'Ventilators' },
                  { id: 'specialist', label: 'Trauma Doctor' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleToggleRes(r.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold text-left border flex items-center justify-between transition-all ${
                      requiredResources.includes(r.id)
                        ? 'bg-medical-teal/10 border-medical-teal/40 text-medical-teal'
                        : 'bg-white/[0.01] border-white/5 text-secondary-text hover:bg-white/5'
                    }`}
                  >
                    <span>{r.label}</span>
                    {requiredResources.includes(r.id) && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsAiMatching(true);
                setShowResult(false);
              }}
            >
              Analyze Requirements
            </Button>
          </div>
        </Card>

        {/* AI Match Simulator Card */}
        <Card className="p-8 border border-white/10 flex flex-col justify-center min-h-[250px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-medical-teal/5 rounded-full blur-xl pointer-events-none" />
          
          {isAiMatching ? (
            <AIRecommendationLoader onComplete={() => {
              setIsAiMatching(false);
              setShowResult(true);
            }} />
          ) : showResult ? (
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-black text-medical-teal bg-medical-teal/10 px-2 py-0.5 rounded border border-medical-teal/20">
                  94% Resource Match
                </span>
                <span className="text-[10px] text-muted-text">Updated 6m ago</span>
              </div>
              <h4 className="font-heading font-black text-sm text-primary-text">Parkar Hospital & Research Institute</h4>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-1.5 text-[10.5px] text-secondary-text leading-normal">
                <div className="flex items-center gap-1.5 text-success">
                  <Check size={11} /> ICU reported available
                </div>
                <div className="flex items-center gap-1.5 text-success">
                  <Check size={11} /> Trauma specialist available
                </div>
                <div className="flex items-center gap-1.5 text-success">
                  <Check size={11} /> Ventilator reported available
                </div>
                <div className="flex items-center gap-1.5 text-muted-text">
                  <MapPin size={11} /> 1.8 km estimated distance
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full text-xs" onClick={() => navigate('/user/emergency')}>
                View Recommendation
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center mx-auto text-muted-text">
                <Activity size={18} />
              </div>
              <h5 className="font-heading font-bold text-xs text-primary-text">Roster Matching Engine</h5>
              <p className="text-[11px] text-muted-text max-w-[200px] mx-auto leading-relaxed">
                Run analysis to align resource vectors.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================================
// 1. EMERGENCY SOS PAGE (/user/emergency)
// ============================================================
export const UserEmergencyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'sos';
  const { currentUser, hospitals, ambulances, doctors, resources } = useApp();

  // Workflow Step State (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State — Emergency Category
  const [emergencyType, setEmergencyType] = useState<string>('Road Accident / Poly-Trauma');

  // Step 2 State — Emergency Location
  const [locationType, setLocationType] = useState<'current_gps' | 'manual'>('current_gps');
  const [manualLocation, setManualLocation] = useState<string>('Ratnagiri Highway Sector 2, MH-08');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsDetectedAddress, setGpsDetectedAddress] = useState<string>('16.9944° N, 73.3033° E — Ratnagiri, Maharashtra');
  const [gpsLat, setGpsLat] = useState<number>(16.9944);
  const [gpsLng, setGpsLng] = useState<number>(73.3033);
  const [isGpsGranted, setIsGpsGranted] = useState<boolean>(true);

  // Step 3 State — Required Resources
  const [requiredResourceIds, setRequiredResourceIds] = useState<string[]>([]);

  // Step 4 State — AI Hospital Recommendations
  const [isAiMatching, setIsAiMatching] = useState<boolean>(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [selectedHospitalForInspection, setSelectedHospitalForInspection] = useState<Hospital | null>(null);

  // Step 5 State — Selected Hospital Confirmation
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Step 6 State — Ambulance Dispatch & Tracking
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState<'Advanced Life Support' | 'Basic Life Support' | 'Patient Transport' | 'Neonatal Ambulance'>('Advanced Life Support');
  const [isAmbulanceDispatched, setIsAmbulanceDispatched] = useState<boolean>(false);
  const [dispatchedAmbulance, setDispatchedAmbulance] = useState<Ambulance | null>(null);
  const [simulatedTrackingStatus, setSimulatedTrackingStatus] = useState<'REQUESTED' | 'DISPATCHED' | 'EN ROUTE' | 'ARRIVED' | 'PATIENT PICKUP' | 'HOSPITAL ARRIVAL'>('DISPATCHED');

  // Hospital Pre-Alert Modal State
  const [showPreAlertModal, setShowPreAlertModal] = useState<boolean>(false);
  const [patientPhone, setPatientPhone] = useState<string>(currentUser?.mobile || '+91 98220 99887');
  const [isPreAlertSent, setIsPreAlertSent] = useState<boolean>(false);
  const [activeReqId, setActiveReqId] = useState<string | null>(null);

  // Logs & History State
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  const fetchEmergencyLogs = useCallback(async () => {
    const list = await emergencyService.getEmergencyRequests();
    setRequests(list);
  }, []);

  useEffect(() => {
    fetchEmergencyLogs();
    const interval = setInterval(fetchEmergencyLogs, 2500);
    return () => clearInterval(interval);
  }, [fetchEmergencyLogs]);

  // Update resource requirements automatically when emergency category changes
  useEffect(() => {
    const mapping = emergencyService.getEmergencyResourceMapping(emergencyType);
    setRequiredResourceIds(mapping.required.map(r => r.id));
  }, [emergencyType]);

  // Geolocation Handler
  const handleDetectCurrentLocation = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E — Ratnagiri Central Grid, Maharashtra`;
          setGpsLat(lat);
          setGpsLng(lng);
          setGpsDetectedAddress(address);
          setIsGpsGranted(true);
          setLocationType('current_gps');
          setIsDetectingGps(false);
        },
        () => {
          // Fallback location for prototype
          const lat = 16.9944;
          const lng = 73.3033;
          const address = `16.9944° N, 73.3033° E — Ratnagiri Highway Sector 2, Maharashtra`;
          setGpsLat(lat);
          setGpsLng(lng);
          setGpsDetectedAddress(address);
          setIsGpsGranted(true);
          setLocationType('current_gps');
          setIsDetectingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      const lat = 16.9944;
      const lng = 73.3033;
      const address = `16.9944° N, 73.3033° E — Ratnagiri Highway Sector 2, Maharashtra`;
      setGpsLat(lat);
      setGpsLng(lng);
      setGpsDetectedAddress(address);
      setIsGpsGranted(true);
      setLocationType('current_gps');
      setIsDetectingGps(false);
    }
  };

  const getEffectiveLocationString = () => {
    return locationType === 'current_gps' ? gpsDetectedAddress : manualLocation;
  };

  // Trigger AI hospital matching
  const handleTriggerAIMatching = async () => {
    setCurrentStep(4);
    setIsAiMatching(true);
    
    const activeLoc = getEffectiveLocationString();

    const newReq = await emergencyService.triggerSOS(
      emergencyType,
      activeLoc,
      requiredResourceIds,
      currentUser?.id || 'guest-01',
      currentUser?.name || 'Emergency Patient',
      locationType,
      activeLoc,
      gpsLat,
      gpsLng
    );
    setActiveReqId(newReq.id);

    // Fetch recommendations from backend database storage
    setTimeout(() => {
      const backendRecs = db.getRecommendations();

      const normalizeHospitalId = (id: string): string => {
        const match = id.match(/^hosp-(\d+)$/);
        if (match) {
          return `hosp-${parseInt(match[1], 10)}`;
        }
        return id;
      };

      const getRequiredDoctorSpecialties = (type: string): string[] => {
        switch (type) {
          case 'Cardiac Emergency':
            return ['cardiologist', 'cardiology'];
          case 'Stroke / Neurological Trauma':
            return ['neurologist', 'neurosurgeon', 'neurosurgery', 'neurology'];
          case 'Road Accident / Poly-Trauma':
            return ['trauma surgeon', 'orthopedic surgeon', 'emergency medicine', 'general surgery & trauma', 'trauma'];
          case 'Severe Burns':
            return ['plastic/burns surgeon', 'burns/plastic specialist', 'plastic surgeon', 'burn care', 'trauma specialist'];
          case 'Respiratory Emergency':
            return ['pulmonologist', 'critical care specialist', 'critical care / emergency medicine', 'pulmonology'];
          case 'Pediatric Emergency':
            return ['pediatrician', 'pediatric specialist', 'pediatrics'];
          case 'Pregnancy / Obstetric Emergency':
            return ['obstetrician', 'gynecologist', 'obstetrician / gynecologist', 'gynaecology', 'obstetrics'];
          case 'Critical Bleeding':
            return ['emergency medicine', 'trauma surgeon', 'vascular / trauma surgeon', 'critical care / emergency medicine', 'general surgery & trauma'];
          default:
            return ['emergency medicine', 'critical care / emergency medicine', 'general medicine'];
        }
      };

      if (backendRecs && backendRecs.length > 0) {
        const mapped = backendRecs.map((rec) => {
          const normHospId = normalizeHospitalId(rec.hospitalId);
          const hospital = hospitals.find((h) => normalizeHospitalId(h.id) === normHospId) || hospitals[0];
          
          const requiredSpecialties = getRequiredDoctorSpecialties(emergencyType);
          const hospitalDoctors = doctors.filter((d) => normalizeHospitalId(d.hospitalId) === normHospId);
          const doctor = hospitalDoctors.find((d) => {
            const ds = (d.specialization || d.specialty || '').toLowerCase();
            return requiredSpecialties.some((spec) => ds.includes(spec) || spec.includes(ds));
          }) || hospitalDoctors.find((d) => d.status === 'Available' || d.emergencyDuty) || hospitalDoctors[0] || doctors[0];

          const hasICU = resources.some((r) => normalizeHospitalId(r.hospitalId) === normHospId && r.resourceType === 'icu_beds' && r.available > 0);
          const hasVentilator = resources.some((r) => normalizeHospitalId(r.hospitalId) === normHospId && r.resourceType === 'ventilators' && r.available > 0);

          return {
            hospital,
            matchScore: rec.matchScore,
            travelTimeMin: rec.estimatedTravelTimeMin,
            distanceKm: rec.distanceKm,
            doctor,
            hasICU,
            hasVentilator,
            reason: rec.reason,
            reasonTags: rec.reasonTags || [],
          };
        });

        setAiRecommendations(mapped);
      } else {
        const mapped = hospitals
          .filter((h) => h.verified && h.emergencyStatus !== 'Critical')
          .map((h, idx) => {
            let matchScore = 96 - idx * 5;
            const normHospId = normalizeHospitalId(h.id);
            const matchedDoctor = doctors.find((d) => normalizeHospitalId(d.hospitalId) === normHospId && (d.availabilityStatus === 'Available' || d.status === 'Available')) || doctors[0];
            const hasICU = resources.some((r) => normalizeHospitalId(r.hospitalId) === normHospId && r.resourceType === 'icu_beds' && r.available > 0);
            const hasVentilator = resources.some((r) => normalizeHospitalId(r.hospitalId) === normHospId && r.resourceType === 'ventilators' && r.available > 0);

            if (!hasICU) matchScore -= 10;
            matchScore = Math.max(70, Math.min(99, matchScore));

            const travelTimeMin = Math.max(4, Math.round(h.distanceFromUserKm * 2.8));

            return {
              hospital: h,
              matchScore,
              travelTimeMin,
              distanceKm: h.distanceFromUserKm,
              doctor: matchedDoctor,
              hasICU,
              hasVentilator,
              reason: `Recommended Resource Match: ${h.name} currently reports available Emergency Department capacity, on-duty specialist (${matchedDoctor.name}), ${hasICU ? 'ICU availability' : 'emergency beds'}, and is located ${h.distanceFromUserKm} km (${travelTimeMin} min) from incident coordinates.`,
              reasonTags: [`${h.distanceFromUserKm} km away`, 'Emergency Dept Free'],
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore);

        setAiRecommendations(mapped);
      }

      setIsAiMatching(false);
      fetchEmergencyLogs();
    }, 1800);
  };

  // Confirm Ambulance Dispatch
  const handleConfirmAmbulanceDispatch = () => {
    if (!selectedHospital) return;
    setIsAmbulanceDispatched(true);
    setSimulatedTrackingStatus('DISPATCHED');

    const matchedAmb = ambulances.find(a => a.hospitalId === selectedHospital.id && a.status === 'Available') || ambulances[0];
    setDispatchedAmbulance(matchedAmb);

    // Progress simulated tracking state after delay
    setTimeout(() => {
      setSimulatedTrackingStatus('EN ROUTE');
    }, 3000);
  };

  // Send Emergency Arrival Request (Pre-Alert)
  const handleSendPreAlert = async () => {
    if (!selectedHospital || !activeReqId) return;

    await emergencyService.sendHospitalPreAlert(
      activeReqId,
      selectedHospital.id,
      selectedHospital.name,
      currentUser?.name || 'Emergency Patient',
      patientPhone,
      emergencyType,
      getEffectiveLocationString(),
      6,
      dispatchedAmbulance?.id,
      dispatchedAmbulance?.ambulanceNumber
    );

    setIsPreAlertSent(true);
    setShowPreAlertModal(false);
    fetchEmergencyLogs();
  };

  const stepsList = [
    { num: 1, title: 'Emergency', label: '01 Emergency' },
    { num: 2, title: 'Location', label: '02 Location' },
    { num: 3, title: 'Requirements', label: '03 Requirements' },
    { num: 4, title: 'Recommendations', label: '04 Recommendations' },
    { num: 5, title: 'Ambulance', label: '05 Ambulance' },
    { num: 6, title: 'Hospital Alert', label: '06 Hospital Alert' }
  ];

  const emergencyCategories = [
    { id: 'Road Accident / Poly-Trauma', label: 'Road Accident / Poly-Trauma', icon: '🚗' },
    { id: 'Cardiac Emergency', label: 'Cardiac Emergency', icon: '❤️' },
    { id: 'Stroke / Neurological Trauma', label: 'Stroke / Neurological Trauma', icon: '🧠' },
    { id: 'Severe Burns', label: 'Severe Burns', icon: '🔥' },
    { id: 'Respiratory Emergency', label: 'Respiratory Emergency', icon: '🫁' },
    { id: 'Critical Bleeding', label: 'Critical Bleeding', icon: '🩸' },
    { id: 'Pediatric Emergency', label: 'Pediatric Emergency', icon: '👶' },
    { id: 'Pregnancy / Obstetric Emergency', label: 'Pregnancy / Obstetric Emergency', icon: '🤰' },
    { id: 'Other Emergency', label: 'Other Emergency Incident', icon: '⚕' }
  ];

  const currentMapping = emergencyService.getEmergencyResourceMapping(emergencyType);

  return (
    <div className="space-y-6 text-left">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-emergency/15 text-emergency flex items-center justify-center font-bold text-lg">
            🚨
          </span>
          <div>
            <h2 className="font-heading font-black text-lg text-primary-text">Emergency SOS Coordination Center</h2>
            <p className="text-xs text-muted-text">Real-time emergency resource matching & ambulance dispatch pipeline.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setSearchParams({ tab: 'sos' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'sos' ? 'bg-emergency/20 text-emergency border border-emergency/30' : 'text-muted-text hover:text-primary-text'
            }`}
          >
            🚨 Live SOS Workflow
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'requests' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'requests' ? 'bg-medical-teal/20 text-medical-teal border border-medical-teal/30' : 'text-muted-text hover:text-primary-text'
            }`}
          >
            Active Requests ({requests.filter(r => r.status !== 'Resolved').length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'history' })}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'history' ? 'bg-white/10 text-primary-text' : 'text-muted-text hover:text-primary-text'
            }`}
          >
            History Logs
          </button>
        </div>
      </div>

      {activeTab === 'sos' && (
        <div className="space-y-6">
          {/* Animated 6-Step Progress Indicator Stepper */}
          <Card className="p-4 border border-white/5 bg-[#0F172A]/80 backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {stepsList.map(step => {
                const isCurrent = currentStep === step.num;
                const isCompleted = currentStep > step.num;

                return (
                  <div
                    key={step.num}
                    onClick={() => {
                      if (isCompleted) setCurrentStep(step.num);
                    }}
                    className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-medical-teal/15 border-medical-teal/50 text-medical-teal shadow-lg shadow-medical-teal/10'
                        : isCompleted
                        ? 'bg-success/10 border-success/30 text-success'
                        : 'bg-white/[0.01] border-white/5 text-muted-text'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-medical-teal text-primary-bg-deep'
                          : isCompleted
                          ? 'bg-success text-primary-bg-deep'
                          : 'bg-white/10 text-muted-text'
                      }`}
                    >
                      {isCompleted ? '✓' : step.num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold block truncate">{step.label}</span>
                      <span className="text-[9px] opacity-75 block truncate">
                        {isCurrent ? 'Active Step' : isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* STEP 1: EMERGENCY TYPE */}
          {currentStep === 1 && (
            <Card className="p-8 border border-white/5 space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <span className="w-12 h-12 rounded-2xl bg-emergency/15 text-emergency flex items-center justify-center text-xl font-bold">
                  🚨
                </span>
                <div>
                  <h3 className="font-heading font-black text-xl text-primary-text">What happened?</h3>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed">
                    Select the emergency so MedRadar AI can identify the healthcare resources required.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">
                  Select Emergency Category
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {emergencyCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEmergencyType(cat.id)}
                      className={`p-4 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                        emergencyType === cat.id
                          ? 'bg-emergency/15 border-emergency/50 text-primary-text shadow-lg shadow-emergency/10 scale-[1.02]'
                          : 'bg-white/[0.01] border-white/5 text-secondary-text hover:bg-white/5'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-bold leading-snug">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <Button
                  variant="emergency"
                  size="md"
                  className="font-black px-6 text-xs"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Location <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <Card className="p-8 border border-white/5 space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <span className="w-12 h-12 rounded-2xl bg-medical-teal/15 text-medical-teal flex items-center justify-center text-xl font-bold">
                  📍
                </span>
                <div>
                  <h3 className="font-heading font-black text-xl text-primary-text">Where is the emergency?</h3>
                  <p className="text-xs text-muted-text mt-1 leading-relaxed">
                    Share the emergency location and let MedRadar AI identify the most suitable nearby healthcare resources.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OPTION A — Current Location */}
                <div
                  onClick={() => handleDetectCurrentLocation()}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    locationType === 'current_gps'
                      ? 'bg-medical-teal/10 border-medical-teal/50 text-primary-text shadow-lg shadow-medical-teal/10'
                      : 'bg-white/[0.01] border-white/5 text-secondary-text hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-medical-teal flex items-center gap-2">
                      <MapPin size={16} /> Option A — Current Location
                    </span>
                    {locationType === 'current_gps' && <Check size={16} className="text-medical-teal font-black" />}
                  </div>

                  <p className="text-xs text-muted-text leading-relaxed">
                    Use browser device GPS coordinates to pinpoint incident site automatically.
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDetectCurrentLocation();
                    }}
                  >
                    {isDetectingGps ? 'Detecting Location...' : '📍 Use Current Location'}
                  </Button>

                  {isGpsGranted && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1 text-[11px] text-secondary-text">
                      <span className="text-success font-bold block flex items-center gap-1">
                        ✓ Current Location Detected
                      </span>
                      <p className="font-mono text-primary-text">{gpsDetectedAddress}</p>
                    </div>
                  )}
                </div>

                {/* OPTION B — Enter Location Manually */}
                <div
                  onClick={() => setLocationType('manual')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    locationType === 'manual'
                      ? 'bg-medical-teal/10 border-medical-teal/50 text-primary-text shadow-lg shadow-medical-teal/10'
                      : 'bg-white/[0.01] border-white/5 text-secondary-text hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-medical-teal flex items-center gap-2">
                      ✍️ Option B — Enter Manually
                    </span>
                    {locationType === 'manual' && <Check size={16} className="text-medical-teal font-black" />}
                  </div>

                  <p className="text-xs text-muted-text leading-relaxed">
                    Manually specify Highway, Landmark, Area, or City (independent of home address).
                  </p>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] uppercase font-bold text-muted-text block">EMERGENCY LOCATION</label>
                    <input
                      type="text"
                      value={manualLocation}
                      onChange={(e) => {
                        setManualLocation(e.target.value);
                        setLocationType('manual');
                      }}
                      placeholder="e.g., Mumbai-Goa Highway near Lanja Sector 3"
                      className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <Button variant="secondary" size="md" className="font-bold text-xs" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={14} className="mr-2" /> Back
                </Button>
                <Button variant="primary" size="md" className="font-black px-6 text-xs" onClick={() => setCurrentStep(3)}>
                  Continue to Requirements <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: REQUIRED RESOURCES */}
          {currentStep === 3 && (
            <Card className="p-8 border border-white/5 space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-medical-teal/15 text-medical-teal flex items-center justify-center text-xl font-bold">
                    🩺
                  </span>
                  <div>
                    <h3 className="font-heading font-black text-xl text-primary-text">Resources Identified</h3>
                    <p className="text-xs text-muted-text mt-1 leading-relaxed">
                      MedRadar AI resource matching algorithm based on category: <strong>{emergencyType}</strong>.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-text bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  Resource Matching (Not Clinical Protocol)
                </span>
              </div>

              {/* Required Resources List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emergency flex items-center gap-2">
                  🚨 Essential Required Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMapping.required.map(res => (
                    <div key={res.id} className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3 text-xs">
                      <span className="text-xl">{res.icon}</span>
                      <span className="font-bold text-primary-text">{res.label}</span>
                      <span className="ml-auto text-[9px] bg-emergency/15 text-emergency font-bold px-2 py-0.5 rounded">Required</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditional / Potential Resources List */}
              {currentMapping.potential.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-2">
                    ⚡ Conditional / Potentially Required Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentMapping.potential.map(res => (
                      <div key={res.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center gap-3 text-xs text-secondary-text">
                        <span className="text-xl">{res.icon}</span>
                        <span className="font-semibold text-secondary-text">{res.label}</span>
                        <span className="ml-auto text-[9px] bg-warning/15 text-warning font-bold px-2 py-0.5 rounded">Conditional</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <Button variant="secondary" size="md" className="font-bold text-xs" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft size={14} className="mr-2" /> Back
                </Button>
                <Button
                  variant="emergency"
                  size="md"
                  className="font-black px-6 text-xs"
                  onClick={handleTriggerAIMatching}
                >
                  Find Matching Hospitals →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: AI HOSPITAL RECOMMENDATIONS */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {isAiMatching ? (
                <Card className="p-12 border border-white/10 text-center min-h-[350px] flex items-center justify-center">
                  <AIRecommendationLoader onComplete={() => setIsAiMatching(false)} />
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Header Banner */}
                  <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                    <div>
                      <h3 className="font-heading font-black text-lg text-primary-text">Recommended Hospital Matches</h3>
                      <p className="text-xs text-muted-text mt-1">
                        Ranked by reported resource availability, distance, travel time, and specialist presence.
                      </p>
                    </div>
                    <span className="text-xs text-medical-teal font-bold bg-medical-teal/10 px-3 py-1 rounded-lg border border-medical-teal/20">
                      {aiRecommendations.length} Facilities Correlated
                    </span>
                  </div>

                  {/* Recommendation Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    {aiRecommendations.map((rec, idx) => (
                      <Card
                        key={rec.hospital.id}
                        className={`p-6 border transition-all duration-300 ${
                          idx === 0
                            ? 'border-medical-teal/40 bg-medical-teal/[0.02] shadow-xl shadow-medical-teal/5'
                            : 'border-white/5 bg-white/[0.01]'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-heading font-black text-base text-primary-text">{rec.hospital.name}</h4>
                              {rec.hospital.verified && (
                                <span className="text-[9px] bg-success/15 text-success font-black px-2 py-0.5 rounded border border-success/30 flex items-center gap-1">
                                  <ShieldCheck size={10} /> Verified Hospital
                                </span>
                              )}
                              <span className="text-xs font-black text-medical-teal bg-medical-teal/10 px-2.5 py-0.5 rounded-lg border border-medical-teal/20">
                                {rec.matchScore}% Recommended Resource Match
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-secondary-text">
                              <span className="flex items-center gap-1"><MapPin size={13} className="text-medical-teal" /> {rec.distanceKm} km away</span>
                              <span className="flex items-center gap-1"><Clock size={13} className="text-medical-teal" /> ~{rec.travelTimeMin} min travel time</span>
                              <span className="text-muted-text">Updated 5m ago</span>
                            </div>

                            {/* Why Recommended AI Explainability */}
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-muted-text italic">
                              "{rec.reason}"
                            </div>

                            {/* Resource Chips */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-primary-text font-bold">✓ Emergency Department</span>
                              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-primary-text font-bold">✓ {rec.doctor.name} ({rec.doctor.specialization || rec.doctor.specialty})</span>
                              {rec.hasICU && <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-primary-text font-bold">✓ ICU Capacity Reported</span>}
                              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-primary-text font-bold">✓ ALS Ambulance Fleet</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 w-full md:w-48 shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs font-bold py-2"
                              onClick={() => setSelectedHospitalForInspection(rec.hospital)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="emergency"
                              size="sm"
                              className="w-full text-xs font-black py-2.5"
                              onClick={() => {
                                setSelectedHospital(rec.hospital);
                                setCurrentStep(5);
                              }}
                            >
                              Select Hospital →
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: HOSPITAL SELECTION & CONFIRMATION */}
          {currentStep === 5 && selectedHospital && (
            <Card className="p-8 border border-white/5 space-y-6 max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <span className="w-12 h-12 rounded-2xl bg-success/15 text-success flex items-center justify-center text-xl font-bold">
                  ✓
                </span>
                <div>
                  <h3 className="font-heading font-black text-xl text-primary-text">Hospital Selected</h3>
                  <p className="text-xs text-muted-text mt-0.5">Confirm ambulance dispatch or arrival navigation options.</p>
                </div>
              </div>

              {/* Selected Hospital Summary Box */}
              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading font-black text-base text-primary-text">{selectedHospital.name}</h4>
                  <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-0.5 rounded border border-success/20">
                    93% Resource Match
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-secondary-text">
                  <div><strong>Distance:</strong> {selectedHospital.distanceFromUserKm} km</div>
                  <div><strong>ETA Window:</strong> ~5 minutes</div>
                  <div><strong>Emergency Status:</strong> {selectedHospital.emergencyStatus}</div>
                  <div><strong>Address:</strong> {selectedHospital.address}</div>
                </div>
              </div>

              {/* Next Action Selection */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-text">Choose Dispatch Method:</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="emergency"
                    size="md"
                    className="w-full text-xs font-black py-3"
                    onClick={() => setCurrentStep(6)}
                  >
                    🚑 Request & Dispatch Emergency Ambulance →
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs font-bold py-2.5"
                      onClick={() => alert(`Opening navigation route to ${selectedHospital.name}`)}
                    >
                      🗺️ Navigate Myself
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold py-2.5"
                      onClick={() => setCurrentStep(4)}
                    >
                      🔄 Change Hospital
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 6: AMBULANCE DISPATCH & LIVE TRACKING */}
          {currentStep === 6 && selectedHospital && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {!isAmbulanceDispatched ? (
                <Card className="p-8 border border-white/5 space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <span className="w-12 h-12 rounded-2xl bg-emergency/15 text-emergency flex items-center justify-center text-2xl font-bold">
                      🚑
                    </span>
                    <div>
                      <h3 className="font-heading font-black text-xl text-primary-text">Request Emergency Ambulance</h3>
                      <p className="text-xs text-muted-text mt-0.5">Select ambulance tier for incident dispatch.</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-text">Pickup Location:</span>
                      <p className="text-primary-text font-bold">{getEffectiveLocationString()}</p>
                    </div>
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-text">Destination Facility:</span>
                      <p className="text-primary-text font-bold">{selectedHospital.name}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-muted-text block">Select Ambulance Tier</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'Advanced Life Support', label: 'Advanced Life Support (Recommended)', desc: 'Ventilator, Cardiac Monitor, Defibrillator' },
                          { id: 'Basic Life Support', label: 'Basic Life Support', desc: 'First Aid, Oxygen, Stretcher' },
                          { id: 'Patient Transport', label: 'Patient Transport', desc: 'Non-emergency transport' },
                          { id: 'Neonatal Ambulance', label: 'Neonatal Ambulance', desc: 'Infant Incubator Suite' }
                        ].map(tier => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setSelectedAmbulanceType(tier.id as any)}
                            className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                              selectedAmbulanceType === tier.id
                                ? 'bg-emergency/15 border-emergency/50 text-primary-text'
                                : 'bg-white/[0.01] border-white/5 text-muted-text'
                            }`}
                          >
                            <span className="font-bold text-xs block">{tier.label}</span>
                            <span className="text-[9px] text-muted-text block">{tier.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="emergency"
                    size="md"
                    className="w-full text-xs font-black py-3.5"
                    onClick={handleConfirmAmbulanceDispatch}
                  >
                    Confirm Ambulance Dispatch →
                  </Button>
                </Card>
              ) : (
                /* LIVE SIMULATED TRACKING PIPELINE */
                <Card className="p-8 border border-white/5 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
                        <h3 className="font-heading font-black text-xl text-primary-text">Ambulance Unit Dispatched</h3>
                      </div>
                      <p className="text-xs text-muted-text mt-1">
                        Unit ID: <strong>{dispatchedAmbulance?.ambulanceNumber || 'AMB-RAT-004'}</strong> ({selectedAmbulanceType})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-heading font-black text-emergency block">ETA: 6 mins</span>
                      <span className="text-[10px] text-muted-text italic">Demo / Simulated Tracking Grid</span>
                    </div>
                  </div>

                  {/* Animated Tracking Pipeline Stepper */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold text-center">
                      {['REQUESTED', 'DISPATCHED', 'EN ROUTE', 'ARRIVED', 'PATIENT PICKUP', 'HOSPITAL ARRIVAL'].map((st, idx) => {
                        const isCurrent = simulatedTrackingStatus === st;
                        const isDone = ['REQUESTED', 'DISPATCHED', 'EN ROUTE', 'ARRIVED', 'PATIENT PICKUP', 'HOSPITAL ARRIVAL'].indexOf(simulatedTrackingStatus) >= idx;

                        return (
                          <div key={st} className="flex-1 space-y-1">
                            <div
                              className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-black ${
                                isCurrent
                                  ? 'bg-emergency text-primary-text animate-bounce'
                                  : isDone
                                  ? 'bg-success text-primary-bg-deep'
                                  : 'bg-white/10 text-muted-text'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[9px] block ${isCurrent ? 'text-emergency font-black' : isDone ? 'text-success' : 'text-muted-text'}`}>
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <Button variant="secondary" className="text-xs font-bold py-2.5" onClick={() => alert('Opening simulated live GPS map feed...')}>
                      📡 Track Ambulance
                    </Button>
                    <a
                      href="tel:108"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-primary-text text-xs rounded-xl inline-flex items-center justify-center font-bold text-center"
                    >
                      📞 Call Ambulance (108)
                    </a>
                    <a
                      href={`tel:${selectedHospital.phone}`}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-primary-text text-xs rounded-xl inline-flex items-center justify-center font-bold text-center"
                    >
                      🏥 Contact Hospital
                    </a>
                    <Button
                      variant="emergency"
                      className="text-xs font-black py-2.5"
                      onClick={() => setShowPreAlertModal(true)}
                    >
                      🚨 Send Pre-Alert Arrival Request
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* EMERGENCY REQUEST HISTORY TAB */}
      {activeTab === 'requests' && (
        <Card className="p-8 border border-white/5 space-y-4">
          <h3 className="font-heading font-black text-base text-primary-text">Active Emergency Requests</h3>
          <div className="space-y-3">
            {requests.filter(r => r.status !== 'Resolved').map((req) => (
              <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-text text-sm">{req.emergencyType}</span>
                    <StatusBadge status={req.status as any} />
                    {req.hospitalAlertStatus === 'acknowledged' && (
                      <span className="text-[9px] bg-success/15 text-success font-bold px-2 py-0.5 rounded border border-success/30">
                        ✓ Hospital Acknowledged
                      </span>
                    )}
                  </div>
                  <p className="text-muted-text">Incident Location: {req.location}</p>
                  {req.selectedHospitalName && (
                    <p className="text-medical-teal font-bold">Destination Facility: {req.selectedHospitalName}</p>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[10px] font-mono text-muted-text block">{req.id}</span>
                  <span className="text-[10px] text-muted-text block">{req.createdAt.includes('T') ? 'Just now' : req.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* HISTORICAL LOGS TAB */}
      {activeTab === 'history' && (
        <Card className="p-8 border border-white/5 space-y-4">
          <h3 className="font-heading font-black text-base text-primary-text">Emergency SOS History Logs</h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center opacity-75 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-text">{req.emergencyType}</span>
                    <StatusBadge status={req.status as any} />
                  </div>
                  <p className="text-muted-text">{req.location}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-text">{req.id}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* HOSPITAL PRE-ALERT ARRIVAL MODAL */}
      <AnimatePresence>
        {showPreAlertModal && selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/70 backdrop-blur-sm" onClick={() => setShowPreAlertModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="z-10 w-full max-w-lg bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-5 text-left"
            >
              <div className="flex justify-between items-start pb-3 border-b border-white/5">
                <div>
                  <h4 className="font-heading font-black text-base text-primary-text">Send Emergency Arrival Request</h4>
                  <p className="text-[10px] text-muted-text mt-0.5">Pre-alert Emergency Department at {selectedHospital.name}</p>
                </div>
                <button onClick={() => setShowPreAlertModal(false)} className="text-muted-text hover:text-primary-text">✕</button>
              </div>

              {!isPreAlertSent ? (
                <>
                  <div className="p-3 bg-medical-teal/5 border border-medical-teal/20 rounded-xl text-[11px] text-medical-teal leading-normal">
                    <strong>Notice:</strong> Emergency treatment is subject to hospital capacity and professional assessment. This pre-alert notifies triage staff in advance.
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Emergency Category</span>
                        <span className="font-bold text-primary-text">{emergencyType}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-muted-text block">Estimated Arrival</span>
                        <span className="font-bold text-emergency">~6 Minutes</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Patient Contact Mobile</label>
                      <input
                        type="text"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex gap-2">
                    <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => setShowPreAlertModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="emergency" className="w-full text-xs font-black py-2.5" onClick={handleSendPreAlert}>
                      Send Emergency Arrival Request
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-base text-primary-text">Pre-Alert Transmitted!</h4>
                    <p className="text-xs text-muted-text mt-1">
                      Emergency Department at {selectedHospital.name} has received your arrival request.
                    </p>
                  </div>
                  <Button variant="primary" className="w-full text-xs font-bold py-2.5" onClick={() => setShowPreAlertModal(false)}>
                    Done & Close
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspect Hospital Detail Drawer Modal */}
      <AnimatePresence>
        {selectedHospitalForInspection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={() => setSelectedHospitalForInspection(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="z-10 w-full max-w-md bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-start pb-3 border-b border-white/5">
                <div>
                  <h4 className="font-heading font-black text-base text-primary-text">{selectedHospitalForInspection.name}</h4>
                  <p className="text-[10px] text-muted-text mt-0.5">{selectedHospitalForInspection.address}</p>
                </div>
                <button onClick={() => setSelectedHospitalForInspection(null)} className="text-muted-text hover:text-primary-text">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Emergency Status</span>
                  <span className="font-bold text-success">{selectedHospitalForInspection.emergencyStatus}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Distance</span>
                  <span className="font-bold text-primary-text">{selectedHospitalForInspection.distanceFromUserKm} km</span>
                </div>
              </div>

              <Button
                variant="emergency"
                className="w-full text-xs font-black py-2.5"
                onClick={() => {
                  setSelectedHospital(selectedHospitalForInspection);
                  setSelectedHospitalForInspection(null);
                  setCurrentStep(5);
                }}
              >
                Select This Hospital
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 2. HOSPITALS SEARCH PAGE (/user/hospitals)
// ============================================================
export const UserHospitalsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'find';
  const navigate = useNavigate();
  const { resources, ambulances, bloodInventory, doctors } = useApp();

  const [query, setQuery] = useState('');
  const [list, setList] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Bookmark persistence logic
  const [savedHospIds, setSavedHospIds] = useState<string[]>(() => {
    const val = localStorage.getItem('medradar_saved_hospitals');
    return val ? JSON.parse(val) : [];
  });

  const toggleSaveHospital = (id: string) => {
    const updated = savedHospIds.includes(id)
      ? savedHospIds.filter(i => i !== id)
      : [...savedHospIds, id];
    setSavedHospIds(updated);
    localStorage.setItem('medradar_saved_hospitals', JSON.stringify(updated));
  };

  const fetchHospitals = useCallback(async () => {
    const data = await hospitalService.getHospitals();
    setList(data);
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const getResourceSummary = (hId: string) => {
    const hospRes = resources.filter(r => r.hospitalId === hId);
    const hospAmbs = ambulances.filter(a => a.hospitalId === hId);
    const hospBlood = bloodInventory.filter(b => b.hospitalId === hId);

    const icu = hospRes.find(r => r.resourceType === 'icu_beds');
    const general = hospRes.find(r => r.resourceType === 'general_beds');
    const vent = hospRes.find(r => r.resourceType === 'ventilators');
    const oxy = hospRes.find(r => r.resourceType === 'oxygen_kl');
    const er = hospRes.find(r => r.resourceType === 'emergency_capacity');
    
    const bloodTotal = hospBlood.reduce((acc, curr) => acc + curr.unitsAvailable, 0);
    const ambsAvail = hospAmbs.filter(a => a.status === 'Available').length;
    
    return {
      icuAvail: icu?.available ?? 0,
      icuTotal: icu?.total ?? 0,
      genAvail: general?.available ?? 0,
      genTotal: general?.total ?? 0,
      ventAvail: vent?.available ?? 0,
      ventTotal: vent?.total ?? 0,
      oxyAvail: oxy?.available ?? 0,
      oxyTotal: oxy?.total ?? 0,
      erAvail: er?.available ?? 0,
      erTotal: er?.total ?? 0,
      bloodUnits: bloodTotal,
      ambCount: ambsAvail,
      ambTotal: hospAmbs.length
    };
  };

  const filteredHospitals = list.filter(h => {
    const isNearby = activeTab === 'nearby' ? h.distanceFromUserKm <= 10 : true;
    const isSaved = activeTab === 'saved' ? savedHospIds.includes(h.id) : true;
    const q = query.toLowerCase().trim();
    const matchesSearch = !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || h.type.toLowerCase().includes(q);
    return isNearby && isSaved && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Search and control area */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search verified Ratnagiri hospitals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-bold text-xs" onClick={() => navigate('/user/hospitals/compare')}>
            Compare Roster
          </Button>
        </div>
      </div>

      {/* Hospitals Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map(h => {
          const summary = getResourceSummary(h.id);
          const isSaved = savedHospIds.includes(h.id);
          return (
            <Card key={h.id} className="p-6 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-heading font-black text-sm text-primary-text truncate">{h.name}</h4>
                      <button 
                        type="button" 
                        onClick={() => toggleSaveHospital(h.id)}
                        className={`shrink-0 transition-colors ${isSaved ? 'text-warning' : 'text-muted-text hover:text-warning'}`}
                      >
                        <Star size={14} className={isSaved ? 'fill-current' : ''} />
                      </button>
                    </div>
                    <span className="text-[10px] text-muted-text truncate block mt-0.5">{h.address}, {h.city}</span>
                    <span className="inline-flex items-center text-[9px] text-medical-teal font-bold mt-1">
                      <ShieldCheck size={11} className="mr-0.5" /> Verified Hospital
                    </span>
                  </div>
                  <StatusBadge status={h.emergencyStatus} />
                </div>

                {/* Readiness summary */}
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-muted-text">Resource Readiness</span>
                    <p className="text-[10px] text-secondary-text font-bold">Operational Resource Readiness</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-medical-teal">{h.readinessScore}%</span>
                  </div>
                </div>

                {/* Resource Summary list */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px] text-secondary-text pt-1">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>ICU Beds:</span>
                    <strong className="text-primary-text">{summary.icuAvail}/{summary.icuTotal}</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Gen Beds:</span>
                    <strong className="text-primary-text">{summary.genAvail}/{summary.genTotal}</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Ventilators:</span>
                    <strong className="text-primary-text">{summary.ventAvail}/{summary.ventTotal}</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Oxygen:</span>
                    <strong className="text-primary-text">{summary.oxyAvail} KL</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Emergency Cap:</span>
                    <strong className="text-primary-text">{summary.erAvail}/{summary.erTotal}</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Ambulances:</span>
                    <strong className="text-primary-text">{summary.ambCount} Avail</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 col-span-2">
                    <span>Blood Bank (All Types):</span>
                    <strong className="text-primary-text">{summary.bloodUnits} Units</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="space-y-3 pt-3 border-t border-white/5 mt-4">
                <div className="flex justify-between text-[10px] text-muted-text">
                  <span className="flex items-center gap-1"><Compass size={11} /> {h.distanceFromUserKm} km</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> Updated 6 min ago</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-[10px] py-2 px-1 font-bold"
                    onClick={() => setSelectedHospital(h)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] py-2 px-1 border-white/10 hover:border-medical-teal/30 hover:bg-medical-teal/5 text-secondary-text hover:text-medical-teal font-bold"
                    onClick={() => navigate(`/user/hospitals/compare?add=${h.id}`)}
                  >
                    Compare
                  </Button>
                  <a
                    href={`https://maps.google.com/?q=${h.lat},${h.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-primary-text text-[10px] rounded-full inline-flex items-center justify-center py-2 font-semibold text-center"
                  >
                    <MapPin size={11} className="mr-1 text-medical-teal" /> Navigate
                  </a>
                  <a
                    href={`tel:${h.phone}`}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-primary-text text-[10px] rounded-full inline-flex items-center justify-center py-2 font-semibold text-center"
                  >
                    <Phone size={11} className="mr-1 text-medical-teal" /> Call
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail overlay panel drawer */}
      <AnimatePresence>
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={() => setSelectedHospital(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="z-10 w-full max-w-2xl h-screen bg-[#0F172A] border-l border-white/10 p-8 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-8">
                {/* Header Close */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-medical-teal flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Grid Node
                  </span>
                  <button onClick={() => setSelectedHospital(null)} className="text-muted-text hover:text-primary-text font-bold text-sm bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    ✕
                  </button>
                </div>

                {/* Hospital Header */}
                <div className="space-y-4">
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/5 relative">
                    <img 
                      src={
                        selectedHospital.id === 'hosp-1'
                          ? 'https://images.unsplash.com/photo-1586773860418-d3b3de97e663?w=800&fit=crop'
                          : selectedHospital.id === 'hosp-2'
                          ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&fit=crop'
                          : 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&fit=crop'
                      } 
                      alt={selectedHospital.name}
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <StatusBadge status={selectedHospital.emergencyStatus} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-2xl text-primary-text">{selectedHospital.name}</h3>
                    <p className="text-xs text-secondary-text">{selectedHospital.address}, {selectedHospital.city}, Maharashtra</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-text font-mono pt-1">
                      <span>REG ID: {selectedHospital.registrationNumber}</span>
                      <span>•</span>
                      <span>TYPE: {selectedHospital.type}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">General Line:</span>
                    <a href={`tel:${selectedHospital.phone}`} className="text-primary-text font-bold hover:text-medical-teal">{selectedHospital.phone}</a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">Emergency Hotline:</span>
                    <a href={`tel:${selectedHospital.emergencyContact}`} className="text-emergency font-bold hover:underline">{selectedHospital.emergencyContact}</a>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">Official Email:</span>
                    <span className="text-primary-text font-medium">{selectedHospital.id === 'hosp-1' ? 'admin@civilhospital.org' : 'info@parkarhospital.org'}</span>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">Official Website:</span>
                    <a href="https://medradar.ai" target="_blank" rel="noreferrer" className="text-medical-teal font-medium hover:underline">www.medradar.ai</a>
                  </div>
                </div>

                {/* Resource Readiness */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Resource Readiness Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {resources.filter(r => r.hospitalId === selectedHospital.id).map(r => (
                      <div key={r.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-text uppercase">
                          <span>{r.resourceName}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary-text">{r.available}</span>
                          <span className="text-xs text-muted-text">/ {r.total}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${r.available === 0 ? 'bg-emergency animate-pulse' : r.available <= 2 ? 'bg-warning' : 'bg-success'}`} />
                          <span className="text-secondary-text">{r.available === 0 ? 'Critical' : r.available <= 2 ? 'Limited' : 'Optimal'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Inventory - All 8 Groups */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-l-2 border-medical-teal pl-2">
                    <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase">Blood Repository Inventory</h4>
                    <span className="text-[10px] text-muted-text">Source: Hospital Admin</span>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {bloodInventory.filter(b => b.hospitalId === selectedHospital.id).map(b => (
                        <div key={b.id} className="p-2.5 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-primary-text block">{b.bloodGroup}</span>
                            <span className="text-[10px] text-muted-text">{b.unitsAvailable} Units</span>
                          </div>
                          <span className={`w-2.5 h-2.5 rounded-full ${b.unitsAvailable === 0 ? 'bg-emergency' : b.unitsAvailable <= 3 ? 'bg-warning' : 'bg-success'}`} />
                        </div>
                      ))}
                    </div>

                    {/* Blood Request Disclaimers */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-muted-text space-y-1">
                      <p>⚠️ <strong>Reported availability</strong> is dynamic and updated periodically. Please <strong>confirm availability with provider</strong> before routing emergencies.</p>
                      <p className="italic text-medical-teal font-semibold">Demo / Simulated Data — Verification network testing simulation only.</p>
                    </div>
                  </div>
                </div>

                {/* On-Call Doctors */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Doctors on Duty / Available Specialists</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.filter(d => d.hospitalId === selectedHospital.id).slice(0, 4).map(d => (
                      <div key={d.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between h-36">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-primary-text truncate">{d.name}</h5>
                            <p className="text-[10px] text-secondary-text truncate">{d.specialty} • {d.experienceYears}y exp</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Available' ? 'bg-success animate-pulse' : d.status === 'On Call' ? 'bg-warning' : 'bg-muted-text'}`} />
                              <span className="text-[9px] font-semibold text-muted-text">{d.status === 'Available' ? 'Available' : d.status === 'On Call' ? 'On Call' : 'Unavailable'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5">
                          <Button variant="secondary" size="sm" className="text-[8px] py-1 font-bold" onClick={() => alert(`Consulting credential logs for ${d.name}`)}>
                            View Profile
                          </Button>
                          <Button variant="primary" size="sm" className="text-[8px] py-1 font-bold" onClick={() => alert(`Booking appointment requested with ${d.name}`)}>
                            Book Shift
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registered Ambulance Units */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Emergency Ambulance Fleet</h4>
                  <div className="space-y-2">
                    {ambulances.filter(a => a.hospitalId === selectedHospital.id).slice(0, 3).map(a => (
                      <div key={a.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary-text">🚑 {a.ambulanceNumber}</span>
                            <span className="text-[10px] text-muted-text">({a.type})</span>
                          </div>
                          <p className="text-[10px] text-secondary-text">Equipment: {a.equipment.join(', ')}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${a.status === 'Available' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Departments Chips */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Available Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Pediatrics', 'Gynecology', 'Emergency Medicine', 'Critical Care', 'Radiology', 'ENT', 'Ophthalmology', 'Pathology'].map(dept => (
                      <span key={dept} className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-[10px] text-secondary-text font-semibold hover:border-medical-teal/30 hover:bg-medical-teal/5 transition-colors cursor-default">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Panel Footer */}
              <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-3 mt-8">
                <Button variant="secondary" className="w-full text-xs font-bold py-3" onClick={() => setSelectedHospital(null)}>
                  Close
                </Button>
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="w-full bg-medical-teal text-primary-bg-deep font-bold text-xs rounded-full inline-flex items-center justify-center gap-1.5 py-3 hover:bg-medical-teal/95 transition-all text-center"
                >
                  <Phone size={14} /> Call Provider
                </a>
                <Button 
                  variant="primary" 
                  className="w-full text-xs font-bold py-3"
                  onClick={() => {
                    alert('Emergency Bed Reservation Committed! Transmitting telemetry confirmation token: RES-BED-' + Math.floor(Math.random() * 90000 + 10000));
                  }}
                >
                  Book Bed Unit
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
// 3. HOSPITALS RESOURCE COMPARISON (/user/hospitals/compare)
// ============================================================
export const UserComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { hospitals } = useApp();
  const [selectedList, setSelectedList] = useState<string[]>([]);
  const [compareActive, setCompareActive] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <button
          onClick={() => navigate('/user/hospitals')}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-text hover:text-primary-text"
        >
          <ArrowLeft size={14} /> Back to Search
        </button>
        <span className="text-xs text-muted-text">Select up to 3 hospitals to match resource telemetry</span>
      </div>

      {!compareActive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.filter(h => h.verified).map(h => (
            <Card
              key={h.id}
              className={`p-6 border transition-all cursor-pointer ${
                selectedList.includes(h.id) ? 'border-medical-teal bg-medical-teal/5' : 'border-white/5'
              }`}
              onClick={() => handleToggleSelect(h.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-heading font-black text-sm text-primary-text truncate max-w-[150px]">{h.name}</h4>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedList.includes(h.id) ? 'border-medical-teal text-medical-teal' : 'border-white/10'}`}>
                  {selectedList.includes(h.id) && '✓'}
                </div>
              </div>
              <p className="text-xs text-muted-text">{h.city}</p>
            </Card>
          ))}
          {selectedList.length > 0 && (
            <div className="col-span-full pt-6 flex justify-end">
              <Button variant="primary" size="md" className="font-black" onClick={() => setCompareActive(true)}>
                Compare Selected ({selectedList.length})
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 border border-white/5 space-y-6 bg-secondary-surface/40">
          <div className="flex justify-between items-start">
            <h3 className="font-heading font-black text-lg text-primary-text">Resource Matching comparison</h3>
            <Button variant="secondary" size="sm" onClick={() => setCompareActive(false)}>
              Adjust Selections
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-secondary-text font-bold">
                  <th className="py-3">Resource Parameters</th>
                  {selectedList.map(id => {
                    const h = hospitals.find(x => x.id === id);
                    return <th key={id} className="py-3 px-4 text-primary-text">{h?.name}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Readiness Score', render: (h: Hospital) => <ReadinessScore score={h.readinessScore} /> },
                  { label: 'Data Freshness', render: (h: Hospital) => <FreshnessIndicator updatedAt={h.updatedAt.includes('T') ? 'Just now' : h.updatedAt} /> },
                  { label: 'Emergency Status', render: (h: Hospital) => <StatusBadge status={h.emergencyStatus} /> },
                  { label: 'Distance', render: (h: Hospital) => `${h.distanceFromUserKm} km` },
                  { label: 'Contact Phone', render: (h: Hospital) => h.phone }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-3.5 text-secondary-text font-medium">{row.label}</td>
                    {selectedList.map(id => {
                      const h = hospitals.find(x => x.id === id);
                      return <td key={id} className="py-3.5 px-4 text-primary-text">{h ? row.render(h) : 'N/A'}</td>;
                    })}
                  </tr>
                ))}
                <tr className="bg-medical-teal/5 font-bold">
                  <td className="py-4 text-medical-teal font-black uppercase tracking-wider">AI RECOMMENDATION MATCH</td>
                  {selectedList.map((id, index) => (
                    <td key={id} className="py-4 px-4">
                      {index === 0 ? (
                        <span className="text-success font-black flex items-center gap-1">
                          ★ Recommended Match
                        </span>
                      ) : (
                        <span className="text-muted-text font-medium">Alternate Resource</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================
// 4. BLOOD FINDER PAGE (/user/blood)
// ============================================================
// ============================================================
// 4. BLOOD FINDER PAGE (/user/blood)
// ============================================================
export const UserBloodPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'find';
  const { currentUser, bloodRequests, hospitals, bloodInventory, resources, doctors, ambulances, refreshState } = useApp();

  const [bloodGroup, setBloodGroup] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O-');
  const [quantity, setQuantity] = useState(2);
  const [location, setLocation] = useState('Ratnagiri');
  
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Modal States
  const [requestModal, setRequestModal] = useState<{
    hospitalId: string;
    hospitalName: string;
    bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
    availableUnits: number;
    updatedAt: string;
  } | null>(null);

  const [successRequest, setSuccessRequest] = useState<{
    id: string;
    hospitalName: string;
    bloodGroup: string;
    quantity: number;
  } | null>(null);

  // Form inputs for request modal
  const [reqName, setReqName] = useState(currentUser?.name || '');
  const [reqMobile, setReqMobile] = useState(currentUser?.mobile || '');
  const [reqLocation, setReqLocation] = useState(currentUser?.location || 'Ratnagiri');
  const [reqUrgency, setReqUrgency] = useState<'Emergency' | 'Urgent' | 'Routine'>('Emergency');
  const [reqQuantity, setReqQuantity] = useState(2);

  const handleQueryBlood = useCallback(() => {
    // 1. Fetch centralized blood inventory
    const allInventory = db.getBloodInventory();
    
    // 2. Filter by group and location (checking hospital city or address match)
    const matches = allInventory.filter(b => {
      if (b.bloodGroup !== bloodGroup) return false;
      
      const hosp = hospitals.find(h => h.id === b.hospitalId);
      if (!hosp) return false;

      const normLoc = location.trim().toLowerCase();
      if (!normLoc || normLoc === 'ratnagiri') return true; // Ratnagiri matches all in district

      return hosp.city.toLowerCase().includes(normLoc) || 
             hosp.address.toLowerCase().includes(normLoc) || 
             normLoc.includes(hosp.city.toLowerCase());
    });

    // 3. Map with hospital objects for sorting and details
    const mappedResults = matches.map(b => {
      const hosp = hospitals.find(h => h.id === b.hospitalId);
      return {
        ...b,
        hospital: hosp
      };
    });

    // 4. Sort results: Available -> Closest -> Freshest
    mappedResults.sort((a, b) => {
      // Priority 1: Availability status (Fully Available > Partially Available > Unavailable)
      const getStatusScore = (item: any) => {
        if (item.unitsAvailable >= quantity) return 3; // 🟢 Available
        if (item.unitsAvailable > 0) return 2; // 🟡 Partially Available
        return 1; // 🔴 Unavailable
      };
      const scoreA = getStatusScore(a);
      const scoreB = getStatusScore(b);
      if (scoreA !== scoreB) return scoreB - scoreA;

      // Priority 2: Distance (closest first)
      const distA = a.hospital?.distanceFromUserKm ?? 999;
      const distB = b.hospital?.distanceFromUserKm ?? 999;
      if (distA !== distB) return distA - distB;

      return 0;
    });

    setResults(mappedResults);
    setSearched(true);
  }, [bloodGroup, hospitals, location, quantity]);

  useEffect(() => {
    if (searched) {
      handleQueryBlood();
    }
  }, [searched, handleQueryBlood]);

  const handleOpenRequest = (item: any, overrideQty?: number) => {
    setRequestModal({
      hospitalId: item.hospitalId,
      hospitalName: item.hospitalName,
      bloodGroup: item.bloodGroup,
      availableUnits: item.unitsAvailable,
      updatedAt: item.updatedAt
    });
    setReqQuantity(overrideQty !== undefined ? overrideQty : quantity);
    setReqName(currentUser?.name || '');
    setReqMobile(currentUser?.mobile || '');
    setReqLocation(currentUser?.location || 'Ratnagiri');
    setReqUrgency('Emergency');
  };

  const handleClearRequestModal = () => {
    setRequestModal(null);
  };

  const handleSubmitRequest = async () => {
    if (!requestModal) return;
    if (!reqName || !reqMobile) {
      alert('Please complete all emergency contact fields.');
      return;
    }

    const reqId = `breq-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Save request into database
    const allRequests = db.getBloodRequests();
    allRequests.unshift({
      id: reqId,
      patientId: currentUser?.id || 'guest',
      patientName: reqName,
      bloodGroup: requestModal.bloodGroup,
      unitsRequired: reqQuantity,
      hospitalId: requestModal.hospitalId,
      hospitalName: requestModal.hospitalName,
      status: 'Pending',
      createdAt: new Date().toISOString()
    });
    db.saveBloodRequests(allRequests);

    // Update dynamic inventory count in database
    const inventory = db.getBloodInventory();
    const updated = inventory.map(item => {
      if (item.hospitalId === requestModal.hospitalId && item.bloodGroup === requestModal.bloodGroup) {
        const nextUnits = Math.max(0, item.unitsAvailable - reqQuantity);
        const status = nextUnits === 0 ? 'Critical' : nextUnits <= 4 ? 'Limited' : 'Available';
        return {
          ...item,
          unitsAvailable: nextUnits,
          unitsReserved: (item.unitsReserved || 0) + reqQuantity,
          status: status as any,
          updatedAt: 'Just now'
        };
      }
      return item;
    });
    db.saveBloodInventory(updated);

    // Insert alert notification
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Blood',
      title: 'Emergency Blood Request',
      description: `${reqName} filed urgent request for ${reqQuantity} units of ${requestModal.bloodGroup} at ${requestModal.hospitalName}. Status: Pending.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: reqUrgency === 'Emergency'
    });
    db.saveNotifications(notifications);

    // Sync context state
    refreshState();

    setSuccessRequest({
      id: reqId,
      hospitalName: requestModal.hospitalName,
      bloodGroup: requestModal.bloodGroup,
      quantity: reqQuantity
    });
    setRequestModal(null);
  };

  // Compile totals for regional availability summary block
  const totalUnitsInDistrict = bloodInventory.reduce((acc, curr) => acc + curr.unitsAvailable, 0);
  const totalVerifiedFacilities = hospitals.filter(h => h.verified).length;

  // Filter lists for Requests and History tabs
  const activeRequests = bloodRequests.filter(r => r.status === 'Pending' || r.status === 'Approved');
  const pastRequests = bloodRequests.filter(r => r.status === 'Collected' || r.status === 'Rejected');

  const isStaleData = (updatedTime: string) => {
    return updatedTime.includes('hours') || updatedTime.includes('day');
  };

  return (
    <div className="space-y-6 text-left">
      {activeTab === 'find' && (
        <>
          {/* Summary Dashboard Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white/[0.01] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-text">Reported Blood Availability</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-medical-teal">{totalUnitsInDistrict} Units</span>
              </div>
              <p className="text-[9px] text-muted-text mt-1">Total count across verified district nodes.</p>
            </Card>
            <Card className="p-4 bg-white/[0.01] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-text">Verified Repositories</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-primary-text">{totalVerifiedFacilities} Facilities</span>
              </div>
              <p className="text-[9px] text-muted-text mt-1 font-semibold text-success">✓ Active Grid Nodes</p>
            </Card>
            <Card className="p-4 bg-white/[0.01] border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-text">Inventory Coverage</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-black text-primary-text">8 Blood Groups</span>
              </div>
              <p className="text-[9px] text-muted-text mt-1">A/B/O systems fully represented.</p>
            </Card>
          </div>

          {/* Blood Finder Query Panel */}
          <Card className="p-8 border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-emergency/15 p-2 rounded-xl text-emergency">
                <Droplet size={18} className="fill-current" />
              </span>
              <div>
                <h3 className="font-heading font-black text-lg text-primary-text">Emergency Blood Finder</h3>
                <p className="text-xs text-muted-text mt-0.5 font-semibold">Reported Blood Availability • Demo / Simulated Data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Required Blood Group</label>
                <CustomSelect
                  value={bloodGroup}
                  onChange={(val) => setBloodGroup(val as any)}
                  options={[
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block font-semibold">Quantity (Units)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Location / Sector</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-primary-text bg-secondary-surface"
                />
              </div>

              <div className="flex items-end">
                <Button variant="primary" className="w-full font-bold text-xs py-3" onClick={handleQueryBlood}>
                  Query Blood Inventory
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-500">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                <strong>Critical Advisory</strong>: Blood availability is provider-reported and dynamic. Confirm availability before collection.
              </p>
            </div>
          </Card>

          {/* Results display with loader */}
          {searched && (
            <div className="space-y-4">
              <h4 className="font-heading font-black text-sm text-primary-text uppercase tracking-wider border-l-2 border-medical-teal pl-2">
                Best Resource Matches for Group: {bloodGroup} ({quantity} units requested)
              </h4>
              
              {results.length === 0 ? (
                <Card className="p-12 text-center text-xs text-muted-text border border-white/5 space-y-4">
                  <AlertCircle size={24} className="mx-auto text-muted-text" />
                  <div>
                    <h5 className="font-bold text-sm text-primary-text">No matching blood inventory found</h5>
                    <p className="text-[10.5px] mt-1 text-secondary-text">Try another blood group, adjust the requested quantity, or expand your location parameters.</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((b) => {
                    const isPartiallyAvailable = b.unitsAvailable > 0 && b.unitsAvailable < quantity;
                    const isStale = isStaleData(b.updatedAt);

                    let statusText = '🟢 Available';
                    let statusColor = 'text-success';
                    if (isPartiallyAvailable) {
                      statusText = `🟡 Partially Available`;
                      statusColor = 'text-warning';
                    } else if (b.unitsAvailable === 0) {
                      statusText = '🔴 Currently Unavailable';
                      statusColor = 'text-emergency';
                    }

                    if (isStale && b.unitsAvailable > 0) {
                      statusText = '⚠ Stale Data';
                      statusColor = 'text-amber-500';
                    }

                    return (
                      <Card key={b.id} className="p-6 border border-white/5 space-y-4 flex flex-col justify-between hover:border-white/15 transition-all">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-bold text-sm text-primary-text leading-tight">{b.hospitalName}</h5>
                                {b.hospital?.verified && (
                                  <span className="text-[9px] text-success font-black">✓ Verified</span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-text block mt-0.5">{b.hospital?.address}, {b.hospital?.city}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-secondary-text font-medium">{b.bloodGroup} Blood stock:</span>
                              <strong className="text-primary-text">{b.unitsAvailable} units available</strong>
                            </div>
                            {isPartiallyAvailable && (
                              <p className="text-[9.5px] text-warning pt-1">Partial stock ({b.unitsAvailable} of {quantity} units available)</p>
                            )}
                          </div>

                          {isStale && (
                            <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[9.5px] text-amber-500 leading-normal">
                              Availability may have changed. Confirm with provider.
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[10px] text-muted-text border-t border-white/5 pt-2">
                            <span className="flex items-center gap-1"><Compass size={11} /> {b.hospital?.distanceFromUserKm ?? 2.5} km</span>
                            <span className="flex items-center gap-1"><Clock size={11} /> Updated {b.updatedAt}</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className={`text-xs font-bold text-center ${statusColor} mb-2`}>
                            {statusText}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-[10px] py-2 font-bold"
                              onClick={() => {
                                if (b.hospital) {
                                  setSelectedHospital(b.hospital);
                                }
                              }}
                            >
                              View Hospital
                            </Button>
                            
                            {b.unitsAvailable > 0 ? (
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="text-[10px] py-2 font-bold"
                                onClick={() => handleOpenRequest(b, isPartiallyAvailable ? b.unitsAvailable : quantity)}
                              >
                                {isPartiallyAvailable ? `Request ${b.unitsAvailable} Units` : 'Request Blood'}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-[10px] py-2 font-bold opacity-50 cursor-not-allowed"
                                disabled
                              >
                                Unavailable
                              </Button>
                            )}
                          </div>

                          <a
                            href={`https://maps.google.com/?q=${b.hospital?.lat},${b.hospital?.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-[#0F172A] hover:bg-white/5 border border-white/10 text-primary-text text-[10px] rounded-full inline-flex items-center justify-center py-2 font-semibold text-center transition-colors"
                          >
                            <MapPin size={11} className="mr-1 text-medical-teal" /> Navigate Coordinates
                          </a>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Requests sub-tab */}
      {activeTab === 'requests' && (
        <Card className="p-8 border border-white/5">
          <h3 className="font-heading font-black text-base text-primary-text mb-6">Active Blood Requests</h3>
          <div className="space-y-4">
            {activeRequests.length === 0 ? (
              <p className="text-xs text-muted-text text-center py-8">No active blood requests found.</p>
            ) : (
              activeRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary-text">Group: {req.bloodGroup} • {req.unitsRequired} Units</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-[10px] text-secondary-text">Requester: {req.patientName} • Facility: {req.hospitalName}</p>
                    <span className="text-[9px] text-muted-text font-mono block">REQUEST ID: {req.id}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-text">Filed: {req.createdAt.includes('T') ? 'Just now' : req.createdAt}</span>
                    <Button variant="outline" size="sm" className="text-[10px] py-1 border-white/10 text-emergency hover:bg-emergency/5" onClick={() => {
                      const list = db.getBloodRequests().filter(r => r.id !== req.id);
                      db.saveBloodRequests(list);
                      refreshState();
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* History sub-tab */}
      {activeTab === 'history' && (
        <Card className="p-8 border border-white/5">
          <h3 className="font-heading font-black text-base text-primary-text mb-6">Blood Requests History</h3>
          <div className="space-y-4">
            {pastRequests.length === 0 ? (
              <p className="text-xs text-muted-text text-center py-8">No completed or historical requests found.</p>
            ) : (
              pastRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center opacity-60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary-text">Group: {req.bloodGroup} • {req.unitsRequired} Units</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-[10px] text-secondary-text">Requester: {req.patientName} • Facility: {req.hospitalName}</p>
                    <span className="text-[9px] text-muted-text font-mono block">ID: {req.id}</span>
                  </div>
                  <span className="text-[10px] text-muted-text">{req.status}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* 1. Request Modal */}
      <AnimatePresence>
        {requestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={handleClearRequestModal} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="z-10 w-full max-w-lg bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start pb-3 border-b border-white/5">
                <div>
                  <h4 className="font-heading font-black text-base text-primary-text">Emergency Blood Request</h4>
                  <p className="text-[10px] text-muted-text mt-0.5">Simulate priority holding request submission.</p>
                </div>
                <button onClick={handleClearRequestModal} className="text-muted-text hover:text-primary-text">✕</button>
              </div>

              {/* Prefilled warning info */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Provider</span>
                  <span className="text-primary-text font-bold truncate block">{requestModal.hospitalName}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Available Stock</span>
                  <span className="text-primary-text font-bold">{requestModal.availableUnits} Units ({requestModal.bloodGroup})</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Last Updated</span>
                  <span className="text-primary-text font-semibold">{requestModal.updatedAt}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Required Group</label>
                    <input
                      type="text"
                      value={requestModal.bloodGroup}
                      disabled
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-muted-text cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Quantity (Units)</label>
                    <input
                      type="number"
                      value={reqQuantity}
                      onChange={(e) => setReqQuantity(Math.min(requestModal.availableUnits, Math.max(1, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={requestModal.availableUnits}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Urgency Tier</label>
                    <CustomSelect
                      value={reqUrgency}
                      onChange={(val) => setReqUrgency(val as any)}
                      options={[
                        { value: 'Emergency', label: '🔴 Critical Emergency' },
                        { value: 'Urgent', label: '🟡 Urgent Requirement' },
                        { value: 'Routine', label: '🟢 Routine Schedule' }
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Location Locks</label>
                    <input
                      type="text"
                      value={reqLocation}
                      onChange={(e) => setReqLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Requester Name</label>
                    <input
                      type="text"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Mobile Number</label>
                    <input
                      type="text"
                      value={reqMobile}
                      onChange={(e) => setReqMobile(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2">
                <Button variant="secondary" className="w-full text-xs font-bold" onClick={handleClearRequestModal}>
                  Cancel Request
                </Button>
                <Button variant="primary" className="w-full text-xs font-bold" onClick={handleSubmitRequest}>
                  Submit Blood Request
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Success Request Modal overlay */}
      <AnimatePresence>
        {successRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={() => setSuccessRequest(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="z-10 w-full max-w-md bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-black text-base text-primary-text">Blood Request Submitted</h4>
                <p className="text-xs text-muted-text">Your request coordinates have been successfully dispatched.</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs text-secondary-text text-left">
                <div className="flex justify-between">
                  <span>Request ID:</span>
                  <strong className="text-primary-text font-mono">{successRequest.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-warning font-bold">Pending Approval</span>
                </div>
                <div className="flex justify-between">
                  <span>Facility Node:</span>
                  <strong className="text-primary-text truncate max-w-[180px]">{successRequest.hospitalName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Roster Reserved:</span>
                  <strong className="text-primary-text">{successRequest.quantity} units of {successRequest.bloodGroup}</strong>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" className="w-full text-xs font-bold py-2.5" onClick={() => setSuccessRequest(null)}>
                  Acknowledge & Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detailed hospital specifications drawer */}
      <AnimatePresence>
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={() => setSelectedHospital(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="z-10 w-full max-w-2xl h-screen bg-[#0F172A] border-l border-white/10 p-8 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-8">
                {/* Header Close */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-medical-teal flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Grid Node
                  </span>
                  <button onClick={() => setSelectedHospital(null)} className="text-muted-text hover:text-primary-text font-bold text-sm bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    ✕
                  </button>
                </div>

                {/* Hospital Header */}
                <div className="space-y-4">
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/5 relative">
                    <img 
                      src={
                        selectedHospital.id === 'hosp-1'
                          ? 'https://images.unsplash.com/photo-1586773860418-d3b3de97e663?w=800&fit=crop'
                          : selectedHospital.id === 'hosp-2'
                          ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&fit=crop'
                          : 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&fit=crop'
                      } 
                      alt={selectedHospital.name}
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <StatusBadge status={selectedHospital.emergencyStatus} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-2xl text-primary-text">{selectedHospital.name}</h3>
                    <p className="text-xs text-secondary-text">{selectedHospital.address}, {selectedHospital.city}, Maharashtra</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-text font-mono pt-1">
                      <span>REG ID: {selectedHospital.registrationNumber}</span>
                      <span>•</span>
                      <span>TYPE: {selectedHospital.type}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">General Line:</span>
                    <a href={`tel:${selectedHospital.phone}`} className="text-primary-text font-bold hover:text-medical-teal">{selectedHospital.phone}</a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">Emergency Hotline:</span>
                    <a href={`tel:${selectedHospital.emergencyContact}`} className="text-emergency font-bold hover:underline">{selectedHospital.emergencyContact}</a>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">Official Email:</span>
                    <span className="text-primary-text font-medium">{selectedHospital.id === 'hosp-1' ? 'admin@civilhospital.org' : 'info@parkarhospital.org'}</span>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-muted-text block text-[9px] uppercase tracking-wider">Official Website:</span>
                    <a href="https://medradar.ai" target="_blank" rel="noreferrer" className="text-medical-teal font-medium hover:underline">www.medradar.ai</a>
                  </div>
                </div>

                {/* Resource Readiness */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Resource Readiness Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {resources.filter(r => r.hospitalId === selectedHospital.id).map(r => (
                      <div key={r.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-text uppercase">
                          <span>{r.resourceName}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary-text">{r.available}</span>
                          <span className="text-xs text-muted-text">/ {r.total}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${r.available === 0 ? 'bg-emergency animate-pulse' : r.available <= 2 ? 'bg-warning' : 'bg-success'}`} />
                          <span className="text-secondary-text">{r.available === 0 ? 'Critical' : r.available <= 2 ? 'Limited' : 'Optimal'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Inventory - All 8 Groups */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-l-2 border-medical-teal pl-2">
                    <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase">Blood Repository Inventory</h4>
                    <span className="text-[10px] text-muted-text">Source: Hospital Admin</span>
                  </div>
                  
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {bloodInventory.filter(b => b.hospitalId === selectedHospital.id).map(b => (
                        <div key={b.id} className="p-2.5 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-primary-text block">{b.bloodGroup}</span>
                            <span className="text-[10px] text-muted-text">{b.unitsAvailable} Units</span>
                          </div>
                          <span className={`w-2.5 h-2.5 rounded-full ${b.unitsAvailable === 0 ? 'bg-emergency' : b.unitsAvailable <= 3 ? 'bg-warning' : 'bg-success'}`} />
                        </div>
                      ))}
                    </div>

                    {/* Blood Request Disclaimers */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-muted-text space-y-1">
                      <p>⚠️ <strong>Reported availability</strong> is dynamic and updated periodically. Please <strong>confirm availability with provider</strong> before routing emergencies.</p>
                      <p className="italic text-medical-teal font-semibold">Demo / Simulated Data — Verification network testing simulation only.</p>
                    </div>
                  </div>
                </div>

                {/* On-Call Doctors */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Doctors on Duty / Available Specialists</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.filter(d => d.hospitalId === selectedHospital.id).slice(0, 4).map(d => (
                      <div key={d.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between h-36">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-primary-text truncate">{d.name}</h5>
                            <p className="text-[10px] text-secondary-text truncate">{d.specialty} • {d.experienceYears}y exp</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Available' ? 'bg-success animate-pulse' : d.status === 'On Call' ? 'bg-warning' : 'bg-muted-text'}`} />
                              <span className="text-[9px] font-semibold text-muted-text">{d.status === 'Available' ? 'Available' : d.status === 'On Call' ? 'On Call' : 'Unavailable'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5">
                          <Button variant="secondary" size="sm" className="text-[8px] py-1 font-bold" onClick={() => alert(`Consulting credential logs for ${d.name}`)}>
                            View Profile
                          </Button>
                          <Button variant="primary" size="sm" className="text-[8px] py-1 font-bold" onClick={() => alert(`Booking appointment requested with ${d.name}`)}>
                            Book Shift
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registered Ambulance Units */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Emergency Ambulance Fleet</h4>
                  <div className="space-y-2">
                    {ambulances.filter(a => a.hospitalId === selectedHospital.id).slice(0, 3).map(a => (
                      <div key={a.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary-text">🚑 {a.ambulanceNumber}</span>
                            <span className="text-[10px] text-muted-text">({a.type})</span>
                          </div>
                          <p className="text-[10px] text-secondary-text">Equipment: {a.equipment.join(', ')}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${a.status === 'Available' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Departments Chips */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-sm text-primary-text tracking-wide uppercase border-l-2 border-medical-teal pl-2">Available Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Cardiology', 'Neurology', 'Orthopedics', 'General Surgery', 'Pediatrics', 'Gynecology', 'Emergency Medicine', 'Critical Care', 'Radiology', 'ENT', 'Ophthalmology', 'Pathology'].map(dept => (
                      <span key={dept} className="px-3 py-1.5 rounded-lg border border-white/5 bg-[#0F172A] text-[10px] text-secondary-text font-semibold hover:border-medical-teal/30 hover:bg-medical-teal/5 transition-colors cursor-default">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Panel Footer */}
              <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-3 mt-8">
                <Button variant="secondary" className="w-full text-xs font-bold py-3" onClick={() => setSelectedHospital(null)}>
                  Close
                </Button>
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="w-full bg-medical-teal text-primary-bg-deep font-bold text-xs rounded-full inline-flex items-center justify-center gap-1.5 py-3 hover:bg-medical-teal/95 transition-all text-center"
                >
                  <Phone size={14} /> Call Provider
                </a>
                <Button 
                  variant="primary" 
                  className="w-full text-xs font-bold py-3"
                  onClick={() => {
                    alert('Emergency Bed Reservation Committed! Transmitting telemetry confirmation token: RES-BED-' + Math.floor(Math.random() * 90000 + 10000));
                  }}
                >
                  Book Bed Unit
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
// 5. SPECIALIST SEARCH PAGE (/user/specialists)
// ============================================================
export const UserSpecialistsPage: React.FC = () => {
  const { currentUser, hospitals } = useApp();
  const [query, setQuery] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [emergencyFilter, setEmergencyFilter] = useState('All');
  const [list, setList] = useState<Doctor[]>([]);

  // Modals state
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState<Doctor | null>(null);
  const [bookingModalDoctor, setBookingModalDoctor] = useState<Doctor | null>(null);
  
  // Booking Form State
  const [bookingDate, setBookingDate] = useState('2026-08-20');
  const [bookingTime, setBookingTime] = useState('10:30 AM');
  const [bookingType, setBookingType] = useState<'Hospital Visit' | 'Home Visit' | 'Tele-Consultation'>('Hospital Visit');
  const [bookingPatientName, setBookingPatientName] = useState(currentUser?.name || '');
  const [bookingPatientPhone, setBookingPatientPhone] = useState(currentUser?.mobile || '');
  const [bookingSuccessToken, setBookingSuccessToken] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    const data = await doctorService.getDoctors();
    setList(data);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Guarantee dataset uniqueness before rendering
  const uniqueList: Doctor[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  list.forEach(doc => {
    const dId = doc.doctorId || doc.id;
    if (!seenIds.has(dId) && !seenNames.has(doc.name)) {
      seenIds.add(dId);
      seenNames.add(doc.name);
      uniqueList.push(doc);
    }
  });

  const filtered = uniqueList.filter(d => {
    const spec = d.specialization || d.specialty;
    const statusVal = d.availabilityStatus || d.status;
    const q = query.toLowerCase().trim();

    const matchesQuery = !q || 
      d.name.toLowerCase().includes(q) || 
      spec.toLowerCase().includes(q) || 
      d.hospitalName.toLowerCase().includes(q) || 
      (d.qualification || '').toLowerCase().includes(q);

    const matchesSpec = specFilter === 'All' || spec.toLowerCase().includes(specFilter.toLowerCase());
    const matchesHosp = hospitalFilter === 'All' || d.hospitalId === hospitalFilter;
    const matchesStatus = statusFilter === 'All' || statusVal === statusFilter;
    const matchesEmergency = emergencyFilter === 'All' || (emergencyFilter === 'Emergency Only' ? d.emergencyDuty : true);

    return matchesQuery && matchesSpec && matchesHosp && matchesStatus && matchesEmergency;
  });

  const handleConfirmAppointment = () => {
    if (!bookingModalDoctor) return;
    const token = `APT-RAT-${Math.floor(Math.random() * 89999 + 10000)}`;

    // Add Audit log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: currentUser?.id || 'guest',
      actorName: currentUser?.name || bookingPatientName || 'Patient',
      actorRole: 'patient',
      action: 'Book Appointment',
      entityType: 'Doctor',
      entityId: bookingModalDoctor.id,
      details: `Booked ${bookingType} appointment with ${bookingModalDoctor.name} at ${bookingModalDoctor.hospitalName} for ${bookingDate} at ${bookingTime}. Token: ${token}`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);

    setBookingSuccessToken(token);
  };

  const specializations = [
    'All',
    'Emergency Medicine',
    'Cardiology',
    'Neurology',
    'Neurosurgery',
    'Orthopedics',
    'General Surgery',
    'Pediatrics',
    'Neonatology',
    'Gynecology',
    'Critical Care',
    'Ophthalmology',
    'Psychiatry',
    'Pulmonology',
    'Oncology'
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header & Disclaimer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-medical-teal bg-medical-teal/10 px-2.5 py-0.5 rounded border border-medical-teal/20">
              Verified Roster
            </span>
            <h3 className="font-heading font-black text-lg text-primary-text">Ratnagiri Specialist Directory</h3>
          </div>
          <p className="text-xs text-muted-text mt-1">
            Browse verified medical specialists and on-duty hospital doctors across Ratnagiri District.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-medical-teal block">{uniqueList.length} Unique Doctors Listed</span>
          <span className="text-[10px] text-muted-text">Zero duplicates guaranteed</span>
        </div>
      </div>

      {/* Healthcare Prototype Disclaimer Banner */}
      <div className="p-3 bg-medical-teal/5 border border-medical-teal/20 rounded-xl flex items-center justify-between text-xs text-medical-teal">
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} />
          <strong>Healthcare Data Disclaimer:</strong> Doctor profiles shown are demonstration data for the MedRadar AI prototype.
        </span>
        <span className="text-[10px] text-muted-text font-mono">DISTRICT GRID NODE: MH-08</span>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-6 border border-white/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Query input */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or hospital..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl glass-input text-primary-text"
            />
          </div>

          {/* Specialization Filter */}
          <div>
            <CustomSelect
              value={specFilter}
              onChange={(val) => setSpecFilter(val)}
              options={specializations.map(s => ({ value: s, label: s === 'All' ? 'All Specialties' : s }))}
            />
          </div>

          {/* Hospital Filter */}
          <div>
            <CustomSelect
              value={hospitalFilter}
              onChange={(val) => setHospitalFilter(val)}
              options={[
                { value: 'All', label: 'All Hospitals' },
                ...hospitals.map(h => ({ value: h.id, label: h.name }))
              ]}
            />
          </div>

          {/* Availability Status Filter */}
          <div>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Available', label: '🟢 Available' },
                { value: 'On Call', label: '🟡 On Call' },
                { value: 'Unavailable', label: '🔴 Unavailable' }
              ]}
            />
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-muted-text">Emergency Duty:</span>
            {['All', 'Emergency Only'].map(opt => (
              <button
                key={opt}
                onClick={() => setEmergencyFilter(opt)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  emergencyFilter === opt
                    ? 'bg-emergency/15 border-emergency/40 text-emergency'
                    : 'bg-white/[0.01] border-white/5 text-muted-text hover:bg-white/5'
                }`}
              >
                {opt === 'Emergency Only' ? '🚨 24/7 Emergency Duty Only' : 'All Doctors'}
              </button>
            ))}
          </div>

          {(query || specFilter !== 'All' || hospitalFilter !== 'All' || statusFilter !== 'All' || emergencyFilter !== 'All') && (
            <button
              onClick={() => {
                setQuery('');
                setSpecFilter('All');
                setHospitalFilter('All');
                setStatusFilter('All');
                setEmergencyFilter('All');
              }}
              className="text-[10px] text-medical-teal hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Specialist Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-text border border-white/5 space-y-3">
          <AlertCircle size={24} className="mx-auto text-muted-text" />
          <h4 className="font-bold text-sm text-primary-text">No doctors match the selected filters</h4>
          <p className="text-secondary-text">Try resetting filters or adjusting search keywords.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(doc => {
            const spec = doc.specialization || doc.specialty;
            const statusVal = doc.availabilityStatus || doc.status;
            const exp = doc.experience || `${doc.experienceYears} years experience`;
            const avatar = doc.profileImage || doc.image;

            return (
              <Card key={doc.id} className="p-6 border border-white/5 flex flex-col justify-between hover:border-white/15 transition-all duration-300">
                <div className="space-y-4">
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img src={avatar} alt={doc.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-primary-bg ${
                        statusVal === 'Available' ? 'bg-success animate-pulse' : statusVal === 'On Call' ? 'bg-warning' : 'bg-emergency'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-black text-sm text-primary-text truncate">{doc.name}</h4>
                      <p className="text-[11px] text-medical-teal font-bold truncate">{spec}</p>
                      <p className="text-[10px] text-muted-text truncate mt-0.5">{doc.qualification}</p>
                    </div>
                  </div>

                  {/* Hospital & Details */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 text-xs space-y-2 text-secondary-text">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-text uppercase font-bold">Primary Hospital:</span>
                      <span className="text-primary-text font-bold truncate max-w-[170px]">{doc.hospitalName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-text uppercase font-bold">Experience:</span>
                      <span className="text-primary-text font-semibold">{exp}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-white/5">
                      <span className="text-[10px] text-muted-text uppercase font-bold">Status:</span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={statusVal as any} />
                        {doc.emergencyDuty && (
                          <span className="text-[9px] bg-emergency/15 text-emergency font-black px-1.5 py-0.5 rounded">
                            🚨 Emergency Duty
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-[10px] py-2 font-bold"
                    onClick={() => setSelectedDoctorProfile(doc)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-[10px] py-2 font-bold"
                    onClick={() => setBookingModalDoctor(doc)}
                  >
                    Book Appointment
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 1. Doctor Profile Detail Modal */}
      <AnimatePresence>
        {selectedDoctorProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={() => setSelectedDoctorProfile(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="z-10 w-full max-w-lg bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-6 text-left"
            >
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div className="flex gap-4 items-center">
                  <img
                    src={selectedDoctorProfile.profileImage || selectedDoctorProfile.image}
                    alt={selectedDoctorProfile.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                  />
                  <div>
                    <h3 className="font-heading font-black text-lg text-primary-text">{selectedDoctorProfile.name}</h3>
                    <p className="text-xs text-medical-teal font-bold">{selectedDoctorProfile.specialization || selectedDoctorProfile.specialty}</p>
                    <p className="text-[10px] text-muted-text mt-0.5">{selectedDoctorProfile.qualification}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoctorProfile(null)} className="text-muted-text hover:text-primary-text font-bold text-sm bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">
                  ✕
                </button>
              </div>

              {/* Profile Overview Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Doctor ID</span>
                  <span className="text-primary-text font-mono font-bold">{selectedDoctorProfile.doctorId || selectedDoctorProfile.id}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Clinical Experience</span>
                  <span className="text-primary-text font-bold">{selectedDoctorProfile.experience || `${selectedDoctorProfile.experienceYears} years`}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Hospital Node</span>
                  <span className="text-primary-text font-bold truncate block">{selectedDoctorProfile.hospitalName}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Availability Status</span>
                  <StatusBadge status={(selectedDoctorProfile.availabilityStatus || selectedDoctorProfile.status) as any} />
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Emergency Duty (24/7)</span>
                  <span className={selectedDoctorProfile.emergencyDuty ? 'text-emergency font-bold' : 'text-muted-text'}>
                    {selectedDoctorProfile.emergencyDuty ? '🚨 Active Emergency Duty' : 'Off Emergency Duty'}
                  </span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-text block">Contact Helpline</span>
                  <span className="text-primary-text font-semibold">{selectedDoctorProfile.contact || '+91 98220 12345'}</span>
                </div>
              </div>

              {/* Consultation Type Badges */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-text uppercase">Supported Consultation Tiers:</span>
                <div className="flex flex-wrap gap-2">
                  {['Hospital Visit', 'Emergency Duty Shift', 'Tele-Consultation', 'Home Visit'].map(t => (
                    <span key={t} className="px-3 py-1 bg-medical-teal/10 border border-medical-teal/20 text-medical-teal rounded-lg text-[10px] font-bold">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                <a
                  href={`tel:${selectedDoctorProfile.contact || '102'}`}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-primary-text text-[10px] rounded-xl inline-flex items-center justify-center py-2.5 font-bold text-center"
                >
                  <Phone size={12} className="mr-1 text-medical-teal" /> Call Doctor
                </a>
                <Button
                  variant="secondary"
                  className="text-[10px] py-2.5 font-bold"
                  onClick={() => {
                    alert(`Routing hospital visit request for ${selectedDoctorProfile.name} at ${selectedDoctorProfile.hospitalName}`);
                  }}
                >
                  Hospital Visit
                </Button>
                <Button
                  variant="primary"
                  className="text-[10px] py-2.5 font-bold"
                  onClick={() => {
                    const doc = selectedDoctorProfile;
                    setSelectedDoctorProfile(null);
                    setBookingModalDoctor(doc);
                  }}
                >
                  Book Appointment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Appointment Booking Modal */}
      <AnimatePresence>
        {bookingModalDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary-bg-deep/60 backdrop-blur-sm" onClick={() => {
              setBookingModalDoctor(null);
              setBookingSuccessToken(null);
            }} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="z-10 w-full max-w-lg bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-5 text-left"
            >
              {!bookingSuccessToken ? (
                <>
                  <div className="flex justify-between items-start pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-heading font-black text-base text-primary-text">Book Appointment</h4>
                      <p className="text-[10px] text-muted-text mt-0.5">Schedule consultation with {bookingModalDoctor.name}</p>
                    </div>
                    <button onClick={() => setBookingModalDoctor(null)} className="text-muted-text hover:text-primary-text">✕</button>
                  </div>

                  {/* Summary Header */}
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                    <img
                      src={bookingModalDoctor.profileImage || bookingModalDoctor.image}
                      alt={bookingModalDoctor.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-primary-text">{bookingModalDoctor.name}</h5>
                      <p className="text-[10px] text-medical-teal font-bold">{bookingModalDoctor.specialization || bookingModalDoctor.specialty}</p>
                      <p className="text-[10px] text-muted-text">{bookingModalDoctor.hospitalName}</p>
                    </div>
                  </div>

                  {/* Booking Inputs */}
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Preferred Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Time Slot</label>
                        <CustomSelect
                          value={bookingTime}
                          onChange={(val) => setBookingTime(val)}
                          options={[
                            { value: '09:30 AM', label: '09:30 AM' },
                            { value: '10:30 AM', label: '10:30 AM' },
                            { value: '02:00 PM', label: '02:00 PM' },
                            { value: '04:30 PM', label: '04:30 PM' },
                            { value: '06:00 PM', label: '06:00 PM' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Consultation Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'Hospital Visit', label: '🏥 Hospital Visit' },
                          { id: 'Tele-Consultation', label: '💻 Tele-Consult' },
                          { id: 'Home Visit', label: '🏡 Home Visit' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setBookingType(t.id as any)}
                            className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                              bookingType === t.id
                                ? 'bg-medical-teal/10 border-medical-teal/40 text-medical-teal'
                                : 'bg-white/[0.01] border-white/5 text-muted-text'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Patient Name</label>
                        <input
                          type="text"
                          value={bookingPatientName}
                          onChange={(e) => setBookingPatientName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block">Mobile Contact</label>
                        <input
                          type="text"
                          value={bookingPatientPhone}
                          onChange={(e) => setBookingPatientPhone(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full px-3 py-2 text-xs rounded-xl glass-input text-primary-text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex gap-2">
                    <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => setBookingModalDoctor(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" className="w-full text-xs font-bold" onClick={handleConfirmAppointment}>
                      Confirm Booking
                    </Button>
                  </div>
                </>
              ) : (
                /* Success Confirmation View */
                <div className="text-center space-y-4 py-2">
                  <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-base text-primary-text">Appointment Confirmed!</h4>
                    <p className="text-xs text-muted-text mt-0.5">Your appointment token has been issued successfully.</p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs text-secondary-text text-left">
                    <div className="flex justify-between">
                      <span>Token ID:</span>
                      <strong className="text-primary-text font-mono">{bookingSuccessToken}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Specialist:</span>
                      <strong className="text-primary-text">{bookingModalDoctor.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Facility:</span>
                      <strong className="text-primary-text truncate max-w-[180px]">{bookingModalDoctor.hospitalName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <strong className="text-primary-text">{bookingDate} @ {bookingTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <strong className="text-medical-teal">{bookingType}</strong>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full text-xs font-bold py-2.5"
                    onClick={() => {
                      setBookingModalDoctor(null);
                      setBookingSuccessToken(null);
                    }}
                  >
                    Done & Close
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// 6. USER PROFILE PAGE (/user/profile)
// ============================================================
export const UserProfilePage: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <Card className="p-8 border border-white/5 space-y-6 text-left max-w-2xl">
      <div>
        <h3 className="font-heading font-black text-base text-primary-text">User Profile Settings</h3>
        <p className="text-xs text-muted-text mt-1">Configure your personal emergency matching metrics.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block mb-1">Full Name</label>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-primary-text">{currentUser?.name}</div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block mb-1">Email Address</label>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-primary-text">{currentUser?.email}</div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-secondary-text uppercase tracking-wider block mb-1">Mobile Phone Connection</label>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-primary-text">{currentUser?.mobile}</div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// 9. USER NOTIFICATIONS (/user/notifications)
// ============================================================
export const UserNotificationsPage: React.FC = () => {
  const { notifications, refreshState } = useApp();

  const handleMarkRead = async (id: string) => {
    await bloodService.requestBlood; // Simple imports check
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

// ============================================================
// 10. USER SAVED RESOURCES PAGE (/user/saved-resources)
// ============================================================
export const UserSavedResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const val = localStorage.getItem('medradar_saved_hospitals');
    return val ? JSON.parse(val) : [];
  });
  const [allHospitals] = useState<Hospital[]>(() => db.getHospitals());

  const handleRemove = (id: string) => {
    const updated = savedIds.filter(i => i !== id);
    setSavedIds(updated);
    localStorage.setItem('medradar_saved_hospitals', JSON.stringify(updated));
  };

  const savedHospitals = allHospitals.filter(h => savedIds.includes(h.id));

  return (
    <Card className="p-8 border border-white/5 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-heading font-black text-base text-primary-text">Saved Healthcare Resources</h3>
          <p className="text-xs text-muted-text mt-1">Bookmark clinics and diagnostic hubs for instant monitoring access.</p>
        </div>
      </div>

      {savedHospitals.length === 0 ? (
        <div className="text-center py-16 text-xs text-muted-text border border-dashed border-white/10 rounded-2xl">
          <Bookmark size={24} className="mx-auto mb-2 text-muted-text" />
          No bookmarked resources. Go to the <button onClick={() => navigate('/user/hospitals')} className="text-medical-teal font-bold underline">Hospitals Directory</button> to save clinics.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedHospitals.map(h => (
            <div key={h.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex justify-between items-center">
              <div>
                <h5 className="text-xs font-bold text-primary-text">{h.name}</h5>
                <p className="text-[10px] text-secondary-text">{h.address}, {h.city}</p>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-medical-teal font-bold">
                  <span>Readiness: {h.readinessScore}%</span>
                  <span>•</span>
                  <span>Status: {h.emergencyStatus}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="text-[10px] py-1 px-2.5" onClick={() => navigate('/user/hospitals')}>
                  Open Find
                </Button>
                <Button variant="outline" size="sm" className="text-[10px] py-1 px-2.5 text-emergency hover:bg-emergency/5 border-white/5 hover:border-emergency/15" onClick={() => handleRemove(h.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================
// 11. USER SETTINGS PAGE (/user/settings)
// ============================================================
export const UserSettingsPage: React.FC = () => {
  const { resetDB } = db;
  const [gpsSimulated, setGpsSimulated] = useState(true);
  const [staleAlerts, setStaleAlerts] = useState(true);

  return (
    <Card className="p-8 border border-white/5 text-left max-w-xl space-y-6">
      <div>
        <h3 className="font-heading font-black text-base text-primary-text">Portal Settings</h3>
        <p className="text-xs text-muted-text mt-1">Configure emergency dashboard settings and cache parameters.</p>
      </div>

      <div className="space-y-4">
        {/* Toggle Simulated Coordinates */}
        <div className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 rounded-xl">
          <div>
            <h5 className="text-xs font-bold text-primary-text">GPS Coordinates Simulation</h5>
            <p className="text-[10px] text-secondary-text">Simulate emergency coordinates locks centered on Ratnagiri District.</p>
          </div>
          <input 
            type="checkbox" 
            checked={gpsSimulated} 
            onChange={(e) => setGpsSimulated(e.target.checked)}
            className="w-4 h-4 accent-medical-teal cursor-pointer"
          />
        </div>

        {/* Toggle Stale Alerts */}
        <div className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 rounded-xl">
          <div>
            <h5 className="text-xs font-bold text-primary-text">Stale Telemetry Warnings</h5>
            <p className="text-[10px] text-secondary-text">Flag updates unmodified for more than 2 hours in warning panel views.</p>
          </div>
          <input 
            type="checkbox" 
            checked={staleAlerts} 
            onChange={(e) => setStaleAlerts(e.target.checked)}
            className="w-4 h-4 accent-medical-teal cursor-pointer"
          />
        </div>

        {/* Reset Database Trigger */}
        <div className="p-4 bg-emergency/5 border border-emergency/25 rounded-xl space-y-3">
          <div>
            <h5 className="text-xs font-bold text-emergency">Danger Zone: Core Database Invalidation</h5>
            <p className="text-[10px] text-muted-text">Clear all local storage entries, delete hospital signups, and restore original Ratnagiri mock database parameters.</p>
          </div>
          <Button variant="outline" size="sm" className="border-emergency/30 text-emergency hover:bg-emergency/5 hover:border-emergency/60 font-bold" onClick={resetDB}>
            Reset Database Cache
          </Button>
        </div>
      </div>
    </Card>
  );
};
