import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, NotificationController.getNotifications);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.post('/clear-all', authenticate, NotificationController.clearAll);

export default router;
