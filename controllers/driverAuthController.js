import Driver from '../models/Driver.js';
import { Error } from 'mongoose';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import { generateTokens } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const registerDriver = async (req, res, next) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body || {};
    const driverExists = await Driver.findOne({ email });
    if (driverExists) {
      res.status(400).send({ error: 'This email is already taken.' });
      return;
    }

    const driver = new Driver({ email, password, fullName, phoneNumber });
    await driver.save();
    const { accessToken, refreshToken } = generateTokens(driver._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(201).send({ accessToken, driver });
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};

export const loginDriver = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const driver = await Driver.findOne({ email });
    if (!driver) {
      res.status(400).send({ error: 'Invalid email or password.' });
      return;
    }
    const isPasswordValid = await driver.checkPassword(password);
    if (!isPasswordValid) {
      res.status(400).send({ error: 'Invalid email or password.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(driver._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(200).send({ accessToken, driver });
  } catch (e) {
    next(e);
  }
};

export const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.userId);
    if (!driver) {
      res.status(404).send({ error: 'Driver not found.' });
      return;
    }
    res.status(200).send(driver);
  } catch (e) {
    next(e);
  }
};

export const updateDriverProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber } = req.body || {};
    const driver = await Driver.findByIdAndUpdate(
      req.userId,
      { fullName, phoneNumber },
      { new: true, runValidators: true }
    );
    if (!driver) {
      res.status(404).send({ error: 'Driver not found.' });
      return;
    }
    res.status(200).send(driver);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};
