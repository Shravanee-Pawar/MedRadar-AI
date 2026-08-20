import { Router } from 'express';
import { EmergencyController } from '../controllers/emergency.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/sos', EmergencyController.triggerSos);
router.get('/requests', authenticate, EmergencyController.getRequests);
router.get('/requests/:id', authenticate, EmergencyController.getRequestById);
router.post('/requests/:id/pre-alert', EmergencyController.sendPreAlert);
router.patch('/requests/:id/acknowledge', authenticate, requireRole('hospital_admin', 'super_admin'), EmergencyController.acknowledgePreAlert);
router.patch('/requests/:id/coordinate', authenticate, requireRole('hospital_admin', 'super_admin'), EmergencyController.coordinateTriage);

export default router;
