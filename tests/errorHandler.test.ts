import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../src/middleware/errorHandler';
import { ApiError } from '../src/utils/ApiError';

describe('Centralized Error Handler Middleware', () => {
  let testApp: express.Express;

  beforeEach(() => {
    testApp = express();
    testApp.use(express.json());

    testApp.get('/test-api-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new ApiError(400, 'Bad request test error', ['Invalid parameter']));
    });

    testApp.get('/test-generic-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('Unexpected server error'));
    });

    testApp.get('/test-mongoose-validation', (_req: Request, _res: Response, next: NextFunction) => {
      const validationError = {
        name: 'ValidationError',
        errors: {
          title: { message: 'Title is required' },
          status: { message: 'Invalid status' },
        },
      };
      next(validationError);
    });

    testApp.get('/test-mongoose-cast-error', (_req: Request, _res: Response, next: NextFunction) => {
      const castError = {
        name: 'CastError',
        path: '_id',
      };
      next(castError);
    });

    testApp.get('/test-mongo-duplicate-error', (_req: Request, _res: Response, next: NextFunction) => {
      const duplicateError = {
        name: 'MongoServerError',
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };
      next(duplicateError);
    });

    testApp.get('/test-jwt-invalid', (_req: Request, _res: Response, next: NextFunction) => {
      const jwtError = {
        name: 'JsonWebTokenError',
        message: 'invalid signature',
      };
      next(jwtError);
    });

    testApp.get('/test-jwt-expired', (_req: Request, _res: Response, next: NextFunction) => {
      const expiredError = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };
      next(expiredError);
    });

    testApp.use(errorHandler);
  });

  it('should handle custom ApiError correctly', async () => {
    const response = await request(testApp).get('/test-api-error');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message', 'Bad request test error');
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors).toContain('Invalid parameter');
  });

  it('should handle generic uncaught Error correctly', async () => {
    const response = await request(testApp).get('/test-generic-error');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('statusCode', 500);
    expect(response.body).toHaveProperty('message', 'Unexpected server error');
  });

  it('should translate Mongoose ValidationError to 400 with formatted errors array', async () => {
    const response = await request(testApp).get('/test-mongoose-validation');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Validation Error');
    expect(response.body.errors).toContain('Title is required');
    expect(response.body.errors).toContain('Invalid status');
  });

  it('should translate Mongoose CastError to 400 with invalid format message', async () => {
    const response = await request(testApp).get('/test-mongoose-cast-error');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Invalid _id format');
  });

  it('should translate MongoDB 11000 duplicate key error to 409 Conflict', async () => {
    const response = await request(testApp).get('/test-mongo-duplicate-error');

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body.message).toContain('Duplicate value for email');
  });

  it('should translate JsonWebTokenError to 401 Unauthorized', async () => {
    const response = await request(testApp).get('/test-jwt-invalid');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Invalid authentication token');
  });

  it('should translate TokenExpiredError to 401 Unauthorized', async () => {
    const response = await request(testApp).get('/test-jwt-expired');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Authentication token has expired');
  });
});
