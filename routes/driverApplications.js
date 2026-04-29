import express from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import {
  createApplication,
  getMyApplication,
  updateMyApplication,
  getApplicationStatus,
} from '../controllers/driverApplicationController.js';

const driverApplicationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Driver Applications
 *     description: Driver application management endpoints
 *
 * /driver/applications:
 *   post:
 *     tags: [Driver Applications]
 *     summary: Create a new driver application
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phoneNumber
 *               - email
 *               - cdlLicense
 *               - state
 *               - drivingExperience
 *               - truckTypes
 *               - longHaulTrips
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               cdlLicense:
 *                 type: string
 *               state:
 *                 type: string
 *               drivingExperience:
 *                 type: string
 *               truckTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               longHaulTrips:
 *                 type: boolean
 *               comments:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Application already exists
 *       422:
 *         description: Validation error
 *
 *   get:
 *     tags: [Driver Applications]
 *     summary: Get my application
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Application retrieved
 *       404:
 *         description: No application found
 *
 *   put:
 *     tags: [Driver Applications]
 *     summary: Update my application
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               cdlLicense:
 *                 type: string
 *               state:
 *                 type: string
 *               drivingExperience:
 *                 type: string
 *               truckTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               longHaulTrips:
 *                 type: boolean
 *               comments:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Application updated
 *       404:
 *         description: No application found
 *       422:
 *         description: Validation error
 *
 * /driver/applications/status:
 *   get:
 *     tags: [Driver Applications]
 *     summary: Get my application status
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Status retrieved
 *       404:
 *         description: No application found
 */

driverApplicationRouter.post('/', verifyAccessToken, upload.single('resume'), createApplication);
driverApplicationRouter.get('/', verifyAccessToken, getMyApplication);
driverApplicationRouter.put('/', verifyAccessToken, upload.single('resume'), updateMyApplication);
driverApplicationRouter.get('/status', verifyAccessToken, getApplicationStatus);

export default driverApplicationRouter;
