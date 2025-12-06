import DoctorSchedule from '../models/DoctorSchedule.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { io } from '../app.js';

//Lấy ds tất cả các lịch hẹn
//getter
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('doctorId', 'firstName lastName employeeId email phone avatar yearsOfExperience');
    if (!appointments.length) {
      return res.status(404).json({
        message: 'No appointment found',
      });
    }

    
    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      message: `Found ${appointments.length} appointments`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppointmentByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const { status, date } = req.query;

    let filter = {
      doctorId,
    };

    if (status) {
      filter.status = status;
    }
    if (date) {
      filter.appointmentDate = date;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email phone avatar yearsOfExperience')
      .populate('specializationId', 'name')
      .populate('scheduleId', 'date shift availableSlots')
      .sort({ appointmentDate: 1 });
    if (!appointments.length) {
      return res.status(404).json({
        success: false,
        message: 'No appointment found for this doctor',
      });
    }
     // Gắn thông tin slot vào mỗi appointment
     
   const appointmentsWithSlots = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.scheduleId && aptObj.scheduleId.availableSlots) {
        const slot = aptObj.scheduleId.availableSlots.find(
          s => s._id.toString() === aptObj.slotId.toString()
        );
        aptObj.slotId = slot || aptObj.slotId;
      }
      return aptObj;
    });
    if(!appointmentsWithSlots.length) {
      return res.json({
        success: false,
        data: [],
        message: 'No appointment found for this date',
      });
    }
    return res.status(200).json({
      success: true,
      count: appointmentsWithSlots.length,
      data: appointmentsWithSlots,
      message: `Found ${appointmentsWithSlots.length} appointments for this date`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }
    
    const doctorId = req.user._id;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required',
      });
    }
    
    // Tạo khoảng thời gian từ đầu đến cuối ngày
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate({
        path: 'patientId',
        select: 'firstName lastName email phone dateOfBirth gender',
      })
      .populate('specializationId', 'name')
      .populate({
        path: 'scheduleId',
        select: 'date shift availableSlots',
      })
      .populate('doctorId', 'firstName lastName email phone avatar yearsOfExperience')
      .sort({ appointmentDate: 1 });
    
    // Gắn thông tin slot vào mỗi appointment
    const appointmentsWithSlots = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.scheduleId && aptObj.scheduleId.availableSlots) {
        const slot = aptObj.scheduleId.availableSlots.find(
          s => s._id.toString() === aptObj.slotId.toString()
        );
        aptObj.slotId = slot || aptObj.slotId;
      }
      return aptObj;
    });
    if(!appointmentsWithSlots.length) {
      return res.json({
        success: false,
        data: [],
        message: 'No appointment found for this date',
      });
    }
    return res.status(200).json({
      success: true,
      count: appointmentsWithSlots.length,
      data: appointmentsWithSlots,
      message: `Found ${appointmentsWithSlots.length} appointments for this date`,
    });
  } catch(error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const updateMedicalRecordForAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medicalRecordId } = req.body;

    // Validate input
    if (!medicalRecordId) {
      return res.status(400).json({
        success: false,
        message: 'medicalRecordId is required',
      });
    }

    // Check appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Update medicalRecordId
    appointment.medicalRecordId = medicalRecordId;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Medical record ID updated successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Error updating medical record for appointment:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppointmentByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, date, doctorId } = req.query;

    let filter = { patientId };

    if (status) {
      filter.status = status;
    }

    if (date) {
      filter.appointmentDate = date;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'firstName lastName email phone avatar yearsOfExperience')
      .populate('specializationId', 'name')
      .populate('patientId', 'name firstName lastName email phone')
      .populate('scheduleId', 'date shift availableSlots')
      .sort({ appointmentDate: 1 });

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    if (!appointments.length) {
      return res.status(404).json({
        success: false,
        message: 'No appointment found for this patient',
      });
    }

     const appointmentsWithSlots = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.scheduleId && aptObj.scheduleId.availableSlots) {
        const slot = aptObj.scheduleId.availableSlots.find(
          s => s._id.toString() === aptObj.slotId.toString()
        );
        aptObj.slotId = slot || aptObj.slotId;
      }
      return aptObj;
    });
    if(!appointmentsWithSlots.length) {
      return res.json({
        success: false,
        data: [],
        message: 'No appointment found for this date',
      });
    }
    return res.status(200).json({
      success: true,
      count: appointmentsWithSlots.length,
      data: appointmentsWithSlots,
      message: `Found ${appointmentsWithSlots.length} appointments for this date`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Some thing went wrong' + error.message,
    });
  }
};


