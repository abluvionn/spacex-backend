import { createApplication } from '../../controllers/userApplicationController.js';
import UserApplication from '../../models/UserApplication.js';
import { Error as MongooseError } from 'mongoose';

// Mock the UserApplication model
jest.mock('../../models/UserApplication.js');

// Mock the sendAdminNotification function
jest.mock('../../controllers/userApplicationController.js', () => {
  const actual = jest.requireActual(
    '../../controllers/userApplicationController.js',
  );
  return {
    ...actual,
    sendAdminNotification: jest.fn(),
  };
});

// Mock the email module to prevent actual email sending
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((options, callback) =>
      callback(null, { messageId: 'test' }),
    ),
  }),
}));

// Mock formatValidationErrors
jest.mock('../../utils/formatValidationErrors.js', () => ({
  formatValidationErrors: jest
    .fn()
    .mockReturnValue({ fullName: 'Field is required' }),
}));

describe('userApplicationController', () => {
  describe('createApplication', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let mockApplicationInstance;

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();

      // Mock request
      mockReq = {
        body: {
          fullName: 'John Doe',
          phoneNumber: '555-1234',
          email: 'john@example.com',
          cdlLicense: 'Yes',
          state: 'CA',
          drivingExperience: '5 years',
          truckTypes: { flatbed: true, tanker: false },
          longHaulTrips: true,
          comments: 'Experienced driver',
        },
        file: undefined,
      };

      // Mock response
      mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      // Mock next function
      mockNext = jest.fn();

      // Mock UserApplication instance
      mockApplicationInstance = {
        _id: '123',
        fullName: 'John Doe',
        phoneNumber: '555-1234',
        email: 'john@example.com',
        cdlLicense: 'Yes',
        state: 'CA',
        drivingExperience: '5 years',
        truckTypes: ['flatbed'],
        longHaulTrips: true,
        comments: 'Experienced driver',
        save: jest.fn().mockResolvedValue(this),
      };
    });

    describe('successful creation', () => {
      it('should create an userApplication with valid data and return 201', async () => {
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(UserApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'John Doe',
            phoneNumber: '555-1234',
            email: 'john@example.com',
            cdlLicense: 'Yes',
            state: 'CA',
            drivingExperience: '5 years',
            truckTypes: ['flatbed'],
            longHaulTrips: true,
            comments: 'Experienced driver',
          }),
        );

        expect(mockApplicationInstance.save).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.send).toHaveBeenCalledWith(mockApplicationInstance);
      });

      it('should handle truckTypes as a JSON string', async () => {
        mockReq.body.truckTypes = '{"flatbed":true,"tanker":false}';
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(UserApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            truckTypes: ['flatbed'],
          }),
        );
      });

      it('should handle truckTypes as an object', async () => {
        mockReq.body.truckTypes = { flatbed: true, tanker: true, dump: false };
        mockApplicationInstance.truckTypes = ['flatbed', 'tanker'];
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(UserApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            truckTypes: expect.arrayContaining(['flatbed', 'tanker']),
          }),
        );
      });
    });

    describe('with file upload', () => {
      it('should include resumePath and resumeFilename when file is uploaded', async () => {
        mockReq.file = {
          path: '/uploads/resumes/resume-123.pdf',
          filename: 'resume-123.pdf',
        };

        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(UserApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            resumePath: '/uploads/resumes/resume-123.pdf',
            resumeFilename: 'resume-123.pdf',
          }),
        );
      });

      it('should not include resumePath when no file is uploaded', async () => {
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(UserApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            resumePath: undefined,
            resumeFilename: undefined,
          }),
        );
      });
    });

    describe('error handling', () => {
      it('should return 422 for validation errors', async () => {
        // Create a proper mongoose ValidationError
        const validationError = new MongooseError.ValidationError();

        mockApplicationInstance.save.mockRejectedValueOnce(validationError);
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        // Validation error should be handled with 422 status
        expect(mockRes.status).toHaveBeenCalledWith(422);
      });

      it('should pass other errors to next middleware', async () => {
        const error = new Error('Database error');
        mockApplicationInstance.save.mockRejectedValueOnce(error);
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe('edge cases', () => {
      it('should handle empty truckTypes', async () => {
        mockReq.body.truckTypes = { flatbed: false, tanker: false };
        mockApplicationInstance.truckTypes = [];
        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(UserApplication).toHaveBeenCalledWith(
          expect.objectContaining({
            truckTypes: [],
          }),
        );
      });

      it('should handle missing optional fields', async () => {
        mockReq.body = {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
        };

        UserApplication.mockImplementation(() => mockApplicationInstance);

        await createApplication(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
      });
    });
  });
});
