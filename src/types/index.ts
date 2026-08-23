import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  errors?: unknown[];
}

export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  CORS_ORIGIN: string;
}

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export interface IUser {
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
