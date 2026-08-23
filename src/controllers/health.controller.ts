import { Request, Response } from 'express';
import { env } from '../config/env';
import { ApiResponseHelper } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getHealthStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const healthData = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };

    return ApiResponseHelper.success(
      res,
      200,
      'Server is healthy',
      healthData
    );
  }
);
