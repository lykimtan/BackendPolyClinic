import express from 'express';
import {
    submitRoleRequest,
    getAllPendingRoleRequests,
    getUserRoleRequests,
    acceptRoleRequest,
    rejectedRoleRequest,
    deleteRoleRequest,
    uploadDocumentProof
} from '../controllers/roleRequestController.js';
import { protect } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/handleUploadDocument.js';

const router = express.Router();

// Upload document proof (protected route)
router.post('/upload-document', protect, uploadDocument.single('document'), uploadDocumentProof);

// Submit role request (protected route - any authenticated user)
router.post('/submit', protect, submitRoleRequest);

// Get user's own role requests
router.get('/my-requests', protect, getUserRoleRequests);

// Admin routes
router.get('/pending', protect,  getAllPendingRoleRequests);
router.patch('/:requestId/approve', protect, acceptRoleRequest);
router.patch('/:requestId/reject', protect,  rejectedRoleRequest);
router.delete('/:requestId', protect, deleteRoleRequest);

export default router;
