import { TaskStatus, TaskPriority } from '../types';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | Date;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | Date;
}

export const validateCreateTaskInput = (
  data: unknown
): { isValid: boolean; errors: string[]; data?: CreateTaskInput } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  const input = data as Partial<CreateTaskInput>;

  // Title validation
  if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.trim().length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  // Description validation
  if (input.description !== undefined && typeof input.description !== 'string') {
    errors.push('Description must be a string');
  } else if (input.description && input.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  // Status validation
  if (input.status !== undefined) {
    if (!Object.values(TaskStatus).includes(input.status as TaskStatus)) {
      errors.push(`Invalid task status. Allowed values: ${Object.values(TaskStatus).join(', ')}`);
    }
  }

  // Priority validation
  if (input.priority !== undefined) {
    if (!Object.values(TaskPriority).includes(input.priority as TaskPriority)) {
      errors.push(`Invalid task priority. Allowed values: ${Object.values(TaskPriority).join(', ')}`);
    }
  }

  // DueDate validation
  if (input.dueDate !== undefined && input.dueDate !== null) {
    const parsedDate = new Date(input.dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid due date format. Please provide a valid ISO date');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      title: input.title!.trim(),
      description: input.description ? input.description.trim() : undefined,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
  };
};

export const validateUpdateTaskInput = (
  data: unknown
): { isValid: boolean; errors: string[]; data?: UpdateTaskInput } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  const input = data as Partial<UpdateTaskInput>;

  if (Object.keys(input).length === 0) {
    return { isValid: false, errors: ['At least one field must be provided to update a task'] };
  }

  // Title validation
  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (input.title.trim().length > 100) {
      errors.push('Title cannot exceed 100 characters');
    }
  }

  // Description validation
  if (input.description !== undefined && typeof input.description !== 'string') {
    errors.push('Description must be a string');
  } else if (input.description && input.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  // Status validation
  if (input.status !== undefined) {
    if (!Object.values(TaskStatus).includes(input.status as TaskStatus)) {
      errors.push(`Invalid task status. Allowed values: ${Object.values(TaskStatus).join(', ')}`);
    }
  }

  // Priority validation
  if (input.priority !== undefined) {
    if (!Object.values(TaskPriority).includes(input.priority as TaskPriority)) {
      errors.push(`Invalid task priority. Allowed values: ${Object.values(TaskPriority).join(', ')}`);
    }
  }

  // DueDate validation
  if (input.dueDate !== undefined && input.dueDate !== null) {
    const parsedDate = new Date(input.dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid due date format. Please provide a valid ISO date');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const sanitizedData: UpdateTaskInput = {};
  if (input.title !== undefined) sanitizedData.title = input.title.trim();
  if (input.description !== undefined) sanitizedData.description = input.description.trim();
  if (input.status !== undefined) sanitizedData.status = input.status;
  if (input.priority !== undefined) sanitizedData.priority = input.priority;
  if (input.dueDate !== undefined) sanitizedData.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;

  return {
    isValid: true,
    errors: [],
    data: sanitizedData,
  };
};
