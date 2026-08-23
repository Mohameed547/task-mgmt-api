import { Request, Response } from 'express';
import { AuthService } from '../services';
import { ApiResponseHelper } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.registerUser(req.body);

  return ApiResponseHelper.success(
    res,
    201,
    'User registered successfully',
    user
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  return ApiResponseHelper.success(
    res,
    200,
    'Login successful',
    result
  );
});
