import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Hospital } from '../types';
import { useApp } from '../context/AppContext';
import { MapPin, Shield, Layers, Info, ExternalLink, Clock } from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

interface InteractiveMapProps {
  onSelectHospital?: (hospital: Hospital) => void;
  filterType?: 'all' | 'icu' | 'blood' | 'emergency' | 'ventilator' | 'ambulance';
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ onSelectHospital, filterType: externalFilter }) => {
  const { hospitals, resources, ambulances, bloodInventory } = useApp();
  
  // Local filter override if not passed from parent
  const [activeFilter, setActiveFilter] = useState<'all' | 'icu' | 'blood' | 'emergency' | 'ventilator' | 'ambulance'>(externalFilter || 'all');
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    type: 'hospital' | 'blood' | 'ambulance';
    name: string;
    distance: number;
    lat: number;
    lng: number;
    phone: string;
    status: string;
    details: string;
    rawObject: any;
    statusColor: string;
    updatedAt: string;
  } | null>(null);

  // Scaling logic for Ratnagiri District coordinates
  const mapWidth = 800;
  const mapHeight = 550;

  const getXY = (lat: number, lng: number) => {
    // Map bounding box for Ratnagiri district sectors
    const minLat = 16.75;
    const maxLat = 17.80;
    const minLng = 73.10;
    const maxLng = 73.75;

    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;
    return { x, y };
  };

  // Compile map markers
  const hospitalPins = hospitals
    .filter(h => h.verified)
    .map(h => {
      const icuRes = resources.find(r => r.hospitalId === h.id && r.resourceType === 'icu_beds');
      const ventRes = resources.find(r => r.hospitalId === h.id && r.resourceType === 'ventilators');
      const isStale = h.updatedAt.includes('hours') || h.updatedAt.includes('day');
      
      let statusColor = 'green';
      if (h.emergencyStatus === 'Critical') statusColor = 'red';
      else if (h.emergencyStatus === 'Limited') statusColor = 'yellow';
      else if (isStale) statusColor = 'orange';

      return {
        id: h.id,
        type: 'hospital' as const,
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        distance: h.distanceFromUserKm,
        phone: h.phone,
        status: h.emergencyStatus,
        statusColor,
        updatedAt: 'Updated 6 min ago',
        details: `ICU: ${icuRes?.available ?? 0}/${icuRes?.total ?? 0} | Vent: ${ventRes?.available ?? 0}/${ventRes?.total ?? 0}`,
        rawObject: h
      };
    });

  const bloodPins = bloodInventory
    .filter(b => b.unitsAvailable > 0)
    .map(b => {
      const hosp = hospitals.find(h => h.id === b.hospitalId);
      if (!hosp) return null;
      return {
        id: `blood-${b.id}`,
        type: 'blood' as const,
        name: `${hosp.name} (${b.bloodGroup} Blood stock)`,
        lat: hosp.lat - 0.002, // offset slightly from main hospital pin
        lng: hosp.lng + 0.002,
        distance: hosp.distanceFromUserKm,
        phone: hosp.phone,
        status: `${b.unitsAvailable} Units Available`,
        statusColor: b.status === 'Available' ? 'green' : b.status === 'Limited' ? 'yellow' : 'red',
        updatedAt: b.updatedAt,
        details: `Blood bank group ${b.bloodGroup} reserve units`,
        rawObject: hosp
      };
    })
    .filter(Boolean) as any[];

  const ambulancePins = ambulances.map(a => {
    const hosp = hospitals.find(h => h.id === a.hospitalId);
    return {
      id: `amb-${a.id}`,
      type: 'ambulance' as const,
      name: `Ambulance: ${a.ambulanceNumber}`,
      lat: a.lat,
      lng: a.lng,
      distance: hosp ? hosp.distanceFromUserKm : 4.5,
      phone: hosp ? hosp.phone : '',
      status: a.status,
      statusColor: a.status === 'Available' ? 'green' : 'yellow',
      updatedAt: 'Updated 10 min ago',
      details: `${a.type} ambulance fleet unit`,
      rawObject: hosp || hospitals[0]
    };
  });

  // Filter selection checks
  const allPins = [...hospitalPins, ...bloodPins, ...ambulancePins].filter(pin => {
    const active = externalFilter || activeFilter;
    if (active === 'all') return true;
    if (active === 'icu') {
      return pin.type === 'hospital' && resources.some(r => r.hospitalId === pin.id && r.resourceType === 'icu_beds' && r.available > 0);
    }
    if (active === 'ventilator') {
      return pin.type === 'hospital' && resources.some(r => r.hospitalId === pin.id && r.resourceType === 'ventilators' && r.available > 0);
    }
    if (active === 'blood') {
      return pin.type === 'blood';
    }
    if (active === 'ambulance') {
      return pin.type === 'ambulance';
    }
    if (active === 'emergency') {
      return pin.type === 'hospital' && pin.status === 'Operational';
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      {/* Left Filters Panel */}
      {!externalFilter && (
        <Card className="lg:col-span-1 flex flex-col justify-between p-6 border border-white/5 bg-[#0B1220]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-medical-teal" />
              <h4 className="font-heading font-semibold text-primary-text text-sm">Resource Overlays</h4>
            </div>

            <div className="space-y-2">
              {[
                { id: 'all', label: 'All Resources', count: hospitalPins.length + bloodPins.length + ambulancePins.length },
                { id: 'icu', label: 'ICU Beds Available', count: hospitalPins.filter(p => resources.some(r => r.hospitalId === p.id && r.resourceType === 'icu_beds' && r.available > 0)).length },
                { id: 'ventilator', label: 'Ventilators', count: hospitalPins.filter(p => resources.some(r => r.hospitalId === p.id && r.resourceType === 'ventilators' && r.available > 0)).length },
                { id: 'blood', label: 'Blood Centres', count: bloodPins.length },
                { id: 'ambulance', label: 'Active Ambulances', count: ambulancePins.length },
                { id: 'emergency', label: 'Operational Emergency Departments', count: hospitalPins.filter(p => p.status === 'Operational').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    activeFilter === f.id
                      ? 'bg-slate-900 border-medical-teal/40 text-medical-teal font-black shadow-[0_0_15px_rgba(85,224,193,0.15)]'
                      : 'bg-white/[0.01] border-white/5 text-secondary-text hover:bg-white/5 hover:text-primary-text'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeFilter === f.id ? 'bg-medical-teal/20 text-medical-teal' : 'bg-white/5 text-muted-text'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 5-item map legend */}
          <div className="pt-4 border-t border-white/5 text-xs text-muted-text space-y-2.5 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success inline-block"></span>
              <span>Operational / Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block"></span>
              <span>Limited Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emergency inline-block"></span>
              <span>Critical Outage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
              <span>Stale Data (&gt; 2h lag)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>
              <span>Unknown Status</span>
            </div>
          </div>
        </Card>
      )}

      {/* Map display */}
      <Card className={`${externalFilter ? 'lg:col-span-4' : 'lg:col-span-3'} relative min-h-[500px] overflow-hidden p-0 bg-primary-bg-deep border-white/5`}>
        {/* Map Header */}
        <div className="absolute top-4 left-4 z-10 bg-secondary-surface/85 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-xs text-secondary-text flex items-center gap-2">
          <Shield size={14} className="text-medical-teal animate-pulse" />
          <span>Regional Focus: <strong>Ratnagiri District</strong></span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-muted-text">Demo / Simulated Data</span>
        </div>

        {/* Dynamic map pin popover */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-20"
            >
              <div className="bg-secondary-surface/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl shadow-black/80">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-medical-teal tracking-wider mb-0.5 block">
                      {selectedPin.type}
                    </span>
                    <h5 className="font-heading font-bold text-sm text-primary-text">{selectedPin.name}</h5>
                  </div>
                  <button
                    onClick={() => setSelectedPin(null)}
                    className="text-muted-text hover:text-primary-text text-sm px-1.5 py-0.5 rounded hover:bg-white/5"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 mb-4 text-xs text-secondary-text">
                  <div className="flex justify-between">
                    <span>Distance Lock:</span>
                    <span className="text-primary-text font-medium">{selectedPin.distance} km away</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability Status:</span>
                    <StatusBadge status={selectedPin.status} />
                  </div>
                  <div className="flex justify-between">
                    <span>Metrics summary:</span>
                    <span className="text-primary-text font-medium">{selectedPin.details}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2 text-[10px] text-muted-text">
                    <span className="flex items-center gap-0.5"><Clock size={11} /> {selectedPin.updatedAt}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onSelectHospital && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs font-bold py-2"
                      onClick={() => {
                        onSelectHospital(selectedPin.rawObject);
                        setSelectedPin(null);
                      }}
                    >
                      <Info size={12} className="mr-1" /> View Details
                    </Button>
                  )}
                  <a
                    href={`https://maps.google.com/?q=${selectedPin.lat},${selectedPin.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-primary-text text-xs border border-white/10 rounded-full inline-flex items-center justify-center gap-1.5 py-2 font-semibold text-center transition-all"
                  >
                    <ExternalLink size={12} className="text-medical-teal" /> Navigate
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vector SVG map and pins overlay */}
        <div className="w-full h-full flex items-center justify-center min-h-[500px] relative">
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full max-h-[500px] text-white/5 opacity-80"
            style={{ filter: 'drop-shadow(0 0 25px rgba(85,224,193,0.03))' }}
          >
            {/* Grid Mesh */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Shore coastline outlines of Ratnagiri */}
            <path
              d="M 120,40 C 130,70 110,120 135,160 C 145,180 120,240 130,280 C 140,320 165,340 180,380 C 190,400 170,450 200,480 C 210,490 230,520 250,530 L 780,530 L 780,40 Z"
              fill="rgba(255,255,255,0.003)"
              stroke="rgba(85,224,193,0.06)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 120,40 C 130,70 110,120 135,160 C 145,180 120,240 130,280 C 140,320 165,340 180,380 C 190,400 170,450 200,480 C 210,490 230,520 250,530"
              fill="none"
              stroke="rgba(85, 224, 193, 0.2)"
              strokeWidth="2"
            />

            {/* East hills boundary */}
            <path
              d="M 780,40 L 750,90 L 720,130 L 680,180 L 650,220 L 600,280 L 590,320 L 550,380 L 500,430 L 450,470 L 400,510 L 250,530"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1.5"
            />

            {/* Topography Roads */}
            <path
              d="M 320,40 L 335,110 L 350,200 Q 380,260 410,320 L 430,390 L 320,490 L 250,530"
              fill="none"
              stroke="rgba(255,255,255,0.015)"
              strokeWidth="3"
            />

            {/* Labels */}
            <text x="60" y="240" fill="rgba(255,255,255,0.12)" fontSize="14" fontWeight="bold" letterSpacing="4">ARABIAN SEA</text>
            <text x="320" y="320" fill="rgba(85,224,193,0.03)" fontSize="48" fontWeight="900" letterSpacing="15">RATNAGIRI</text>
            <text x="500" y="460" fill="rgba(255,255,255,0.02)" fontSize="12" letterSpacing="2">LANJA TALUKA</text>
            <text x="440" y="140" fill="rgba(255,255,255,0.02)" fontSize="12" letterSpacing="2">CHIPLUN ZONE</text>
            <text x="360" y="220" fill="rgba(255,255,255,0.02)" fontSize="12" letterSpacing="2">DEVRUKH SEC</text>
          </svg>

          {/* Absolute Markers Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {allPins.map(pin => {
              const coords = getXY(pin.lat, pin.lng);
              
              let markerColor = 'text-success';
              let ringColor = 'rgba(74, 222, 128, 0.4)';
              if (pin.statusColor === 'red') {
                markerColor = 'text-emergency';
                ringColor = 'rgba(255, 107, 107, 0.4)';
              } else if (pin.statusColor === 'yellow') {
                markerColor = 'text-warning';
                ringColor = 'rgba(251, 191, 36, 0.4)';
              } else if (pin.statusColor === 'orange') {
                markerColor = 'text-amber-500';
                ringColor = 'rgba(245, 158, 11, 0.4)';
              } else if (pin.statusColor === 'slate') {
                markerColor = 'text-slate-500';
                ringColor = 'rgba(148, 163, 184, 0.4)';
              }

              return (
                <div
                  key={pin.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                  style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
                >
                  {/* Outer pulse ring */}
                  <div
                    className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none animate-ping"
                    style={{ backgroundColor: ringColor }}
                  />

                  <button
                    type="button"
                    className={`w-5 h-5 rounded-full flex items-center justify-center bg-slate-900 border border-white/20 shadow-lg cursor-pointer pointer-events-auto hover:scale-125 transition-transform ${markerColor}`}
                    onClick={() => setSelectedPin(pin)}
                  >
                    {pin.type === 'hospital' ? (
                      <MapPin size={11} className="fill-current" />
                    ) : pin.type === 'blood' ? (
                      <span className="text-[8px] leading-none">🩸</span>
                    ) : (
                      <span className="text-[8px] leading-none">🚑</span>
                    )}
                  </button>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-slate-950/95 text-[9.5px] text-white px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-35 font-bold shadow-md">
                    {pin.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
