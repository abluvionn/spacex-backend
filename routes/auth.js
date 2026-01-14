import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/User.js';
import { Error } from 'mongoose';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';

const authRouter = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS, {
    expiresIn: `${config.JwtAccessExpiresAt}m`,
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH, {
    expiresIn: `${config.JwtRefreshExpiresAt}h`,
  });

  return { accessToken, refreshToken };
};

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body;
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
});

export default authRouter;
