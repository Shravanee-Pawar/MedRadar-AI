import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticate, requireRole('hospital_admin', 'super_admin'), TransferController.getTransfers);
router.get('/:id', authenticate, requireRole('hospital_admin', 'super_admin'), TransferController.getTransferById);
router.post('/', authenticate, requireRole('hospital_admin', 'super_admin'), TransferController.createTransfer);
router.patch('/:id/status', authenticate, requireRole('hospital_admin', 'super_admin'), TransferController.updateStatus);

export default router;
