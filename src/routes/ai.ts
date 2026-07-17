import { Router } from 'express';
import { generateServiceContent, getRecommendations, trackEvent } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/generate-service', protect, generateServiceContent);
router.get('/recommendations', protect, getRecommendations);
router.post('/track', protect, trackEvent);

export default router;
