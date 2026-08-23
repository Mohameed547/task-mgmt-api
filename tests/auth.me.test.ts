import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { JwtUtils } from '../src/utils/jwt';

jest.mock('../src/models/user.model');

describe('GET /api/auth/me Protected Endpoint', () => {
  const mockUserFindById = User.findById as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 OK and safe user profile when a valid Bearer token is provided', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const validToken = JwtUtils.generateToken({ userId, email: 'john@example.com' });

    mockUserFindById.mockResolvedValueOnce({
      _id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      toJSON: jest.fn().mockReturnValue({
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'User profile retrieved successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id', userId);
    expect(response.body.data).toHaveProperty('name', 'John Doe');
    expect(response.body.data).toHaveProperty('email', 'john@example.com');
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('should return 401 Unauthorized when Authorization header is missing', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Authentication token is required');
  });

  it('should return 401 Unauthorized when token format is malformed or invalid', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Invalid authentication token');
  });

  it('should return 404 Not Found if authenticated user ID does not exist in database', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const validToken = JwtUtils.generateToken({ userId, email: 'john@example.com' });

    mockUserFindById.mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
