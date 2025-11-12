import express from 'express';

import {
    getAllDoctors,
    getDoctorById,
    getAllDoctorBySpecialization
} from '../controllers/doctorController.js';
    
const router = express.Router();

//public routes

router.get('/all', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/specialization/:id', getAllDoctorBySpecialization);

export default router;