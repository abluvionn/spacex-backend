import express from 'express';
import { Error } from 'mongoose';
import Application from '../models/Application.js';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import { verifyAccessToken } from '../middleware/auth.js';

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
 *     summary: Create a new application
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
applicationsRouter.post('/', verifyAccessToken, async (req, res, next) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      cdlLicense,
      state,
      drivingExperience,
      truckTypes,
      longHaulTrips,
      comments,
    } = req.body || {};

    const application = new Application({
      fullName,
      phoneNumber,
      email,
      cdlLicense,
      state,
      drivingExperience,
      truckTypes,
      longHaulTrips,
      comments,
    });

    await application.save();
    res.status(201).send(application);
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
applicationsRouter.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments();
    const applications = await Application.find().skip(skip).limit(limit);

    res.status(200).send({
      data: applications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /applications/{id}/toggle-archive:
 *   patch:
 *     tags: [Applications]
 *     summary: Toggle archived status of an application
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
 *         description: Application archived status toggled successfully
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

applicationsRouter.patch(
  '/:id/toggle-archive',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const application = await Application.findById(req.params.id);

      if (!application) {
        res.status(404).send({ error: 'Application not found' });
        return;
      }

      await application.toggleArchived();
      res.status(200).send(application);
    } catch (e) {
      next(e);
    }
  }
);

export default applicationsRouter;
