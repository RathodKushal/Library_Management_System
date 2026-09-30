import express from 'express';
import { getSettings, updateSettings, resetFines } from '../controllers/settingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getSettings);
router.put('/', authorize('admin'), updateSettings);
router.post('/reset-fines', authorize('admin'), resetFines);

export default router;
