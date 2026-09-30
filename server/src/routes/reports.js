import { Router } from 'express';
import { getDashboardStats, getPopularBooks, getActiveMembers, getMonthlyStats, getCategoryDistribution } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/popular-books', getPopularBooks);
router.get('/active-members', getActiveMembers);
router.get('/monthly-stats', getMonthlyStats);
router.get('/category-distribution', getCategoryDistribution);

export default router;
