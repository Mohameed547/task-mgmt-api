import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  logger.error(`Error ${statusCode}: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    statusCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
