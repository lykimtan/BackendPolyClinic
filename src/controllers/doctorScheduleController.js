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
        .json({ message: 'Schedule already exists for this doctor on the given date and shift' });
    }
    await newSchedule.save();
    res.status(201).json({ message: 'Schedule created', data: newSchedule });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* mau du lieu recurring cua mot bac si
[
  {
    doctorId: "60a1c2d3e4f5a6b7c8d9e0f1", // ID của Bác sĩ Nguyễn Văn A
    dayOfWeek: 1, // Thứ 2
    shift: ["morning", "afternoon"],
    createdBy: "admin_id_here"
  },
  {
    doctorId: "60a1c2d3e4f5a6b7c8d9e0f1",
    dayOfWeek: 2, // Thứ 3
    shift: ["morning", "afternoon"],
    createdBy: "admin_id_here"
  },
  {
    doctorId: "60a1c2d3e4f5a6b7c8d9e0f1",
    dayOfWeek: 3, // Thứ 4
    shift: ["morning", "afternoon"],
    createdBy: "admin_id_here"
  },
  {
    doctorId: "60a1c2d3e4f5a6b7c8d9e0f1",
    dayOfWeek: 4, // Thứ 5
    shift: ["morning", "afternoon"],
    createdBy: "admin_id_here"
  },
  {
    doctorId: "60a1c2d3e4f5a6b7c8d9e0f1",
    dayOfWeek: 5, // Thứ 6
    shift: ["morning", "afternoon"],
    createdBy: "admin_id_here"
  }
]
*/
