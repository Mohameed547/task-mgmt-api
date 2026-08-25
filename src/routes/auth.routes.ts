import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { validateRegisterInput, validateLoginInput } from '../schemas';

const router = Router();

// Rate limiter for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    status: 'fail',
    message: 'Too many authentication attempts, please try again later.',
  },
});

router.post('/register', authLimiter, validateBody(validateRegisterInput), register);
router.post('/login', authLimiter, validateBody(validateLoginInput), login);
router.get('/me', authenticate, getMe);

export default router;
