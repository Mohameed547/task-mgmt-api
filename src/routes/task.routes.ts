import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { validateCreateTaskInput, validateUpdateTaskInput } from '../schemas';

const router = Router();

// Protect all task endpoints with JWT authentication middleware
router.use(authenticate);

router.post('/', validateBody(validateCreateTaskInput), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.patch('/:id', validateBody(validateUpdateTaskInput), updateTask);
router.delete('/:id', deleteTask);

export default router;
