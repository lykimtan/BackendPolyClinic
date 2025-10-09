import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
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

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: String,

}, 
{
    timestamps: true
})


export default mongoose.model('Rating', ratingSchema);