//get appointment by id
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId', 'firstName lastName email phone avatar yearsOfExperience')
      .populate('specializationId', 'name')
      .populate('scheduleId', 'date shift availableSlots');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
    
    // Gắn thông tin slot vào appointment
    const appointmentObj = appointment.toObject();
    if (appointmentObj.scheduleId && appointmentObj.scheduleId.availableSlots) {
      const slot = appointmentObj.scheduleId.availableSlots.find(
        s => s._id.toString() === appointmentObj.slotId.toString()
      );
      appointmentObj.slotId = slot || appointmentObj.slotId;
    }
    
    return res.status(200).json({
      success: true,
      data: appointmentObj,
      message: 'Appointment details fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Some thing went wrong' + error.message,
    });
  }
};

//create appointment - patient

export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      scheduleId,
      slotId,
      appointmentDate,
      reason,
      notes,
      specializationId,
    } = req.body;

    const patientId = req.user._id;

    // Kiểm tra thông tin bắt buộc
    if(!patientId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not authenticated',
      });
    }
    if (
      !doctorId ||
      !scheduleId ||
      !slotId ||
      !appointmentDate ||
      !specializationId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin cuộc hẹn',
      });
    }

    // Kiểm tra người dùng có tồn tại không
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bệnh nhân',
      });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin bác sĩ',
      });
    }

    // Kiểm tra lịch của bác sĩ
    const schedule = await DoctorSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch làm việc của bác sĩ',
      });
    }

    // Kiểm tra xem bác sĩ có phải là người trong lịch không
    if (schedule.doctorId.toString() !== doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Lịch làm việc không khớp với bác sĩ được chọn',
      });
    }

    // Kiểm tra ngày hẹn có khớp với ngày trong lịch không
    const scheduleDateStr = schedule.date.toISOString().split('T')[0];
    const appointmentDateStr = new Date(appointmentDate).toISOString().split('T')[0];

    if (scheduleDateStr !== appointmentDateStr) {
      return res.status(400).json({
        success: false,
        message: 'Ngày hẹn không khớp với lịch làm việc của bác sĩ',
      });
    }

    // Sử dụng findOneAndUpdate để đảm bảo tính nguyên tử khi cập nhật slot
    const result = await DoctorSchedule.findOneAndUpdate(
      {
        _id: scheduleId,
        'availableSlots._id': slotId,
        'availableSlots.isBooked': false,
      },
      {
        $set: {
          'availableSlots.$.isBooked': true,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Khung giờ đã được đặt hoặc không tồn tại. Vui lòng chọn khung giờ khác.',
      });
    }

    // Tìm slot đã cập nhật
    const slot = result.availableSlots.id(slotId);

    // Tạo cuộc hẹn mới
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      scheduleId: scheduleId,
      slotId: slotId,
      appointmentDate,
      reason: reason || '',
      notes: notes || '',
      specializationId,
      status: 'pending', // Mặc định là pending cho đến khi được xác nhận
    });

    // Lưu cuộc hẹn
    const savedAppointment = await newAppointment.save();

    // Cập nhật appointmentId của slot
    await DoctorSchedule.updateOne(
      {
        _id: scheduleId,
        'availableSlots._id': slotId,
      },
      {
        $set: { 'availableSlots.$.appointmentId': savedAppointment._id },
      }
    );

    // Create notification for doctor
    const notification = new Notification({
      userId: doctorId,
      notificator: patientId,
      title: 'Có bệnh nhân đặt lịch khám với bạn',
      type: 'appointment',
      content: `${patient.firstName} ${patient.lastName} đã đặt lịch khám với bạn vào ${new Date(appointmentDate).toLocaleDateString('vi-VN')}`,
      data: {
        model: 'Appointment',
        resourceId: savedAppointment._id,
        route: `/doctor/appointment/${savedAppointment._id}`,
      },
    });
    await notification.save();

    // Emit notification via Socket.io to doctor
    io.to(doctorId).emit('receive_notification', notification);

    // Trả về kết quả
    return res.status(201).json({
      success: true,
      message: 'Đặt lịch hẹn thành công',
      data: savedAppointment,
    });
  } catch (error) {
    console.error('Lỗi khi tạo cuộc hẹn:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi khi tạo cuộc hẹn: ${error.message}`,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, reasonForRejection } = req.body;

    // 1. Log xem Server thực sự nhận được chữ gì (quan trọng nhất để debug)
    console.log(`[DEBUG] Update Appointment ${appointmentId}. Received status:`, status);

    // 2. Validate đầu vào
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required in body',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    const patientId = appointment.patientId;
    const doctorId = req.user._id;

    if (status === 'cancelled' || status === 'rejected') {
      appointment.status = status;
      if(status === 'rejected' && reasonForRejection) {
        appointment.reasonForRejection = reasonForRejection;
      }
      // Khi hủy hoặc từ chối, giải phóng slot
      
      const schedule = await DoctorSchedule.findById(appointment.scheduleId);
      if (schedule) {
        const slot = schedule.availableSlots.find(
          (s) => s.appointmentId && s.appointmentId.toString() === appointmentId
        );
        
        if (slot) {
          slot.isBooked = false;
          slot.appointmentId = null;
          await schedule.save();
          console.log('[DEBUG] Slot released successfully');
        }
      }
    } else {
      appointment.status = status;
    }

    await appointment.save();

    // Tạo notification cho bệnh nhân
    const notificationMessages = {
      confirmed: {
        title: 'Lịch khám đã được xác nhận',
        content: 'Bác sĩ đã xác nhận lịch khám của bạn. Vui lòng đến đúng giờ.',
      },
      rejected: {
        title: 'Lịch khám bị từ chối',
        content: reasonForRejection 
          ? `Lịch khám bị từ chối. Lý do: ${reasonForRejection}`
          : 'Lịch khám bị từ chối. Vui lòng đặt lịch mới.',
      },
      cancelled: {
        title: 'Lịch khám đã bị hủy',
        content: 'Lịch khám của bạn đã bị hủy. Bạn có thể đặt lịch mới.',
      },
      completed: {
        title: 'Lịch khám đã hoàn thành',
        content: 'Lịch khám của bạn đã hoàn thành. Vui lòng kiểm tra hồ sơ y tế.',
      },
    };

    if (notificationMessages[status]) {
      const { title, content } = notificationMessages[status];

      const notification = new Notification({
        userId: patientId,
        notificator: doctorId,
        title,
        content,
        type: 'appointment',
        data: {
          model: 'Appointment',
          resourceId: appointmentId,
          route: `/my-appointment/${appointmentId}`,
        },
      });

      await notification.save();

      // Gửi real-time notification qua Socket.io
      io.to(patientId.toString()).emit('receive_notification', notification);

      console.log('[DEBUG] Notification created and sent:', notification._id);
    }

    return res.status(200).json({
      success: true,
      message: `Appointment updated to ${status} successfully`,
      data: appointment // Trả về data mới để frontend cập nhật ngay
    });

  } catch (error) {
    console.error('[ERROR] Update Status:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    //check available appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        success: false,
      });
    }
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot delete confirmed or completed appointment',
        success: false,
      });
    }

    const schedule = await DoctorSchedule.findById(appointment.scheduleId);
    if (!schedule) {
      return res.status(404).json({
        message: 'Schedule not found',
        success: false,
      });
    }
    await Appointment.findByIdAndDelete(appointmentId);

    return res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
