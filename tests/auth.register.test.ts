import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/user.model';
import bcrypt from 'bcryptjs';

jest.mock('../src/models/user.model');

describe('POST /api/auth/register Endpoint', () => {
  const mockUserFindOne = User.findOne as jest.Mock;
  const mockUserCreate = User.create as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 201 Created and safe user object on valid registration', async () => {
    mockUserFindOne.mockResolvedValueOnce(null);

    const hashedPassword = await bcrypt.hash('securePassword123', 10);
    const mockCreatedUser = {
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
    };
    mockUserCreate.mockResolvedValueOnce(mockCreatedUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_id', '507f1f77bcf86cd799439011');
    expect(response.body.data).toHaveProperty('name', 'John Doe');
    expect(response.body.data).toHaveProperty('email', 'john@example.com');
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('should return 400 Bad Request when request body has missing or invalid fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: '',
        email: 'invalid-email',
        password: '123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'Validation Error');
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should return 409 Conflict when registering with a duplicate email', async () => {
    mockUserFindOne.mockResolvedValueOnce({
      _id: 'existing_id',
      email: 'john@example.com',
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Duplicate',
        email: 'john@example.com',
        password: 'securePassword123',
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message', 'User with this email already exists');
  });
});
