import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        requried: [true, 'Tên thuộc khong được để trống'],
    },

    genericName: { //tên gốc, tên chung quốc tế
        type: String,
    },
    
    desription: String,

    form: {
        type: String,
        enum: ['Solid','Liquid', 'Cream'],
        required: true,
    },

    unit: {
        type: String,
        enum: ['tab' , 'capsule', 'lozenge', 'vial', 'ml', 'ampoule' ] , 
        //viên nén, viên nhộng, thuốc ngậm, thuốc nhỏ, ống
        required: true
    },

    description: String,

    imageUrl: String,


},
{
    timestamps: true
})


export default mongoose.model('Medication', medicationSchema);