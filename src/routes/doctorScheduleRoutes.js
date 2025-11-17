import express from 'express';

import {
    createDoctorSchedule,
    getDoctorSchedules
} from '../controllers/doctorScheduleController.js';

import {protect, authorize} from '../middleware/auth.js';

const router = express.Router();

router.get('/:doctorId', getDoctorSchedules);
router.post('/', protect, authorize('staff', 'admin'), createDoctorSchedule);

export default router;