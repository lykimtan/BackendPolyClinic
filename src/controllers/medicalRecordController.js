import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import Medication from '../models/Medication.js';
import mongoose from 'mongoose';

//tạo hồ sơ y tế mới

export const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('appointmentId')
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName')
      .populate('prescribedMedications.drugId', 'name description');

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No medical records found',
      });
    }
    return res.status(200).json({
      success: true,
      data: records,
      count: records.length,
      message: `There are ${records.length} medical records found.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Some thing went wrong' + error.message,
    });
  }
};

export const getMedicationRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID',
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('appointmentId')
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName')
      .populate('prescribedMedications.drugId', 'name description');

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No medical records found for this patient',
      });
    }

    return res.status(200).json({
      success: true,
      data: records,
      count: records.length,
      message: `There are ${records.length} medical records found for this patient.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Some thing went wrong' + error.message,
    });
  }
};

export const createMedicalRecord = async (req, res) => {
  try {
    const {
      appointmentId,
      doctorId,
      patientId,
      diagnosis,
      symptoms,
      notes,
      prescribedMedications,
      testResults,
      followUpRequire,
      followUpDate,
    } = req.body;

    // Kiểm tra appointmentId có tồn tại không
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Xử lý và validate prescribedMedications
    let processedMedications = [];
    if (prescribedMedications && Array.isArray(prescribedMedications)) {
      // Validate từng medication
      for (const med of prescribedMedications) {
        // Kiểm tra các trường bắt buộc
        if (!med.drugId || !med.dosage || !med.frequency) {
          return res.status(400).json({
            success: false,
            message: 'Mỗi thuốc cần có đầy đủ drugId, dosage và frequency',
          });
        }

        // Kiểm tra drugId có phải ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(med.drugId)) {
          return res.status(400).json({
            success: false,
            message: `DrugId ${med.drugId} không hợp lệ`,
          });
        }

        // Kiểm tra medication có tồn tại trong database không
        const medicationExists = await Medication.findById(med.drugId);
        if (!medicationExists) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy thuốc với ID: ${med.drugId}`,
          });
        }

        // Thêm vào danh sách đã xử lý
        processedMedications.push({
          drugId: med.drugId,
          dosage: med.dosage.trim(),
          frequency: med.frequency.trim(),
        });
      }
    }

    // Tạo medical record mới
    const newMedicalRecord = new MedicalRecord({
      appointmentId,
      doctorId,
      patientId,
      diagnosis: diagnosis?.trim() || '',
      symptoms: symptoms?.trim() || '',
      notes: notes?.trim() || '',
      prescribedMedications: processedMedications,
      testResults: testResults || [],
      followUpRequire: followUpRequire || false,
      followUpDate: followUpRequire && followUpDate ? new Date(followUpDate) : undefined,
    });

    const savedRecord = await newMedicalRecord.save();

    // Populate thông tin thuốc để trả về
    const populatedRecord = await MedicalRecord.findById(savedRecord._id)
      .populate('prescribedMedications.drugId', 'name description')
      .populate('appointmentId')
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName');

    return res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: populatedRecord,
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.query.doctorId;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'DoctorId need for this action',
      });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }
    //khong cho bac si khac chinh sua bang record cua bac si tao ra
    if (record.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this medical record',
      });
    }
    const updateData = req.body;

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(recordId, updateData, {
      new: true, // trả về bản ghi sau khi cập nhật
      runValidators: true, // đảm bảo kiểm tra schema
    });

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
