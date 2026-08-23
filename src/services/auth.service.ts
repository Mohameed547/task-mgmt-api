import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models';
import { RegisterInput } from '../schemas';
import { ApiError } from '../utils/ApiError';

export class AuthService {
  /**
   * Registers a new user account.
   *
   * @param input - Validated registration details (name, email, password)
   * @returns Safe user representation without sensitive fields
   */
  public static async registerUser(input: RegisterInput): Promise<Partial<IUserDocument>> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check for existing user account to prevent duplicates
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash the password securely using bcrypt
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user in the database
    const newUser = await User.create({
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Convert document to a plain JavaScript object (triggers toObject sanitization)
    const userObject = newUser.toObject();

    return userObject;
  }
}
