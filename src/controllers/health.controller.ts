import { Request, Response } from 'express';
import { env } from '../config/env';
import { getDatabaseState } from '../config/database';
import { ApiResponseHelper } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getHealthStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const dbStateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbStateCode = getDatabaseState();
    const dbStatus = dbStateMap[dbStateCode] || 'unknown';

    const healthData = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbStatus,
    };

    return ApiResponseHelper.success(
      res,
      200,
      'Server is healthy',
      healthData
    );
  }
);
