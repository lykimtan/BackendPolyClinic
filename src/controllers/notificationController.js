import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { io } from '../app.js';

// Tạo notification mới
export const createNotification = async (req, res) => {
  try {
    const { userId, notificator, title, type, content, data } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ message: 'userId, title and content are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = new Notification({
      userId,
      notificator,
      title,
      type,
      content,
      data,
    });

    await notification.save();

    // Populate references
    await notification.populate('userId', 'firstName lastName email');
    await notification.populate('notificator', 'firstName lastName');

    // Emit socket event to user
    if (io) {
      io.to(userId.toString()).emit('receive_notification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả notifications của user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isRead, limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Build filter
    const filter = { userId };
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('notificator', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        unreadCount,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy unread notifications count của user
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification id is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('notificator', 'firstName lastName');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark multiple notifications as read
export const markMultipleAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'notificationIds array is required' });
    }

    // Validate all IDs
    for (const id of notificationIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid notification ID format: ${id}` });
      }
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single notification
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification id is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }

    const notification = await Notification.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('notificator', 'firstName lastName');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification id is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID format' });
    }

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete multiple notifications
export const deleteMultipleNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'notificationIds array is required' });
    }

    // Validate all IDs
    for (const id of notificationIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid notification ID format: ${id}` });
      }
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
    });

    res.status(200).json({
      success: true,
      message: 'Notifications deleted successfully',
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all notifications of user
export const deleteAllUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully',
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search notifications
export const searchNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { keyword, type, limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Build filter
    const filter = { userId };

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('notificator', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
