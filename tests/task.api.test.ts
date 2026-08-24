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

  describe('GET /api/tasks (List & Search & Filter & Paginate Tasks)', () => {
    const mockCountDocuments = Task.countDocuments as jest.Mock;

    it('should return 200 OK with paginated list of tasks owned by authenticated user', async () => {
      const mockTasks = [
        {
          _id: taskId,
          title: 'User A Task',
          user: userAId,
          toJSON: jest.fn().mockReturnValue({ _id: taskId, title: 'User A Task' }),
        },
      ];

      const mockLimit = jest.fn().mockResolvedValueOnce(mockTasks);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/tasks?page=1&limit=9')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        limit: 9,
        total: 1,
        totalPages: 1,
      });
      expect(mockTaskFind).toHaveBeenCalledWith({ user: userAId });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(9);
    });

    it('should filter tasks by title search query parameter with pagination', async () => {
      const mockTasks = [
        {
          _id: taskId,
          title: 'Team Meeting Prep',
          user: userAId,
          toJSON: jest.fn().mockReturnValue({ _id: taskId, title: 'Team Meeting Prep' }),
        },
      ];

      const mockLimit = jest.fn().mockResolvedValueOnce(mockTasks);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/tasks?search=meeting&page=1&limit=9')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        title: { $regex: 'meeting', $options: 'i' },
      });
    });

    it('should filter tasks by status query parameter', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(0);

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
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(mockTaskFind).toHaveBeenCalledWith({
        user: userAId,
        priority: TaskPriority.HIGH,
      });
    });

    it('should support combining search, status, priority, and custom pagination parameters', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(15);

      const response = await request(app)
        .get('/api/tasks?search=meeting&status=DONE&priority=HIGH&page=2&limit=5')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
      expect(mockSkip).toHaveBeenCalledWith(5);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should return 400 Bad Request when invalid page or limit parameters are provided', async () => {
      const response = await request(app)
        .get('/api/tasks?page=0&limit=-5')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.errors).toContain('Page must be a positive integer');
      expect(response.body.errors).toContain('Limit must be a positive integer');
    });

    it('should return 400 Bad Request when limit exceeds maximum limit of 50', async () => {
      const response = await request(app)
        .get('/api/tasks?limit=100')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.errors).toContain('Limit cannot exceed maximum of 50');
    });

    it('should return 200 OK with empty tasks array when page exceeds total pages', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(5);

      const response = await request(app)
        .get('/api/tasks?page=10&limit=9')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tasks).toEqual([]);
      expect(response.body.data.pagination).toEqual({
        page: 10,
        limit: 9,
        total: 5,
        totalPages: 1,
      });
    });

    it('should maintain user isolation even when search query matches tasks owned by other users', async () => {
      const mockLimit = jest.fn().mockResolvedValueOnce([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockTaskFind.mockReturnValueOnce({ sort: mockSort });
      mockCountDocuments.mockResolvedValueOnce(0);

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
