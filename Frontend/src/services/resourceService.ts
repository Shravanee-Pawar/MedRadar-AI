import { db } from './db';
import { type HospitalResource, type ResourceUpdate } from '../types';
import { hospitalService } from './hospitalService';

export const resourceService = {
  getResources: async (): Promise<HospitalResource[]> => {
    return db.getResources();
  },

  getResourcesByHospital: async (hospitalId: string): Promise<HospitalResource[]> => {
    const list = db.getResources();
    return list.filter(r => r.hospitalId === hospitalId);
  },

  updateResource: async (
    hospitalId: string,
    resourceType: string,
    newValue: number,
    reason: string,
    adminName: string
  ): Promise<void> => {
    const resources = db.getResources();
    let oldVal = 0;
    let resourceName = '';

    const updated = resources.map(r => {
      if (r.hospitalId === hospitalId && r.resourceType === resourceType) {
        oldVal = r.available;
        resourceName = r.resourceName;
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

    // Dynamic readiness score recalculation
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

    // Save ResourceUpdate history
    const updates = db.getResourceUpdates();
    const hosp = hospitals.find(h => h.id === hospitalId);
    const newUpdate: ResourceUpdate = {
      id: `u-log-${Date.now()}`,
      hospitalId,
      hospitalName: hosp?.name || 'Unknown Hospital',
      resourceName,
      previousValue: oldVal,
      newValue,
      status: newValue === 0 ? 'Critical' : newValue <= 2 ? 'Limited' : 'Available',
      reason,
      updatedBy: adminName,
      updatedAt: new Date().toISOString()
    };
    updates.unshift(newUpdate);
    db.getResourceUpdates(); // Wait, let's write it down:
    db.saveResourceUpdates(updates);

    // Push alert notifications
    const notifications = db.getNotifications();
    if (newValue === 0) {
      notifications.unshift({
        id: `not-${Date.now()}`,
        recipientId: 'all_admins',
        type: 'Resource',
        title: 'CRITICAL: Resource Depletion',
        description: `${hosp?.name} reports 0 available ${resourceName}.${reason ? ` Reason: ${reason}` : ''}`,
        timestamp: 'Just now',
        isRead: false,
        isCritical: true
      });
    } else {
      notifications.unshift({
        id: `not-${Date.now()}`,
        recipientId: 'all_admins',
        type: 'Resource',
        title: 'Resource Stock Updated',
        description: `${hosp?.name} updated ${resourceName} to ${newValue} available.`,
        timestamp: 'Just now',
        isRead: false,
        isCritical: false
      });
    }
    db.saveNotifications(notifications);

    // Add Audit Log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'hosp-admin',
      actorName: adminName,
      actorRole: 'hospital_admin',
      action: 'Update Resource',
      entityType: 'HospitalResource',
      entityId: `${hospitalId}-${resourceType}`,
      details: `Modified ${resourceName} count from ${oldVal} to ${newValue} for ${hosp?.name}`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);
  },

  sendStaleReminder: async (hospitalId: string, resourceName: string): Promise<void> => {
    const hospitals = db.getHospitals();
    const hosp = hospitals.find(h => h.id === hospitalId);

    // Trigger notification to user/admins
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

    // Set updated time to current to clear the warning visual state in frontend (simulation feedback)
    const resources = db.getResources();
    const updated = resources.map(r => {
      if (r.hospitalId === hospitalId && r.resourceName === resourceName) {
        return {
          ...r,
          status: 'Available' as any,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    db.saveResources(updated);

    // Update hospital timestamp
    const updatedHops = hospitals.map(h => (h.id === hospitalId ? { ...h, updatedAt: new Date().toISOString() } : h));
    db.saveHospitals(updatedHops);

    // Audit log
    const auditLogs = db.getAuditLogs();
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: 'super-admin',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      action: 'Reminder Dispatched',
      entityType: 'HospitalResource',
      entityId: `${hospitalId}-${resourceName}`,
      details: `Requested freshness checkpoint verify alert for ${resourceName} at ${hosp?.name}`,
      timestamp: new Date().toISOString()
    });
    db.saveAuditLogs(auditLogs);
  }
};
