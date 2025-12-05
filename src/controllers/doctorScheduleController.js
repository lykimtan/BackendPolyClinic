import DoctorSchedule from '../models/DoctorSchedule.js';
import { createSlots } from '../utils/timeSlotGenerator.js';

export const createDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, specializationId, date, shift } = req.body;

    let slots = [];
    if (shift === 'morning') slots = createSlots('08:00', '12:00', 30);
    if (shift === 'afternoon') slots = createSlots('13:00', '17:00', 30);
    if (shift === 'evening') slots = createSlots('18:00', '21:00', 30);

    const newSchedule = new DoctorSchedule({
      doctorId: doctorId,
      specializationId: specializationId,
      date,
      shift,
      availableSlots: slots,
      createdBy: req.user._id,
    });

    const isExist = await DoctorSchedule.findOne({ doctorId, date, shift });
    if (isExist) {
      return res
        .status(400)
        .json({ message: 'Lịch làm việc đã tồn tại cho bác sĩ này vào ngày và ca đã cho' });
    }
    await newSchedule.save();
    res.status(201).json({ message: 'Schedule created', data: newSchedule });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDoctorSchedules = async (req, res) => {
  try {
    const {doctorId} = req.params;
    const schedules = await DoctorSchedule.find({ doctorId}).sort({ date: 1});
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules found for this doctor' });
    }
    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

