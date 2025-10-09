import mongoose from 'mongoose';

const FnASchema = new mongoose.Schema({
    akserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true

    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.answer && this.status === 'answered';
        }
    },

    question: {
        type: String,
        required: true,
    },

    answer: {
        type: String,
    },

    img: {
        type: String,
        default: null
    },

    isPublished: {
        type: Boolean,
        default: true
    },

    status: {
        type: String,
        enum: ['pending', 'answered', 'closed'],
        default: 'pending'
    },

}, {
    timestamps: true
})


export default mongoose.model('F&A', FnASchema);