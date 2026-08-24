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

export interface TaskQueryFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  limit?: number;
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

export const validateTaskQuery = (
  query: Record<string, unknown>
): { isValid: boolean; errors: string[]; data?: TaskQueryFilters } => {
  const errors: string[] = [];
  const filters: TaskQueryFilters = {};

  if (query.search !== undefined && query.search !== null) {
    if (typeof query.search !== 'string') {
      errors.push('Search parameter must be a string');
    } else {
      const trimmedSearch = query.search.trim();
      if (trimmedSearch.length > 0) {
        filters.search = trimmedSearch;
      }
    }
  }

  if (query.status !== undefined && query.status !== null) {
    const statusStr = String(query.status).trim();
    if (statusStr.length > 0) {
      if (!Object.values(TaskStatus).includes(statusStr as TaskStatus)) {
        errors.push(`Invalid status filter. Allowed values: ${Object.values(TaskStatus).join(', ')}`);
      } else {
        filters.status = statusStr as TaskStatus;
      }
    }
  }

  if (query.priority !== undefined && query.priority !== null) {
    const priorityStr = String(query.priority).trim();
    if (priorityStr.length > 0) {
      if (!Object.values(TaskPriority).includes(priorityStr as TaskPriority)) {
        errors.push(`Invalid priority filter. Allowed values: ${Object.values(TaskPriority).join(', ')}`);
      } else {
        filters.priority = priorityStr as TaskPriority;
      }
    }
  }

  // Page validation (Default: 1, Must be a positive integer >= 1)
  if (query.page !== undefined && query.page !== null && String(query.page).trim() !== '') {
    const pageNum = Number(query.page);
    if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    } else {
      filters.page = pageNum;
    }
  } else {
    filters.page = 1;
  }

  // Limit validation (Default: 9, Must be a positive integer >= 1 and <= 50)
  if (query.limit !== undefined && query.limit !== null && String(query.limit).trim() !== '') {
    const limitNum = Number(query.limit);
    if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum < 1) {
      errors.push('Limit must be a positive integer');
    } else if (limitNum > 50) {
      errors.push('Limit cannot exceed maximum of 50');
    } else {
      filters.limit = limitNum;
    }
  } else {
    filters.limit = 9;
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: filters,
  };
};
