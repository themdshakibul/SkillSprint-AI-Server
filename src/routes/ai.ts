import { Router } from 'express';
import { generateServiceContent, getRecommendations, trackEvent, chatWithAI, analyzeDocument } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/generate-service', protect, generateServiceContent);
router.get('/recommendations', protect, getRecommendations);
router.post('/track', protect, trackEvent);
router.post('/chat', protect, chatWithAI);
router.post('/analyze-document', protect, analyzeDocument);

export default router;
