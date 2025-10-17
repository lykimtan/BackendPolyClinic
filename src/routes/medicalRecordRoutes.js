import express from 'express';
import {
    createMedicalRecord
} from '../controllers/medicalRecordController.js';

import { protec, authorization} from '../middleware/auth.js';

const router = express.Router();

//public route

router.post('/createRecord', createMedicalRecord);