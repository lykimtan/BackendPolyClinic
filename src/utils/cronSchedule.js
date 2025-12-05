import cron from 'node-cron';
import DoctorSchedule from '../models/DoctorSchedule.js';
import RecurringScheduled from '../models/RecurringScheduled.js';
import User from '../models/User.js';
import { createSlots } from './timeSlotGenerator.js';

/**
 * Lấy ngày của tuần tiếp theo
 * @returns {Date[]} Mảng các ngày trong tuần tiếp theo
 */
const getNextWeekDates = () => {
  const today = new Date();
  const dates = [];

  // Vì cron chạy lúc 00:00 Chủ nhật nên:
  // - today.getDay() = 0 (Chủ nhật)
  // - Cần lấy Thứ 2 tuần tiếp theo = today + 1 ngày
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + 1); // Chủ nhật + 1 = Thứ 2 tuần sau

  // Tạo 7 ngày từ thứ 2 tới chủ nhật
  for (let i = 0; i < 7; i++) {
    const date = new Date(nextMonday);
    date.setDate(nextMonday.getDate() + i);
    dates.push(date);
  }

  return dates;
};

/**
 * Tạo các slots dựa vào ca làm việc
 * @param {string} shift Ca làm việc ('morning', 'afternoon', 'evening')
 * @returns {Array} Mảng các slots thời gian
 */
const generateSlotsForShift = (shift) => {
  switch (shift) {
    case 'morning':
      return createSlots('08:00', '12:00', 30);
    case 'afternoon':
      return createSlots('13:00', '17:00', 30);
    case 'evening':
      return createSlots('18:00', '21:00', 30);
    default:
      return [];
  }
};

// Chạy lúc 00:00 (0 giờ 0 phút) mỗi Chủ nhật (ngày 0)
cron.schedule('0 0 * * 0', async () => {
  //phút - giờ - ngày trong tháng - tháng - ngày trong tuần
  try {
    console.log('Bắt đầu tạo lịch tự động cho tuần tới...');

    //chủ nhật hàng tuần sẽ sinh lịch tự động
    const nextWeek = getNextWeekDates();
    const recurringSchedules = await RecurringScheduled.find().populate(
      'doctorId',
      'specializationId'
    );
    console.log(`Tìm thấy ${recurringSchedules.length} lịch định kỳ.`);

    let createdCount = 0;
    let errorCount = 0;

    for (const recurringSchedule of recurringSchedules) {
      // Lọc các ngày trong tuần phù hợp với dayOfWeek
      const matchingDays = nextWeek.filter((d) => d.getDay() === recurringSchedule.dayOfWeek);

      // Lấy thông tin bác sĩ để có specializationIds
      const doctor = await User.findById(recurringSchedule.doctorId).select('specializationIds');

      if (!doctor || !doctor.specializationIds || doctor.specializationIds.length === 0) {
        console.error(`Không tìm thấy specializationIds của bác sĩ: ${recurringSchedule.doctorId}`);
        errorCount++;
        continue;
      }

      for (const date of matchingDays) {
        for (const shift of recurringSchedule.shift) {
          // Tạo lịch cho mỗi chuyên khoa của bác sĩ
          for (const specializationId of doctor.specializationIds) {
            try {
              // Tạo slots dựa trên ca làm việc
              const availableSlots = generateSlotsForShift(shift);

              await DoctorSchedule.create({
                doctorId: recurringSchedule.doctorId,
                specializationId: specializationId,
                date,
                shift: [shift], // Chuyển thành mảng để phù hợp với schema
                availableSlots,
                createdBy: recurringSchedule.createdBy,
                isActive: true,
              });

              createdCount++;
            } catch (error) {
              // Bỏ qua lỗi trùng lặp (do unique index), ghi log các lỗi khác
              if (error.code !== 11000) {
                console.error(`Lỗi khi tạo lịch: ${error.message}`);
              }
              errorCount++;
            }
          }
        }
      }
    }

    console.log(`Đã tạo ${createdCount} lịch làm việc cho tuần tiếp theo.`);
    if (errorCount > 0) {
      console.log(`Có ${errorCount} lỗi trong quá trình tạo lịch.`);
    }
  } catch (error) {
    console.error('Lỗi khi tạo lịch tự động:', error);
  }
});
