import Rating from '../models/Rating.js';
import mongoose from 'mongoose';

export const getRatingByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID',
      });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const ratings = await Rating.find({ doctorId })
      .populate('patientId', 'firstName lastName')
      .populate('appointmentId', 'date timeSlot');

    if (ratings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No ratings found for this doctor',
      });
    }

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings,
      message: `There are ${ratings.length} ratings found for this doctor.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong: ' + error.message,
    });
  }
};

export const getAverageRatingByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    const avgRating = await Rating.getAvgRating(doctorId);
    res.status(200).json({
      success: true,
      data: { averageRating: avgRating },
      message: `The average rating for doctor ${doctorId} is ${avgRating}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong: ' + error.message,
    });
  }
};

export const createRating = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, score, comment } = req.body;

    if (!patientId || !doctorId || !appointmentId || !score) {
      return res.status(400).json({
        success: false,
        message: 'PatientId, DoctorId, AppointmentId and Score are required',
      });
    }

    const newRating = new Rating({
      patientId,
      doctorId,
      appointmentId,
      score,
      comment,
    });

    await newRating.save();
    res.status(201).json({
      success: true,
      data: newRating,
      message: 'Rating created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong: ' + error.message,
    });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { score, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID',
      });
    }

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }
    if (rating.patientId.toString() !== req.user._id.toString()) {
      //lay user_id tu token
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this rating',
      });
    }

    rating.score = score || rating.score;
    rating.comment = comment || rating.comment;

    await rating.save();
    const avgRating = await Rating.getAvgRating(rating.doctorId);
    await Doctor.findByIdAndUpdate(rating.doctorId, { averageRating: avgRating });
    res.status(200).json({
      success: true,
      data: rating,
      message: 'Rating updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong: ' + error.message,
    });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating ID',
      });
    }
    const rating = await Rating.findByIdAndDelete(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong:' + error.message,
    });
  }
};
