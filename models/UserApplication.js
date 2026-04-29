import { Schema, model } from 'mongoose';

export const STATUS_ENUM = ['pending', 'reviewing', 'rejected', 'accepted'];

const UserApplicationSchema = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver ID is required'],
    },
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
      type: Boolean,
      required: [true, 'Long haul trips preference is required'],
    },
    comments: {
      type: String,
    },
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: 'pending',
    },
    // path on the local filesystem where the uploaded resume was saved
    resumePath: {
      type: String,
    },
    resumeFilename: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

UserApplicationSchema.methods.updateStatus = function (newStatus) {
  if (STATUS_ENUM.includes(newStatus)) {
    this.status = newStatus;
    return this.save();
  }
  throw new Error('Invalid status value');
};

// virtual property that clients can use to fetch the resume file
UserApplicationSchema.virtual('resumeUrl').get(function () {
  if (this.resumePath) {
    return `userApplications/${this._id}/resume`;
  }
  return null;
});

const UserApplication = model('UserApplication', UserApplicationSchema);

export default UserApplication;
