import express from 'express';
import {
    getAverageRatingByDoctorId,
    createRating,
    updateRating,
    deleteRating,
    getRatingByDoctorId,

} from '../controllers/ratingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/doctor/:doctorId/average', getAverageRatingByDoctorId);
router.get('/doctor/:doctorId',getRatingByDoctorId);
router.post('/', createRating);
router.put('/update/:ratingId', protect, updateRating);
router.delete('/delete/:ratingId', protect, deleteRating);
