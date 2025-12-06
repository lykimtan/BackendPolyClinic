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

// Chạy lúc 01:17 (1 giờ 17 phút) mỗi Chủ nhật (ngày 0)
cron.schedule('17 1 * * 0', async () => {
  //phút - giờ - ngày trong tháng - tháng - ngày trong tuần
  try {
    console.log('========== BẮT ĐẦU TẠO LỊCH TỰ ĐỘNG ==========');

    const nextWeek = getNextWeekDates();
    console.log(
      `Tuần tới: ${nextWeek[0].toLocaleDateString('vi-VN')} - ${nextWeek[6].toLocaleDateString('vi-VN')}`
    );

    const recurringSchedules = await RecurringScheduled.find().populate('doctorId');
    console.log(`Tìm thấy ${recurringSchedules.length} lịch định kỳ\n`);

    if (recurringSchedules.length === 0) {
      console.log('Không có lịch định kỳ nào. Kết thúc.');
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Lặp qua từng lịch định kỳ
    for (const recurring of recurringSchedules) {
      const doctorId = recurring.doctorId._id;
      const doctorName = recurring.doctorId.firstName + ' ' + recurring.doctorId.lastName;
      const daysCount = recurring.dayOfWeek; // Số ngày làm việc liên tục (ví dụ: 5 = Thứ 2-6)
      const shifts = recurring.shift;

      console.log(`Bác sĩ: ${doctorName}`);
      console.log(` Số ngày làm việc: ${daysCount} ngày (Thứ 2 - ${daysCount === 5 ? 'Thứ 6' : daysCount === 6 ? 'Thứ 7' : 'Chủ nhật'})`);
      console.log(`Ca làm việc: ${shifts.join(', ')}`);

      // Lấy daysCount ngày đầu tiên từ nextWeek (từ Thứ 2)
      const matchingDates = nextWeek.slice(0, daysCount);

      if (matchingDates.length === 0) {
        console.log(`Không đủ ngày trong tuần tới`);
        continue;
      }

      console.log(`Tạo lịch cho ${matchingDates.length} ngày: ${matchingDates.map((d) => d.toLocaleDateString('vi-VN')).join(', ')}`);

      // Lặp qua từng ngày phù hợp
      for (const dateObj of matchingDates) {
        // Đặt ngày về 00:00:00
        const scheduleDate = new Date(dateObj);
        scheduleDate.setHours(0, 0, 0, 0);
        const dateStr = scheduleDate.toLocaleDateString('vi-VN');

        // Lặp qua từng ca làm việc
        for (const shift of shifts) {
          try {
            // Kiểm tra xem lịch này đã tồn tại chưa
            const existingSchedule = await DoctorSchedule.findOne({
              doctorId,
              date: scheduleDate,
              shift: shift, // Kiểm tra shift là string, không phải array
            });

            if (existingSchedule) {
              console.log(
                `  Bỏ qua: ${dateStr} - Ca ${shift} (đã tồn tại)`
              );
              skippedCount++;
              continue;
            }

            const availableSlots = generateSlotsForShift(shift);

            await DoctorSchedule.create({
              doctorId,
              specializationId: recurring.doctorId.specializationIds?.[0], // Lấy chuyên khoa chính
              date: scheduleDate,
              shift: shift, // Lưu shift là string
              availableSlots,
              createdBy: recurring.createdBy,
              isActive: true,
            });

            createdCount++;
            console.log(
              `  Tạo: ${dateStr} - Ca ${shift} (${availableSlots.length} slots)`
            );
          } catch (error) {
            console.error(
              `  Lỗi: ${dateStr} - Ca ${shift}: ${error.message}`
            );
            errorCount++;
          }
        }
      }
    }

    console.log('\n========== KẾT QUẢ ==========');
    console.log(`Tạo mới: ${createdCount} lịch`);
    console.log(`Bỏ qua: ${skippedCount} lịch (đã tồn tại)`);
    console.log(`Lỗi: ${errorCount} lịch`);
    console.log('========== KẾT THÚC ==========\n');
  } catch (error) {
    console.error('Lỗi khi tạo lịch tự động:', error);
  }
});
