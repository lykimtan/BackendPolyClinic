import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    schedulesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorSchedule',
        required: true
    },

    specializationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization',
        required: true
    },

    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        required: function () {
            return this.status === 'completed';
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancel']
    },
    

}, {
    timestamps: true
})



export default mongoose.model('Appointment', appointmentSchema);