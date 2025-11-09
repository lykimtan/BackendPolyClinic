import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Sửa lỗi chính tả: require -> required
    },

    diagnosis: {
      type: String,
    },

    symptoms: {
      type: String,
    },
    notes: String,

    prescribedMedications: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrescribedMedication',
      required: true,
    },

    testResults: {
      type: [
        {
          testName: String,
          result: String,
          normalRange: String,
        },
      ],
    },

    followUpRequire: {
      type: Boolean,
    },

    followUpDate: {
      // ngày tái khám
      type: Date,
      required: function () {
        return this.followUpRequire;
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('MedicalRecord', medicalRecordSchema);
