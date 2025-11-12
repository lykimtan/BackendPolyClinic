import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Trường tên không được bỏ trống'],
      trim: true,
      maxlenght: [50, 'Trường tên chỉ chứa tối đa 50 ký tự'],
    },

    lastName: {
      type: String,
      required: [true, 'Họ không được bỏ trống'],
      trim: true,
      maxlenght: [50, 'Họ không được vượt quá 50 kí tự'],
    },
    email: {
      type: String,
      required: [true, 'Trường email không được bỏ trống'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, //allow multiple null values
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, 'Mật khẩu cần chứa ít nhất 6 kí tự'],
      select: false, //don't include password in query
    },

    phone: {
      type: String,
      match: [/^[\+]?[0-9][\d]{0,10}$/, 'Vui lòng nhập số điện thoại hợp lệ'],
    },

    address: {
      type: String,
    },

    role: {
      type: String,
      enum: ['admin', 'doctor', 'patient', 'staff'],
      required: [true, 'Vai trò không được bỏ trống'],
      default: 'patient',
    },

    //medical information (for patient)

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    allergies: [String],
    medicalHistory: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      // required: function() {
      //     return ['admin', 'doctor', 'staff'].includes(this.role)
      // }
    },

    specializationIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Specialization', //relationship many to many with specialization
        },
      ],
      // required: function() {
      //     return this.role === 'doctor';
      // }
    },

    licenseNumber: {
      type: String,
    },

    yearsOfExperience: {
      type: Number,
      default: 1,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,
    avatar: {
      type: String,
      default: function () {
        return 'https://i.pinimg.com/1200x/48/20/24/48202483641116df96e01100f0ced437.jpg';
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Fix: toJSON not toJson
    toObject: { virtuals: true },
  }
);

//virtual fullName (change from fullname to match camelCase)

userSchema.virtual('fullName').get(function () {
  return `${this.lastName} ${this.firstName}`;
});

userSchema.virtual('age').get(function () {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

//index for better performance
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ role: 1 });

//hashing password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    // hash password with cost of 12;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateEmployeeId = function () {
  const rolePrefix = {
    admin: 'ADM',
    doctor: 'DOC',
    staff: 'STF',
  };

  const prefix = rolePrefix[this.role] || 'EMP';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
};

userSchema.pre('save', function (next) {
  if (['admin', 'doctor', 'staff'].includes(this.role) && !this.employeeId) {
    this.employeeId = this.generateEmployeeId();
  }
  next();
});

export default mongoose.model('User', userSchema);
