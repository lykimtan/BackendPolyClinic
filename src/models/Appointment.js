import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorSchedule',
      required: true,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Lấy thông tin appointment cùng với thông tin slot
    // const appointment = await Appointment.findById(appointmentId)
    //     .populate('schedulesId');

    // // Tìm slot cụ thể trong DoctorSchedule
    // const slot = appointment.schedulesId.availableSlots.id(appointment.slotId);
    // console.log(slot.time); // Lấy được thời gian của slot

    appointmentDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      default: '',
    },

    notes: {
      type: String,
      default: '',
    },

    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'canceled'],
      default: 'pending',
    },

    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Appointment', appointmentSchema);
