import mongoose from 'mongoose';
const recurringScheduleScheme = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
        // 0 = Chủ nhật, 1 = Thứ hai, 2 = Thứ ba, 3 = Thứ tư, 4 = Thứ năm, 5 = Thứ sáu, 6 = Thứ bảy
    },
    shift: [{
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        required: true,
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('RecurringScheduled', recurringScheduleScheme);