import express from 'express';
import {
  getAllMedicalRecords,
  getMedicationRecordsByPatient,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
} from '../controllers/medicalRecordController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//public route

router.post('/createRecord', protect, authorize('doctor'), createMedicalRecord);
router.get('/patient/:patientId', protect, getMedicationRecordsByPatient);
router.get('/:recordId', protect, getMedicalRecordById);
router.put('/updateRecord/:recordId', protect, authorize('doctor'), updateMedicalRecord);
router.get('/', protect, authorize('admin', 'staff'), getAllMedicalRecords);

export default router;
