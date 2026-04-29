import express from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import {
  downloadResume,
  listApplications,
  listAllApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/userApplicationController.js';

const userApplicationsRouter = express.Router();

// serve raw resume file for a specific userApplication
/**
 * @swagger
 * /userApplications/{id}/resume:
 *   get:
 *     tags: [Applications]
 *     summary: Download the resume associated with an userApplication
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UserApplication ID
 *     responses:
 *       200:
 *         description: Resume file returned as binary
 *         content:
 *           userApplication/octet-stream:
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
userApplicationsRouter.get('/:id/resume', verifyAccessToken, downloadResume);

/**
 * @swagger
 * /userApplications:
 *   get:
 *     tags: [Applications]
 *     summary: Get all userApplications (authenticated admins only)
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
 *         description: Number of userApplications per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending','reviewing','rejected','accepted']
 *         description: Filter by userApplication status
 *     responses:
 *       200:
 *         description: Paginated list of userApplications
 *         content:
 *           userApplication/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserApplication'
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
// paginated list of userApplications
userApplicationsRouter.get('/', verifyAccessToken, listApplications);

// unbounded list (no pagination)
/**
 * @swagger
 * /userApplications/all:
 *   get:
 *     tags: [Applications]
 *     summary: Get all userApplications without pagination (authenticated admins only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending','reviewing','rejected','accepted']
 *         description: Filter by userApplication status
 *     responses:
 *       200:
 *         description: Array of userApplication objects
 *         content:
 *           userApplication/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserApplication'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
userApplicationsRouter.get('/all', verifyAccessToken, listAllApplications);

/**
 * @swagger
 * /userApplications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Get userApplication by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UserApplication ID
 *     responses:
 *       200:
 *         description: UserApplication found
 *         content:
 *           userApplication/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApplication'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: UserApplication not found
 *       500:
 *         description: Internal server error
 */
userApplicationsRouter.get('/:id', verifyAccessToken, getApplicationById);

/**
 * @swagger
 * /userApplications/{id}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update status of an userApplication
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UserApplication ID
 *     requestBody:
 *       required: true
 *       content:
 *         userApplication/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: UserApplication status updated successfully
 *         content:
 *           userApplication/json:
 *             schema:
 *               $ref: '#/components/schemas/UserApplication'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: UserApplication not found
 *       500:
 *         description: Internal server error
 */

userApplicationsRouter.patch(
  '/:id/status',
  verifyAccessToken,
  updateApplicationStatus,
);

export default userApplicationsRouter;
