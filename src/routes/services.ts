import { Router } from 'express';
import { getServices, getService, createService, deleteService, getCategories } from '../controllers/serviceController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/:id', getService);
router.post('/', protect, createService);
router.delete('/:id', protect, deleteService);

export default router;
