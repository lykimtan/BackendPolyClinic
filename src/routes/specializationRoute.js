import express from 'express';
import {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
  uploadImageSpecialization,
} from '../controllers/specializationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSpecializationImage } from '../middleware/handleUploadSpecializationImage.js';

const router = express.Router();

//upload speicialization image
router.post(
  '/upload-image',
  protect,
  uploadSpecializationImage.single('specImage'),
  uploadImageSpecialization
);

// Create a new specialization (admin only)
router.post('/', createSpecialization);
// authorize('admin'),

// Get all specializations (public)
router.get('/', getAllSpecializations);

// Get specialization by ID (public)
router.get('/:specializationId', getSpecializationById);

//update specialization
router.put('/:specializationId', protect, updateSpecialization);
//delete specialization
router.delete('/:specializationId', protect, deleteSpecialization);

export default router;
