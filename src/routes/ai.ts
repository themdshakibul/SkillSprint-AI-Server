import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { generateServiceContent, getRecommendations, trackEvent, chatWithAI, analyzeDocument, analyzeUploadedDocument, upload } from '../controllers/aiController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateServiceSchema, chatSchema, analyzeDocSchema, trackEventSchema } from '../validators/ai';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Too many requests, please try again later' },
});

router.post('/generate-service', protect, aiLimiter, validate(generateServiceSchema), generateServiceContent);
router.get('/recommendations', protect, getRecommendations);
router.post('/track', protect, trackEvent);
router.post('/chat', protect, aiLimiter, validate(chatSchema), chatWithAI);
router.post('/analyze-document', protect, aiLimiter, validate(analyzeDocSchema), analyzeDocument);
router.post('/analyze-upload', protect, aiLimiter, upload.single('file'), analyzeUploadedDocument);

export default router;
