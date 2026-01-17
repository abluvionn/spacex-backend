import { Schema, model } from 'mongoose';

const ApplicationSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    cdlLicense: {
      type: String,
      required: [true, 'CDL license is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    drivingExperience: {
      type: String,
      required: [true, 'Driving experience is required'],
    },
    truckTypes: {
      type: [String],
      required: [true, 'Truck types are required'],
    },
    longHaulTrips: {
      type: String,
      enum: ['yes', 'no'],
      required: [true, 'Long haul trips preference is required'],
    },
    comments: {
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

ApplicationSchema.methods.toggleArchived = function () {
  this.archived = !this.archived;
  return this.save();
};

const Application = model('Application', ApplicationSchema);

export default Application;
