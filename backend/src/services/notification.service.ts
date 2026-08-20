import { notificationRepository } from '../repositories/notification.repository.js';
import { NotificationItem } from '../interfaces/notification.interface.js';

export class NotificationService {
  public static async getUserNotifications(recipientId: string, isRead?: boolean): Promise<NotificationItem[]> {
    return notificationRepository.findAll(recipientId, isRead);
  }

  public static async markAsRead(id: string): Promise<NotificationItem> {
    const updated = await notificationRepository.markAsRead(id);
    if (!updated) {
      const error: any = new Error(`Notification '${id}' not found`);
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return updated;
  }

  public static async clearAll(recipientId: string): Promise<boolean> {
    return notificationRepository.clearAll(recipientId);
  }
}
