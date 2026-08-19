import { db } from './db';
import { type BloodInventory, type BloodRequest } from '../types';

export const bloodService = {
  getBloodInventory: async (): Promise<BloodInventory[]> => {
    return db.getBloodInventory();
  },

  getInventoryByHospital: async (hospitalId: string): Promise<BloodInventory[]> => {
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

    // Update dynamic inventory count
    const inventory = db.getBloodInventory();
    const updatedInventory = inventory.map(item => {
      if (item.hospitalId === hospitalId && item.bloodGroup === bloodGroup) {
        const nextUnits = Math.max(0, item.unitsAvailable - unitsRequired);
        const status = (nextUnits === 0 ? 'Critical' : nextUnits <= 2 ? 'Limited' : 'Available') as any;
        return {
          ...item,
          unitsAvailable: nextUnits,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    db.saveBloodInventory(updatedInventory);

    // Notification alert
    const notifications = db.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      recipientId: 'all_admins',
      type: 'Blood',
      title: 'Blood Units Reserved',
      description: `${patientName} filed request for ${unitsRequired} units of ${bloodGroup} at ${targetHosp?.name}. Verification Code: MB-${Math.floor(Math.random()*9000 + 1000)}.`,
      timestamp: 'Just now',
      isRead: false,
      isCritical: false
    });
    db.saveNotifications(notifications);

    return newBReq;
  },

  updateInventoryStatus: async (
    hospitalId: string,
    bloodGroup: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-',
    unitsAvailable: number
  ): Promise<void> => {
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
