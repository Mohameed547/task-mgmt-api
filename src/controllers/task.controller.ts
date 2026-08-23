import { Response } from 'express';
import { TaskService } from '../services';
import { validateTaskQuery } from '../schemas';
import { ApiResponseHelper } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const task = await TaskService.createTask(userId, req.body);

  return ApiResponseHelper.success(
    res,
    201,
    'Task created successfully',
    task
  );
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
  const updatedTask = await TaskService.updateTask(userId, taskId, req.body);

  return ApiResponseHelper.success(
    res,
    200,
    'Task updated successfully',
    updatedTask
  );
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
