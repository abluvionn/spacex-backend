import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_WORK_FACTOR = 10;

const DriverSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [5, 'Password must be at least 5 characters long'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    knowledgeTestPassed: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true },
);

DriverSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

DriverSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
});

DriverSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const Driver = model('Driver', DriverSchema);

export default Driver;
