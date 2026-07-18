import { Router } from 'express';
import { getServices, getService, createService, deleteService, getCategories, getMyServices, getMyStats, getMyAnalytics } from '../controllers/serviceController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createServiceSchema } from '../validators/service';

const router = Router();

router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/me', protect, getMyServices);
router.get('/stats', protect, getMyStats);
router.get('/analytics', protect, getMyAnalytics);
router.get('/:id', getService);
router.post('/', protect, validate(createServiceSchema), createService);
router.delete('/:id', protect, deleteService);

export default router;
