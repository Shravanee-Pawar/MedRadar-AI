import { db } from './db';
import { apiFetch } from './apiClient';
import { type Hospital, type HospitalResource } from '../types';

export const hospitalService = {
  getHospitals: async (): Promise<Hospital[]> => {
    const local = db.getHospitals();
    const remote = await apiFetch<Hospital[]>('/hospitals');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      const mergedMap = new Map<string, Hospital>();
      // Put remote first, then local (local overrides/adds newly created ones)
      remote.forEach(h => mergedMap.set(h.id, h));
      local.forEach(h => mergedMap.set(h.id, h));
      return Array.from(mergedMap.values());
    }
    return local;
  },

  getHospitalById: async (id: string): Promise<Hospital | undefined> => {
    const remote = await apiFetch<Hospital>(`/hospitals/${id}`);
    if (remote) return remote;
    const list = db.getHospitals();
    return list.find(h => h.id === id);
  },

  registerHospital: async (hospData: Omit<Hospital, 'id' | 'verified' | 'distanceFromUserKm' | 'readinessScore' | 'updatedAt'>): Promise<Hospital> => {
    const hospitals = db.getHospitals();
    const newId = `hosp-${Date.now()}`;
    
    const newHosp: Hospital = {
      ...hospData,
      id: newId,
      verified: true,
      distanceFromUserKm: Number((Math.random() * 8 + 1).toFixed(1)),
      readinessScore: 75,
      updatedAt: new Date().toISOString()
    };

    db.saveHospitals([newHosp, ...hospitals]);

    // Seed default resources locally
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

    return newHosp;
  },

  verifyHospital: async (hospitalId: string, action: 'approve' | 'reject'): Promise<void> => {
    await apiFetch(`/hospitals/${hospitalId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });

    const list = db.getHospitals();
    const updated = list.map(h => {
      if (h.id === hospitalId) {
        return { ...h, verified: action === 'approve', updatedAt: new Date().toISOString() };
      }
      return h;
    });
    db.saveHospitals(updated);
  },

  calculateReadinessScore: (_hospitalId: string, myResources: HospitalResource[]): number => {
    const icu = myResources.find(r => r.resourceType === 'icu_beds');
    const genBeds = myResources.find(r => r.resourceType === 'general_beds');
    const vent = myResources.find(r => r.resourceType === 'ventilators');

    let score = 30;
    if (icu && icu.available > 0) {
      score += Math.round((icu.available / Math.max(1, icu.total)) * 35);
    }
    if (genBeds && genBeds.available > 0) {
      score += Math.round((genBeds.available / Math.max(1, genBeds.total)) * 20);
    }
    if (vent && vent.available > 0) {
      score += Math.round((vent.available / Math.max(1, vent.total)) * 15);
    }

    return Math.min(100, Math.max(10, score));
  }
};
