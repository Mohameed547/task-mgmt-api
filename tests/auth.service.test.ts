import bcrypt from 'bcryptjs';
import { AuthService } from '../src/services/auth.service';
import { User } from '../src/models/user.model';

jest.mock('../src/models/user.model');
jest.mock('bcryptjs');

describe('AuthService - registerUser', () => {
  const mockUserFindOne = User.findOne as jest.Mock;
  const mockUserCreate = User.create as jest.Mock;
  const mockBcryptHash = bcrypt.hash as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully hash password and create user when email is not duplicate', async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockBcryptHash.mockResolvedValue('$2a$10$hashedpasswordstring');

    const fakeUserDoc = {
      _id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2a$10$hashedpasswordstring',
      toObject: jest.fn().mockReturnValue({
        _id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    };
    mockUserCreate.mockResolvedValue(fakeUserDoc);

    const input = {
      name: '  John Doe  ',
      email: '  JOHN@EXAMPLE.COM  ',
      password: 'securePassword123',
    };

    const result = await AuthService.registerUser(input);

    expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(mockBcryptHash).toHaveBeenCalledWith('securePassword123', 10);
    expect(mockUserCreate).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2a$10$hashedpasswordstring',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).toEqual({
      _id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should throw ApiError with 409 status if user email already exists', async () => {
    mockUserFindOne.mockResolvedValue({ _id: 'existing_user_id', email: 'john@example.com' });

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123',
    };

    try {
      await AuthService.registerUser(input);
      fail('Expected registerUser to throw ApiError');
    } catch (error: any) {
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('User with this email already exists');
    }

    expect(mockUserCreate).not.toHaveBeenCalled();
  });
});
