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
      required: true, 
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
