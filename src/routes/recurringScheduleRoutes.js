import express from 'express';
import {
  createRecurringSchedule,
  getDoctorRecurringSchedules,
  deleteRecurringSchedule,
  updateRecurringSchedules,
} from '../controllers/recurringScheduleController.js';

import { protect, authorite } from '../middleware/auth.js';

const router = express.Router();

//cac route deu yc dang nhap
router.use(protect);

//tao va lay tat ca lich dinh ky

router.route('/').post(authorite('staff', 'admin'), createRecurringSchedule);

//lay lich dinh ky theo bac si

router.route('/doctor/:doctorId').get(authorite('admin', 'staff'), getDoctorRecurringSchedules);

//xoa
router.route('/:id').delete(authorite('admin', 'staff'), deleteRecurringSchedule);

router.route('/:id').put(authorite('admin', 'staff'), updateRecurringSchedules);

export default router;
