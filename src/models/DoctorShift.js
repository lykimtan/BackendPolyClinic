import mongoose from 'mongoose';

const doctorShiftSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    specializationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Specialization'
    },          
    startTime: {
        type: String,
        required: true,
    },

    endTime: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        enum: ['weekend', 'holiday', 'extra'],
        required: true,
    },

    status: {
        type: String,
        enum: ['scheduled','canceled'],
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

}, 
{
    timestamps: true
})


export default mongoose.model('DoctorShift', doctorShift);