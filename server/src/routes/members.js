import { Router } from 'express';
import { body } from 'express-validator';
import { getAllMembers, getMemberById, createMember, updateMember, deleteMember } from '../controllers/memberController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllMembers);
router.get('/:id', getMemberById);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('phone').optional().trim(),
  validate
], createMember);

router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status.'),
  validate
], updateMember);

router.delete('/:id', deleteMember);

export default router;
