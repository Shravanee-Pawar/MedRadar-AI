import { NotificationItem, NotificationRepository } from '../interfaces/notification.interface.js';

class MockNotificationRepository implements NotificationRepository {
  private notifications: NotificationItem[] = [];

  constructor() {
    this.seedNotifications();
  }

  private seedNotifications(): void {
    const now = new Date().toISOString();
    this.notifications = [
      {
        id: 'notif-001',
        recipientId: 'all',
        type: 'Emergency',
        title: 'Emergency SOS Broadcasted',
        description: 'New Cardiac Emergency broadcast near Salvi Stop, Ratnagiri.',
        timestamp: now,
        isRead: false,
        isCritical: true,
      },
      {
        id: 'notif-002',
        recipientId: 'hosp-001',
        type: 'Transfer',
        title: 'Incoming Inter-Hospital Transfer',
        description: 'Patient PAT-RAT-8821 transferred from Sub-District Hospital Chiplun.',
        timestamp: now,
        isRead: false,
        isCritical: true,
      },
      {
        id: 'notif-003',
        recipientId: 'hosp-001',
        type: 'Resource',
        title: 'ICU Capacity Update Warning',
        description: 'ICU bed occupancy is at 90% capacity.',
        timestamp: now,
        isRead: false,
        isCritical: false,
      },
    ];
  }

  async findAll(recipientId: string, isRead?: boolean): Promise<NotificationItem[]> {
    let result = this.notifications.filter(
      (n) => n.recipientId === recipientId || n.recipientId === 'all'
    );
    if (isRead !== undefined) {
      result = result.filter((n) => n.isRead === isRead);
    }
    return result;
  }

  async findById(id: string): Promise<NotificationItem | null> {
    const notif = this.notifications.find((n) => n.id === id);
    return notif || null;
  }

  async markAsRead(id: string): Promise<NotificationItem | null> {
    const notif = await this.findById(id);
    if (!notif) return null;
    notif.isRead = true;
    return notif;
  }

  async clearAll(recipientId: string): Promise<boolean> {
    const targets = this.notifications.filter(
      (n) => n.recipientId === recipientId || n.recipientId === 'all'
    );
    targets.forEach((n) => (n.isRead = true));
    return true;
  }

  async create(data: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.notifications.push(newNotif);
    return newNotif;
  }
}

export const notificationRepository: NotificationRepository = new MockNotificationRepository();
