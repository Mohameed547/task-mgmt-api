import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;
