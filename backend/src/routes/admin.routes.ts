import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/users', authenticate, requireRole('super_admin'), AdminController.getUsers);
router.post('/hospitals/:id/resources/stale-reminder', authenticate, requireRole('super_admin'), AdminController.sendStaleReminder);
router.get('/analytics/regional', authenticate, requireRole('super_admin'), AdminController.getRegionalAnalytics);

export default router;
