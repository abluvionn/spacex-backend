import { Error as MongooseError } from 'mongoose';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from '../../controllers/authController.js';
import User from '../../models/User.js';
import { generateTokens } from '../../services/authService.js';
import jwt from 'jsonwebtoken';

jest.mock('../../models/User.js');
jest.mock('../../services/authService.js');
jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));
jest.mock('../../utils/formatValidationErrors.js', () => ({
  formatValidationErrors: jest
    .fn()
    .mockReturnValue({ email: 'Email is required' }),
}));

describe('authController', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '555-1234',
      password: 'hashed-password',
      save: jest.fn().mockResolvedValue(true),
      checkPassword: jest.fn(),
    };

    User.mockImplementation(() => mockUser);
    User.findOne = jest.fn();

    generateTokens.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('registerUser', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          email: 'john@example.com',
          password: 'password123',
          fullName: 'John Doe',
          phone: '555-7890',
        },
      };
    });

    it('should register a new user and return tokens', async () => {
      User.findOne.mockResolvedValue(null);

      await registerUser(mockReq, mockRes, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(User).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          password: 'password123',
          fullName: 'John Doe',
          phone: '555-7890',
        }),
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateTokens).toHaveBeenCalledWith('user123');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith({
        accessToken: 'access-token',
        user: mockUser,
      });
    });

    it('should return 400 when email already exists', async () => {
      User.findOne.mockResolvedValue(mockUser);

      await registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: 'This email is already taken.',
      });
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should return 422 for validation errors', async () => {
      User.findOne.mockResolvedValue(null);

      const validationError = new MongooseError.ValidationError();
      mockUser.save.mockRejectedValueOnce(validationError);

      await registerUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: { email: 'Email is required' },
      });
    });

    it('should call next for unexpected errors', async () => {
      User.findOne.mockResolvedValue(null);
      const error = new Error('Database failure');
      mockUser.save.mockRejectedValueOnce(error);

      await registerUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('loginUser', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          email: 'john@example.com',
          password: 'password123',
        },
      };
    });

    it('should login with valid credentials and return tokens', async () => {
      User.findOne.mockResolvedValue(mockUser);
      mockUser.checkPassword.mockResolvedValue(true);

      await loginUser(mockReq, mockRes, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockUser.checkPassword).toHaveBeenCalledWith('password123');
      expect(generateTokens).toHaveBeenCalledWith('user123');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        accessToken: 'access-token',
        user: mockUser,
      });
    });

    it('should return 400 when user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await loginUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: 'Invalid email or password.',
      });
    });

    it('should return 400 when password is invalid', async () => {
      User.findOne.mockResolvedValue(mockUser);
      mockUser.checkPassword.mockResolvedValue(false);

      await loginUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: 'Invalid email or password.',
      });
    });

    it('should call next for unexpected errors', async () => {
      const error = new Error('Login failure');
      User.findOne.mockRejectedValueOnce(error);

      await loginUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens when refreshToken is valid', async () => {
      mockReq = {
        cookies: {
          refreshToken: 'old-refresh-token',
        },
      };
      jwt.verify.mockReturnValue({ userId: 'user123' });

      await refreshToken(mockReq, mockRes);

      expect(jwt.verify).toHaveBeenCalledWith(
        'old-refresh-token',
        expect.any(String),
      );
      expect(generateTokens).toHaveBeenCalledWith('user123');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        accessToken: 'access-token',
      });
    });

    it('should return 401 when refresh token is missing', async () => {
      mockReq = { cookies: {} };

      await refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: 'Refresh token is missing.',
      });
    });

    it('should return 401 when refresh token is invalid', async () => {
      mockReq = {
        cookies: {
          refreshToken: 'bad-token',
        },
      };
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: 'Invalid refresh token.',
      });
    });
  });

  describe('logoutUser', () => {
    it('should clear refresh cookie and return success message', () => {
      logoutUser({}, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
});
