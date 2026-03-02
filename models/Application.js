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
      type: Boolean,
      required: [true, 'Long haul trips preference is required'],
    },
    comments: {
      type: String,
    },
    // path on the local filesystem where the uploaded resume was saved
    resumePath: {
      type: String,
    },
    resumeFilename: {
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
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

ApplicationSchema.methods.toggleArchived = function () {
  this.archived = !this.archived;
  return this.save();
};

// virtual property that clients can use to fetch the resume file
ApplicationSchema.virtual('resumeUrl').get(function () {
  if (this.resumePath) {
    return `applications/${this._id}/resume`;
  }
  return null;
});

const Application = model('Application', ApplicationSchema);

export default Application;
