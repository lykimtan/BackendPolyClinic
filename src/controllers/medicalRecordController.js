import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';

//tạo hồ sơ y tế mới 

export const createMedicalRecord = async (req, res) => {
    try {
        const {appointmentId, doctorId, patientId} = req.params;
        const { diagnosis, symptoms, notes, prescribedMedications, testResults, followUpRequire, followUpDate } = req.body;
        //kiểm tra appointmentId có tồn tại không
        const appointment = Appointment.findById(appointmentId);
        if(!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            })
        }

        const MedicalRecord = new MedicalRecord({
            appointmentId,
            doctorId,
            patientId,
            diagnosis,
            symptoms,
            notes, 
            prescribedMedications,
            testResults,
            followUpRequire,
            followUpDate
        })


        const saveRecord = await MedicalRecord.save();

        return res.status(201).json({
            success: true,
            message: 'Medical record created successfully',
            data: saveRecord
        });
        //xem lại cách xử lý 


    }
    catch (error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}