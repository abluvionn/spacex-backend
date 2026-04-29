import Admin from '../models/Admin.js';
import { Error } from 'mongoose';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import { generateTokens } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body || {};
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      res.status(400).send({ error: 'This email is already taken.' });
      return;
    }

    const admin = new Admin({ email, password, fullName, phone });
    await admin.save();
    const { accessToken, refreshToken } = generateTokens(admin._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(201).send({ accessToken, admin });
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(400).send({ error: 'Invalid email or password.' });
      return;
    }
    const isPasswordValid = await admin.checkPassword(password);
    if (!isPasswordValid) {
      res.status(400).send({ error: 'Invalid email or password.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(admin._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(200).send({ accessToken, admin });
  } catch (e) {
    next(e);
  }
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (!refreshToken) {
    res.status(401).send({ error: 'Refresh token is missing.' });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, config.JwtRefreshSecret);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
    );
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(200).send({ accessToken });
  } catch (e) {
    res.status(401).send({ error: 'Invalid refresh token.' });
  }
};

export const logout = (_req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).send({ message: 'Logged out successfully' });
};
