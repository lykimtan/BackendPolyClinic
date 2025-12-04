import express from 'express';
import {
  getAverageRatingByDoctorId,
  createRating,
  updateRating,
  deleteRating,
  getRatingByDoctorId,
  getTopRatedDoctors,
} from '../controllers/ratingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('patient'), createRating);
router.get('/top-rated', getTopRatedDoctors);
router.get('/doctor/:doctorId/average', getAverageRatingByDoctorId);
router.get('/doctor/:doctorId', getRatingByDoctorId);
router.put('/:ratingId', protect, authorize('patient'), updateRating);
router.delete('/:ratingId', protect, authorize('patient'), deleteRating);

export default router;
