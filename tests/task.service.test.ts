import mongoose from 'mongoose';
import { TaskService } from '../src/services/task.service';
import { Task } from '../src/models/task.model';
import { TaskStatus, TaskPriority } from '../src/types';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/task.model');

describe('TaskService Unit Tests', () => {
  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  const taskId = new mongoose.Types.ObjectId().toString();

  const mockTaskCreate = Task.create as jest.Mock;
  const mockTaskFind = Task.find as jest.Mock;
  const mockTaskFindOne = Task.findOne as jest.Mock;
  const mockTaskFindOneAndUpdate = Task.findOneAndUpdate as jest.Mock;
  const mockTaskFindOneAndDelete = Task.findOneAndDelete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should successfully create a task for the authenticated user', async () => {
      const input = {
        title: 'New Task Title',
        description: 'Task description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      };

      const expectedCreatedTask = {
        _id: taskId,
        ...input,
        user: userAId,
      };

      mockTaskCreate.mockResolvedValueOnce(expectedCreatedTask);

      const result = await TaskService.createTask(userAId, input);

      expect(mockTaskCreate).toHaveBeenCalledWith({
        ...input,
        user: userAId,
      });
      expect(result).toEqual(expectedCreatedTask);
    });
  });

  describe('getUserTasks with Search, Pagination, and Filters', () => {
    const mockCountDocuments = Task.countDocuments as jest.Mock;

    it('should retrieve paginated tasks for userA with default page=1 and limit=9', async () => {
      const mockTasks = [
        { _id: taskId, title: 'User A Task 1', user: userAId },
        { _id: new mongoose.Types.ObjectId().toString(), title: 'User A Task 2', user: userAId },
      ];

      const mockLimit = jest.fn().mockResolvedValueOnce(mockTasks);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(25);

      const result = await TaskService.getUserTasks(userAId);

      expect(mockTaskFind).toHaveBeenCalledWith({ user: userAId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(9);
      expect(mockCountDocuments).toHaveBeenCalledWith({ user: userAId });

      expect(result).toEqual({
        tasks: mockTasks,
        pagination: {
          page: 1,
          limit: 9,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it('should calculate skip correctly when custom page and limit are provided', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(20);

      const result = await TaskService.getUserTasks(userAId, { page: 3, limit: 5 });

      expect(mockSkip).toHaveBeenCalledWith(10); // (3 - 1) * 5
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 20,
        totalPages: 4,
      });
    });

    it('should query MongoDB with escaped regex when search filter is provided', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(0);

      await TaskService.getUserTasks(userAId, { search: 'meeting (team)' });

      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        title: { $regex: 'meeting \\(team\\)', $options: 'i' },
      });
    });

    it('should query MongoDB with status filter when status is provided', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(0);

      await TaskService.getUserTasks(userAId, { status: TaskStatus.IN_PROGRESS });

      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        status: TaskStatus.IN_PROGRESS,
      });
    });

    it('should query MongoDB with priority filter when priority is provided', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(0);

      await TaskService.getUserTasks(userAId, { priority: TaskPriority.HIGH });

      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        priority: TaskPriority.HIGH,
      });
    });

    it('should combine search, status, priority, and pagination in MongoDB query', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(12);

      await TaskService.getUserTasks(userAId, {
        search: 'urgent',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        page: 2,
        limit: 5,
      });

      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        title: { $regex: 'urgent', $options: 'i' },
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      });
      expect(mockSkip).toHaveBeenCalledWith(5);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });

  describe('getTaskById', () => {
    it('should return task when requested by owner', async () => {
      const mockTask = { _id: taskId, title: 'Task Title', user: userAId };
      mockTaskFindOne.mockResolvedValueOnce(mockTask);

      const result = await TaskService.getTaskById(userAId, taskId);

      expect(mockTaskFindOne).toHaveBeenCalledWith({ _id: taskId, user: userAId });
      expect(result).toEqual(mockTask);
    });

    it('should throw 404 when userB tries to get userA task', async () => {
      mockTaskFindOne.mockResolvedValueOnce(null);

      try {
        await TaskService.getTaskById(userBId, taskId);
        fail('Expected getTaskById to throw ApiError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Task not found');
      }
    });

    it('should throw 400 when task ID format is invalid', async () => {
      try {
        await TaskService.getTaskById(userAId, 'invalid-task-id');
        fail('Expected getTaskById to throw ApiError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid task ID format');
      }
    });
  });

  describe('updateTask', () => {
    it('should update task when requested by owner', async () => {
      const input = { title: 'Updated Title' };
      const mockUpdatedTask = { _id: taskId, title: 'Updated Title', user: userAId };

      mockTaskFindOneAndUpdate.mockResolvedValueOnce(mockUpdatedTask);

      const result = await TaskService.updateTask(userAId, taskId, input);

      expect(mockTaskFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user: userAId },
        { $set: input },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should throw 404 when userB tries to update userA task', async () => {
      mockTaskFindOneAndUpdate.mockResolvedValueOnce(null);

      try {
        await TaskService.updateTask(userBId, taskId, { title: 'Unauthorized update' });
        fail('Expected updateTask to throw ApiError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Task not found');
      }
    });
  });

  describe('deleteTask', () => {
    it('should delete task when requested by owner', async () => {
      mockTaskFindOneAndDelete.mockResolvedValueOnce({ _id: taskId, user: userAId });

      await TaskService.deleteTask(userAId, taskId);

      expect(mockTaskFindOneAndDelete).toHaveBeenCalledWith({ _id: taskId, user: userAId });
    });

    it('should throw 404 when userB tries to delete userA task', async () => {
      mockTaskFindOneAndDelete.mockResolvedValueOnce(null);

      try {
        await TaskService.deleteTask(userBId, taskId);
        fail('Expected deleteTask to throw ApiError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Task not found');
      }
    });
  });
});
