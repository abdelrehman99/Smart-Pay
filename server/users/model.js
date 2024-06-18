import { model, Schema } from 'mongoose';
import validator from 'validator';
import { USER, ROLES } from '../common/constants.js';
import nanoid from '../../config/nanoid.js';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    smartEmail: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      select: false,
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return /\w\s\w/.test(value);
        },
        message: 'Please provide a full name',
      },
    },
    role: {
      type: String,
      enum: ROLES,
      default: USER,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^((012)|(011)|(010))([0-9]){8}$/.test(value);
        },
        message: 'Please provide a valid phone number',
      },
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enums: ['Male, Female'],
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    phoneOtp: {
      type: Number,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

const Users = model('users', userSchema);

export default Users;
