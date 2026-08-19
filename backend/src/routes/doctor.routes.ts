import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', DoctorController.getDoctors);
router.get('/:id', DoctorController.getDoctorById);
router.post('/', authenticate, requireRole('hospital_admin', 'super_admin'), DoctorController.addDoctor);
router.patch('/:id/roster', authenticate, requireRole('hospital_admin', 'super_admin'), DoctorController.updateRoster);

export default router;
