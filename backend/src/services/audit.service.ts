import { auditLogRepository } from '../repositories/audit.repository.js';
import { AuditLog } from '../interfaces/audit.interface.js';

export class AuditService {
  public static async getLogs(filters?: { actorRole?: string; limit?: number }): Promise<AuditLog[]> {
    return auditLogRepository.findAll(filters);
  }

  public static async logAction(data: {
    actorId: string;
    actorName: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
  }): Promise<AuditLog> {
    return auditLogRepository.create(data);
  }
}
