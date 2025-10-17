import express from 'express';

import  {
    createMedication,
    getMedication
    
} from '../controllers/medicationController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//public route

router.post('/createDrug',   createMedication);
// protect, authorize('admin', 'doctor', 'staff'),
router.get('/:id', protect, getMedication);

export default router;