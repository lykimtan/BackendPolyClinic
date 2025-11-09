import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
    },

    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: String,
  },
  {
    timestamps: true,
  }
);

ratingSchema.statics.getAvgRating = async function (doctorId) {
  const ratings = await this.find({ doctorId });
  if (ratings.length === 0) return 0;

  const total = ratings.reduce((acc, rating) => acc + rating.score, 0);
  return total / ratings.length;
};

export default mongoose.model('Rating', ratingSchema);
