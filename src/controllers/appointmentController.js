import DoctorSchedule from '../models/DoctorSchedule.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

//Lấy ds tất cả các lịch hẹn
//getter
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        if(!appointments.length) {
            return res.status(404).json({
                message: 'No appointment found'
            })
        }
        return res.status(200).json({
            success: true,
            count : appointments.length,
            data: appointments,
            message: `Found ${appointments.length} appointments`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const getAppointmentByDoctorId = async (req, res) => {
    try{
        const {doctorId} = req.params;

        const {status, date} = req.query;


        let filter = {
            doctorId
        };

        if(status) {
            filter.status = status;
        }
        if(date) {
            filter.appointmentDate = date;
        }

        const appointments = await Appointment.find(filter)
                    .populate('patientId', 'name email phone')
                    .populate('doctorId', 'name email phone')
                    .populate('specializationId', 'name')
                    .populate('scheduleId', 'date shift')
                    .sort({appointmentDate: 1});
        if(!appointments.length) {
            return res.status(404).json({
                success: false,
                message: 'No appointment found for this doctor'
            })
        };
        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
            message: `Found ${appointments.length} appointments for this doctor`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



export const getAppointmentByPatientId = async (req, res) => {
    try {
        const {patientId} = req.params;
        const {status, date, doctorId} = req.query;

        let filter = { patientId};

        if(status) {
            filter.status = status;
        }

        if(date) {
            filter.appointmentDate = date;
        }

        if(doctorId) { 
            filter.doctorId = doctorId;
        }

        const appointments = await Appointment.find(filter)
        .populate('doctorId', 'name email')
        .populate('specializationId', 'name')
        .populate('patientId', 'name email phone')
        .populate('scheduleId', 'date shift')
        .sort({appointmentDate: 1});

        const patient = await User.findById(patientId);
        if(!patient) {
            return res.status(404).json({
                success: false,
                message:  "Patient not found",
            })
        }; 

        if(!appointments.length) {
            return res.status(404).json({
                success: false,
                message: 'No appointment found for this patient'
            })
        }

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
            message: `Found ${appointments.length} appointments for this patient`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Some thing went wrong' + error.message
        })
    }
}

//create appointment - patient

export const createAppointment = async (req, res) => {
    try {
        const {patientId, doctorId, scheduleId, slotId, appointmentDate, reason, notes, specializationId} = req.body;
        
        // Kiểm tra thông tin bắt buộc
        if (!patientId || !doctorId || !scheduleId || !slotId || !appointmentDate || !specializationId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin cuộc hẹn'
            });
        }

        // Kiểm tra người dùng có tồn tại không
        const patient = await User.findById(patientId);
        const doctor = await User.findById(doctorId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin bệnh nhân'
            });
        }

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin bác sĩ'
            });
        }

        // Kiểm tra lịch của bác sĩ
        const schedule = await DoctorSchedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch làm việc của bác sĩ'
            });
        }

        // Kiểm tra xem bác sĩ có phải là người trong lịch không
        if (schedule.doctorId.toString() !== doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Lịch làm việc không khớp với bác sĩ được chọn'
            });
        }

        // Kiểm tra ngày hẹn có khớp với ngày trong lịch không
        const scheduleDateStr = schedule.date.toISOString().split('T')[0];
        const appointmentDateStr = new Date(appointmentDate).toISOString().split('T')[0];
        
        if (scheduleDateStr !== appointmentDateStr) {
            return res.status(400).json({
                success: false,
                message: 'Ngày hẹn không khớp với lịch làm việc của bác sĩ'
            });
        }

        // Sử dụng findOneAndUpdate để đảm bảo tính nguyên tử khi cập nhật slot
        const result = await DoctorSchedule.findOneAndUpdate(
            { 
                _id: scheduleId,
                "availableSlots._id": slotId,
                "availableSlots.isBooked": false
            },
            { 
                $set: { 
                    "availableSlots.$.isBooked": true
                }
            },
            { new: true }
        );

        if (!result) {
            return res.status(400).json({
                success: false,
                message: 'Khung giờ đã được đặt hoặc không tồn tại. Vui lòng chọn khung giờ khác.'
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
            status: 'pending' // Mặc định là pending cho đến khi được xác nhận
        });

        // Lưu cuộc hẹn
        const savedAppointment = await newAppointment.save();

        // Cập nhật appointmentId của slot
        await DoctorSchedule.updateOne(
            { 
                _id: scheduleId,
                "availableSlots._id": slotId
            },
            { 
                $set: { "availableSlots.$.appointmentId": savedAppointment._id }
            }
        );

        // Trả về kết quả
        return res.status(201).json({
            success: true,
            message: 'Đặt lịch hẹn thành công',
            data: savedAppointment
        });

    } catch (error) {
        console.error('Lỗi khi tạo cuộc hẹn:', error);
        return res.status(500).json({
            success: false,
            message: `Lỗi khi tạo cuộc hẹn: ${error.message}`
        });
    }
}

export const updateAppointmentStatus = async(req, res) => {
    try {
        const { appointmentId} = req.params;
        const {status} = req.body;

        //check available appointment
        const appointment = await Appointment.findById(appointmentId);
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            })
        }

        // Neu co thi update status
        if(!['cancelled'].includes(status)) {
            appointment.status = status;
        } else {
            appointment.status = status;
            const schedule = await DoctorSchedule.findById(appointment.scheduleId);
            if(!schedule) {
                return res.status(404).json({
                    message: 'Schedule not found'
                })
            }
            //update slot isBooked to false
            const slot = schedule.availableSlots.find(s => s.appointmentId.toString() === appointmentId);
            if(slot) {
                slot.isBooked = false;
                slot.appointmentId = null;
                await schedule.save();
            }
            else {
                 console.warn(`No slot found for appointment ${appointmentId} in schedule ${schedule._id}`);
            }
        }

        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment status updated sucessfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId} = req.params;

        //check available appointment
        const appointment = await Appointment.findById(appointmentId);
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found',
                success: false
            })
        }
        if(appointment.status === 'confirmed' || appointment.status === 'completed') {
            return res.status(400).json({
                message: 'Cannot delete confirmed or completed appointment',
                success: false
            })
        }

        const schedule = await DoctorSchedule.findById(appointment.scheduleId);
        if(!schedule) {
            return res.status(404).json({
                message: 'Schedule not found',
                success: false
            })
        }
        //update slot isBooked to false
        const slot = schedule.availableSlots.find(s => s.appointmentId.toString() === appointmentId);
        if(slot) {
            slot.isBooked = false;
            slot.appointmentId = null;
            await schedule.save();
        }
        
    
        await Appointment.findByIdAndDelete(appointmentId);

        return res.status(200).json({
            success: true,
            message: 'Appointment deleted successfully',
        });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}