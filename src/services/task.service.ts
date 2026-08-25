import mongoose from 'mongoose';
import { Task, ITaskDocument } from '../models';
import { CreateTaskInput, UpdateTaskInput, TaskQueryFilters } from '../schemas';
import { ApiError } from '../utils/ApiError';
import { ITaskAttachment } from '../types';

export interface PaginatedTasksResult {
  tasks: ITaskDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskService {
  /**
   * Creates a new task associated with the authenticated user, optionally with a file attachment.
   */
  public static async createTask(
    userId: string,
    input: CreateTaskInput,
    attachment?: ITaskAttachment
  ): Promise<ITaskDocument> {
    const task = await Task.create({
      ...input,
      ...(attachment && { attachment }),
      user: userId,
    });

    return task;
  }

  /**
   * Retrieves tasks belonging strictly to the authenticated user with server-side pagination, search, and filtering.
   */
  public static async getUserTasks(
    userId: string,
    filters?: TaskQueryFilters
  ): Promise<PaginatedTasksResult> {
    const page = filters?.page && filters.page >= 1 ? filters.page : 1;
    const limit = filters?.limit && filters.limit >= 1 ? filters.limit : 9;
    const skip = (page - 1) * limit;

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

    const [tasks, total] = await Promise.all([
      Task.find(mongoQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(mongoQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
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
    input: UpdateTaskInput,
    attachment?: ITaskAttachment
  ): Promise<ITaskDocument> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new ApiError(400, 'Invalid task ID format');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { ...input };
    if (attachment) {
      updateData.attachment = attachment;
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { $set: updateData },
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
