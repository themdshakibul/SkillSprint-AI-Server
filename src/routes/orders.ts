import { Router } from 'express';
import { createOrder, getMyOrders, getMentorOrders, updateOrderStatus } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/me', getMyOrders);
router.get('/mentor', getMentorOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
