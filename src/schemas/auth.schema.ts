export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const validateRegisterInput = (data: unknown): { isValid: boolean; errors: string[]; data?: RegisterInput } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  const input = data as Partial<RegisterInput>;

  // Name validation
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (input.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (input.name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  // Email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!input.email || typeof input.email !== 'string' || input.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!emailRegex.test(input.email.trim())) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!input.password || typeof input.password !== 'string') {
    errors.push('Password is required');
  } else if (input.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name: input.name!.trim(),
      email: input.email!.trim().toLowerCase(),
      password: input.password!,
    },
  };
};
