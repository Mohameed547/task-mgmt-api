import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
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
  } else if (err?.name === 'ValidationError' && err?.errors) {
    // Handle Mongoose Validation Errors
    statusCode = 400;
    message = 'Validation Error';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors = Object.values(err.errors).map((e: any) => e.message);
  } else if (err?.name === 'CastError') {
    // Handle Mongoose Invalid ObjectId / Cast Errors
    statusCode = 400;
    message = `Invalid ${err.path || 'resource ID'} format`;
  } else if (err?.code === 11000 || (err?.name === 'MongoServerError' && err?.code === 11000)) {
    // Handle MongoDB Duplicate Key Errors
    statusCode = 409;
    const keys = err.keyValue ? Object.keys(err.keyValue).join(', ') : 'field';
    message = `Duplicate value for ${keys}. Record already exists`;
  } else if (err?.name === 'JsonWebTokenError') {
    // Handle JWT Signature / Formatting Errors
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err?.name === 'TokenExpiredError') {
    // Handle Expired JWT Tokens
    statusCode = 401;
    message = 'Authentication token has expired';
  } else if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in (err as any)) {
    // Handle Malformed Request Body JSON Syntax Errors
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err instanceof Error) {
    message = err.message || 'Internal Server Error';
  }

  logger.error(`Error ${statusCode}: ${message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err?.stack,
  });

  return res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    statusCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err?.stack }),
  });
};
