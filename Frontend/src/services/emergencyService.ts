import { db } from './db';
import { type EmergencyRequest, type Recommendation, type Ambulance } from '../types';

export interface EmergencyResourceMapping {
  required: { id: string; label: string; icon: string }[];
  potential: { id: string; label: string; icon: string }[];
}

export const emergencyResourceMappings: Record<string, EmergencyResourceMapping> = {
  'Road Accident / Poly-Trauma': {
    required: [
      { id: 'ambulance', label: 'ALS Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Trauma / Emergency Specialist', icon: '👨‍⚕️' },
      { id: 'emergency_dept', label: 'Operational Emergency Dept', icon: '🏥' },
      { id: 'emergency_beds', label: 'Emergency Resuscitation Bed', icon: '🛏️' }
    ],
    potential: [
      { id: 'icu_beds', label: 'ICU Bed Unit', icon: '🩺' },
      { id: 'ventilators', label: 'Mechanical Ventilator', icon: '🫁' },
      { id: 'blood', label: 'Blood Inventory Reserve', icon: '🩸' }
    ]
  },
  'Cardiac Emergency': {
    required: [
      { id: 'ambulance', label: 'ALS Ambulance (Cardiac Monitor)', icon: '🚑' },
      { id: 'specialist', label: 'On-Duty Cardiologist', icon: '👨‍⚕️' },
      { id: 'emergency_dept', label: 'Operational Cath Lab / Emergency Dept', icon: '🏥' },
      { id: 'emergency_beds', label: 'Cardiac Resuscitation Bed', icon: '🛏️' }
    ],
    potential: [
      { id: 'icu_beds', label: 'CCU / ICU Bed Unit', icon: '🩺' },
      { id: 'ventilators', label: 'Mechanical Ventilator', icon: '🫁' }
    ]
  },
  'Stroke / Neurological Trauma': {
    required: [
      { id: 'ambulance', label: 'ALS Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Neurologist / Neurosurgeon', icon: '🧠' },
      { id: 'emergency_dept', label: 'Stroke Care & CT Scan Unit', icon: '🏥' },
      { id: 'emergency_beds', label: 'Emergency Resuscitation Bed', icon: '🛏️' }
    ],
    potential: [
      { id: 'icu_beds', label: 'Neuro ICU Unit', icon: '🩺' }
    ]
  },
  'Severe Burns': {
    required: [
      { id: 'ambulance', label: 'ALS Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Burn Care / Trauma Specialist', icon: '👨‍⚕️' },
      { id: 'emergency_beds', label: 'Burn Isolation Bed', icon: '🛏️' }
    ],
    potential: [
      { id: 'icu_beds', label: 'ICU Bed Unit', icon: '🩺' },
      { id: 'ventilators', label: 'Mechanical Ventilator', icon: '🫁' }
    ]
  },
  'Respiratory Emergency': {
    required: [
      { id: 'ambulance', label: 'ALS / Oxygen Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Pulmonologist / Critical Care Specialist', icon: '👨‍⚕️' },
      { id: 'oxygen_kl', label: 'High-Flow Liquid Oxygen', icon: '💨' }
    ],
    potential: [
      { id: 'icu_beds', label: 'ICU Bed Unit', icon: '🩺' },
      { id: 'ventilators', label: 'Mechanical Ventilator', icon: '🫁' }
    ]
  },
  'Critical Bleeding': {
    required: [
      { id: 'ambulance', label: 'ALS Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Vascular / Trauma Surgeon', icon: '👨‍⚕️' },
      { id: 'emergency_beds', label: 'Resuscitation Bed', icon: '🛏️' }
    ],
    potential: [
      { id: 'blood', label: 'Emergency Blood Units (O- / Matched)', icon: '🩸' },
      { id: 'icu_beds', label: 'ICU Bed Unit', icon: '🩺' },
      { id: 'operating_theatres', label: 'Emergency Operating Theatre', icon: '🏥' }
    ]
  },
  'Pediatric Emergency': {
    required: [
      { id: 'ambulance', label: 'Pediatric Ambulance Unit', icon: '🚑' },
      { id: 'specialist', label: 'On-Duty Pediatrician', icon: '👶' },
      { id: 'emergency_beds', label: 'Pediatric Emergency Bed', icon: '🛏️' }
    ],
    potential: [
      { id: 'icu_beds', label: 'PICU / NICU Bed Unit', icon: '🩺' },
      { id: 'ventilators', label: 'Pediatric Ventilator', icon: '🫁' }
    ]
  },
  'Pregnancy / Obstetric Emergency': {
    required: [
      { id: 'ambulance', label: 'Obstetric Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Gynecologist / Obstetrician', icon: '🤰' },
      { id: 'emergency_beds', label: 'Maternity Emergency Suite', icon: '🛏️' }
    ],
    potential: [
      { id: 'icu_beds', label: 'ICU Bed Unit', icon: '🩺' },
      { id: 'operating_theatres', label: 'Emergency OT', icon: '🏥' },
      { id: 'blood', label: 'Blood Inventory Reserve', icon: '🩸' }
    ]
  },
  'Other Emergency': {
    required: [
      { id: 'ambulance', label: 'Emergency Ambulance', icon: '🚑' },
      { id: 'specialist', label: 'Emergency Medicine Officer', icon: '👨‍⚕️' },
      { id: 'emergency_dept', label: 'Operational Emergency Dept', icon: '🏥' }
    ],
    potential: [
      { id: 'icu_beds', label: 'ICU Bed Unit', icon: '🩺' }
    ]
  }
};

