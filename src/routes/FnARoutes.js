import express from 'express';
import {
  createFrequencyQuestion,
  getAllFnA,
  getFnAByAsker,
  getPublishedFnA,
  updateQuestion,
  updateFnA,
  deleteAnswer,
  deleteFnA,
  getFnAByResponder,
  updateFnAPublicationStatus,
} from '../controllers/FnAController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleUploadFnAImage, handleUploadError } from '../middleware/handleUploadFnAImage.js';

const router = express.Router();

//public routes

router.get('/all', getAllFnA);
router.get('/published', getPublishedFnA);
router.get('/asker/:askerId', getFnAByAsker);
router.get('/responder/:doctorId', getFnAByResponder);

router.post('/create', createFrequencyQuestion);
router.put('/question/:id', updateQuestion);
router.put('/update/:id', handleUploadFnAImage, handleUploadError, updateFnA);
router.put('/delete-answer/:id', deleteAnswer);
router.put('/publish/:id', updateFnAPublicationStatus);
router.delete('/delete/:id', protect, deleteFnA);

export default router;
