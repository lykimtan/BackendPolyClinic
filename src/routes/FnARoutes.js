import express from 'express';
import {
    createFrequencyQuestion,
    getAllFnA,
    getFnAByAsker,
    getPublishedFnA,
    updateFnA,
    deleteFnA,
    getFnAByResponder,
    updateFnAPublicationStatus
} from '../controllers/FnAController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

//public routes

router.get('/all', getAllFnA);
router.get('/published', getPublishedFnA);
router.get('/asker/:askerId', getFnAByAsker);
router.get('/responder/:doctorId', getFnAByResponder);


router.post('/create', createFrequencyQuestion);
router.put('/update/:id', updateFnA);
router.put('/publish/:id', updateFnAPublicationStatus);
router.delete('/delete/:id', protect, deleteFnA);

export default router;
