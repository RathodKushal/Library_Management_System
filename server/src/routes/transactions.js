import { Router } from 'express';
import { body } from 'express-validator';
import { getAllTransactions, issueBook, returnBook, getOverdueTransactions, deleteTransaction } from '../controllers/transactionController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllTransactions);
router.get('/overdue', getOverdueTransactions);

router.post('/issue', [
  body('book_id').isInt({ min: 1 }).withMessage('Valid book ID is required.'),
  body('member_id').isInt({ min: 1 }).withMessage('Valid member ID is required.'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date.'),
  validate
], issueBook);

router.post('/return/:id', returnBook);
router.delete('/:id', deleteTransaction);

export default router;
