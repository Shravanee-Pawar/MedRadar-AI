import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole, requireHospitalAccess } from '../middleware/role.middleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register/patient', AuthController.registerPatient);
router.post('/register/hospital', AuthController.registerHospital);
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);

// RBAC Verification Test Endpoints
router.get('/admin-test', authenticate, requireRole('super_admin'), (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Welcome Super Admin!', user: req.user });
});

router.get('/hospital-test/:hospitalId', authenticate, requireRole('hospital_admin', 'super_admin'), requireHospitalAccess, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Access granted for hospital ${req.params.hospitalId}`, user: req.user });
});

export default router;
