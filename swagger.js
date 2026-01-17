import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config.js';

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'SpaceX Backend API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${config.port}/api` }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6967945bd6e92f8fd828ac24' },
            email: { type: 'string', example: 'user@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '+1234567890' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName', 'phone'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            fullName: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        TokenResponse: {
          type: 'object',
          properties: { accessToken: { type: 'string' } },
        },
        Application: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6967945bd6e92f8fd828ac24' },
            fullName: { type: 'string', example: 'John Smith' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            cdlLicense: { type: 'string', example: 'DL123456' },
            state: { type: 'string', example: 'CA' },
            drivingExperience: { type: 'string', example: '5 years' },
            truckTypes: {
              type: 'object',
              additionalProperties: { type: 'boolean' },
            },
            longHaulTrips: {
              type: 'string',
              enum: ['yes', 'no'],
              example: 'yes',
            },
            comments: {
              type: 'string',
              example: 'Experienced driver looking for new opportunities',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApplicationRequest: {
          type: 'object',
          required: [
            'fullName',
            'phoneNumber',
            'email',
            'cdlLicense',
            'state',
            'drivingExperience',
            'truckTypes',
            'longHaulTrips',
          ],
          properties: {
            fullName: { type: 'string', example: 'John Smith' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            cdlLicense: { type: 'string', example: 'DL123456' },
            state: { type: 'string', example: 'CA' },
            drivingExperience: { type: 'string', example: '5 years' },
            truckTypes: {
              type: 'object',
              additionalProperties: { type: 'boolean' },
            },
            longHaulTrips: {
              type: 'string',
              enum: ['yes', 'no'],
              example: 'yes',
            },
            comments: {
              type: 'string',
              example: 'Experienced driver looking for new opportunities',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
