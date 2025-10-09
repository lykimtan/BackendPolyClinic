import mongoose from 'mongoose'

const doctorScheduleSchema = new mongoose.Schema({
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

    dayOfWeek: {
        type: Number,
        required: true
    },

    isAvailable: {
        type: Boolean,
        default: true
    },
}, 
{
    timestamps: true
})


export default mongoose.model('DoctorSchedule', doctorScheduleSchema);