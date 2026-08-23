import { Response } from 'express';
import { ApiResponse as IApiResponse } from '../types';

export class ApiResponseHelper {
  public static success<T>(
    res: Response,
    statusCode: number = 200,
    message: string,
    data?: T
  ): Response {
    const responsePayload: IApiResponse<T> = {
      status: 'success',
      message,
      ...(data !== undefined && { data }),
    };

    return res.status(statusCode).json(responsePayload);
  }

  public static error(
    res: Response,
    statusCode: number = 500,
    message: string,
    errors: unknown[] = []
  ): Response {
    const responsePayload: IApiResponse = {
      status: statusCode >= 500 ? 'error' : 'fail',
      message,
      ...(errors.length > 0 && { errors }),
    };

    return res.status(statusCode).json(responsePayload);
  }
}
