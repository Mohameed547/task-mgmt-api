import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Task } from '../src/models/task.model';
import { JwtUtils } from '../src/utils/jwt';
import { TaskStatus, TaskPriority } from '../src/types';

jest.mock('../src/models/task.model');

describe('Task API Endpoints (/api/tasks)', () => {
  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  const taskId = new mongoose.Types.ObjectId().toString();

  const userAToken = JwtUtils.generateToken({ userId: userAId, email: 'usera@example.com' });
  const userBToken = JwtUtils.generateToken({ userId: userBId, email: 'userb@example.com' });

  const mockTaskCreate = Task.create as jest.Mock;
  const mockTaskFind = Task.find as jest.Mock;
  const mockTaskFindOne = Task.findOne as jest.Mock;
  const mockTaskFindOneAndUpdate = Task.findOneAndUpdate as jest.Mock;
  const mockTaskFindOneAndDelete = Task.findOneAndDelete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated Access Controls', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Authentication token is required');
    });
  });

  describe('POST /api/tasks (Create Task)', () => {
    it('should create a new task for authenticated user and return 201 Created', async () => {
      const taskData = {
        title: 'Design API Endpoints',
        description: 'Create RESTful routes for task CRUD',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      };

      const mockCreatedTask = {
        _id: taskId,
        ...taskData,
        user: userAId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        toJSON: jest.fn().mockReturnValue({
          _id: taskId,
          ...taskData,
          user: userAId,
        }),
      };

      mockTaskCreate.mockResolvedValueOnce(mockCreatedTask);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Task created successfully');
      expect(response.body.data).toHaveProperty('_id', taskId);
      expect(response.body.data).toHaveProperty('title', 'Design API Endpoints');
    });

    it('should return 400 Bad Request when mandatory title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          description: 'Missing title',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Validation Error');
      expect(response.body.errors).toContain('Title is required');
    });

    it('should return 400 Bad Request when status enum is invalid', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Valid title',
          status: 'INVALID_ENUM_VALUE',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.errors[0]).toContain('Invalid task status');
    });
  });

  describe('GET /api/tasks (List & Search & Filter Tasks)', () => {
    it('should return 200 OK with list of tasks owned by authenticated user', async () => {
      const mockTasks = [
        {
          _id: taskId,
          title: 'User A Task',
          user: userAId,
          toJSON: jest.fn().mockReturnValue({ _id: taskId, title: 'User A Task' }),
        },
      ];

      const mockSort = jest.fn().mockResolvedValueOnce(mockTasks);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveLength(1);
      expect(mockTaskFind).toHaveBeenCalledWith({ user: userAId });
    });

    it('should filter tasks by title search query parameter', async () => {
      const mockTasks = [
        {
          _id: taskId,
          title: 'Team Meeting Prep',
          user: userAId,
          toJSON: jest.fn().mockReturnValue({ _id: taskId, title: 'Team Meeting Prep' }),
        },
      ];

      const mockSort = jest.fn().mockResolvedValueOnce(mockTasks);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      const response = await request(app)
        .get('/api/tasks?search=meeting')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        title: { $regex: 'meeting', $options: 'i' },
      });
    });

    it('should filter tasks by status query parameter', async () => {
      const mockSort = jest.fn().mockResolvedValueOnce([]);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      const response = await request(app)
        .get('/api/tasks?status=TODO')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        status: TaskStatus.TODO,
      });
    });

    it('should filter tasks by priority query parameter', async () => {
      const mockSort = jest.fn().mockResolvedValueOnce([]);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      const response = await request(app)
        .get('/api/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        priority: TaskPriority.HIGH,
      });
    });

    it('should support combining search, status, and priority parameters', async () => {
      const mockSort = jest.fn().mockResolvedValueOnce([]);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      const response = await request(app)
        .get('/api/tasks?search=meeting&status=DONE&priority=HIGH')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        title: { $regex: 'meeting', $options: 'i' },
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
      });
    });

    it('should return 200 OK with empty array [] when no tasks match query criteria', async () => {
      const mockSort = jest.fn().mockResolvedValueOnce([]);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      const response = await request(app)
        .get('/api/tasks?search=nonexistentterm')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 Bad Request when an invalid status query parameter is provided', async () => {
      const response = await request(app)
        .get('/api/tasks?status=INVALID_STATUS')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Validation Error');
    });

    it('should maintain user isolation even when search query matches tasks owned by other users', async () => {
      const mockSort = jest.fn().mockResolvedValueOnce([]);
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });

      await request(app)
        .get('/api/tasks?search=common')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userBId,
        title: { $regex: 'common', $options: 'i' },
      });
    });
  });

  describe('GET /api/tasks/:id (Get Single Task)', () => {
    it('should return 200 OK with single task when requested by owner', async () => {
      const mockTask = {
        _id: taskId,
        title: 'Task Details',
        user: userAId,
        toJSON: jest.fn().mockReturnValue({ _id: taskId, title: 'Task Details' }),
      };

      mockTaskFindOne.mockResolvedValueOnce(mockTask);

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('_id', taskId);
      expect(mockTaskFindOne).toHaveBeenCalledWith({ _id: taskId, user: userAId });
    });

    it('should return 404 Not Found when userB attempts to access userA task', async () => {
      mockTaskFindOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Task not found');
      expect(mockTaskFindOne).toHaveBeenCalledWith({ _id: taskId, user: userBId });
    });

    it('should return 400 Bad Request when task ID format is invalid', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Invalid task ID format');
    });
  });

  describe('PATCH /api/tasks/:id (Update Task)', () => {
    it('should update task and return 200 OK when requested by owner', async () => {
      const updatePayload = { title: 'Updated Title' };
      const mockUpdatedTask = {
        _id: taskId,
        title: 'Updated Title',
        user: userAId,
        toJSON: jest.fn().mockReturnValue({ _id: taskId, title: 'Updated Title' }),
      };

      mockTaskFindOneAndUpdate.mockResolvedValueOnce(mockUpdatedTask);

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('title', 'Updated Title');
      expect(mockTaskFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user: userAId },
        { $set: updatePayload },
        { new: true, runValidators: true }
      );
    });

    it('should return 404 Not Found when userB attempts to update userA task', async () => {
      mockTaskFindOneAndUpdate.mockResolvedValueOnce(null);

      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked Title' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Task not found');
      expect(mockTaskFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user: userBId },
        { $set: { title: 'Hacked Title' } },
        { new: true, runValidators: true }
      );
    });
  });

  describe('DELETE /api/tasks/:id (Delete Task)', () => {
    it('should delete task and return 200 OK when requested by owner', async () => {
      mockTaskFindOneAndDelete.mockResolvedValueOnce({ _id: taskId, user: userAId });

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Task deleted successfully');
      expect(mockTaskFindOneAndDelete).toHaveBeenCalledWith({ _id: taskId, user: userAId });
    });

    it('should return 404 Not Found when userB attempts to delete userA task', async () => {
      mockTaskFindOneAndDelete.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Task not found');
      expect(mockTaskFindOneAndDelete).toHaveBeenCalledWith({ _id: taskId, user: userBId });
    });
  });
});
