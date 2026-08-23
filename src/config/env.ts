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
};
