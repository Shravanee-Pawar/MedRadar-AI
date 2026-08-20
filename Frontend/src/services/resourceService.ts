import { db } from './db';
import { apiFetch } from './apiClient';
import { type HospitalResource } from '../types';
import { hospitalService } from './hospitalService';

export const resourceService = {
  getResources: async (): Promise<HospitalResource[]> => {
    const remote = await apiFetch<HospitalResource[]>('/hospitals/hosp-001/resources');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }
    return db.getResources();
  },

  getResourcesByHospital: async (hospitalId: string): Promise<HospitalResource[]> => {
    const remote = await apiFetch<HospitalResource[]>(`/hospitals/${hospitalId}/resources`);
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return remote;
    }
    const list = db.getResources();
    return list.filter(r => r.hospitalId === hospitalId);
  },

  updateResource: async (
    hospitalId: string,
    resourceType: string,
    newValue: number,
    _reason: string,
    adminName: string
  ): Promise<void> => {
    await apiFetch(`/hospitals/${hospitalId}/resources/${resourceType}`, {
      method: 'PUT',
      body: JSON.stringify({ occupied: newValue }),
    });

    const resources = db.getResources();

    const updated = resources.map(r => {
      if (r.hospitalId === hospitalId && r.resourceType === resourceType) {
        const status = (newValue === 0 ? 'Critical' : newValue <= 2 ? 'Limited' : 'Available') as any;
        return {
          ...r,
          available: newValue,
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: adminName
        };
      }
      return r;
    });
    db.saveResources(updated);

    const hospitals = db.getHospitals();
    const myHospRes = updated.filter(r => r.hospitalId === hospitalId);
    const nextReadiness = hospitalService.calculateReadinessScore(hospitalId, myHospRes);

    const updatedHospitals = hospitals.map(h => {
      if (h.id === hospitalId) {
        return {
          ...h,
          readinessScore: nextReadiness,
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });
    db.saveHospitals(updatedHospitals);
  },

  sendStaleReminder: async (hospitalId: string, resourceName: string): Promise<void> => {
    await apiFetch(`/hospitals/${hospitalId}/resources/stale-reminder`, {
      method: 'POST',
      body: JSON.stringify({ resourceName }),
    });

    const hospitals = db.getHospitals();
    const hosp = hospitals.find(h => h.id === hospitalId);

    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Stale Data',
      title: 'Telemetry Reminder Dispatched',
      description: `Verification ping sent to administrator at ${hosp?.name} regarding stale ${resourceName} levels.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: false
    });
    db.saveNotifications(notifications);
  }
};
