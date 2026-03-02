import express from 'express';
import { Error } from 'mongoose';
import Application from '../models/Application.js';
import { formatValidationErrors } from '../utils/formatValidationErrors.js';
import { verifyAccessToken } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import path from 'path';

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
applicationsRouter.post(
  '/',
  upload.single('resume'),
  async (req, res, next) => {
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

      // Convert truckTypes object to array of strings (only keys with true values)
      let truckTypesArray = [];
      if (truckTypes) {
        const truckTypesObj =
          typeof truckTypes === 'string' ? JSON.parse(truckTypes) : truckTypes;
        truckTypesArray = Object.keys(truckTypesObj).filter(
          (key) => truckTypesObj[key],
        );
      }

      const application = new Application({
        fullName,
        phoneNumber,
        email,
        cdlLicense,
        state,
        drivingExperience,
        truckTypes: truckTypesArray,
        longHaulTrips,
        comments,
        resumePath: req.file ? req.file.path : undefined,
        resumeFilename: req.file ? req.file.filename : undefined,
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
  },
);

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
applicationsRouter.get(
  '/:id/resume',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const application = await Application.findById(req.params.id);
      if (!application || !application.resumePath) {
        return res.status(404).send({ error: 'Resume not found' });
      }
      res.sendFile(path.resolve(application.resumePath));
    } catch (e) {
      next(e);
    }
  },
);

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
// paginated list of applications
applicationsRouter.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments();
    const applications = await Application.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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

// unbounded list (no pagination)
/**
 * @swagger
 * /applications/all:
 *   get:
 *     tags: [Applications]
 *     summary: Get all applications without pagination (authenticated users only)
 *     security:
 *       - BearerAuth: []
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
applicationsRouter.get('/all', verifyAccessToken, async (req, res, next) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).send(applications);
  } catch (e) {
    next(e);
  }
});

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
applicationsRouter.get('/:id', verifyAccessToken, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).send({ error: 'Application not found' });
    }

    res.status(200).send(application);
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
  },
);

export default applicationsRouter;
