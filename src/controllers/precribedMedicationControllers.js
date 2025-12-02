import PrescribedMedication from '../models/PrescribedMedication.js';
import Appointment from '../models/Appointment.js';
import Medication from '../models/Medication.js';


export const createPrescribedMedication = async (req, res) => {
    try {
        const { medicalRecordId, drugs, dosage, frequency} = req.body;
        if(!medicalRecordId || !drugs || !dosage  || !frequency) {
            return res.status(400).json({
                success: false,
                message: 'medicalRecordId, drugs, dosage and frequency are required fields'
            })
        }
        
        // Kiểm tra appointment tồn tại
        const appointment = await Appointment.findById(medicalRecordId);
        if(!appointment) {
            return res.status(404).json({ 
                success: false,
                message: 'Appointment not found'
            });
        }

        // Kiểm tra tất cả drugs tồn tại
        for (const drug of drugs) {
            const exist = await Medication.findById(drug.drugId);
            if (!exist) {
                return res.status(404).json({
                    success: false,
                    message: `Thuốc với ID ${drug.drugId} không tồn tại`
                });
            }
        }

        // Tạo và lưu prescribed medication
        const prescribedMedication = new PrescribedMedication({
            medicalRecordId,
            drugs,
            dosage,
            frequency
        });
        
        const savedPrescription = await prescribedMedication.save();
        const populatedPrescription = await PrescribedMedication.findById(savedPrescription._id)
            .populate('drugs.drugId', 'name');
        
        return res.status(201).json({
            success: true,
            message: 'Prescribed medication created successfully',
            data: populatedPrescription
        });
    } catch(error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const getPresribedMedicationsById  = async (req, res) => {
    try {
        const { prescribedMedicationId} = req.params;
        const prescribedMedication = await PrescribedMedication.findById(prescribedMedicationId).populate('drugs.drugId', 'name');
        
        if (!prescribedMedication) {
            return res.status(404).json({
                success: false,
                message: 'Prescribed medication not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: prescribedMedication
        });
    } catch(error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const getPresribedMedicationsByMedicalRecord = async (req, res) => {
    try {
        const { medicalRecordId} = req.params;
        const prescribedMedications = await PrescribedMedication.find({ medicalRecordId}).populate('drugs.drugId', 'name');
        
        return res.status(200).json({
            success: true,
            data: prescribedMedications
        });
    } catch(error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

