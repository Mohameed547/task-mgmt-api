import path from 'node:path';
import dotenv from 'dotenv';
import { EnvironmentVariables } from '../types';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getJwtSecret = (): string => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is missing and strictly required in production mode');
  }
  return 'default_jwt_secret_key_change_in_production';
};

export const env: EnvironmentVariables = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management_db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  JWT_SECRET: getJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};
