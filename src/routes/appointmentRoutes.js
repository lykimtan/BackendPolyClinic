import express from 'express';
import {
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAllAppointmentsByDate,
  getAppointmentByDoctorId,
  getAppointmentByPatientId,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'staff'), getAllAppointments);

router.get('/doctor/appointment-today', protect, authorize('doctor', 'staff'), getAllAppointmentsByDate);

router.get(
  '/doctor/:doctorId',
  protect,
  getAppointmentByDoctorId
);
router.get(
  '/patientId/:patientId',
  protect,
  authorize('patient', 'admin', 'staff'),
  getAppointmentByPatientId
);

router.post('/', protect, createAppointment);
router.put(
  '/:appointmentId/status',
  protect,
  authorize('doctor', 'staff'),
  updateAppointmentStatus
);

router.delete('/:appointmentId', protect, authorize('patient'), deleteAppointment);

export default router;
