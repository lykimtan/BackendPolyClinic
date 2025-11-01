import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword,
    uploadUserAvatar
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/handleUploadAvatar.js';

const router = express.Router();



// Public routes
router.post('/register', registerUser);
router.post('/login',  loginUser);
router.post('/logout', logoutUser);

// Protected routes (requires authentication)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-avatar', protect, uploadAvatar.single('avatar'), uploadUserAvatar);
router.put('/change-password', protect, changePassword);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllUsers);
//  protect, authorize('admin')
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
