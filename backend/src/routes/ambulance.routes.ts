import { Router } from 'express';
import { AmbulanceController } from '../controllers/ambulance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', AmbulanceController.getAmbulances);
router.get('/:id', AmbulanceController.getAmbulanceById);
router.post('/', authenticate, requireRole('hospital_admin', 'super_admin'), AmbulanceController.addAmbulance);
router.patch('/:id/status', authenticate, requireRole('hospital_admin', 'super_admin'), AmbulanceController.updateStatus);

export default router;
