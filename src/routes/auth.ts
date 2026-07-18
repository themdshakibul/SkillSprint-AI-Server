import { Router } from 'express';
import { register, login, demoLogin, googleLogin, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, googleLoginSchema } from '../validators/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo', demoLogin);
router.post('/google', validate(googleLoginSchema), googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
