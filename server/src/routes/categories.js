import { Router } from 'express';
import { body } from 'express-validator';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Category name is required.'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color.'),
  validate
], createCategory);

router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty.'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color.'),
  validate
], updateCategory);

router.delete('/:id', deleteCategory);

export default router;
