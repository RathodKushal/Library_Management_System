import { queryAll, queryOne } from '../config/database.js';

export function getDashboardStats(req, res, next) {
  try {
    const totalBooks = queryOne('SELECT COUNT(*) as count FROM books')?.count || 0;
    const totalMembers = queryOne('SELECT COUNT(*) as count FROM members')?.count || 0;
    const activeMembers = queryOne("SELECT COUNT(*) as count FROM members WHERE status = 'active'")?.count || 0;
    const totalCategories = queryOne('SELECT COUNT(*) as count FROM categories')?.count || 0;
    const totalTransactions = queryOne('SELECT COUNT(*) as count FROM transactions')?.count || 0;
    const activeIssues = queryOne("SELECT COUNT(*) as count FROM transactions WHERE status = 'issued'")?.count || 0;
    const overdueBooks = queryOne("SELECT COUNT(*) as count FROM transactions WHERE status = 'issued' AND due_date < datetime('now')")?.count || 0;
    const totalFines = queryOne('SELECT COALESCE(SUM(fine_amount), 0) as total FROM transactions')?.total || 0;

    const thresholdSetting = queryOne("SELECT value FROM settings WHERE key = 'low_stock_threshold'");
    const threshold = thresholdSetting ? parseInt(thresholdSetting.value) : 1;

    const recentTransactions = queryAll('SELECT t.*, b.title as book_title, m.name as member_name, l.name as librarian_name FROM transactions t JOIN books b ON t.book_id = b.id JOIN members m ON t.member_id = m.id JOIN librarians l ON t.issued_by = l.id ORDER BY t.created_at DESC LIMIT 10');
    const lowStockBooks = queryAll('SELECT id, title, author, total_copies, available_copies FROM books WHERE available_copies <= ? AND total_copies > 1 ORDER BY available_copies ASC LIMIT 50', [threshold]);

    res.json({ success: true, data: { stats: { totalBooks, totalMembers, activeMembers, totalCategories, totalTransactions, activeIssues, overdueBooks, totalFines }, recentTransactions, lowStockBooks } });
  } catch (error) { next(error); }
}

export function getPopularBooks(req, res, next) {
  try {
    const books = queryAll('SELECT b.id, b.title, b.author, b.isbn, c.name as category_name, c.color as category_color, COUNT(t.id) as issue_count FROM books b LEFT JOIN transactions t ON b.id = t.book_id LEFT JOIN categories c ON b.category_id = c.id GROUP BY b.id ORDER BY issue_count DESC LIMIT 10');
    res.json({ success: true, data: books });
  } catch (error) { next(error); }
}

export function getActiveMembers(req, res, next) {
  try {
    const members = queryAll("SELECT m.id, m.name, m.email, m.membership_id, COUNT(t.id) as total_borrows, SUM(CASE WHEN t.status = 'issued' THEN 1 ELSE 0 END) as current_borrows, COALESCE(SUM(t.fine_amount), 0) as total_fines FROM members m LEFT JOIN transactions t ON m.id = t.member_id GROUP BY m.id ORDER BY total_borrows DESC LIMIT 10");
    res.json({ success: true, data: members });
  } catch (error) { next(error); }
}

export function getMonthlyStats(req, res, next) {
  try {
    const stats = queryAll("SELECT strftime('%Y-%m', issue_date) as month, COUNT(*) as total_issues, SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as total_returns, COALESCE(SUM(fine_amount), 0) as total_fines FROM transactions WHERE issue_date >= date('now', '-12 months') GROUP BY strftime('%Y-%m', issue_date) ORDER BY month ASC");
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}

export function getCategoryDistribution(req, res, next) {
  try {
    const distribution = queryAll('SELECT c.name, c.color, COUNT(b.id) as book_count FROM categories c LEFT JOIN books b ON c.id = b.category_id GROUP BY c.id ORDER BY book_count DESC');
    res.json({ success: true, data: distribution });
  } catch (error) { next(error); }
}
