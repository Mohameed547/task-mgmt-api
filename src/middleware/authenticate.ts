import { Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

/**
 * Reusable JWT Authentication Middleware.
 * Reads the Authorization header, validates the Bearer token,
 * and attaches the authenticated user's identity to req.user.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Invalid authorization header format. Expected Bearer token'));
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  try {
    const decoded = JwtUtils.verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    next(error);
  }
};
