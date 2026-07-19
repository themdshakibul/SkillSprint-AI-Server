import { Router } from 'express';
import { createOrder, getMyOrders, getMentorOrders, updateOrderStatus, createCheckoutSession, verifyPayment } from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order';

const router = Router();

router.use(protect);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/me', getMyOrders);
router.get('/mentor', getMentorOrders);
router.get('/verify-payment', verifyPayment);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/create-checkout-session', createCheckoutSession);

export default router;
