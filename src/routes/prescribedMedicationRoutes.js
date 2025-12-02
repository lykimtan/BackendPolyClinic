import express from 'express';
import {
  createPrescribedMedication,
  getPresribedMedicationsByMedicalRecord,
  getPresribedMedicationsById
} from '../controllers/precribedMedicationControllers.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//public route

router.post('/createPrescribedMedication', protect, authorize('doctor'), createPrescribedMedication);
router.get('/medicalRecord/:medicalRecordId', protect, getPresribedMedicationsByMedicalRecord);
router.get('/:prescribedMedicationId', protect, getPresribedMedicationsById);

export default router;