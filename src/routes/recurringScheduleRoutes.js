import express from 'express';
import {
  createRecurringSchedule,
  getDoctorRecurringSchedules,
  getRecurringById,
  deleteRecurringSchedule,
  updateRecurringSchedules,
} from '../controllers/recurringScheduleController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//cac route deu yc dang nhap
router.use(protect);

//tao va lay tat ca lich dinh ky

router.route('/').post(createRecurringSchedule);

router.route('/:id').get(getRecurringById);

//lay lich dinh ky theo bac si

router.route('/doctor/:doctorId').get( getDoctorRecurringSchedules);

//xoa
router.route('/:id').delete(authorize('admin', 'staff'), deleteRecurringSchedule);

router.route('/:id').put(authorize('admin', 'staff'), updateRecurringSchedules);

export default router;
