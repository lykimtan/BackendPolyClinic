import express from 'express';
import {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  getNotificationById,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllUserNotifications,
  searchNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create notification (admin/staff)
router.post('/', protect, createNotification);

// Routes with specific sub-paths (MUST be before /:userId or /:notificationId)
router.put('/read-multiple', protect, markMultipleAsRead);
router.delete('/multiple', protect, deleteMultipleNotifications);

// Routes with userId params (MUST be before /:notificationId)
router.get('/:userId/unread', protect, getUnreadCount);
router.get('/:userId/search', protect, searchNotifications);
router.put('/:userId/read-all', protect, markAllAsRead);
router.delete('/:userId/all', protect, deleteAllUserNotifications);
router.get('/:userId', protect, getUserNotifications);

// Routes with notificationId params (MUST be last)
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.get('/:userId/:id', protect, getNotificationById);

export default router;


