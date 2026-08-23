import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/user.model';
import bcrypt from 'bcryptjs';

jest.mock('../src/models/user.model');

describe('POST /api/auth/login Endpoint', () => {
  const mockUserFindOne = User.findOne as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 OK with JWT token and safe user payload on valid login', async () => {
    const hashedPassword = await bcrypt.hash('securePassword123', 10);
    const mockSelect = jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      toObject: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    mockUserFindOne.mockReturnValue({ select: mockSelect });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'securePassword123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('should return 400 Bad Request when email or password field is missing or invalid', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Validation Error');
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should return 401 Unauthorized for invalid email or password', async () => {
    const mockSelect = jest.fn().mockResolvedValue(null);
    mockUserFindOne.mockReturnValue({ select: mockSelect });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown@example.com',
        password: 'wrongPassword123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Invalid email or password');
  });
});
