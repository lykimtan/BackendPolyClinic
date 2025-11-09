import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },

    notificator: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    type: {
      type: String,
      enum: ['info', 'appointment', 'system', 'warning'],
      default: 'info',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', notificationSchema);
