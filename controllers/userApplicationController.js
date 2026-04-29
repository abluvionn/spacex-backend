import { Error } from 'mongoose';
import UserApplication, { STATUS_ENUM } from '../models/UserApplication.js';
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

const sendAdminNotification = (userApplication) => {
  const mailOptions = {
    from: 'SpaceX <no-reply@spacex.com>',
    to: config.admin.email,
    subject: `New Application submitted by ${userApplication.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2c3e50;">New Application Received</h2>
        <p>A candidate has just submitted an Application with the following details:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Full Name</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.fullName}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.email}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Phone Number</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>CDL License</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.cdlLicense}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>State</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.state}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Driving Experience</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.drivingExperience}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Truck Types</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.truckTypes.join(', ')}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Long Haul Trips?</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.longHaulTrips ? 'Yes' : 'No'}</td>
          </tr>
          ${
            userApplication.comments
              ? `
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Comments</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${userApplication.comments}</td>
          </tr>`
              : ''
          }
        </table>
        ${userApplication.resumePath ? `<p>Resume file saved at: ${userApplication.resumeFilename}</p>` : ''}
        <p style="font-size:0.9em; color:#777;">--<br/>This notification was generated automatically by the SpaceX Application system.</p>
      </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent successfully:', info);
  });
};

const sendStatusUpdateEmail = (userApplication, status) => {
  if (status === 'accepted') {
    const mailOptions = {
      from: 'SpaceX <no-reply@spacex.com>',
      to: userApplication.email,
      subject: '🎉 Your SpaceX Application has been accepted!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2c3e50;">Congratulations!</h2>
          <p style="font-size: 1.2rem;">We are excited to let you know that your Application to <strong>SpaceX company</strong> has been accepted.</p>
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
      to: userApplication.email,
      subject: '😔 Application Update from SpaceX',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2c3e50;">We're Sorry</h2>
          <p style="font-size: 1.2rem;">Unfortunately, your Application to <strong>SpaceX company</strong> has been rejected at this time.</p>
          <p style="font-size: 1.2rem;">😔 We appreciate your interest and encourage you to apply again in the future. 🚚</p>
          <p style="font-size:0.9em; color:#777;">Thank you for your Application</p>
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

export const downloadResume = async (req, res, next) => {
  try {
    const userApplication = await UserApplication.findById(req.params.id);
    if (!userApplication || !userApplication.resumePath) {
      return res.status(404).send({ error: 'Resume not found' });
    }
    res.sendFile(path.resolve(userApplication.resumePath));
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

    const total = await UserApplication.countDocuments(filter);
    const userApplications = await UserApplication.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).send({
      data: userApplications,
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
    const userApplications = await UserApplication.find(filter).sort({
      createdAt: -1,
    });
    res.status(200).send(userApplications);
  } catch (e) {
    next(e);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const userApplication = await UserApplication.findById(req.params.id);
    if (!userApplication) {
      return res.status(404).send({ error: 'UserApplication not found' });
    }
    res.status(200).send(userApplication);
  } catch (e) {
    next(e);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const userApplication = await UserApplication.findById(req.params.id);
    if (!userApplication) {
      res.status(404).send({ error: 'UserApplication not found' });
      return;
    }

    try {
      await userApplication.updateStatus(req.body.status);
      sendStatusUpdateEmail(userApplication, req.body.status);
      res.status(200).send(userApplication);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  } catch (e) {
    next(e);
  }
};
