import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

const app: Express = express();

// CORS Configuration for future React frontend
const corsOptions: cors.CorsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use(requestLogger);

// API Routes
app.use('/api', apiRoutes);

// 404 Not Found Middleware
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
