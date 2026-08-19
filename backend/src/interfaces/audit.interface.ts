export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AuditLogRepository {
  findAll(filters?: { actorRole?: string; limit?: number }): Promise<AuditLog[]>;
  create(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
}
