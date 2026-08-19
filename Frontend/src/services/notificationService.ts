import { db } from './db';
import { type Notification } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    return db.getNotifications();
  },

  markRead: async (notificationId: string): Promise<void> => {
    const list = db.getNotifications();
    const updated = list.map(n => {
      if (n.id === notificationId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    db.saveNotifications(updated);
  },

  clearAll: async (): Promise<void> => {
    const list = db.getNotifications();
    const updated = list.map(n => ({ ...n, isRead: true }));
    db.saveNotifications(updated);
  }
};
