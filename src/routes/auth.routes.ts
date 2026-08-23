import { Router } from 'express';
import { register } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { validateRegisterInput } from '../schemas';

const router = Router();

router.post('/register', validateBody(validateRegisterInput), register);

export default router;
