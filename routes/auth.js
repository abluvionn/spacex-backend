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

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email taken
 *       422:
 *         description: Validation error
 */
authRouter.post('/register', async (req, res, next) => {
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
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).send({ error: 'Invalid email or password.' });
      return;
    }
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      res.status(401).send({ error: 'Invalid email or password.' });
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
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange refresh token for a new access token
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Missing or invalid refresh token
 */
authRouter.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (!refreshToken) {
    res.status(401).send({ error: 'Refresh token is missing.' });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId
    );
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(200).send({ accessToken });
  } catch (e) {
    res.status(401).send({ error: 'Invalid refresh token.' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user (clears refresh cookie)
 *     responses:
 *       200:
 *         description: Logged out
 */
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).send({ message: 'Logged out successfully' });
});

export default authRouter;
