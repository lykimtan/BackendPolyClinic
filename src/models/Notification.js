import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    notificator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    type: {
      type: String,
      enum: ['info', 'appointment', 'medical_record', 'fna', 'system', 'warning'],
      default: 'info',
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },


    data: {
      model: { type: String }, 
      resourceId: { type: mongoose.Schema.Types.ObjectId }, 
      route: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: userId + isRead + createdAt (tối ưu cho query notifications chưa đọc)
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// TTL index: Tự động xóa notification cũ hơn 30 ngày
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Notification', notificationSchema);