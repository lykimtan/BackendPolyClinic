import RecurringScheduled from '../models/RecurringScheduled.js';

//tạo lịch định kỳ mới
export const createRecurringSchedule = async (req, res) => {
    try {
        const {doctorId, dayOfWeek, shift} = req.body;

        //kiem tra xem da co lich dinh ky chua
        const existingSchedule = await RecurringScheduled.findOne({doctorId, dayOfWeek});
        if(existingSchedule) {
            existingSchedule.shift = shift;
            //nếu đã có lịch làm việc định kỳ => cập nhật ca làm việc
            await existingSchedule.save();
            return res.status(200).json({
                sucess: true,
                message: 'Recurring schedule updated',
                data: existingSchedule
            });
        }
        const newRecurringSchedule = new RecurringScheduled({
            doctorId,
            dayOfWeek,
            shift,
            createdBy: req.user._id
        });
        await newRecurringSchedule.save();

        res.status(201).json({
            success: true,
            message: 'Recurring schedule created',
            data: newRecurringSchedule
        })
    }
    catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
};


export const getDoctorRecurringSchedules =  async (req, res) => {
    try {
        const {doctorId} = req.params;
        const schedules = await RecurringScheduled.find({doctorId})
        .sort({dayOfWeek: 1}); //sap xep tu thu 2 den chunhat
        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateRecurringSchedules = async (req, res) => {
    try {
        const {recurringScheduledId} = req.params;
        const recurringSchedule = await RecurringScheduled.findById(recurringScheduledId);

        if(!recurringSchedule) {
            return res.status(404).json({
                success: false,
                message: "Recurring schedule not found",
            })
        }

        const {dayOfWeek, shift} = req.body;
        if(dayOfWeek !== undefined) recurringSchedule.dayOfWeek = dayOfWeek;
        if(shift !== undefined) recurringSchedule.shift = shift;
        
        await recurringSchedule.save();
        res.status(200).json({
            success: true,
            message: "Recurring schedule updated",
            data: recurringSchedule
        });

    }
    catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteRecurringSchedule = async (req, res) => {
    try {
        const {id} = req.params;
        const schedule = await RecurringScheduled.findByIdAndDelete(id);
        if(!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Recurring schedule not found'
            })
        } 
        return res.status(200).json({
            success: true,
            message: "Recurring schedule deleted"
        })
    } catch(error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}