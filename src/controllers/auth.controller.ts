import { Response } from 'express';
import { User } from '../models';
import { AuthService } from '../services';
import { ApiResponseHelper } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await AuthService.registerUser(req.body);

  return ApiResponseHelper.success(
    res,
    201,
    'User registered successfully',
    user
  );
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  return ApiResponseHelper.success(
    res,
    200,
    'Login successful',
    result
  );
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return ApiResponseHelper.success(
    res,
    200,
    'User profile retrieved successfully',
    user
  );
});
