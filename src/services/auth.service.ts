import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models';
import { RegisterInput, LoginInput } from '../schemas';
import { AuthResponseData } from '../types';
import { ApiError } from '../utils/ApiError';
import { JwtUtils } from '../utils/jwt';

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

  /**
   * Authenticates a user with email and password and returns a JWT token.
   *
   * @param input - Validated login credentials (email, password)
   * @returns Authentication data object containing safe user object and JWT token
   */
  public static async loginUser(input: LoginInput): Promise<AuthResponseData> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Retrieve user and explicitly include password field for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !user.password) {
      // Use generic security message to prevent user enumeration
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify candidate password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate signed JWT token with minimal necessary claims
    const token = JwtUtils.generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Convert user document to object (automatically strips password via schema transform)
    const safeUser = user.toObject();

    return {
      user: safeUser,
      token,
    };
  }
}
