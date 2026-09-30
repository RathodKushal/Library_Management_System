import { queryAll, queryOne, run } from '../config/database.js';
import { getPagination } from '../utils/helpers.js';

export function getAllBooks(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { category_id, search } = req.query;

    let where = '1=1';
    const params = [];
    if (category_id) { where += ' AND b.category_id = ?'; params.push(Number(category_id)); }
    if (search) {
      where += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
      const s = `%${search}%`; params.push(s, s, s);
    }

    const countRow = queryOne(`SELECT COUNT(*) as total FROM books b WHERE ${where}`, params);
    const total = countRow?.total || 0;
    const books = queryAll(`SELECT b.*, c.name as category_name, c.color as category_color FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);

    res.json({ success: true, data: books, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
}

export function getBookById(req, res, next) {
  try {
    const book = queryOne('SELECT b.*, c.name as category_name, c.color as category_color FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?', [Number(req.params.id)]);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    const transactions = queryAll('SELECT t.*, m.name as member_name, l.name as librarian_name FROM transactions t JOIN members m ON t.member_id = m.id JOIN librarians l ON t.issued_by = l.id WHERE t.book_id = ? ORDER BY t.created_at DESC LIMIT 10', [Number(req.params.id)]);
    res.json({ success: true, data: { ...book, transactions } });
  } catch (error) { next(error); }
}

export function createBook(req, res, next) {
  try {
    const { title, author, isbn, category_id, publisher, year, total_copies, description, cover_image } = req.body;
    const copies = total_copies || 1;
    const result = run('INSERT INTO books (title, author, isbn, category_id, publisher, year, total_copies, available_copies, description, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, author, isbn || null, category_id || null, publisher || null, year || null, copies, copies, description || null, cover_image || null]);
    const book = queryOne('SELECT b.*, c.name as category_name, c.color as category_color FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Book added successfully.', data: book });
  } catch (error) { next(error); }
}

export function updateBook(req, res, next) {
  try {
    const existing = queryOne('SELECT * FROM books WHERE id = ?', [Number(req.params.id)]);
    if (!existing) return res.status(404).json({ success: false, message: 'Book not found.' });
    const { title, author, isbn, category_id, publisher, year, total_copies, description, cover_image } = req.body;
    let newAvailable = existing.available_copies;
    if (total_copies !== undefined && total_copies !== existing.total_copies) {
      newAvailable = Math.max(0, existing.available_copies + (total_copies - existing.total_copies));
    }
    run('UPDATE books SET title=COALESCE(?,title), author=COALESCE(?,author), isbn=COALESCE(?,isbn), category_id=COALESCE(?,category_id), publisher=COALESCE(?,publisher), year=COALESCE(?,year), total_copies=COALESCE(?,total_copies), available_copies=?, description=COALESCE(?,description), cover_image=COALESCE(?,cover_image), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title ?? null, author ?? null, isbn ?? null, category_id ?? null, publisher ?? null, year ?? null, total_copies ?? null, newAvailable, description ?? null, cover_image ?? null, Number(req.params.id)]);
    const book = queryOne('SELECT b.*, c.name as category_name, c.color as category_color FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Book updated successfully.', data: book });
  } catch (error) { next(error); }
}

export function deleteBook(req, res, next) {
  try {
    const book = queryOne('SELECT * FROM books WHERE id = ?', [Number(req.params.id)]);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    const active = queryOne("SELECT id FROM transactions WHERE book_id = ? AND status = 'issued'", [Number(req.params.id)]);
    if (active) return res.status(400).json({ success: false, message: 'Cannot delete book with active loans.' });
    run('DELETE FROM books WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Book deleted successfully.' });
  } catch (error) { next(error); }
}

export function searchBooks(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    const s = `%${q.trim()}%`;
    const books = queryAll('SELECT b.*, c.name as category_name, c.color as category_color FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? ORDER BY b.title ASC LIMIT 20', [s, s, s]);
    res.json({ success: true, data: books, count: books.length });
  } catch (error) { next(error); }
}