export const emergencyService = {
  getEmergencyResourceMapping: (emergencyType: string): EmergencyResourceMapping => {
    return emergencyResourceMappings[emergencyType] || emergencyResourceMappings['Other Emergency'];
  },

  getEmergencyRequests: async (): Promise<EmergencyRequest[]> => {
    return db.getEmergencyRequests();
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    return db.getRecommendations();
  },

  triggerSOS: async (
    emergencyType: string,
    location: string,
    requiredResources: string[],
    patientId: string,
    patientName: string,
    locationType: 'current_gps' | 'manual' = 'manual',
    locationAddress?: string,
    lat?: number,
    lng?: number
  ): Promise<EmergencyRequest> => {
    const requests = db.getEmergencyRequests();
    const reqId = `req-${Date.now()}`;
    
    const mapping = emergencyResourceMappings[emergencyType] || emergencyResourceMappings['Other Emergency'];
    const potentialList = mapping.potential.map(p => p.id);

    const newReq: EmergencyRequest = {
      id: reqId,
      patientId,
      patientName,
      emergencyType,
      emergencyCategory: emergencyType,
      location,
      locationAddress: locationAddress || location,
      lat: lat || (16.9944 + (Math.random() - 0.5) * 0.05),
      lng: lng || (73.3033 + (Math.random() - 0.5) * 0.05),
      locationType,
      requiredResources,
      potentialResources: potentialList,
      status: 'Active',
      stepIndex: 3,
      createdAt: new Date().toISOString()
    };

    requests.unshift(newReq);
    db.saveEmergencyRequests(requests);

    // Push critical alert
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Emergency',
      title: '🚨 CRITICAL SOS ALERT',
      description: `${patientName} triggered a ${emergencyType} emergency at ${location}.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: true
    });
    db.saveNotifications(notifications);

    return newReq;
  },

  sendHospitalPreAlert: async (
    requestId: string,
    hospitalId: string,
    hospitalName: string,
    patientName: string,
    patientPhone: string,
    emergencyType: string,
    pickupLocation: string,
    etaMin: number,
    ambulanceId?: string,
    ambulanceNumber?: string
  ): Promise<void> => {
    const reqs = db.getEmergencyRequests();
    const updatedReqs = reqs.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          selectedHospitalId: hospitalId,
          selectedHospitalName: hospitalName,
          patientPhone,
          ambulanceId,
          ambulanceNumber,
          ambulanceEtaMin: etaMin,
          hospitalAlertStatus: 'pending' as const,
          hospitalAlertTime: new Date().toISOString(),
          status: 'Dispatched' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    db.saveEmergencyRequests(updatedReqs);

    // Notify Hospital Admin
    const notifs = db.getNotifications();
    notifs.unshift({
      id: `not-prealert-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Emergency',
      title: '🚨 INCOMING EMERGENCY — Patient Pre-Alert',
      description: `${patientName} (${emergencyType}) heading to ${hospitalName}. ETA: ${etaMin} min. Pickup: ${pickupLocation}. Ambulance: ${ambulanceNumber || 'ALS Unit'}.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: true
    });
    db.saveNotifications(notifs);

    // Audit log
    const audits = db.getAuditLogs();
    audits.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'patient',
      actorName: patientName,
      actorRole: 'patient',
      action: 'Send Emergency Arrival Pre-Alert',
      entityType: 'EmergencyRequest',
      entityId: requestId,
      details: `Transmitted Emergency Arrival Request for ${patientName} (${emergencyType}) to ${hospitalName}. ETA: ${etaMin}m`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(audits);
  },

  acknowledgeHospitalPreAlert: async (requestId: string, adminName: string): Promise<void> => {
    const reqs = db.getEmergencyRequests();
    const updatedReqs = reqs.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          hospitalAlertStatus: 'acknowledged' as const,
          status: 'Acknowledged' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    db.saveEmergencyRequests(updatedReqs);

    const targetReq = reqs.find(r => r.id === requestId);

    // Push notification
    const notifs = db.getNotifications();
    notifs.unshift({
      id: `not-ack-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Emergency',
      title: '✓ Emergency Alert Acknowledged',
      description: `${adminName} acknowledged incoming emergency pre-alert for ${targetReq?.patientName || 'Patient'} at ${targetReq?.selectedHospitalName || 'Hospital'}.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: false
    });
    db.saveNotifications(notifs);

    // Audit log
    const audits = db.getAuditLogs();
    audits.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'hosp-admin',
      actorName: adminName,
      actorRole: 'hospital_admin',
      action: 'Acknowledge Pre-Alert',
      entityType: 'EmergencyRequest',
      entityId: requestId,
      details: `${adminName} confirmed hospital pre-alert for ${targetReq?.patientName}`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(audits);
  },

  updateAmbulanceStatus: async (
    ambulanceId: string,
    status: 'Available' | 'On Trip' | 'At Hospital' | 'Maintenance' | 'Offline',
    equipment: string[]
  ): Promise<void> => {
    const list = db.getAmbulances();
    const updated = list.map(a => {
      if (a.id === ambulanceId) {
        return { ...a, status, equipment, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    db.saveAmbulances(updated);

    const targetAmb = list.find(a => a.id === ambulanceId);

    // Audit log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'hosp-admin',
      actorName: 'Hospital Admin',
      actorRole: 'hospital_admin',
      action: 'Update Ambulance Status',
      entityType: 'Ambulance',
      entityId: ambulanceId,
      details: `Set ambulance unit ${targetAmb?.ambulanceNumber} status to ${status}`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);
  },

  addAmbulance: async (ambData: Omit<Ambulance, 'id' | 'updatedAt'>): Promise<Ambulance> => {
    const list = db.getAmbulances();
    const newAmb: Ambulance = {
      ...ambData,
      id: `amb-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    list.unshift(newAmb);
    db.saveAmbulances(list);

    return newAmb;
  }
};
