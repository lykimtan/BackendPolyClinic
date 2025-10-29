import express from 'express';

import  {
    createMedication,

    getMedicationById
    
} from '../controllers/medicationController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//public route

router.post('/createDrug',   createMedication);
// protect, authorize('admin', 'doctor', 'staff'),
router.get('/:medicationId', protect, getMedicationById);

export default router;