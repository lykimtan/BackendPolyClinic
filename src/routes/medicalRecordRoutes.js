import express from 'express';
import {
  getAllMedicalRecords,
  getMedicationRecordsByPatient,
  createMedicalRecord,
  updateMedicalRecord,
} from '../controllers/medicalRecordController.js';

import { protect, authorize } from '../middleware/auth.js';
import e from 'express';

const router = express.Router();

//public route

router.get('/', protect, authorize('admin', 'staff'), getAllMedicalRecords);
router.get('/patient/:patientId', protect, getMedicationRecordsByPatient);
router.put('/updateRecord/:recordId', protect, authorize('doctor'), updateMedicalRecord);

router.post('/createRecord', protect, authorize('admin', 'staff'), createMedicalRecord);

export default router;
