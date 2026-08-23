import mongoose from 'mongoose';
import { Task } from '../src/models/task.model';
import { TaskStatus, TaskPriority } from '../src/types';

describe('Task Model Unit Tests', () => {
  const validUserId = new mongoose.Types.ObjectId();

  it('should validate a valid task object successfully', () => {
    const validTaskData = {
      title: 'Complete project documentation',
      description: 'Write comprehensive README and API reference',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2026-12-31'),
      user: validUserId,
    };

    const task = new Task(validTaskData);
    const validationError = task.validateSync();

    expect(validationError).toBeUndefined();
    expect(task.title).toBe('Complete project documentation');
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.user).toEqual(validUserId);
  });

  it('should set default status (TODO) and default priority (MEDIUM) when omitted', () => {
    const minimalTask = new Task({
      title: 'Simple task title',
      user: validUserId,
    });

    const validationError = minimalTask.validateSync();

    expect(validationError).toBeUndefined();
    expect(minimalTask.status).toBe(TaskStatus.TODO);
    expect(minimalTask.priority).toBe(TaskPriority.MEDIUM);
  });

  it('should fail validation when required fields (title, user) are missing', () => {
    const emptyTask = new Task({});
    const validationError = emptyTask.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors.title).toBeDefined();
    expect(validationError?.errors.user).toBeDefined();
  });

  it('should fail validation when an invalid status enum value is provided', () => {
    const invalidStatusTask = new Task({
      title: 'Task with bad status',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: 'INVALID_STATUS' as any,
      user: validUserId,
    });

    const validationError = invalidStatusTask.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors.status).toBeDefined();
    expect(validationError?.errors.status.message).toContain(
      'Invalid task status. Allowed values: TODO, IN_PROGRESS, DONE'
    );
  });

  it('should fail validation when an invalid priority enum value is provided', () => {
    const invalidPriorityTask = new Task({
      title: 'Task with bad priority',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      priority: 'ULTRA_HIGH' as any,
      user: validUserId,
    });

    const validationError = invalidPriorityTask.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors.priority).toBeDefined();
    expect(validationError?.errors.priority.message).toContain(
      'Invalid task priority. Allowed values: LOW, MEDIUM, HIGH'
    );
  });

  it('should properly configure user field reference to User model', () => {
    const userPath = Task.schema.path('user');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = (userPath as any).options;

    expect(options.ref).toBe('User');
    expect(options.required[0]).toBe(true);
    expect(options.index).toBe(true);
  });
});
