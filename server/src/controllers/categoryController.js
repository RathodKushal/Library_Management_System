import { queryAll, queryOne, run } from '../config/database.js';

export function getAllCategories(req, res, next) {
  try {
    const categories = queryAll('SELECT c.*, (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) as book_count FROM categories c ORDER BY c.name ASC');
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
}

export function getCategoryById(req, res, next) {
  try {
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [Number(req.params.id)]);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    const books = queryAll('SELECT id, title, author, isbn, available_copies FROM books WHERE category_id = ?', [Number(req.params.id)]);
    res.json({ success: true, data: { ...category, books } });
  } catch (error) { next(error); }
}

export function createCategory(req, res, next) {
  try {
    const { name, description, color } = req.body;
    const result = run('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)', [name, description || null, color || '#6366F1']);
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Category created successfully.', data: category });
  } catch (error) { next(error); }
}

export function updateCategory(req, res, next) {
  try {
    const existing = queryOne('SELECT * FROM categories WHERE id = ?', [Number(req.params.id)]);
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });
    const { name, description, color } = req.body;
    run('UPDATE categories SET name=COALESCE(?,name), description=COALESCE(?,description), color=COALESCE(?,color) WHERE id=?', [name, description, color, Number(req.params.id)]);
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) { next(error); }
}

export function deleteCategory(req, res, next) {
  try {
    const category = queryOne('SELECT * FROM categories WHERE id = ?', [Number(req.params.id)]);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    run('DELETE FROM categories WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) { next(error); }
}
