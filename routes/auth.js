import express from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../controllers/authController.js';

const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new admin
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         userApplication/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           userApplication/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Email taken
 *       422:
 *         description: Validation error
 */
authRouter.post('/register', verifyAccessToken, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         userApplication/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           userApplication/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', login);

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
 *           userApplication/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Missing or invalid refresh token
 */
authRouter.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout admin (clears refresh cookie)
 *     responses:
 *       200:
 *         description: Logged out
 */
authRouter.post('/logout', logout);

export default authRouter;
