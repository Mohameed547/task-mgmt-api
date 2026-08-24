import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Task } from '../src/models/task.model';
import { JwtUtils } from '../src/utils/jwt';
import { uploadToCloudinary, deleteFromCloudinary } from '../src/utils/cloudinary';
import { TaskStatus, TaskPriority } from '../src/types';

jest.mock('../src/models/task.model');
jest.mock('../src/utils/cloudinary');

describe('Task Attachment Feature (POST /api/tasks)', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const taskId = new mongoose.Types.ObjectId().toString();
  const userToken = JwtUtils.generateToken({ userId, email: 'attachment_user@example.com' });

  const mockTaskCreate = Task.create as jest.Mock;
  const mockUploadToCloudinary = uploadToCloudinary as jest.Mock;
  const mockDeleteFromCloudinary = deleteFromCloudinary as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Create task without an attachment still works', async () => {
    const taskData = {
      title: 'Task without file',
      description: 'Standard JSON task creation',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    };

    const mockCreatedTask = {
      _id: taskId,
      ...taskData,
      user: userId,
      toJSON: () => ({ _id: taskId, ...taskData, user: userId }),
    };

    mockTaskCreate.mockResolvedValueOnce(mockCreatedTask);

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(taskData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('_id', taskId);
    expect(response.body.data).not.toHaveProperty('attachment');
    expect(mockUploadToCloudinary).not.toHaveBeenCalled();
  });

  it('2. Authenticated user can create a task with a valid attachment', async () => {
    const mockAttachment = {
      fileName: 'document.pdf',
      fileUrl: 'https://res.cloudinary.com/test/raw/upload/v12345/task-manager/attachments/document.pdf',
      publicId: 'task-manager/attachments/document_123',
      mimeType: 'application/pdf',
      fileSize: 102450,
    };

    const mockCreatedTask = {
      _id: taskId,
      title: 'Task with PDF Attachment',
      description: 'Uploaded via multipart/form-data',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      user: userId,
      attachment: mockAttachment,
      toJSON: () => ({
        _id: taskId,
        title: 'Task with PDF Attachment',
        description: 'Uploaded via multipart/form-data',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        user: userId,
        attachment: mockAttachment,
      }),
    };

    mockUploadToCloudinary.mockResolvedValueOnce(mockAttachment);
    mockTaskCreate.mockResolvedValueOnce(mockCreatedTask);

    const pdfBuffer = Buffer.from('%PDF-1.4 test pdf content');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Task with PDF Attachment')
      .field('description', 'Uploaded via multipart/form-data')
      .field('status', TaskStatus.IN_PROGRESS)
      .field('priority', TaskPriority.HIGH)
      .attach('attachment', pdfBuffer, {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('attachment');
    expect(response.body.data.attachment).toEqual(mockAttachment);
    expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
  });

  it('3. Unauthenticated requests are rejected', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 test content');

    const response = await request(app)
      .post('/api/tasks')
      .field('title', 'Unauthenticated Task')
      .attach('attachment', pdfBuffer, {
        filename: 'doc.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(mockUploadToCloudinary).not.toHaveBeenCalled();
  });

  it('4. Unsupported file types are rejected', async () => {
    const exeBuffer = Buffer.from('MZ executable binary data');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Task with Malicious Executable')
      .attach('attachment', exeBuffer, {
        filename: 'malicious.exe',
        contentType: 'application/x-msdownload',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body.message).toMatch(/Invalid file type/i);
    expect(mockUploadToCloudinary).not.toHaveBeenCalled();
  });

  it('5. Files larger than 5 MB are rejected', async () => {
    // 5.1 MB buffer (5,347,737 bytes > 5,242,880 bytes)
    const oversizedBuffer = Buffer.alloc(5.1 * 1024 * 1024);

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Task with Oversized File')
      .attach('attachment', oversizedBuffer, {
        filename: 'oversized.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body.message).toMatch(/File size cannot exceed 5 MB/i);
    expect(mockUploadToCloudinary).not.toHaveBeenCalled();
  });

  it('6. Cloudinary upload failure is handled correctly', async () => {
    mockUploadToCloudinary.mockRejectedValueOnce(new Error('Cloudinary service connection error'));

    const pdfBuffer = Buffer.from('%PDF-1.4 content');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Task with failing upload')
      .attach('attachment', pdfBuffer, {
        filename: 'doc.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toMatch(/Failed to upload file attachment/i);
    expect(mockTaskCreate).not.toHaveBeenCalled();
  });

  it('7. Database failure after Cloudinary upload attempts Cloudinary cleanup', async () => {
    const mockAttachment = {
      fileName: 'cleanup_test.pdf',
      fileUrl: 'https://res.cloudinary.com/test/raw/upload/v123/cleanup_test.pdf',
      publicId: 'task-manager/attachments/cleanup_public_id_999',
      mimeType: 'application/pdf',
      fileSize: 45000,
    };

    mockUploadToCloudinary.mockResolvedValueOnce(mockAttachment);
    mockTaskCreate.mockRejectedValueOnce(new Error('Database write error'));

    const pdfBuffer = Buffer.from('%PDF-1.4 test');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Task failing DB save')
      .attach('attachment', pdfBuffer, {
        filename: 'cleanup_test.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(500);
    expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
    expect(mockDeleteFromCloudinary).toHaveBeenCalledWith('task-manager/attachments/cleanup_public_id_999');
  });

  it('8. Attachment metadata is saved correctly', async () => {
    const mockAttachment = {
      fileName: 'image.png',
      fileUrl: 'https://res.cloudinary.com/test/image/upload/v1234/image.png',
      publicId: 'task-manager/attachments/image_abc',
      mimeType: 'image/png',
      fileSize: 20480,
    };

    mockUploadToCloudinary.mockResolvedValueOnce(mockAttachment);
    mockTaskCreate.mockImplementationOnce((data) => Promise.resolve({
      _id: taskId,
      ...data,
      toJSON: () => ({ _id: taskId, ...data }),
    }));

    const pngBuffer = Buffer.from('fake png image content');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Metadata Verification Task')
      .attach('attachment', pngBuffer, {
        filename: 'image.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(201);
    expect(mockTaskCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Metadata Verification Task',
        user: userId,
        attachment: mockAttachment,
      })
    );
  });

  it('9. Created task still belongs to the authenticated user identity', async () => {
    const mockAttachment = {
      fileName: 'spec.docx',
      fileUrl: 'https://res.cloudinary.com/test/raw/upload/v123/spec.docx',
      publicId: 'task-manager/attachments/spec_123',
      mimeType: 'application/docx',
      fileSize: 30000,
    };

    mockUploadToCloudinary.mockResolvedValueOnce(mockAttachment);
    mockTaskCreate.mockImplementationOnce((data) => Promise.resolve({
      _id: taskId,
      ...data,
      toJSON: () => ({ _id: taskId, ...data }),
    }));

    const docxBuffer = Buffer.from('fake docx content');

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'User Scoped Task')
      .field('user', 'hacked_other_user_id') // User trying to inject fake user ID
      .attach('attachment', docxBuffer, {
        filename: 'spec.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

    expect(response.status).toBe(201);
    expect(mockTaskCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        user: userId, // Must use authenticated JWT user ID
      })
    );
  });
});
