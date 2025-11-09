import mongoose from 'mongoose';

const roleRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    requestedRole: {
      type: String,
      enum: ['doctor', 'staff', 'admin'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    documentProof: {
      type: String,
    },

    licenseNumber: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    specializationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization',
      },
    ],
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RoleRequest', roleRequestSchema);
