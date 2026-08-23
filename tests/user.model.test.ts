import { User } from '../src/models/user.model';

describe('User Model Unit Tests', () => {
  it('should validate a valid user object successfully', async () => {
    const validUserData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'StrongPassword123!',
    };

    const user = new User(validUserData);
    const validationError = user.validateSync();

    expect(validationError).toBeUndefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
  });

  it('should fail validation when required fields are missing', () => {
    const user = new User({});
    const validationError = user.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors.name).toBeDefined();
    expect(validationError?.errors.email).toBeDefined();
    expect(validationError?.errors.password).toBeDefined();
  });

  it('should normalize (trim and lowercase) the email address', () => {
    const rawUserData = {
      name: '  Alice Smith  ',
      email: '   ALICE.SMITH@EXAMPLE.COM   ',
      password: 'password123',
    };

    const user = new User(rawUserData);

    expect(user.email).toBe('alice.smith@example.com');
    expect(user.name).toBe('Alice Smith');
  });

  it('should fail validation for invalid email formats', () => {
    const userWithInvalidEmail = new User({
      name: 'Bob',
      email: 'not-an-email',
      password: 'password123',
    });

    const validationError = userWithInvalidEmail.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors.email).toBeDefined();
    expect(validationError?.errors.email.message).toContain(
      'Please provide a valid email address'
    );
  });

  it('should enforce unique index and lowercase options on email field', () => {
    const emailPath = User.schema.path('email');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = (emailPath as any).options;

    expect(options.unique).toBe(true);
    expect(options.lowercase).toBe(true);
    expect(options.trim).toBe(true);
  });

  it('should enforce select: false on password field to prevent exposure by default', () => {
    const passwordPath = User.schema.path('password');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = (passwordPath as any).options;

    expect(options.select).toBe(false);
  });

  it('should exclude password field when serialized to JSON', () => {
    const user = new User({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'SuperSecretPassword',
    });

    const jsonRepresentation = user.toJSON();

    expect(jsonRepresentation.name).toBe('Charlie');
    expect(jsonRepresentation.email).toBe('charlie@example.com');
    expect(jsonRepresentation.password).toBeUndefined();
  });
});
