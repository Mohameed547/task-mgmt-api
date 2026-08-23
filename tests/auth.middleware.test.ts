import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/authenticate';
import { JwtUtils } from '../src/utils/jwt';
import { env } from '../src/config/env';
import { ApiError } from '../src/utils/ApiError';
import { AuthenticatedRequest } from '../src/types';

describe('Authentication Middleware (authenticate)', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should call next() and attach user identity to req.user when valid Bearer token is provided', () => {
    const validToken = JwtUtils.generateToken({
      userId: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
    });

    mockRequest.headers = {
      authorization: `Bearer ${validToken}`,
    };

    authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.userId).toBe('507f1f77bcf86cd799439011');
    expect(mockRequest.user?.email).toBe('user@example.com');
  });

  it('should pass 401 ApiError to next() when Authorization header is missing', () => {
    mockRequest.headers = {};

    authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication token is required');
  });

  it('should pass 401 ApiError to next() when Authorization header format is not Bearer', () => {
    mockRequest.headers = {
      authorization: 'Basic dXNlcjpwYXNz',
    };

    authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Invalid authorization header format. Expected Bearer token');
  });

  it('should pass 401 ApiError to next() when Bearer token string is empty', () => {
    mockRequest.headers = {
      authorization: 'Bearer ',
    };

    authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication token is required');
  });

  it('should pass 401 ApiError to next() when token signature is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid.tampered.token',
    };

    authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Invalid authentication token');
  });

  it('should pass 401 ApiError to next() when token is expired', () => {
    const expiredToken = jwt.sign(
      { userId: '507f1f77bcf86cd799439011' },
      env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    authenticate(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication token has expired');
  });
});
