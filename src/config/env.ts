import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentVariables } from '../types';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env: EnvironmentVariables = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management_db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};
