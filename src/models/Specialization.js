import mongoose from 'mongoose';

const specializationSchema = new mongoose.Schema({
    //infor about specialization of general medical clinic
    name: {
        type: String,
        required: [true, 'Tên khoa không được để trống'],
    },
    
    descripton: String,
    image: {
        type: String,
    },
    symptom: {
        type: [String]
    }
}, 
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    }
)

specializationSchema.virtual('doctor', {
    ref: 'User',
    localField: '_id',
    foreignField: 'specializationIds'
});  


export default mongoose.model('Specialization', specializationSchema);