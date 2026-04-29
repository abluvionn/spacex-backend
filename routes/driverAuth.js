import express from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverProfile,
} from '../controllers/driverAuthController.js';

const driverAuthRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Driver Auth
 *     description: Driver authentication endpoints
 *
 * /driver/auth/register:
 *   post:
 *     tags: [Driver Auth]
 *     summary: Register a new driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 example: driver@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 example: 555-1234
 *     responses:
 *       201:
 *         description: Driver successfully registered
 *       400:
 *         description: Email already taken
 *       422:
 *         description: Validation error
 *
 * /driver/auth/login:
 *   post:
 *     tags: [Driver Auth]
 *     summary: Login as driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 *
 * /driver/auth/profile:
 *   get:
 *     tags: [Driver Auth]
 *     summary: Get driver profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile retrieved
 *       404:
 *         description: Driver not found
 *   put:
 *     tags: [Driver Auth]
 *     summary: Update driver profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Driver profile updated
 *       404:
 *         description: Driver not found
 *       422:
 *         description: Validation error
 */

driverAuthRouter.post('/register', registerDriver);
driverAuthRouter.post('/login', loginDriver);
driverAuthRouter.get('/profile', verifyAccessToken, getDriverProfile);
driverAuthRouter.put('/profile', verifyAccessToken, updateDriverProfile);

export default driverAuthRouter;
