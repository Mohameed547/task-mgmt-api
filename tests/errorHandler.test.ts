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
});
