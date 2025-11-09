import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },

  isBooked: {
    type: Boolean,
    default: false,
  },

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
  },
});

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Specialization',
    },

    date: {
      type: Date,
      required: true,
    },

    shift: {
      type: [String],
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },

    availableSlots: [slotSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

//đảm bảo 1 bác sĩ không có 2 lich trùng ngày, trùng ca
doctorScheduleSchema.index({ doctorId: 1, date: 1, shift: 1 }, { unique: true });

export default mongoose.model('DoctorSchedule', doctorScheduleSchema);
