import { Router } from 'express';
import { BloodController } from '../controllers/blood.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole, requireHospitalAccess } from '../middleware/role.middleware.js';

const router = Router();

router.get('/inventory', BloodController.getInventory);
router.put(
  '/inventory/:hospitalId/:bloodGroup',
  authenticate,
  requireRole('hospital_admin', 'super_admin'),
  requireHospitalAccess,
  BloodController.updateInventory
);
router.post('/requests', BloodController.createRequest);
router.get('/requests', authenticate, BloodController.getRequests);

export default router;
