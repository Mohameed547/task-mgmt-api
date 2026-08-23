import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  validateTaskQuery,
} from '../src/schemas/task.schema';
import { TaskStatus, TaskPriority } from '../src/types';

describe('Task Schema Validation Unit Tests', () => {
  describe('validateCreateTaskInput', () => {
    it('should reject non-object body data', () => {
      const result = validateCreateTaskInput(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body must be a JSON object');
    });

    it('should reject title longer than 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = validateCreateTaskInput({ title: longTitle });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot exceed 100 characters');
    });

    it('should reject non-string description', () => {
      const result = validateCreateTaskInput({ title: 'Valid Title', description: 12345 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be a string');
    });

    it('should reject description longer than 1000 characters', () => {
      const longDesc = 'd'.repeat(1001);
      const result = validateCreateTaskInput({ title: 'Valid Title', description: longDesc });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description cannot exceed 1000 characters');
    });

    it('should reject invalid due date format', () => {
      const result = validateCreateTaskInput({ title: 'Valid Title', dueDate: 'invalid-date-string' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid due date format. Please provide a valid ISO date');
    });

    it('should reject invalid priority enum value', () => {
      const result = validateCreateTaskInput({ title: 'Valid Title', priority: 'INVALID_PRIORITY' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid task priority');
    });
  });

  describe('validateUpdateTaskInput', () => {
    it('should reject non-object body data', () => {
      const result = validateUpdateTaskInput(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body must be a JSON object');
    });

    it('should reject empty object {} for update', () => {
      const result = validateUpdateTaskInput({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one field must be provided to update a task');
    });

    it('should reject empty title string for update', () => {
      const result = validateUpdateTaskInput({ title: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot be empty');
    });

    it('should reject title exceeding 100 characters for update', () => {
      const result = validateUpdateTaskInput({ title: 't'.repeat(101) });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot exceed 100 characters');
    });

    it('should reject non-string description for update', () => {
      const result = validateUpdateTaskInput({ description: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be a string');
    });

    it('should reject description exceeding 1000 characters for update', () => {
      const result = validateUpdateTaskInput({ description: 'x'.repeat(1001) });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description cannot exceed 1000 characters');
    });

    it('should reject invalid status enum for update', () => {
      const result = validateUpdateTaskInput({ status: 'BAD_STATUS' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid task status');
    });

    it('should reject invalid due date format for update', () => {
      const result = validateUpdateTaskInput({ dueDate: 'not-a-date' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid due date format. Please provide a valid ISO date');
    });

    it('should sanitize and accept valid update fields', () => {
      const result = validateUpdateTaskInput({
        title: '  Clean Title  ',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
      });

      expect(result.isValid).toBe(true);
      expect(result.data?.title).toBe('Clean Title');
      expect(result.data?.status).toBe(TaskStatus.DONE);
      expect(result.data?.priority).toBe(TaskPriority.LOW);
    });
  });

  describe('validateTaskQuery', () => {
    it('should reject non-string search query parameter', () => {
      const result = validateTaskQuery({ search: 12345 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search parameter must be a string');
    });

    it('should reject invalid priority query filter', () => {
      const result = validateTaskQuery({ priority: 'SUPER_HIGH' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid priority filter');
    });

    it('should ignore empty search/status/priority strings in query', () => {
      const result = validateTaskQuery({ search: '   ', status: '', priority: '   ' });
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({});
    });
  });
});
