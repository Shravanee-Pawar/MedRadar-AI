import { db } from './db';
import { apiFetch } from './apiClient';
import { type Notification } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const remote = await apiFetch<Notification[]>('/notifications');
    if (remote && Array.isArray(remote) && remote.length > 0) return remote;
    return db.getNotifications();
  },

  markRead: async (notificationId: string): Promise<void> => {
    await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' });

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
    await apiFetch('/notifications/clear-all', { method: 'POST' });

    const list = db.getNotifications();
    const updated = list.map(n => ({ ...n, isRead: true }));
    db.saveNotifications(updated);
  }
};
