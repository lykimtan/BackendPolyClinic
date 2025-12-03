import express from 'express';
import {
  createMedication,
  getAllMedication,
  getMedicationById,
  updateMedication,
  deleteMedication,
} from '../controllers/medicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  handleUploadMedicationImage,
  handleUploadError,
} from '../middleware/handleUploadMedicationImage.js';

const router = express.Router();

// Public routes
router.get('/', getAllMedication);
router.get('/:medicationId', getMedicationById);

// Protected routes (admin/staff)
router.post(
  '/createDrug',
  protect,
  authorize('admin', 'staff'),
  handleUploadMedicationImage,
  handleUploadError,
  createMedication
);

router.put(
  '/:medicationId',
  protect,
  authorize('admin', 'staff'),
  handleUploadMedicationImage,
  handleUploadError,
  updateMedication
);

router.delete('/:medicationId', protect, authorize('admin', 'staff'), deleteMedication);

export default router;
