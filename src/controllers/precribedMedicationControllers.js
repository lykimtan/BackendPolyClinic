import PrescribedMedication from '../models/PrescribedMedication.js';
import Appointment from '../models/Appointment.js';


export const createPrescribedMedication = async (req, res) => {
    try {
        const { medicalRecordId, drugs, dosage, frequency} = req.body;
        if(!medicalRecordId || !drugs || !dosage  || !frequency) {
            return res.status(400).json({
                message: 'medicalRecordId, drugs, dosage and frequency are required fields'
            })
        }
        const appointment = await Appointment.findById(medicalRecordId);

        
        if(!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }

    for (const drug of drugs) {
      const exist = await Medication.findById(drug.drugId);
      if (!exist) {
        return res.status(404).json({
          success: false,
          message: `Thuốc với ID ${drug.drugId} không tồn tại`
        });
      }
    }
    const prescribedMedication = new PrescribedMedication({
            medicalRecordId,
            drugs,
            dosage,
            frequency
        })
    } catch(error) {
        res.status(400).json({message: error.message})
    }
    
}


export const getPresribedMedicationsByMedicalRecord = async (req, res) => {
    try {
        const { medicalRecordId} = req.params;
        const prescribedMedications = await PrescribedMedication.find({ medicalRecordId}).populate('drugs.drugId', 'name');
        res.status(200).json({data: prescribedMedications});
    } catch(error) {
        res.status(400).json({message: error.message})
    }
}

