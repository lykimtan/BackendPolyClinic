import mongoose from "mongoose";

const prescribedMedicationSchema = new mongoose.Schema({
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
        required: true
    },

    drugs: [
        {
            drugId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medication',
                required: true
            },
            dosage: {
                type: String,
                required: true
            },
            frequency: {
                type: String,
                default: ''
            },
            note: {
                type: String,
                default: ''
            }
        }
    ],

}, {
    timestamps: true
})

export default mongoose.model('PrescribedMedication', prescribedMedicationSchema);