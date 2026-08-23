import mongoose from 'mongoose';
import { Task, ITaskDocument } from '../models';
import { CreateTaskInput, UpdateTaskInput, TaskQueryFilters } from '../schemas';
import { ApiError } from '../utils/ApiError';

export class TaskService {
  /**
   * Creates a new task associated with the authenticated user.
   */
  public static async createTask(userId: string, input: CreateTaskInput): Promise<ITaskDocument> {
    const task = await Task.create({
      ...input,
      user: userId,
    });

    return task;
  }

  /**
   * Retrieves all tasks belonging strictly to the authenticated user with optional search and filtering.
   */
  public static async getUserTasks(
    userId: string,
    filters?: TaskQueryFilters
  ): Promise<ITaskDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mongoQuery: Record<string, any> = { user: userId };

    if (filters?.status) {
      mongoQuery.status = filters.status;
    }

    if (filters?.priority) {
      mongoQuery.priority = filters.priority;
    }

    if (filters?.search) {
      // Escape special regex syntax characters to prevent regex injection attacks
      const safeSearch = filters.search.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
      mongoQuery.title = { $regex: safeSearch, $options: 'i' };
    }

    const tasks = await Task.find(mongoQuery).sort({ createdAt: -1 });
    return tasks;
  }

  /**
   * Retrieves a single task by ID owned by the authenticated user.
   */
  public static async getTaskById(userId: string, taskId: string): Promise<ITaskDocument> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return task;
  }

  /**
   * Updates a single task by ID owned by the authenticated user.
   */
  public static async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<ITaskDocument> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      throw new ApiError(404, 'Task not found');
    }

    return updatedTask;
  }

  /**
   * Deletes a single task by ID owned by the authenticated user.
   */
  public static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    const deletedTask = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (!deletedTask) {
      throw new ApiError(404, 'Task not found');
    }
  }
}
