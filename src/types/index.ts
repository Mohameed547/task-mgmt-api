import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';

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
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
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

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface ITaskAttachment {
  fileName: string;
  fileUrl: string;
  publicId: string;
  mimeType: string;
  fileSize: number;
}

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  attachment?: ITaskAttachment;
  user: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponseData {
  user: Partial<IUser>;
  token: string;
}

export interface AuthUser {
  userId: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
