import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getPendingServices,
  getAllServices,
  approveService,
  rejectService,
  getUsers,
  deleteUser,
  getDashboardStats,
} from '../controllers/adminController';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/services/pending', getPendingServices);
router.get('/services', getAllServices);
router.patch('/services/:id/approve', approveService);
router.delete('/services/:id/reject', rejectService);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

export default router;