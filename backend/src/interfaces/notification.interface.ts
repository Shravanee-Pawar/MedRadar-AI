export type NotificationType =
  | 'Emergency'
  | 'Blood'
  | 'Hospital'
  | 'Resource'
  | 'Ambulance'
  | 'Stale Data'
  | 'Verification'
  | 'Transfer';

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  isCritical: boolean;
}

export interface NotificationRepository {
  findAll(recipientId: string, isRead?: boolean): Promise<NotificationItem[]>;
  findById(id: string): Promise<NotificationItem | null>;
  markAsRead(id: string): Promise<NotificationItem | null>;
  clearAll(recipientId: string): Promise<boolean>;
  create(data: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): Promise<NotificationItem>;
}
