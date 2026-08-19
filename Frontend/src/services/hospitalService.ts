import { db } from './db';
import { type Hospital, type HospitalResource } from '../types';

export const hospitalService = {
  getHospitals: async (): Promise<Hospital[]> => {
    return db.getHospitals();
  },

  getHospitalById: async (id: string): Promise<Hospital | undefined> => {
    const list = db.getHospitals();
    return list.find(h => h.id === id);
  },

  registerHospital: async (hospData: Omit<Hospital, 'id' | 'verified' | 'distanceFromUserKm' | 'readinessScore' | 'updatedAt'>): Promise<Hospital> => {
    const hospitals = db.getHospitals();
    const newId = `hosp-${Date.now()}`;
    
    const newHosp: Hospital = {
      ...hospData,
      id: newId,
      verified: false,
      distanceFromUserKm: Number((Math.random() * 8 + 1).toFixed(1)),
      readinessScore: 60, // Baseline readiness score
      updatedAt: new Date().toISOString()
    };

    db.saveHospitals([newHosp, ...hospitals]);

    // Seed default resources
    const resources = db.getResources();
    const defaultResources: HospitalResource[] = [
      { id: `res-${newId}-1`, hospitalId: newId, resourceType: 'icu_beds', resourceName: 'ICU Beds', total: 10, available: 2, status: 'Available', updatedAt: new Date().toISOString(), updatedBy: 'Admin Self-Registration' },
      { id: `res-${newId}-2`, hospitalId: newId, resourceType: 'general_beds', resourceName: 'General Beds', total: 50, available: 15, status: 'Available', updatedAt: new Date().toISOString(), updatedBy: 'Admin Self-Registration' },
      { id: `res-${newId}-3`, hospitalId: newId, resourceType: 'ventilators', resourceName: 'Ventilators', total: 4, available: 1, status: 'Available', updatedAt: new Date().toISOString(), updatedBy: 'Admin Self-Registration' },
      { id: `res-${newId}-4`, hospitalId: newId, resourceType: 'oxygen_kl', resourceName: 'Liquid Oxygen Capacity (KL)', total: 3, available: 2, status: 'Available', updatedAt: new Date().toISOString(), updatedBy: 'Admin Self-Registration' },
      { id: `res-${newId}-5`, hospitalId: newId, resourceType: 'operating_theatres', resourceName: 'Operating Theatres', total: 2, available: 1, status: 'Available', updatedAt: new Date().toISOString(), updatedBy: 'Admin Self-Registration' },
      { id: `res-${newId}-6`, hospitalId: newId, resourceType: 'emergency_capacity', resourceName: 'Emergency Capacity (Beds)', total: 5, available: 2, status: 'Available', updatedAt: new Date().toISOString(), updatedBy: 'Admin Self-Registration' }
    ];
    db.saveResources([...defaultResources, ...resources]);

    // Push admin alert
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Verification',
      title: 'Verification Request Filed',
      description: `${newHosp.name} registered and requested credentials validation.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: true
    });
    db.saveNotifications(notifications);

    return newHosp;
  },

  verifyHospital: async (hospitalId: string, action: 'approve' | 'reject'): Promise<void> => {
    const list = db.getHospitals();
    const updated = list.map(h => {
      if (h.id === hospitalId) {
        return { ...h, verified: action === 'approve', updatedAt: new Date().toISOString() };
      }
      return h;
    });
    db.saveHospitals(updated);

    const targetHosp = list.find(h => h.id === hospitalId);
    
    // Add verification alert
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Verification',
      title: `Hospital ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `${targetHosp?.name} has been ${action === 'approve' ? 'verified on' : 'suspended from'} the resource grid.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: false
    });
    db.saveNotifications(notifications);

    // Audit Log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'usr-8',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      action: 'Verify Hospital',
      entityType: 'Hospital',
      entityId: hospitalId,
      details: `${action === 'approve' ? 'Approved' : 'Rejected'} grid verified status for ${targetHosp?.name}`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);
  },

  calculateReadinessScore: (hospitalId: string, myResources: HospitalResource[]): number => {
    const icu = myResources.find(r => r.resourceType === 'icu_beds');
    const genBeds = myResources.find(r => r.resourceType === 'general_beds');
    const vent = myResources.find(r => r.resourceType === 'ventilators');
    const oxy = myResources.find(r => r.resourceType === 'oxygen_kl');
    const ot = myResources.find(r => r.resourceType === 'operating_theatres');
    const erCap = myResources.find(r => r.resourceType === 'emergency_capacity');

    let score = 25; // baseline

    // ICU beds (max 15 pts)
    if (icu && icu.available > 0) {
      const ratio = icu.available / Math.max(1, icu.total);
      score += Math.round(ratio * 15);
    }
    // General beds (max 10 pts)
    if (genBeds && genBeds.available > 0) {
      const ratio = genBeds.available / Math.max(1, genBeds.total);
      score += Math.round(ratio * 10);
    }
    // Ventilators (max 15 pts)
    if (vent && vent.available > 0) {
      const ratio = vent.available / Math.max(1, vent.total);
      score += Math.round(ratio * 15);
    }
    // Oxygen (max 10 pts)
    if (oxy && oxy.available > 2) {
      score += 10;
    } else if (oxy && oxy.available > 0) {
      score += 5;
    }
    // Operating Theatres (max 10 pts)
    if (ot && ot.available > 0) {
      score += 10;
    }
    // Emergency Capacity (max 10 pts)
    if (erCap && erCap.available > 0) {
      score += 10;
    }

    // Doctors on duty (max 5 pts)
    try {
      const docs = db.getDoctors().filter(d => d.hospitalId === hospitalId || d.availabilityStatus === 'Available');
      if (docs.length > 0) score += 5;
    } catch (_) {}

    // Ambulance fleet (max 5 pts)
    try {
      const ambs = db.getAmbulances().filter(a => a.hospitalId === hospitalId || a.status === 'Available');
      if (ambs.length > 0) score += 5;
    } catch (_) {}

    // Blood stock (max 5 pts)
    try {
      const bloods = db.getBloodInventory().filter(b => b.hospitalId === hospitalId);
      const availableUnits = bloods.reduce((sum, b) => sum + (b.unitsAvailable || 0), 0);
      if (availableUnits > 5) score += 5;
    } catch (_) {}

    return Math.min(100, Math.max(10, score));
  }
};
