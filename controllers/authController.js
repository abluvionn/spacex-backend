import User from '../models/User.js';
import { Error } from 'mongoose';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import { generateTokens } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body || {};
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).send({ error: 'This email is already taken.' });
      return;
    }

    const user = new User({ email, password, fullName, phone });
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(201).send({ accessToken, user });
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      const structuredErrors = formatValidationErrors(e);
      res.status(422).send({ error: structuredErrors });
      return;
    }
    next(e);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({ error: 'Invalid email or password.' });
      return;
    }
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      res.status(400).send({ error: 'Invalid email or password.' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(200).send({ accessToken, user });
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

export const logoutUser = (_req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).send({ message: 'Logged out successfully' });
};
