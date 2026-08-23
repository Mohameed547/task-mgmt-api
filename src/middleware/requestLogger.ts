import morgan from 'morgan';
import { RequestHandler } from 'express';
import { env } from '../config/env';

export const requestLogger: RequestHandler = morgan(
  env.NODE_ENV === 'development' ? 'dev' : 'combined'
);
