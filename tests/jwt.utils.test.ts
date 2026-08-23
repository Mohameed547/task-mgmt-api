import jwt from 'jsonwebtoken';
import { JwtUtils } from '../src/utils/jwt';
import { env } from '../src/config/env';
import { ApiError } from '../src/utils/ApiError';

describe('JwtUtils Utility Module', () => {
  const samplePayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
  };

  it('should generate a valid signed JWT string', () => {
    const token = JwtUtils.generateToken(samplePayload);

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('should successfully verify and decode a valid token', () => {
    const token = JwtUtils.generateToken(samplePayload);
    const decoded = JwtUtils.verifyToken(token);

    expect(decoded).toHaveProperty('userId', '507f1f77bcf86cd799439011');
    expect(decoded).toHaveProperty('email', 'test@example.com');
    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
  });

  it('should throw 401 ApiError for an invalid or tampered token', () => {
    const invalidToken = 'invalid.jwt.tokenstring';

    try {
      JwtUtils.verifyToken(invalidToken);
      fail('Expected verifyToken to throw ApiError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid authentication token');
    }
  });

  it('should throw 401 ApiError when token is expired', () => {
    const expiredToken = jwt.sign(samplePayload, env.JWT_SECRET, { expiresIn: '-1s' });

    try {
      JwtUtils.verifyToken(expiredToken);
      fail('Expected verifyToken to throw ApiError for expired token');
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication token has expired');
    }
  });
});
