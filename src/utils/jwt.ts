import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { ApiError } from './ApiError';

/**
 * Reusable JWT utility module for signing and verifying JSON Web Tokens.
 */
export class JwtUtils {
  /**
   * Generates a signed JWT token for a given user payload.
   *
   * @param payload - Claims to embed in the token (e.g. userId, email)
   * @returns Signed JWT string
   */
  public static generateToken(payload: { userId: string; email?: string }): string {
    const signOptions: jwt.SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_SECRET, signOptions);
  }

  /**
   * Verifies and decodes a given JWT token.
   *
   * @param token - JWT token string to verify
   * @returns Decoded JwtPayload
   * @throws ApiError if token is invalid or expired
   */
  public static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Authentication token has expired');
      }
      throw new ApiError(401, 'Invalid authentication token');
    }
  }
}
