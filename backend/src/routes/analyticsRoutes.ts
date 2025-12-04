import express from 'express';
import { getDashboardStats, getRevenueAnalytics } from '../controllers/analyticsController';
import { protect, restrictTo } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);

export default router;

