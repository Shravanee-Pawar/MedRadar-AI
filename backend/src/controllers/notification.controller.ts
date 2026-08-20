import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';

export class NotificationController {
  public static getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = req.user ? (req.user.hospitalId || req.user.id) : 'all';
      const { isRead } = req.query;
      const filterRead = isRead !== undefined ? isRead === 'true' : undefined;

      const notifications = await NotificationService.getUserNotifications(recipientId, filterRead);

      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  public static markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  public static clearAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = req.user ? (req.user.hospitalId || req.user.id) : 'all';
      await NotificationService.clearAll(recipientId);

      res.status(200).json({
        success: true,
        message: 'All notifications cleared',
      });
    } catch (error) {
      next(error);
    }
  };
}
