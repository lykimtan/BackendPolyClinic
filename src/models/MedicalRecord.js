import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },

    diagnosis: {
        type: String,
    },

    symptoms: {
        type: String
    },
    notes: String,
    
    prescribedMedications: [
        {
            drugId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medication',
            required: true,
            },
            dosage: String, // liều dùng
            frequency: String, // tần suất
        }
    ],
    
    testResults: {
        type: [
            {
                testName: String,
                result: String,
                normalRange: String
            }
        ]
    },

    followUpRequire: {
        type: Boolean
    },

    followUpDate: {
        type: Date,
        required: function() {
            return this.followUpRequire
        },
    },
}, 
{
    timestamps: true,
})

export default mongoose.model('MedicalRecord', medicalRecordSchema)