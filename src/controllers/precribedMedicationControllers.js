import PrescribedMedication from '../models/PrescribedMedication.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Medication from '../models/Medication.js';


export const createPrescribedMedication = async (req, res) => {
    try {
        const { medicalRecordId, drugs } = req.body;
        if(!medicalRecordId || !drugs || !Array.isArray(drugs) || drugs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'medicalRecordId and drugs array are required fields'
            })
        }
        
        // Kiểm tra medical record tồn tại
        const medicalRecord = await MedicalRecord.findById(medicalRecordId);
        if(!medicalRecord) {
            return res.status(404).json({ 
                success: false,
                message: 'Medical Record not found'
            });
        }

        // Kiểm tra tất cả drugs có dosage và frequency
        for (const drug of drugs) {
            if (!drug.drugId || !drug.dosage || !drug.frequency) {
                return res.status(400).json({
                    success: false,
                    message: 'Mỗi loại thuốc phải có drugId, dosage và frequency'
                });
            }
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
            drugs
        });
        
        const savedPrescription = await prescribedMedication.save();
        const populatedPrescription = await PrescribedMedication.findById(savedPrescription._id)
            .populate('drugs.drugId', 'name genericName form unit imageUrl description price');
        
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

export const getPrescribedMedicationsById  = async (req, res) => {
    try {
        const { prescribedMedicationId} = req.params;
        const prescribedMedication = await PrescribedMedication.findById(prescribedMedicationId).populate('drugs.drugId', 'name genericName form unit imageUrl description price');
        
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


export const getPrescribedMedicationsByMedicalRecord = async (req, res) => {
    try {
        const { medicalRecordId} = req.params;
        const prescribedMedications = await PrescribedMedication.find({ medicalRecordId}).populate('drugs.drugId', 'name genericName form unit imageUrl description price');
        
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


export const updatePrescribedMedication = async (req, res) => {
    try {
        const { id } = req.params;
        const { drugs } = req.body;

        if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'drugs array is required and must not be empty'
            });
        }

        // Kiểm tra prescribed medication tồn tại
        const prescribedMedication = await PrescribedMedication.findById(id);
        if (!prescribedMedication) {
            return res.status(404).json({
                success: false,
                message: 'Prescribed medication not found'
            });
        }

        // Kiểm tra tất cả drugs có dosage và frequency
        for (const drug of drugs) {
            if (!drug.drugId || !drug.dosage || !drug.frequency) {
                return res.status(400).json({
                    success: false,
                    message: 'Mỗi loại thuốc phải có drugId, dosage và frequency'
                });
            }
            const exist = await Medication.findById(drug.drugId);
            if (!exist) {
                return res.status(404).json({
                    success: false,
                    message: `Thuốc với ID ${drug.drugId} không tồn tại`
                });
            }
        }

        // Cập nhật drugs array
        prescribedMedication.drugs = drugs;
        const savedPrescription = await prescribedMedication.save();
        const populatedPrescription = await PrescribedMedication.findById(savedPrescription._id)
            .populate('drugs.drugId', 'name genericName form unit imageUrl description price');

        return res.status(200).json({
            success: true,
            message: 'Prescribed medication updated successfully',
            data: populatedPrescription
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}