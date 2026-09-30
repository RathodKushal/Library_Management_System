import { queryAll, queryOne, run } from '../config/database.js';
import { getPagination, calculateFine, getDefaultDueDate } from '../utils/helpers.js';
import { sendIssueEmail } from '../utils/mailer.js';

export function getAllTransactions(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { status, member_id, book_id, search } = req.query;
    let where = '1=1'; const params = [];
    
    if (status) { where += ' AND t.status = ?'; params.push(status); }
    if (member_id) { where += ' AND t.member_id = ?'; params.push(Number(member_id)); }
    if (book_id) { where += ' AND t.book_id = ?'; params.push(Number(book_id)); }
    
    if (search) {
      where += ' AND (b.title LIKE ? OR m.name LIKE ? OR m.membership_id LIKE ? OR CAST(t.id AS TEXT) LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM transactions t 
      JOIN books b ON t.book_id = b.id 
      JOIN members m ON t.member_id = m.id 
      WHERE ${where}
    `;
    const { total } = queryOne(countQuery, params) || { total: 0 };
    
    const dataQuery = `
      SELECT t.*, 
             b.title as book_title, b.author as book_author, b.isbn as book_isbn, 
             m.name as member_name, m.membership_id as member_membership_id, 
             l.name as librarian_name 
      FROM transactions t 
      JOIN books b ON t.book_id = b.id 
      JOIN members m ON t.member_id = m.id 
      JOIN librarians l ON t.issued_by = l.id 
      WHERE ${where} 
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const transactions = queryAll(dataQuery, [...params, limit, offset]);
    res.json({ success: true, data: transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
}

export function issueBook(req, res, next) {
  try {
    const { book_id, member_id, due_date, notes } = req.body;
    const book = queryOne('SELECT * FROM books WHERE id = ?', [Number(book_id)]);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.available_copies <= 0) return res.status(400).json({ success: false, message: 'No copies available.' });
    
    const member = queryOne('SELECT * FROM members WHERE id = ?', [Number(member_id)]);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (member.status !== 'active') return res.status(400).json({ success: false, message: 'Member account is not active.' });
    
    const existing = queryOne("SELECT id FROM transactions WHERE book_id = ? AND member_id = ? AND status = 'issued'", [Number(book_id), Number(member_id)]);
    if (existing) return res.status(400).json({ success: false, message: 'Member already has this book issued.' });
    
    const { active_count } = queryOne("SELECT COUNT(*) as active_count FROM transactions WHERE member_id = ? AND status = 'issued'", [Number(member_id)]) || { active_count: 0 };
    if (active_count >= 5) return res.status(400).json({ success: false, message: 'Member has reached max 5 active loans.' });

    const issueDueDate = due_date || getDefaultDueDate();
    const result = run("INSERT INTO transactions (book_id, member_id, issued_by, due_date, notes, status) VALUES (?, ?, ?, ?, ?, 'issued')", [Number(book_id), Number(member_id), req.user.id, issueDueDate, notes || null]);
    run('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [Number(book_id)]);
    
    const transaction = queryOne('SELECT t.*, b.title as book_title, b.author as book_author, m.name as member_name, m.membership_id as member_membership_id, l.name as librarian_name FROM transactions t JOIN books b ON t.book_id = b.id JOIN members m ON t.member_id = m.id JOIN librarians l ON t.issued_by = l.id WHERE t.id = ?', [result.lastInsertRowid]);
    
    sendIssueEmail(member.email, {
      studentName: member.name,
      enrollmentNo: member.enrollment_no,
      bookTitle: book.title,
      issueDate: transaction.issue_date,
      dueDate: transaction.due_date
    });

    res.status(201).json({ success: true, message: 'Book issued successfully.', data: transaction });
  } catch (error) { next(error); }
}

export function returnBook(req, res, next) {
  try {
    const transaction = queryOne('SELECT * FROM transactions WHERE id = ?', [Number(req.params.id)]);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (transaction.status !== 'issued') return res.status(400).json({ success: false, message: 'Already returned.' });

    const returnDate = new Date().toISOString();
    const setting = queryOne("SELECT value FROM settings WHERE key = 'daily_fine_amount'");
    const dailyRate = setting ? parseFloat(setting.value) : 1.0;
    const fine = calculateFine(transaction.due_date, returnDate, dailyRate);
    run("UPDATE transactions SET return_date = ?, fine_amount = ?, status = 'returned' WHERE id = ?", [returnDate, fine, Number(req.params.id)]);
    run('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [transaction.book_id]);

    const updated = queryOne('SELECT t.*, b.title as book_title, b.author as book_author, m.name as member_name, m.membership_id as member_membership_id, l.name as librarian_name FROM transactions t JOIN books b ON t.book_id = b.id JOIN members m ON t.member_id = m.id JOIN librarians l ON t.issued_by = l.id WHERE t.id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: fine > 0 ? `Book returned with fine ₹${fine.toFixed(2)}.` : 'Book returned successfully.', data: updated });
  } catch (error) { next(error); }
}

export function getOverdueTransactions(req, res, next) {
  try {
    const transactions = queryAll("SELECT t.*, b.title as book_title, b.author as book_author, m.name as member_name, m.membership_id as member_membership_id, m.email as member_email, m.phone as member_phone, l.name as librarian_name, CAST(julianday('now') - julianday(t.due_date) AS INTEGER) as days_overdue FROM transactions t JOIN books b ON t.book_id = b.id JOIN members m ON t.member_id = m.id JOIN librarians l ON t.issued_by = l.id WHERE t.status = 'issued' AND t.due_date < datetime('now') ORDER BY t.due_date ASC");
    res.json({ success: true, data: transactions, count: transactions.length });
  } catch (error) { next(error); }
}

export function deleteTransaction(req, res, next) {
  try {
    const transaction = queryOne('SELECT * FROM transactions WHERE id = ?', [Number(req.params.id)]);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (transaction.status === 'issued') {
      run('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [transaction.book_id]);
    }
    run('DELETE FROM transactions WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Transaction record deleted.' });
  } catch (error) { next(error); }
}
