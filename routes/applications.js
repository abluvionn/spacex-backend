import express from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import {
  createApplication,
  downloadResume,
  listApplications,
  listAllApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController.js';

const applicationsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Applications
 *     description: Application endpoints
 *
 * /applications:
 *   post:
 *     tags: [Applications]
 *     summary: Create a new application (multipart/form-data with optional resume file)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationRequest'
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
applicationsRouter.post('/', upload.single('resume'), createApplication);

// serve raw resume file for a specific application
/**
 * @swagger
 * /applications/{id}/resume:
 *   get:
 *     tags: [Applications]
 *     summary: Download the resume associated with an application
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Resume file returned as binary
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 *       500:
 *         description: Internal server error
 */
applicationsRouter.get('/:id/resume', verifyAccessToken, downloadResume);

/**
 * @swagger
 * /applications:
 *   get:
 *     tags: [Applications]
 *     summary: Get all applications (authenticated users only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of applications per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending','reviewing','rejected','accepted']
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Paginated list of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// paginated list of applications
applicationsRouter.get('/', verifyAccessToken, listApplications);

// unbounded list (no pagination)
/**
 * @swagger
 * /applications/all:
 *   get:
 *     tags: [Applications]
 *     summary: Get all applications without pagination (authenticated users only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending','reviewing','rejected','accepted']
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Array of application objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
applicationsRouter.get('/all', verifyAccessToken, listAllApplications);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Get application by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
applicationsRouter.get('/:id', verifyAccessToken, getApplicationById);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update status of an application
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */

applicationsRouter.patch(
  '/:id/status',
  verifyAccessToken,
  updateApplicationStatus,
);

export default applicationsRouter;
