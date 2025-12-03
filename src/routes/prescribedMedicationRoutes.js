import express from 'express';
import {
  createPrescribedMedication,
  getPrescribedMedicationsByMedicalRecord,
  getPrescribedMedicationsById,
  updatePrescribedMedication
} from '../controllers/precribedMedicationControllers.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//public route

router.post('/createPrescribedMedication', protect, authorize('doctor'), createPrescribedMedication);
router.patch('/:id', protect, authorize('doctor'), updatePrescribedMedication);
router.get('/medicalRecord/:medicalRecordId', protect, getPrescribedMedicationsByMedicalRecord);
router.get('/:prescribedMedicationId', protect, getPrescribedMedicationsById);

export default router; 