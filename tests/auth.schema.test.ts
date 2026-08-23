import {
  validateRegisterInput,
  validateLoginInput,
} from '../src/schemas/auth.schema';

describe('Auth Schema Validation Unit Tests', () => {
  describe('validateRegisterInput', () => {
    it('should reject non-object body data', () => {
      const result = validateRegisterInput(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body must be a JSON object');
    });

    it('should reject name shorter than 2 characters or longer than 50 characters', () => {
      const shortNameResult = validateRegisterInput({ name: 'A', email: 'test@example.com', password: 'password123' });
      expect(shortNameResult.isValid).toBe(false);
      expect(shortNameResult.errors).toContain('Name must be at least 2 characters long');

      const longNameResult = validateRegisterInput({ name: 'N'.repeat(51), email: 'test@example.com', password: 'password123' });
      expect(longNameResult.isValid).toBe(false);
      expect(longNameResult.errors).toContain('Name cannot exceed 50 characters');
    });

    it('should reject invalid email format', () => {
      const result = validateRegisterInput({ name: 'John Doe', email: 'not-an-email', password: 'password123' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please provide a valid email address');
    });

    it('should reject password shorter than 6 characters or longer than 100 characters', () => {
      const shortPassResult = validateRegisterInput({ name: 'John Doe', email: 'test@example.com', password: '123' });
      expect(shortPassResult.isValid).toBe(false);
      expect(shortPassResult.errors).toContain('Password must be at least 6 characters long');

      const longPassResult = validateRegisterInput({ name: 'John Doe', email: 'test@example.com', password: 'P'.repeat(101) });
      expect(longPassResult.isValid).toBe(false);
      expect(longPassResult.errors).toContain('Password cannot exceed 100 characters');
    });
  });

  describe('validateLoginInput', () => {
    it('should reject non-object body data', () => {
      const result = validateLoginInput(12345);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body must be a JSON object');
    });

    it('should reject missing email or password', () => {
      const result = validateLoginInput({ email: '', password: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
      expect(result.errors).toContain('Password is required');
    });

    it('should reject invalid email format during login', () => {
      const result = validateLoginInput({ email: 'bad-email-format', password: 'password123' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please provide a valid email address');
    });
  });
});
