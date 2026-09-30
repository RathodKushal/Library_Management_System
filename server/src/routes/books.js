import { Router } from 'express';
import { body } from 'express-validator';
import { getAllBooks, getBookById, createBook, updateBook, deleteBook, searchBooks } from '../controllers/bookController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Search must come before :id route
router.get('/search', searchBooks);

router.get('/', getAllBooks);
router.get('/:id', getBookById);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('author').trim().notEmpty().withMessage('Author is required.'),
  body('total_copies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1.'),
  body('year').optional().isInt({ min: 1000, max: 2100 }).withMessage('Invalid year.'),
  validate
], createBook);

router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty.'),
  body('total_copies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1.'),
  validate
], updateBook);

router.delete('/:id', deleteBook);

export default router;
