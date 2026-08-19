import { AuditLog, AuditLogRepository } from '../interfaces/audit.interface.js';

class MockAuditLogRepository implements AuditLogRepository {
  private logs: AuditLog[] = [];

  constructor() {
    this.seedLogs();
  }

  private seedLogs(): void {
    const now = new Date().toISOString();
    this.logs = [
      {
        id: 'log-001',
        actorId: 'usr-hosp-admin-001',
        actorName: 'Dr. Suresh Patil',
        actorRole: 'hospital_admin',
        action: 'UPDATE_RESOURCE',
        entityType: 'HospitalResource',
        entityId: 'res-001-icu',
        details: 'Updated ICU bed capacity: Total 20, Occupied 18, Reserved 1',
        timestamp: now,
      },
      {
        id: 'log-002',
        actorId: 'usr-super-admin-001',
        actorName: 'District Health Officer',
        actorRole: 'super_admin',
        action: 'VERIFY_HOSPITAL',
        entityType: 'Hospital',
        entityId: 'hosp-001',
        details: 'Approved hospital registration for District Civil Hospital Ratnagiri',
        timestamp: now,
      },
      {
        id: 'log-003',
        actorId: 'usr-patient-001',
        actorName: 'Rahul Sharma',
        actorRole: 'patient',
        action: 'TRIGGER_SOS',
        entityType: 'EmergencyRequest',
        entityId: 'SOS-8550',
        details: 'Initiated Emergency SOS callout for Cardiac Emergency',
        timestamp: now,
      },
    ];
  }

  async findAll(filters?: { actorRole?: string; limit?: number }): Promise<AuditLog[]> {
    let result = [...this.logs];
    if (filters) {
      if (filters.actorRole) {
        result = result.filter((l) => l.actorRole === filters.actorRole);
      }
      if (filters.limit) {
        result = result.slice(0, filters.limit);
      }
    }
    return result;
  }

  async create(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog); // latest logs first
    return newLog;
  }
}

export const auditLogRepository: AuditLogRepository = new MockAuditLogRepository();
