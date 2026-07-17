import { Router } from 'express';
import { register, login, demoLogin, googleLogin, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo', demoLogin);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
