import UserApplication from '../models/UserApplication.js';
import { Error } from 'mongoose';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import fs from 'fs';
import path from 'path';

export const createApplication = async (req, res, next) => {
  try {
    const driverId = req.userId;
    
    // Check if driver already has an application
    const existingApplication = await UserApplication.findOne({ driverId });
    if (existingApplication) {
      res.status(400).send({ error: 'You already have an application. Please update your existing application instead.' });
      return;
    }

    const { fullName, phoneNumber, email, cdlLicense, state, drivingExperience, truckTypes, longHaulTrips, comments } = req.body || {};

    let truckTypesArray = [];
    if (truckTypes) {
      const truckTypesObj =
        typeof truckTypes === 'string' ? JSON.parse(truckTypes) : truckTypes;
      truckTypesArray = Object.keys(truckTypesObj).filter(
        (key) => truckTypesObj[key],
      );
    }
    
    const applicationData = {
      driverId,
      fullName,
      phoneNumber,
      email,
      cdlLicense,
      state,
      drivingExperience,
      truckTypes: truckTypesArray,
      longHaulTrips,
      comments,
    };

    // Handle resume upload if exists
    if (req.file) {
      applicationData.resumePath = req.file.path;
      applicationData.resumeFilename = req.file.filename;
    }

    const application = new UserApplication(applicationData);
    await application.save();
    res.status(201).send(application);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};

export const getMyApplication = async (req, res, next) => {
  try {
    const driverId = req.userId;
    const application = await UserApplication.findOne({ driverId }).populate('driverId', '-password');
    
    if (!application) {
      res.status(404).send({ error: 'You have no application yet.' });
      return;
    }
    
    res.status(200).send(application);
  } catch (e) {
    next(e);
  }
};

export const updateMyApplication = async (req, res, next) => {
  try {
    const driverId = req.userId;
    const { fullName, phoneNumber, email, cdlLicense, state, drivingExperience, truckTypes, longHaulTrips, comments } = req.body || {};
    
    const application = await UserApplication.findOne({ driverId });
    if (!application) {
      res.status(404).send({ error: 'You have no application yet.' });
      return;
    }

    // Update fields
    if (fullName !== undefined) application.fullName = fullName;
    if (phoneNumber !== undefined) application.phoneNumber = phoneNumber;
    if (email !== undefined) application.email = email;
    if (cdlLicense !== undefined) application.cdlLicense = cdlLicense;
    if (state !== undefined) application.state = state;
    if (drivingExperience !== undefined) application.drivingExperience = drivingExperience;
    if (truckTypes !== undefined) application.truckTypes = truckTypes;
    if (longHaulTrips !== undefined) application.longHaulTrips = longHaulTrips;
    if (comments !== undefined) application.comments = comments;

    // Handle resume upload if exists
    if (req.file) {
      // Delete old resume if exists
      if (application.resumePath && fs.existsSync(application.resumePath)) {
        fs.unlinkSync(application.resumePath);
      }
      application.resumePath = req.file.path;
      application.resumeFilename = req.file.filename;
    }

    await application.save();
    res.status(200).send(application);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};

export const getApplicationStatus = async (req, res, next) => {
  try {
    const driverId = req.userId;
    const application = await UserApplication.findOne({ driverId }, { status: 1, _id: 1, updatedAt: 1 });
    
    if (!application) {
      res.status(404).send({ error: 'You have no application yet.' });
      return;
    }
    
    res.status(200).send(application);
  } catch (e) {
    next(e);
  }
};
