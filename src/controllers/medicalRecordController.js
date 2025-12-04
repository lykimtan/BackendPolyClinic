import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import Medication from '../models/Medication.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

//tạo hồ sơ y tế mới

export const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('appointmentId')
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName');

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

    const records = await MedicalRecord.find({ patientId })
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'specializationId',
          select: 'name',
        },
      })
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName');

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

export const getMedicalRecordCountByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID',
      });
    }

    const count = await MedicalRecord.countDocuments({ patientId });

    return res.status(200).json({
      success: true,
      count,
      message: `There are ${count} medical records for this patient.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Some thing went wrong' + error.message,
    });
  }
}

export const getMedicalRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medical record ID',
      });
    }

    const record = await MedicalRecord.findById(recordId)
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'specializationId',
          select: 'name',
        },
      })
      .populate('doctorId', 'firstName lastName')
      .populate('patientId', 'firstName lastName');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
      message: 'Medical record retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Some thing went wrong: ' + error.message,
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

    // Tạo medical record mới
    const newMedicalRecord = new MedicalRecord({
      appointmentId,
      doctorId,
      patientId,
      diagnosis: diagnosis?.trim() || '',
      symptoms: symptoms?.trim() || '',
      notes: notes?.trim() || '',
      testResults: testResults || [],
      followUpRequire: followUpRequire || false,
      followUpDate: followUpRequire && followUpDate ? new Date(followUpDate) : undefined,
    });

    const savedRecord = await newMedicalRecord.save();

    // Populate thông tin để trả về
    const populatedRecord = await MedicalRecord.findById(savedRecord._id)
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'specializationId',
          select: 'name',
        },
      })
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
