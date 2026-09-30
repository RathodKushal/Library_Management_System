import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { booksAPI, categoriesAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  MagnifyingGlass, Plus, PencilSimple, Trash, X, Book,
  FunnelSimple, SpinnerGap
} from '@phosphor-icons/react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', category_id: '', publisher: '', year: '', total_copies: 1, description: '' });
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await booksAPI.getAll({ page, limit: 12, search: debouncedSearch, category_id: categoryFilter || undefined });
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [debouncedSearch, categoryFilter]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const openAdd = () => {
    setFormData({ title: '', author: '', isbn: '', category_id: '', publisher: '', year: '', total_copies: 1, description: '' });
    setModal({ open: true, mode: 'add', data: null });
  };

  const openEdit = (book) => {
    setFormData({
      title: book.title, author: book.author, isbn: book.isbn || '', category_id: book.category_id || '',
      publisher: book.publisher || '', year: book.year || '', total_copies: book.total_copies, description: book.description || ''
    });
    setModal({ open: true, mode: 'edit', data: book });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, category_id: formData.category_id || null, total_copies: Number(formData.total_copies), year: formData.year ? Number(formData.year) : null };
      if (modal.mode === 'add') {
        await booksAPI.create(payload);
        toast.success('Book added successfully!');
      } else {
        await booksAPI.update(modal.data.id, payload);
        toast.success('Book updated successfully!');
      }
      setModal({ open: false, mode: 'add', data: null });
      fetchBooks(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (book) => {
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await booksAPI.delete(book.id);
      toast.success('Book deleted');
      fetchBooks(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Books</h1>
        <div className="actions">
          <div className="search-bar">
            <MagnifyingGlass size={18} className="search-icon" />
            <input className="form-input" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
          </div>
          <select className="form-input" style={{ width: 180 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <motion.button className="btn btn-primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd}>
            <Plus size={18} weight="bold" /> Add Book
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <Book size={64} weight="duotone" className="empty-icon" style={{ color: 'var(--text-dim)' }} />
          <h3>No books found</h3>
          <p>Add your first book or adjust the filters.</p>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Book</button>
        </div>
      ) : (
        <>
          <motion.div className="grid grid-cols-3 gap-4" variants={{ show: { transition: { staggerChildren: 0.04 } } }} initial="hidden" animate="show">
            {books.map(book => (
              <motion.div key={book.id} variants={fadeUp} className="card" style={{ cursor: 'default', borderLeft: book.category_color ? `4px solid ${book.category_color}` : '4px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge" style={{ background: book.category_color ? `${book.category_color}22` : 'rgba(99,102,241,0.15)', color: book.category_color || 'var(--primary-light)', fontSize: '0.6875rem' }}>
                    {book.category_name || 'Uncategorized'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost btn-icon sm" onClick={() => openEdit(book)} title="Edit"><PencilSimple size={16} /></button>
                    <button className="btn btn-ghost btn-icon sm" onClick={() => handleDelete(book)} title="Delete" style={{ color: 'var(--danger)' }}><Trash size={16} /></button>
                  </div>
                </div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>{book.title}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{book.author}</p>
                {book.isbn && <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>ISBN: {book.isbn}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {book.available_copies > 0 ? `${book.available_copies} Available` : 'Unavailable'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{book.total_copies} total</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`btn ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => fetchBooks(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal({ open: false, mode: 'add', data: null })}>
            <motion.div className="modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{modal.mode === 'add' ? 'Add New Book' : 'Edit Book'}</h3>
                <button className="btn btn-ghost btn-icon sm" onClick={() => setModal({ open: false, mode: 'add', data: null })}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="book-title">Title *</label>
                    <input id="book-title" className="form-input" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="book-author">Author *</label>
                    <input id="book-author" className="form-input" required value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="book-isbn">ISBN</label>
                      <input id="book-isbn" className="form-input" value={formData.isbn} onChange={e => setFormData(p => ({ ...p, isbn: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="book-category">Category</label>
                      <select id="book-category" className="form-input" value={formData.category_id} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}>
                        <option value="">None</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="book-publisher">Publisher</label>
                      <input id="book-publisher" className="form-input" value={formData.publisher} onChange={e => setFormData(p => ({ ...p, publisher: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="book-year">Year</label>
                      <input id="book-year" type="number" className="form-input" value={formData.year} onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="book-copies">Copies</label>
                      <input id="book-copies" type="number" min="1" className="form-input" value={formData.total_copies} onChange={e => setFormData(p => ({ ...p, total_copies: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="book-desc">Description</label>
                    <textarea id="book-desc" className="form-input" rows="2" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModal({ open: false, mode: 'add', data: null })}>Cancel</button>
                  <motion.button type="submit" className="btn btn-primary" disabled={saving} whileTap={{ scale: 0.97 }}>
                    {saving ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : modal.mode === 'add' ? 'Add Book' : 'Save Changes'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
