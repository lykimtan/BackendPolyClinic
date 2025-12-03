import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      requried: [true, 'Tên thuộc khong được để trống'],
    },

    genericName: {
      type: String,
    },

    desription: String,

    form: {
      type: String,
      enum: ['tablet', 'capsule', 'lozenge', 'vial', 'liquid', 'injection'],
      required: true,
    },

    unit: {
      type: String,
      enum: ['mg', 'ml', 'g', 'box', 'vial'],
      //viên nén, viên nhộng, thuốc ngậm, thuốc nhỏ, ống
      required: true,
    },

    description: String,

    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Medication', medicationSchema);
