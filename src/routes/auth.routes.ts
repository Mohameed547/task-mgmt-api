import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { validateRegisterInput, validateLoginInput } from '../schemas';

const router = Router();

router.post('/register', validateBody(validateRegisterInput), register);
router.post('/login', validateBody(validateLoginInput), login);

export default router;
