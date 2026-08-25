import { Response } from 'express';
import { TaskService } from '../services';
import { validateTaskQuery } from '../schemas';
import { ApiResponseHelper } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { AuthenticatedRequest, ITaskAttachment } from '../types';

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  let attachment: ITaskAttachment | undefined;

  // Upload to Cloudinary if file attachment is attached
  if (req.file) {
    try {
      attachment = await uploadToCloudinary(req.file);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Cloudinary file upload failed';
      throw new ApiError(500, `Failed to upload file attachment: ${errorMessage}`);
    }
  }

  try {
    const task = await TaskService.createTask(userId, req.body, attachment);

    return ApiResponseHelper.success(
      res,
      201,
      'Task created successfully',
      task
    );
  } catch (err) {
    // If DB task creation fails after a successful Cloudinary upload, delete the uploaded asset to avoid orphaned files
    if (attachment?.publicId) {
      try {
        await deleteFromCloudinary(attachment.publicId);
      } catch (cleanupErr) {
        // Log cleanup error silently without overriding primary error
      }
    }
    throw err;
  }
});

export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const queryValidation = validateTaskQuery(req.query as Record<string, unknown>);
  if (!queryValidation.isValid) {
    throw new ApiError(400, 'Validation Error', queryValidation.errors);
  }

  const tasks = await TaskService.getUserTasks(userId, queryValidation.data);

  return ApiResponseHelper.success(
    res,
    200,
    'Tasks retrieved successfully',
    tasks
  );
});

export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const taskId = req.params.id;
  const task = await TaskService.getTaskById(userId, taskId);

  return ApiResponseHelper.success(
    res,
    200,
    'Task retrieved successfully',
    task
  );
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const taskId = req.params.id;
  let attachment: ITaskAttachment | undefined;

  // Upload to Cloudinary if file attachment is attached during edit
  if (req.file) {
    try {
      attachment = await uploadToCloudinary(req.file);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Cloudinary file upload failed';
      throw new ApiError(500, `Failed to upload file attachment: ${errorMessage}`);
    }
  }

  try {
    const updatedTask = await TaskService.updateTask(userId, taskId, req.body, attachment);

    return ApiResponseHelper.success(
      res,
      200,
      'Task updated successfully',
      updatedTask
    );
  } catch (err) {
    if (attachment?.publicId) {
      try {
        await deleteFromCloudinary(attachment.publicId);
      } catch (cleanupErr) {
        // Log cleanup error
      }
    }
    throw err;
  }
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const taskId = req.params.id;
  await TaskService.deleteTask(userId, taskId);

  return ApiResponseHelper.success(
    res,
    200,
    'Task deleted successfully'
  );
});
