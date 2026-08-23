import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    404,
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  next(error);
};
