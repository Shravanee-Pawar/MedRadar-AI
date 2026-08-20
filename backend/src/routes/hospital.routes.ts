import { Router } from 'express';
import { HospitalController } from '../controllers/hospital.controller.js';
import { ResourceController } from '../controllers/resource.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole, requireHospitalAccess } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', HospitalController.getHospitals);
router.get('/:id', HospitalController.getHospitalById);
router.patch('/:id/verify', authenticate, requireRole('super_admin'), HospitalController.verifyHospital);

// Hospital Resource Telemetry Endpoints
router.get('/:id/resources', ResourceController.getResources);
router.put(
  '/:id/resources/:resourceType',
  authenticate,
  requireRole('hospital_admin', 'super_admin'),
  requireHospitalAccess,
  ResourceController.updateResource
);

export default router;
