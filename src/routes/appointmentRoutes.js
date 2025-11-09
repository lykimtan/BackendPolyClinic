import express from 'express';
import {
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentByDoctorId,
  getAppointmentByPatientId,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'staff'), getAllAppointments);
router.get(
  '/doctor/:doctorId',
  protect,
  authorize('doctor', 'staff', 'admin'),
  getAppointmentByDoctorId
);
router.get(
  '/patientId/:patientId',
  protect,
  authorize('patient', 'admin', 'staff'),
  getAppointmentByPatientId
);

router.post('/', protect, authorize('patient'), createAppointment);
router.put(
  '/:appointmentId/status',
  protect,
  authorize('doctor', 'staff'),
  updateAppointmentStatus
);

router.delete('/:appointmentId', protect, authorize('patient'), deleteAppointment);

export default router;
