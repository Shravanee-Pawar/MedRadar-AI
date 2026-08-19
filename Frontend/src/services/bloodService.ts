import { db } from './db';
import { apiFetch } from './apiClient';
import { type BloodInventory, type BloodRequest } from '../types';

export const bloodService = {
  getBloodInventory: async (): Promise<BloodInventory[]> => {
    const remote = await apiFetch<BloodInventory[]>('/blood/inventory');
    if (remote && Array.isArray(remote) && remote.length > 0) return remote;
    return db.getBloodInventory();
  },

  getInventoryByHospital: async (hospitalId: string): Promise<BloodInventory[]> => {
    const remote = await apiFetch<BloodInventory[]>(`/blood/inventory?hospitalId=${hospitalId}`);
    if (remote && Array.isArray(remote) && remote.length > 0) return remote;
    const list = db.getBloodInventory();
    return list.filter(b => b.hospitalId === hospitalId);
  },

  requestBlood: async (
    bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-',
    unitsRequired: number,
    hospitalId: string,
    patientName: string,
    patientId: string
  ): Promise<BloodRequest> => {
    const remote = await apiFetch<BloodRequest>('/blood/requests', {
      method: 'POST',
      body: JSON.stringify({
        patientName,
        patientPhone: '9876543210',
        bloodGroup,
        unitsRequired,
        hospitalId,
      }),
    });
    if (remote) return remote;

    const list = db.getBloodRequests();
    const hospitals = db.getHospitals();
    const targetHosp = hospitals.find(h => h.id === hospitalId);

    const newBReq: BloodRequest = {
      id: `breq-${Date.now()}`,
      patientId,
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalId,
      hospitalName: targetHosp?.name || 'Unknown Facility',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    list.unshift(newBReq);
    db.saveBloodRequests(list);
    return newBReq;
  },

  updateInventoryStatus: async (
    hospitalId: string,
    bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-',
    unitsAvailable: number
  ): Promise<void> => {
    await apiFetch(`/blood/inventory/${hospitalId}/${bloodGroup}`, {
      method: 'PUT',
      body: JSON.stringify({ unitsAvailable }),
    });

    const inventory = db.getBloodInventory();
    const updated = inventory.map(item => {
      if (item.hospitalId === hospitalId && item.bloodGroup === bloodGroup) {
        const status = (unitsAvailable === 0 ? 'Critical' : unitsAvailable <= 2 ? 'Limited' : 'Available') as any;
        return {
          ...item,
          unitsAvailable,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    db.saveBloodInventory(updated);
  }
};
