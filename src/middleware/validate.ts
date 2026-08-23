import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

export type ValidatorFn<T> = (data: unknown) => { isValid: boolean; errors: string[]; data?: T };

export const validateBody = <T>(validator: ValidatorFn<T>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = validator(req.body);

    if (!result.isValid) {
      const error = new ApiError(400, 'Validation Error', result.errors);
      return next(error);
    }

    if (result.data) {
      req.body = result.data;
    }

    next();
  };
};
