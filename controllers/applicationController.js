import { Error } from 'mongoose';
import Application, { STATUS_ENUM } from '../models/Application.js';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import path from 'path';
import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass,
  },
});

const sendAdminNotification = (application) => {
  const mailOptions = {
    from: 'SpaceX <no-reply@spacex.com>',
    to: config.admin.email,
    subject: `New application submitted by ${application.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2c3e50;">New Application Received</h2>
        <p>A candidate has just submitted an application with the following details:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Full Name</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.fullName}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.email}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Phone Number</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>CDL License</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.cdlLicense}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>State</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.state}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Driving Experience</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.drivingExperience}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Truck Types</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.truckTypes.join(', ')}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Long Haul Trips?</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.longHaulTrips ? 'Yes' : 'No'}</td>
          </tr>
          ${
            application.comments
              ? `
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Comments</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${application.comments}</td>
          </tr>`
              : ''
          }
        </table>
        ${application.resumePath ? `<p>Resume file saved at: ${application.resumeFilename}</p>` : ''}
        <p style="font-size:0.9em; color:#777;">--<br/>This notification was generated automatically by the SpaceX application system.</p>
      </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent successfully:', info);
  });
};

const sendStatusUpdateEmail = (application, status) => {
  if (status === 'accepted') {
    const mailOptions = {
      from: 'SpaceX <no-reply@spacex.com>',
      to: application.email,
      subject: '🎉 Your SpaceX application has been accepted!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2c3e50;">Congratulations!</h2>
          <p style="font-size: 1.2rem;">We are excited to let you know that your application to <strong>SpaceX company</strong> has been accepted.</p>
          <p style="font-size: 1.2rem;">🚀 Our team will reach out soon with the next steps to move forward.</p>
          <p style="font-size:0.9em; color:#777;">Thank you for applying</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('Error sending acceptance email:', error);
      }
      console.log('Acceptance email sent successfully:', info);
    });
  } else if (status === 'rejected') {
    const mailOptions = {
      from: 'SpaceX <no-reply@spacex.com>',
      to: application.email,
      subject: '😔 Application Update from SpaceX',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2c3e50;">We're Sorry</h2>
          <p style="font-size: 1.2rem;">Unfortunately, your application to <strong>SpaceX company</strong> has been rejected at this time.</p>
          <p style="font-size: 1.2rem;">😔 We appreciate your interest and encourage you to apply again in the future. 🚚</p>
          <p style="font-size:0.9em; color:#777;">Thank you for your application</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('Error sending rejection email:', error);
      }
      console.log('Rejection email sent successfully:', info);
    });
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      cdlLicense,
      state,
      drivingExperience,
      truckTypes,
      longHaulTrips,
      comments,
    } = req.body || {};

    let truckTypesArray = [];
    if (truckTypes) {
      const truckTypesObj =
        typeof truckTypes === 'string' ? JSON.parse(truckTypes) : truckTypes;
      truckTypesArray = Object.keys(truckTypesObj).filter(
        (key) => truckTypesObj[key],
      );
    }

    const application = new Application({
      fullName,
      phoneNumber,
      email,
      cdlLicense,
      state,
      drivingExperience,
      truckTypes: truckTypesArray,
      longHaulTrips,
      comments,
      resumePath: req.file ? req.file.path : undefined,
      resumeFilename: req.file ? req.file.filename : undefined,
    });

    await application.save();
    res.status(201).send(application);
    sendAdminNotification(application);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};

export const downloadResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application || !application.resumePath) {
      return res.status(404).send({ error: 'Resume not found' });
    }
    res.sendFile(path.resolve(application.resumePath));
  } catch (e) {
    next(e);
  }
};

export const listApplications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && STATUS_ENUM.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).send({
      data: applications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

export const listAllApplications = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && STATUS_ENUM.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const applications = await Application.find(filter).sort({ createdAt: -1 });
    res.status(200).send(applications);
  } catch (e) {
    next(e);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).send({ error: 'Application not found' });
    }
    res.status(200).send(application);
  } catch (e) {
    next(e);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).send({ error: 'Application not found' });
      return;
    }

    try {
      await application.updateStatus(req.body.status);
      sendStatusUpdateEmail(application, req.body.status);
      res.status(200).send(application);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  } catch (e) {
    next(e);
  }
};
